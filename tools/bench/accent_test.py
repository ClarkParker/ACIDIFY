#!/usr/bin/env python3
"""Prueft die beiden Hardware-Verhalten des Accent-Sweep-Netzwerks:
   1. Steigerung ueber aufeinanderfolgende akzentuierte Noten
   2. Abhaengigkeit des Accent-Charakters vom Resonanzregler

Gemessen wird der spektrale Schwerpunkt kurz nach jedem Notenanfang - er folgt
der momentanen Cutoff. Noten liegen im 16tel-Raster bei 140 BPM (107 ms), also
innerhalb der Entladezeit des 1-uF-Kondensators.
"""
import cmath, json, math, os, shutil, struct, subprocess

SD = "/tmp/claude-0/-home-user/0d638a5f-d17d-5e69-9f78-27c8a9360bd2/scratchpad"
CMAJ = f"{SD}/cmaj-bin/linux/x64/cmaj"
RIG = f"{SD}/acc"
RATE = 48000

TMPL = """
processor Control
{{
{outs}
    output event std::midi::Message midiOut;
    void main()
    {{
        advance();
{sends}
        advance();
{notes}
        loop {{ advance(); }}
    }}
}}
graph Rig
{{
    output stream float<2> out;
    node src = Control;
    node synth = Acidify;
    connection
    {{
        src.midiOut -> synth.midiIn;
        synth.out -> out;
{conns}
    }}
}}
"""


def render(dsp, params, events, seconds):
    """events: [(absoluteFrame, status, note, vel)] - wird in Deltas umgerechnet."""
    os.makedirs(RIG, exist_ok=True)
    shutil.copy(dsp, f"{RIG}/DSP.cmajor")
    outs, sends, conns = [], [], []
    for i, v in sorted(params.items()):
        outs.append(f"    output event float pOut{i};")
        sends.append(f"        pOut{i} <- {float(v)}f;")
        conns.append(f"        src.pOut{i} -> synth.param{i};")
    nl, prev = [], 0
    for frame, st, n, v in sorted(events):
        d = frame - prev
        if d > 0:
            nl.append(f"        loop ({d}) advance();")
        nl.append(f"        midiOut <- std::midi::createMessage ({st}, {n}, {v});")
        prev = frame
    open(f"{RIG}/Rig.cmajor", "w").write(
        TMPL.format(outs="\n".join(outs), sends="\n".join(sends),
                    notes="\n".join(nl), conns="\n".join(conns)))
    json.dump({"CmajorVersion": 1, "ID": "com.acc.rig", "version": "1.0",
               "name": "Rig", "source": ["DSP.cmajor", "Rig.cmajor"],
               "mainProcessor": "Rig"}, open(f"{RIG}/Rig.cmajorpatch", "w"))
    wav = f"{RIG}/o.wav"
    r = subprocess.run([CMAJ, "render", f"--rate={RATE}",
                        f"--length={int(RATE*seconds)}", "--channels=2",
                        "--blockSize=128", f"--output={wav}", f"{RIG}/Rig.cmajorpatch"],
                       capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError(r.stdout + r.stderr)
    d = open(wav, "rb").read()
    off, data = 12, None
    while off + 8 <= len(d):
        cid = d[off:off+4]; sz = struct.unpack("<I", d[off+4:off+8])[0]
        if cid == b"data": data = (off+8, sz); break
        off += 8 + sz + (sz & 1)
    cnt = data[1]//4
    xs = struct.unpack(f"<{cnt}f", d[data[0]:data[0]+data[1]])
    return list(xs[0::2])


def fft(x):
    n = len(x)
    if n == 1: return list(x)
    ev, od = fft(x[0::2]), fft(x[1::2])
    o = [0]*n
    for k in range(n//2):
        t = cmath.exp(-2j*math.pi*k/n)*od[k]
        o[k] = ev[k]+t; o[k+n//2] = ev[k]-t
    return o


def centroid(seg):
    n = 2048
    s = list(seg[:n]) + [0.0]*max(0, n-len(seg))
    w = [0.5-0.5*math.cos(2*math.pi*i/(n-1)) for i in range(n)]
    sp = fft([s[i]*w[i] for i in range(n)])
    num = den = 0.0
    for k in range(1, n//2):
        m = abs(sp[k]); f = k*RATE/n
        num += f*m; den += m
    return num/max(den, 1e-12)


STEP = int(RATE * 60 / 140 / 4)     # 16tel bei 140 BPM = 107 ms


def accent_run(dsp, res, accents):
    ev = []
    for k, acc in enumerate(accents):
        ev.append((k*STEP, "0x90", 36, 110 if acc else 70))
        ev.append((k*STEP + int(STEP*0.55), "0x80", 36, 0))
    sig = render(dsp, {2: 0.30, 3: res, 4: 0.68, 5: 0.2, 6: 0.9, 8: 0.0},
                 ev, 2.5)
    i0 = next((i for i, v in enumerate(sig) if abs(v) > 1e-5), 0)
    return [centroid(sig[i0 + k*STEP + 200 : i0 + k*STEP + 200 + 2048])
            for k in range(len(accents))]


if __name__ == "__main__":
    runs = [("4 Accents in Folge", [1, 1, 1, 1]),
            ("Accent / unbetont im Wechsel", [1, 0, 1, 0])]
    for title, pat in runs:
        print(f"\n########## {title} ##########")
        for label, dsp in (("ALT", f"{SD}/OLD_DSP.cmajor"),
                           ("NEU", "/home/user/ACIDIFY/ACIDIFYDSP.cmajor")):
            for res in (0.1, 0.9):
                c = accent_run(dsp, res, pat)
                print(f"  {label}  Resonanz {res}:  "
                      + "  ".join(f"{v:6.0f}" for v in c)
                      + f"   Hz Schwerpunkt   Delta {c[-1]-c[0]:+7.0f}")
