#!/usr/bin/env python3
"""Impulsantwort-Messung des isolierten Leiterfilters."""
import cmath, json, math, os, struct, subprocess, sys

SD = os.environ.get("ACIDIFY_BENCH_DIR",
                    os.path.join(os.path.dirname(os.path.abspath(__file__)), "_work"))
CMAJ = f"{SD}/cmaj-bin/linux/x64/cmaj"
D = f"{SD}/bench/filter"
TMPL = open(f"{D}/Filt.cmajor").read()


def fft(x):
    n = len(x)
    if n == 1:
        return list(x)
    ev = fft(x[0::2]); od = fft(x[1::2])
    out = [0]*n
    for k in range(n//2):
        t = cmath.exp(-2j*math.pi*k/n)*od[k]
        out[k] = ev[k] + t
        out[k+n//2] = ev[k] - t
    return out


def measure(cutoff, resonance, drive=1.0, nonlinear=False, rate=48000, n=32768):
    src = (TMPL.replace("CUTOFF", f"{float(cutoff)}f")
                .replace("RESONANCE", f"{float(resonance)}f")
                .replace("DRIVE", f"{float(drive)}f")
                .replace("NLIN", "softClip" if nonlinear else "")
                .replace("NLOUT", "softClip" if nonlinear else ""))
    open(f"{D}/Gen.cmajor", "w").write(src)
    json.dump({"CmajorVersion": 1, "ID": "com.bench.filt", "version": "1.0",
               "name": "Filt", "source": ["Gen.cmajor"]},
              open(f"{D}/Filt.cmajorpatch", "w"))
    wav = f"{D}/ir.wav"
    r = subprocess.run([CMAJ, "render", f"--rate={rate}", f"--length={n+30000}",
                        "--channels=2", "--blockSize=512", f"--output={wav}",
                        f"{D}/Filt.cmajorpatch"], capture_output=True, text=True)
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
    dry, wet = list(xs[0::2]), list(xs[1::2])
    i0 = max(range(len(dry)), key=lambda i: abs(dry[i]))   # Impulsposition
    ir = wet[i0:i0+n]
    ir += [0.0]*(n-len(ir))
    return ir, rate


def response(ir, rate):
    sp = fft(ir)
    n = len(ir)
    return [(k*rate/n, 20*math.log10(max(abs(sp[k]), 1e-12))) for k in range(n//2)]


def report(cutoff, resonance, **kw):
    ir, rate = measure(cutoff, resonance, **kw)
    resp = response(ir, rate)

    def at(f):
        return min(resp, key=lambda p: abs(p[0]-f))[1]

    lf = sum(at(f) for f in (20, 30, 40)) / 3          # Passband-Referenz
    peak_f, peak_db = max((p for p in resp if p[0] > 10), key=lambda p: p[1])
    # -3 dB relativ zum Passband
    fc = next((f for f, v in resp if f > 20 and v <= lf-3), None)
    sl = at(min(cutoff*4, rate*0.4)) - at(min(cutoff*2, rate*0.2))
    stable = all(abs(v) < 1e3 for v in ir) and abs(ir[-1]) < abs(max(ir, key=abs))*0.5
    return dict(cutoff=cutoff, res=resonance, passband=round(lf, 2),
                peak_hz=round(peak_f), peak_db=round(peak_db-lf, 2),
                minus3=fc and round(fc), slope=round(sl, 1), stable=stable)


if __name__ == "__main__":
    print("=== Linearer Filter: Steilheit ueber Cutoff (Resonanz 0) ===")
    for c in (200, 500, 1000, 2000, 4000):
        print(report(c, 0.0))
    print()
    print("=== Resonanzverhalten bei 1000 Hz ===")
    for r in (0.0, 0.3, 0.5, 0.7, 0.9, 1.0):
        print(report(1000, r))
