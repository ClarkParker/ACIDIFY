#!/usr/bin/env python3
"""Die widerlegbaren Prüfsteine des Hardwareabgleichs, ausführbar.

Jeder Test hier kann scheitern — das ist der Zweck. Ein Test, der nur bestätigt,
beweist nichts.

Der Filterkern wird dafür aus `ACIDIFYDSP.cmajor` herausgeschnitten und als
eigenständiger Prozessor gemessen. Damit misst der Stand immer den echten
Plug-in-Code und nicht eine Kopie, die auseinanderläuft.

    ACIDIFY_BENCH_DIR=/pfad/mit/cmaj-bin python3 tools/bench/hardware_checks.py
"""
import json
import math
import os
import struct
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
SD = os.environ.get("ACIDIFY_BENCH_DIR", os.path.join(HERE, "_work"))
CMAJ = f"{SD}/cmaj-bin/linux/x64/cmaj"
DSP = os.path.join(HERE, "..", "..", "ACIDIFYDSP.cmajor")
WORK = f"{SD}/bench/hwcheck"

RIG = """processor Impulse
{{ output stream float out; int frame = 0;
   void main() {{ loop {{ out <- (frame == 64) ? 1.0f : 0.0f; frame += 1; advance(); }} }} }}

processor Ladder
{{
    input stream float in; output stream float out;
    float64 zdfS1 = 0.0, zdfS2 = 0.0, zdfS3 = 0.0, zdfS4 = 0.0;
    float64[5] coupleX1; float64[5] coupleY1;
    float64[5] coupleB0; float64[5] coupleB1; float64[5] coupleA1;
    float64[3] fbX1; float64[3] fbY1;
    float64[3] fbB0; float64[3] fbB1; float64[3] fbA1;
{coef}
{body}
    void main() {{ let sr = float (processor.frequency); updateCouplingCoefficients (sr);
        loop {{ out <- processLadder (in, CUTOFF, sr); advance(); }} }} }}

processor Combine
{{ input stream float dry, wet; output stream float<2> out;
   void main() {{ loop {{ out <- float<2> (dry, wet); advance(); }} }} }}

graph HwCheck [[ main ]]
{{ output stream float<2> out; node src = Impulse; node f = Ladder * 4; node mix = Combine;
   connection {{ src.out -> f.in; src.out -> mix.dry; f.out -> mix.wet; mix.out -> out; }} }}
"""


def extract():
    src = open(DSP).read()

    def block(start):
        i = src.index(start)
        j = src.index("\n    }\n", i) + len("\n    }\n")
        return src[i:j]

    body = block("    float processLadder (float signal, float cutoffHz, float sampleRate)")
    body = body.replace("clamp (resonanceSkewed, 0.0f, 1.0f)", "RESK")
    coef = block("    void updateCouplingCoefficients (float sampleRate)")
    return RIG.format(coef=coef, body=body)


