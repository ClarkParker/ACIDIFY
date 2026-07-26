"""Netzverfolgung im x0xb0x-Schaltplan.

Gruene Leitungen, rote Bauteile. EAGLE zeichnet Kreuzungen ohne Verbindung als
schlichte Ueberlagerung; echte Verbindungen tragen einen ausgefuellten Punkt.
Genau diese Unterscheidung macht Augenverfolgung unzuverlaessig - hier wird sie
explizit geprueft.

Regeln:
  - Beruehren sich ein waagerechter und ein senkrechter Lauf am ENDE eines der
    beiden, ist das eine Ecke oder ein T -> verbunden.
  - Liegt der Schnittpunkt im INNEREN beider Laeufe, ist es eine Kreuzung ->
    nur verbunden, wenn dort ein Knotenpunkt (Punktscheibe) sitzt.
"""
import sys
from PIL import Image

EPS = 4          # Toleranz "am Ende eines Laufs"
MINLEN = 6       # kuerzere Laeufe sind Bauteil-Zacken, keine Leitung


def green_mask(path):
    im = Image.open(path).convert("RGB")
    W, H = im.size
    px = im.load()
    m = bytearray(W * H)
    for y in range(H):
        row = y * W
        for x in range(W):
            r, g, b = px[x, y]
            # kraeftiges Gruen, deutlich ueber Rot und Blau
            if g > 90 and g - r > 40 and g - b > 40:
                m[row + x] = 1
    return m, W, H


def runs(m, W, H):
    hor, ver = [], []
    for y in range(H):
        row = y * W
        x = 0
        while x < W:
            if m[row + x]:
                x0 = x
                while x < W and m[row + x]:
                    x += 1
                if x - x0 >= MINLEN:
                    hor.append((x0, x - 1, y))
            else:
                x += 1
    for x in range(W):
        y = 0
        while y < H:
            if m[y * W + x]:
                y0 = y
                while y < H and m[y * W + x]:
                    y += 1
                if y - y0 >= MINLEN:
                    ver.append((y0, y - 1, x))
            else:
                y += 1
    return hor, ver


def dot_at(m, W, H, x, y, r=5):
    """Knotenpunkt: ausgefuellte Scheibe statt gekreuzter duenner Linien.

    An einer reinen Kreuzung sind nur die beiden Linienbreiten gefuellt.
    Ein Punkt fuellt die Ecken der Scheibe mit.
    """
    filled = total = 0
    for dy in range(-r, r + 1):
        yy = y + dy
        if not (0 <= yy < H):
            continue
        for dx in range(-r, r + 1):
            xx = x + dx
            if not (0 <= xx < W) or dx * dx + dy * dy > r * r:
                continue
            # Ecken der Scheibe: abseits beider Linienachsen
            if abs(dx) > 2 and abs(dy) > 2:
                total += 1
                if m[yy * W + xx]:
                    filled += 1
    return total > 0 and filled / total > 0.5


def build(hor, ver, m, W, H):
    adj = {}
    hi = {i: h for i, h in enumerate(hor)}
    vi = {len(hor) + i: v for i, v in enumerate(ver)}
    # Bucket nach y bzw. x, damit nicht alles gegen alles geprueft wird
    for i, (x0, x1, y) in hi.items():
        for j, (y0, y1, x) in vi.items():
            if not (x0 - EPS <= x <= x1 + EPS and y0 - EPS <= y <= y1 + EPS):
                continue
            end_h = (abs(x - x0) <= EPS or abs(x - x1) <= EPS)
            end_v = (abs(y - y0) <= EPS or abs(y - y1) <= EPS)
            if end_h or end_v:
                conn = True                      # Ecke oder T
            else:
                conn = dot_at(m, W, H, x, y)     # echte Kreuzung
            if conn:
                adj.setdefault(i, set()).add(j)
                adj.setdefault(j, set()).add(i)
    return hi, vi, adj


def find_run(hi, vi, x, y, tol=6):
    best, bd = None, 1e9
    for i, (x0, x1, yy) in hi.items():
        if x0 - tol <= x <= x1 + tol:
            d = abs(yy - y)
            if d < bd:
                best, bd = i, d
    for j, (y0, y1, xx) in vi.items():
        if y0 - tol <= y <= y1 + tol:
            d = abs(xx - x)
            if d < bd:
                best, bd = j, d
    return best if bd <= tol else None


def net_of(hi, vi, adj, start):
    seen, stack = {start}, [start]
    while stack:
        n = stack.pop()
        for k in adj.get(n, ()):
            if k not in seen:
                seen.add(k)
                stack.append(k)
    return seen


def bbox(hi, vi, net):
    xs, ys = [], []
    for n in net:
        if n in hi:
            x0, x1, y = hi[n]; xs += [x0, x1]; ys.append(y)
        else:
            y0, y1, x = vi[n]; ys += [y0, y1]; xs.append(x)
    return min(xs), min(ys), max(xs), max(ys)


if __name__ == "__main__":
    path = sys.argv[1]
    m, W, H = green_mask(path)
    hor, ver = runs(m, W, H)
    print(f"image {W}x{H}  horizontal runs {len(hor)}  vertical runs {len(ver)}",
          flush=True)
    hi, vi, adj = build(hor, ver, m, W, H)
    print(f"graph nodes {len(hi)+len(vi)}  edges {sum(len(v) for v in adj.values())//2}",
          flush=True)

    targets = {}
    for label, (x, y) in {
        "C21_right(R121 220k)": (int(sys.argv[2]), int(sys.argv[3])),
        "C20_right(R122 100k)": (int(sys.argv[4]), int(sys.argv[5])),
    }.items():
        s = find_run(hi, vi, x, y)
        if s is None:
            print(f"{label}: kein Lauf bei ({x},{y})")
            continue
        net = net_of(hi, vi, adj, s)
        targets[label] = net
        print(f"{label}: start={s} netzgroesse={len(net)} bbox={bbox(hi,vi,net)}",
              flush=True)

    ks = list(targets)
    if len(ks) == 2:
        a, b = targets[ks[0]], targets[ks[1]]
        print("gleiches Netz?" , bool(a & b), " gemeinsame Laeufe:", len(a & b))
    import json
    json.dump({k: sorted(v) for k, v in targets.items()},
              open("/tmp/claude-0/-home-user/cf1234b6-c6a5-547b-9c3c-5b2a157b53e2/scratchpad/nets.json", "w"))
