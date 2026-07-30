#!/usr/bin/env python3
"""Einzelquelle der 90 Arp-Phrasen.

Kompakte Notation je Phrase: 8/12/16 Tokens, Leerzeichen-getrennt.
Token = Pitch relativ zur gespielten Taste (Halbtoene), "-" = Rest.
Suffix "!" = Accent, "~" = Slide in den naechsten Step.

Laeuft als Generator: schreibt die markierten Bloecke in ACIDIFYDSP.cmajor
(gepackte Tabelle) und ACIDIFYUI.js (Namen + Laengen) neu und legt
tools/data/arp_phrases.json als maschinenlesbare Referenz fuer die Tests ab.
Aufruf: python3 tools/gen_phrases.py [--check]
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# (Name <= 8 Zeichen, Spezifikation) — 90 Phrasen in 8 Kategorien.
PHRASES = [
    # ---- OCTAVE (01-12): Grundton/Oktave-Figuren ----
    ("OCT 8TH",  "0! 12 0 12 0! 12 0 12 0! 12 0 12 0! 12 0 12"),
    ("OCT PUMP", "0! 0 12 0 0! 0 12 0 0! 0 12 0 0! 0 12 0"),
    ("OCT UP2",  "0! 12 24 12 0 12 24 12 0! 12 24 12 0 12 24 12"),
    ("OCT OFF",  "0! - 12 - 0! - 12 - 0! - 12 - 0! - 12 12"),
    ("OCT ROLL", "0! 0 0 12 0! 0 0 12 0! 0 0 12 0! 12 0 12"),
    ("OCT SYNC", "0! - 12 0 - 12 0! - 12 0 - 12 0! - 0 12"),
    ("OCT DOWN", "12! 0 12 0 12! 0 12 0 12! 0 12 0 12! 0 12 0"),
    ("OCT SKIP", "0! 12 - 12 0! 12 - 12 0! 12 - 12 0! 12 12 12"),
    ("OCT 3UP",  "0! 0 12 0 0 12 0! 0 12 0 0 12 0! 12 0 12"),
    ("OCT HANG", "0! 12 12 0 0 12 12 0 0! 12 12 0 0 12 12~ 0"),
    ("OCT LIFT", "0! 0 0 0 12 12 12 12 0! 0 0 0 12 12 24 12"),
    ("OCT GAP",  "0! - - 12 - - 0! - - 12 - - 0! - 12 24"),
    # ---- ACID (13-24): Moll-Konturen ----
    ("ACID UP",  "0! 3 7 10 12 10 7 3 0! 3 7 10 12 15 12 10"),
    ("ACID DIP", "0! 0 10 0 0 7 0 3 0! 0 10 0 0 7 3~ 0"),
    ("ACID 5TH", "0! 7 0 7 0! 7 0 7 0! 7 0 7 0! 7 12 7"),
    ("ACID M3",  "0! 3 0 3 0! 3 0 3 0! 3 0 3 0! 3 15 3"),
    ("ACID B7",  "0! 10 0 10 0! 10 0 10 0! 10 0 10 0! 10 22 10"),
    ("ACID SNK", "0! - 3 - 7 - 10 - 12! - 10 - 7 - 3~ 0"),
    ("ACID RUN", "0 3 5 7 10 12 15 19 24! 19 15 12 10 7 5~ 3"),
    ("ACID PIT", "12! 10 7 3 0 3 7 10 12! 10 7 3 0~ 0 3 7"),
    ("ACID SUS", "0! 0 3 3 5 5 7 7 10! 10 7 7 5 5 3~ 3"),
    ("ACID JMP", "0! 12 3 15 7 19 10 22 12! 0 15 3 19 7 22~ 10"),
    ("ACID LOW", "0! 0 0 3 0 0 0 7 0! 0 0 3 0 7 3~ 0"),
    ("ACID TRI", "0! 3 7 0 3 7 0! 3 7 0 3 7 0! 3 7 12"),
    # ---- SYNCO (25-36): Off-Beat-Gates ----
    ("SNC ONE",  "0! - - 0 - - 0 - 0! - - 0 - 0 - -"),
    ("SNC TWO",  "- 0! - 0 - 0! - 0 - 0! - 0 - 0! 0 -"),
    ("SNC HALF", "0! - 0 - - 0 - 0 - - 0! - 0 - - 0"),
    ("SNC PUSH", "0! 0 - 0 0 - 0 0 - 0! 0 - 0 0 - 0"),
    ("SNC HOLE", "0! 0 0 - 0 0 0 - 0! 0 0 - 0 - 0 -"),
    ("SNC CLAV", "0! - 0 0 - 0 - 0 0! - 0 0 - 0 0 -"),
    ("SNC 3+3",  "0! 0 0 - - - 0! 0 0 - - - 0! 0 0 0"),
    ("SNC DUB",  "0! - - 0 0 - - 0 0! - - 0 0 - 0 0"),
    ("SNC LATE", "- - 0! 0 - - 0! 0 - - 0! 0 - - 0! 0"),
    ("SNC BUMP", "0! 0 - - 0! 0 - - 0! 0 - - 0! 0 0 0"),
    ("SNC EDGE", "0! - 0 - 0 - 0! - 0 - 0 - 0! 0 - 0"),
    ("SNC REST", "0! 0 0 0 - - - - 0! 0 0 0 - - 0! 0"),
    # ---- SLIDE (37-46): Portamento-Ketten ----
    ("SLD UP",   "0!~ 3 3~ 7 7~ 12 12 12 0!~ 3 3~ 7 7~ 12 12~ 0"),
    ("SLD DOWN", "12!~ 10 10~ 7 7~ 3 3 0 12!~ 10 10~ 7 7~ 3 3~ 0"),
    ("SLD OCT",  "0!~ 12 0 0 0~ 12 0 0 0!~ 12 0 0 0~ 12 12~ 0"),
    ("SLD CHRM", "0! 0 1~ 0 0 0 3~ 0 0! 0 6~ 7 0 0 1~ 0"),
    ("SLD WAVE", "0!~ 7 7~ 0 0~ 7 7~ 0 0!~ 10 10~ 0 0~ 10 10~ 0"),
    ("SLD CRPP", "0! 0~ 3 0 0~ 5 0 0 0!~ 7 0 0 0~ 12 0~ 0"),
    ("SLD FALL", "24!~ 12 12 12 12~ 0 0 0 24!~ 12 12 12 12~ 0 0 0"),
    ("SLD PAIR", "0! 0~ 3 3 7! 7~ 10 10 12! 12~ 10 10 7! 7~ 3 3"),
    ("SLD HOOK", "0! 3~ 0 0 7~ 0 0 10~ 0! 0 12~ 0 0 10~ 7~ 3"),
    ("SLD LONG", "0!~ 3~ 5~ 7~ 10~ 12~ 15~ 19 19 15 12 10 7 5 3~ 0"),
    # ---- ACCENT (47-56): Figuren nur aus Accent-Verteilung ----
    ("ACC 4FLR", "0! 0 0 0 0! 0 0 0 0! 0 0 0 0! 0 0 0"),
    ("ACC OFF",  "0 0! 0 0 0 0! 0 0 0 0! 0 0 0 0! 0 0"),
    ("ACC 3ER",  "0! 0 0 0! 0 0 0! 0 0 0! 0 0 0! 0 0 0!"),
    ("ACC PAIR", "0! 0! 0 0 0 0 0! 0! 0 0 0 0 0! 0! 0 0"),
    ("ACC EDGE", "0! 0 0 0 0 0 0 0! 0 0 0 0 0 0 0! 0!"),
    ("ACC GALP", "0! 0 0 0! 0 0 0! 0 0 0 0! 0 0 0! 0 0"),
    ("ACC SNAP", "0 0 0! 0 0 0 0! 0 0 0 0! 0 0 0! 0 0"),
    ("ACC WALL", "0! 0! 0! 0 0 0 0 0 0! 0! 0! 0 0 0 0 0"),
    ("ACC HART", "0! 0 0! 0 0! 0 0! 0 0! 0 0! 0 0! 0 0! 0"),
    ("ACC ROLL", "0 0 0 0 0! 0! 0 0 0 0 0 0 0! 0! 0! 0!"),
    # ---- ZIGZAG (57-68): Treppen und Spruenge ----
    ("ZIG STEP", "0! 7 3 10 7 12 10 15 12! 15 10 12 7 10 3~ 7"),
    ("ZIG WIDE", "0! 12 3 15 7 19 3 15 0! 12 3 15 7 19 10~ 22"),
    ("ZIG BACK", "0! 5 3 7 5 10 7 12 10! 7 12 5 7 3 5~ 0"),
    ("ZIG DROP", "12! 0 10 0 7 0 5 0 12! 0 10 0 7 0 3~ 0"),
    ("ZIG CLMB", "0! 3 0 5 0 7 0 10 0! 12 0 15 0 19 0~ 24"),
    ("ZIG POGO", "0! 24 0 19 0 15 0 12 0! 24 0 19 0 15 0~ 12"),
    ("ZIG TRIO", "0! 7 12 3 10 15 5 12 19! 7 12 3 10 15 5~ 12"),
    ("ZIG DIVE", "24! 19 15 12 10 7 5 3 0! 3 5 7 10 12 15~ 19"),
    ("ZIG SAW",  "0! 5 10 15 3 7 12 19 0! 5 10 15 3 7 12~ 24"),
    ("ZIG HOPS", "0! 10 0 12 0 10 0 7 0! 10 0 12 0 15 0~ 12"),
    ("ZIG FLIP", "0! 12 7 19 3 15 10 22 0! 12 7 19 3 15 10~ 24"),
    ("ZIG TIDE", "0 3 7 3 12 7 3 7 15! 12 7 12 3 7 12~ 0"),
    # ---- RAVE (69-78): Stab-Pendel ----
    ("RVE M3",   "0! 0 3 3 0! 0 3 3 0! 0 3 3 0! 3 0 3"),
    ("RVE 4TH",  "0! 0 5 5 0! 0 5 5 0! 0 5 5 0! 5 0 5"),
    ("RVE HOOV", "0! 0 0 3 5 5 5 3 0! 0 0 3 5 3~ 0 0"),
    ("RVE PEND", "0! 5 0 3 0! 5 0 3 0! 5 0 3 0! 7 5 3"),
    ("RVE STAB", "0! - 0 - 3! - 3 - 5! - 5 - 3! - 0 -"),
    ("RVE LIFT", "0! 0 3 5 7! 7 5 3 0! 0 3 5 7! 10 7~ 5"),
    ("RVE DARK", "0! 0 0 0 3 3 3 3 5! 5 5 5 3 3 3 3"),
    ("RVE SIRN", "0!~ 5 5~ 0 0~ 5 5~ 0 0!~ 5 5~ 0 0~ 5 5~ 0"),
    ("RVE PUSH", "3! 3 0 0 5 5 0 0 3! 3 0 0 7 7~ 5 3"),
    ("RVE ANTH", "0! 3 5 3 0 3 5 7 0! 3 5 3 10 7 5~ 3"),
    # ---- ELECTRO (79-90): gebrochene 16tel-Muster ----
    ("ELC FUNK", "0! - 0 12 - 0 - 12 0! - 0 12 - 12 0 -"),
    ("ELC BRKN", "0! 0 - 12 0 - 12 - 0! 0 - 12 0 12 - 12"),
    ("ELC ROBO", "0! 12 - 0 12 - 0 12 0! 12 - 0 12 - 12 -"),
    ("ELC WONK", "0! - 12 - - 0 12 - 0! - 12 - 0 - 12 12"),
    ("ELC SNAP", "0! 0 12 - 0 12 - 0 12! - 0 12 0 - 12 0"),
    ("ELC HALF", "0! - - - 12 - - - 0! - - 12 - - 12 -"),
    ("ELC TAPE", "0! 12 0 - 0 12 0 - 0! 12 0 - 0 12~ 0 -"),
    ("ELC GLDE", "0! - 0~ 12 - 0 0~ 12 0! - 0~ 12 - 12~ 0 -"),
    ("ELC DRAG", "- 0! 0 - 12 0 - 0 - 0! 0 - 12 0 12 -"),
    ("ELC NERV", "0! 12 12 0 - 12 0 - 0! 12 12 0 - 12 - 12"),
    ("ELC LOPE", "0! - 0 0 12 - 0 0 0! - 0 0 12 - 12 12"),
    ("ELC ENDE", "0! 0 12 0 0 12 0 0 12! 0 0 12 0 12 12! 24"),
]

PITCH_MIN, PITCH_MAX = -12, 24


def parse(spec: str):
    steps = []
    tokens = spec.split()
    if len(tokens) not in (8, 12, 16):
        raise ValueError(f"Phrase braucht 8/12/16 Steps, hat {len(tokens)}: {spec}")
    for token in tokens:
        accent = "!" in token
        slide = "~" in token
        core = token.replace("!", "").replace("~", "")
        if core == "-":
            steps.append({"pitch": 0, "gate": 0, "accent": 0, "slide": 0})
            continue
        pitch = int(core)
        if not (PITCH_MIN <= pitch <= PITCH_MAX):
            raise ValueError(f"Pitch {pitch} ausserhalb {PITCH_MIN}..{PITCH_MAX}: {spec}")
        steps.append({"pitch": pitch, "gate": 1, "accent": int(accent), "slide": int(slide)})
    return steps


def packed(step):
    return (step["pitch"] + 12) | (step["gate"] << 6) | (step["accent"] << 7) | (step["slide"] << 8)


def build():
    phrases = []
    seen = set()
    for name, spec in PHRASES:
        if len(name) > 8:
            raise ValueError(f"Name zu lang: {name}")
        if name in seen:
            raise ValueError(f"Name doppelt: {name}")
        seen.add(name)
        steps = parse(spec)
        phrases.append({"name": name, "length": len(steps), "steps": steps})
    if len(phrases) != 90:
        raise ValueError(f"Erwartet 90 Phrasen, sind {len(phrases)}")
    return phrases


def cmajor_block(phrases):
    values = []
    lengths = []
    for phrase in phrases:
        lengths.append(phrase["length"])
        padded = phrase["steps"] + [{"pitch": 0, "gate": 0, "accent": 0, "slide": 0}] * (16 - phrase["length"])
        values.extend(packed(step) for step in padded)
    rows = [", ".join(str(v) for v in values[i:i + 16]) for i in range(0, len(values), 16)]
    body = ",\n        ".join(rows)
    lens = ", ".join(str(v) for v in lengths)
    return (
        "    // GENERIERT von tools/gen_phrases.py — nicht von Hand editieren.\n"
        "    // Pro Step: (pitch+12) | gate<<6 | accent<<7 | slide<<8.\n"
        f"    const int[{len(values)}] arpPhraseData = (\n        {body});\n"
        f"    const int[90] arpPhraseLengths = ({lens});\n"
    )


def js_block(phrases):
    entries = ", ".join(
        f'{{ name: {json.dumps(p["name"])}, length: {p["length"]} }}' for p in phrases
    )
    return (
        "// GENERIERT von tools/gen_phrases.py — nicht von Hand editieren.\n"
        f"const ARP_PHRASES = [{entries}];\n"
    )


def replace_between(path: Path, begin: str, end: str, payload: str, check: bool) -> bool:
    text = path.read_text(encoding="utf-8")
    pattern = re.compile(re.escape(begin) + r"\n.*?" + re.escape(end), re.DOTALL)
    if not pattern.search(text):
        raise SystemExit(f"Marker fehlen in {path}")
    updated = pattern.sub(begin + "\n" + payload + end, text)
    if check:
        return updated == text
    if updated != text:
        path.write_text(updated, encoding="utf-8")
    return True


def main() -> int:
    check = "--check" in sys.argv
    phrases = build()
    json_path = ROOT / "tools" / "data" / "arp_phrases.json"
    json_payload = json.dumps(phrases, ensure_ascii=False, indent=1) + "\n"
    ok = True
    if check:
        ok &= json_path.exists() and json_path.read_text(encoding="utf-8") == json_payload
    else:
        json_path.parent.mkdir(parents=True, exist_ok=True)
        json_path.write_text(json_payload, encoding="utf-8")
    ok &= replace_between(ROOT / "ACIDIFYDSP.cmajor",
                          "    // ARP-PHRASES-BEGIN", "    // ARP-PHRASES-END",
                          cmajor_block(phrases), check)
    ok &= replace_between(ROOT / "ACIDIFYUI.js",
                          "// ARP-PHRASES-BEGIN", "// ARP-PHRASES-END",
                          js_block(phrases), check)
    if check and not ok:
        print("Phrasen-Tabellen sind NICHT synchron zur Quelle.", file=sys.stderr)
        return 1
    print(f"{'geprueft' if check else 'geschrieben'}: 90 Phrasen, "
          f"{sum(p['length'] for p in phrases)} Steps")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