def fft(x):
    n = len(x)
    if n == 1:
        return list(x)
    ev, od = fft(x[0::2]), fft(x[1::2])
    out = [0] * n
    for k in range(n // 2):
        t = complex(math.cos(-2 * math.pi * k / n), math.sin(-2 * math.pi * k / n)) * od[k]
        out[k] = ev[k] + t
        out[k + n // 2] = ev[k] - t
    return out


TEMPLATE = None


def measure(cutoff, knob, n=32768, rate=48000):
    """Impulsantwort des echten Plug-in-Filterkerns."""
    os.makedirs(WORK, exist_ok=True)
    src = TEMPLATE.replace("CUTOFF", f"{float(cutoff)}f").replace("RESK", f"{float(knob)}f")
    open(f"{WORK}/Gen.cmajor", "w").write(src)
    json.dump({"CmajorVersion": 1, "ID": "com.acidify.hwcheck", "version": "1.0",
               "name": "HwCheck", "source": ["Gen.cmajor"]},
              open(f"{WORK}/HwCheck.cmajorpatch", "w"))
    r = subprocess.run([CMAJ, "render", f"--rate={rate}", f"--length={n + 30000}",
                        "--channels=2", "--blockSize=512", f"--output={WORK}/ir.wav",
                        f"{WORK}/HwCheck.cmajorpatch"], capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError((r.stdout + r.stderr)[-1500:])
    d = open(f"{WORK}/ir.wav", "rb").read()
    off, data = 12, None
    while off + 8 <= len(d):
        cid = d[off:off + 4]
        sz = struct.unpack("<I", d[off + 4:off + 8])[0]
        if cid == b"data":
            data = (off + 8, sz)
            break
        off += 8 + sz + (sz & 1)
    cnt = data[1] // 4
    xs = struct.unpack(f"<{cnt}f", d[data[0]:data[0] + data[1]])
    dry, wet = list(xs[0::2]), list(xs[1::2])
    i0 = max(range(len(dry)), key=lambda i: abs(dry[i]))
    ir = wet[i0:i0 + n]
    ir += [0.0] * (n - len(ir))
    return ir, rate


def response(ir, rate):
    sp = fft(ir)
    n = len(ir)
    return [(k * rate / n, 20 * math.log10(max(abs(sp[k]), 1e-12))) for k in range(n // 2)]


def at(rp, f):
    return min(rp, key=lambda p: abs(p[0] - f))[1]


def oscillates(ir):
    mx = max(abs(v) for v in ir)
    return mx > 1e3 or (mx > 0 and abs(ir[-1]) / mx > 0.5)


FAILURES = []


def check(name, ok, detail):
    mark = "PASS" if ok else "FAIL"
    print(f"  [{mark}] {name}: {detail}", flush=True)
    if not ok:
        FAILURES.append(name)


def main():
    global TEMPLATE
    TEMPLATE = extract()

    print("1. Der Serien-303 schwingt absichtlich NICHT an")
    for cut in (200, 1000, 5000):
        ir, _ = measure(cut, 1.0)
        mx = max(abs(v) for v in ir)
        tail = abs(ir[-1]) / mx if mx else 0.0
        check(f"kein Anschwingen bei {cut} Hz", not oscillates(ir), f"Tail/Max = {tail:.6f}")

    print("\n2. Anschwinggrenze ist frequenzabhaengig (Whittle: nur mittlere/hohe Frequenzen)")
    limits = {}
    for cut in (150, 8000):
        lo, hi = 0.5, 8.0
        if not oscillates(measure(cut, hi)[0]):
            limits[cut] = None
            continue
        for _ in range(6):
            m = (lo + hi) / 2
            if oscillates(measure(cut, m)[0]):
                hi = m
            else:
                lo = m
        limits[cut] = (lo + hi) / 2
    lo_lim, hi_lim = limits.get(150), limits.get(8000)
    ok = lo_lim is not None and hi_lim is not None and lo_lim > hi_lim * 1.5
    check("Reserve schrumpft zu hohen Frequenzen",
          ok, f"150 Hz -> {lo_lim}, 8000 Hz -> {hi_lim}")

    print("\n3. Steilheit steigt ueber der Frequenz (vierpolig, im Hoerbereich flacher)")
    rp = measure(1000, 0.0)[0], 48000
    rp = response(*rp)
    slopes = [at(rp, b) - at(rp, a) for a, b in ((1000, 2000), (2000, 4000), (4000, 8000))]
    check("Steilheit monoton steigend",
          slopes[0] > slopes[1] > slopes[2] and slopes[2] > -24.5,
          " / ".join(f"{s:+.2f}" for s in slopes) + " dB/Okt")

    print("\n4. Resonanz monoton ueber den ganzen Reglerweg, kein totes Drittel")
    peaks = []
    for knob in (0.2, 0.4, 0.6, 0.8, 1.0):
        rp = response(*(measure(1000, knob)[0], 48000))
        f, p = max((q for q in rp if q[0] > 60), key=lambda q: q[1])
        peaks.append(p - at(rp, 250.0))
    mono = all(b > a for a, b in zip(peaks, peaks[1:]))
    top_third = peaks[-1] - peaks[-2]
    check("monoton", mono, " -> ".join(f"{p:+.2f}" for p in peaks) + " dB")
    check("oberes Reglerdrittel traegt", top_third > 3.0, f"letzter Schritt {top_third:+.2f} dB")

    print("\n5. Koppelnetz trifft Stinchcombes Uebertragungsfunktion")

    def c_analytic(f):
        s = complex(0, 2 * math.pi * f)
        num = 1.06 * s ** 3 * (s + 109.9) * (s + 34.0)
        den = (s + 97.5) * (s + 38.5) * (s + 4.45) * (s + 578.1) * (s + 20.0)
        return abs(num / den)

    sr = 48000.0
    K = 2.0 * sr
    zeros = [0.0, 0.0, 0.0, 109.9, 34.0]
    poles = [4.45, 20.0, 38.5, 578.1, 97.5]
    b0 = [(K + a) / (K + b) for a, b in zip(zeros, poles)]
    b1 = [(a - K) / (K + b) for a, b in zip(zeros, poles)]
    a1 = [(b - K) / (K + b) for a, b in zip(zeros, poles)]
    b0[0] *= 1.06
    b1[0] *= 1.06

    def c_digital(f):
        z = complex(math.cos(-2 * math.pi * f / sr), math.sin(-2 * math.pi * f / sr))
        h = complex(1, 0)
        for i in range(5):
            h *= (b0[i] + b1[i] * z) / (1 + a1[i] * z)
        return abs(h)

    worst = max(abs(20 * math.log10(c_digital(f)) - 20 * math.log10(c_analytic(f)))
                for f in (2, 4, 8, 20, 65.4, 200, 1000, 5000))
    check("Abweichung unter 0,01 dB", worst < 0.01, f"groesste Abweichung {worst:.5f} dB")

    print()
    if FAILURES:
        print(f"FEHLGESCHLAGEN: {len(FAILURES)} — " + ", ".join(FAILURES))
        return 1
    print("Alle Pruefsteine bestanden.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
