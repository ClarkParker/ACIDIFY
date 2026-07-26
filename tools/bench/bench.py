#!/usr/bin/env python3
"""Unabhaengiger Messstand fuer ACIDIFYDSP.cmajor.

Erzeugt pro Messung einen Cmajor-Rig, der Parameter setzt und MIDI sendet,
rendert mit dem echten cmaj und analysiert das WAV. Nichts davon stammt aus
dem Repository - der Messstand ist bewusst neu gebaut.
"""
import json, math, os, shutil, struct, subprocess, cmath

SD = os.environ.get("ACIDIFY_BENCH_DIR",
                    os.path.join(os.path.dirname(os.path.abspath(__file__)), "_work"))
CMAJ = f"{SD}/cmaj-bin/linux/x64/cmaj"
RIG  = f"{SD}/bench/rig"
DSP  = "/home/user/ACIDIFY/ACIDIFYDSP.cmajor"

RIG_TMPL = """
processor Control
{{
    output event float ctl;
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
    }}
}}
"""


def build_rig(params, notes):
    """params: {index: value}. notes: [(frameDelay, status, note, vel)]."""
    os.makedirs(RIG, exist_ok=True)
    shutil.copy(DSP, f"{RIG}/ACIDIFYDSP.cmajor")

    # Jeder Parameter braucht ein eigenes Event-Endpoint -> generieren.
    outs, sends, conns = [], [], []
    for idx, val in sorted(params.items()):
        outs.append(f"    output event float pOut{idx};")
        sends.append(f"        pOut{idx} <- {float(val)}f;")
        conns.append(f"        src.pOut{idx} -> synth.param{idx};")

    note_lines = []
    for delay, status, note, vel in notes:
        if delay:
            note_lines.append(f"        loop ({delay}) advance();")
        note_lines.append(
            f"        midiOut <- std::midi::createMessage ({status}, {note}, {vel});")

    body = RIG_TMPL.format(sends="\n".join(sends), notes="\n".join(note_lines))
    body = body.replace("    output event float ctl;", "\n".join(outs))
    body = body.replace("        synth.out -> out;",
                        "        synth.out -> out;\n" + "\n".join(conns))
    open(f"{RIG}/Rig.cmajor", "w").write(body)
    json.dump({"CmajorVersion": 1, "ID": "com.bench.rig", "version": "1.0",
               "name": "Rig", "source": ["ACIDIFYDSP.cmajor", "Rig.cmajor"],
               "mainProcessor": "Rig"},
              open(f"{RIG}/Rig.cmajorpatch", "w"), indent=2)


def render(rate, seconds):
    wav = f"{SD}/bench/out.wav"
    r = subprocess.run([CMAJ, "render", f"--rate={rate}",
                        f"--length={int(rate*seconds)}", "--channels=2",
                        "--blockSize=128", f"--output={wav}",
                        f"{RIG}/Rig.cmajorpatch"], capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError(r.stdout + r.stderr)
    return read_wav(wav)


def read_wav(path):
    d = open(path, "rb").read()
    off, data = 12, None
    while off + 8 <= len(d):
        cid = d[off:off+4]; sz = struct.unpack("<I", d[off+4:off+8])[0]
        if cid == b"data": data = (off+8, sz); break
        off += 8 + sz + (sz & 1)
    n = data[1] // 4
    xs = struct.unpack(f"<{n}f", d[data[0]:data[0]+data[1]])
    return list(xs[0::2])


LEAD = 20000   # fester Renderer-Vorlauf, grosszuegig uebersprungen


def trim(sig):
    i = next((k for k, v in enumerate(sig) if abs(v) > 1e-6), 0)
    return sig[i:]


def dft(sig, rate, freqs):
    """Goertzel-artige Einzelfrequenz-Auswertung, keine numpy-Abhaengigkeit."""
    n = len(sig)
    win = [0.5 - 0.5*math.cos(2*math.pi*i/(n-1)) for i in range(n)]
    out = {}
    for f in freqs:
        w = 2*math.pi*f/rate
        acc = sum(sig[i]*win[i]*cmath.exp(-1j*w*i) for i in range(n))
        out[f] = abs(acc) * 2 / sum(win)
    return out


def db(x):
    return 20*math.log10(max(x, 1e-12))
