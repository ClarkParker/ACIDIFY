#!/usr/bin/env python3
"""Bauteilwerte gegen die x0xb0x-EAGLE-Quelldatei prüfen.

Der x0xb0x ist quelloffen; Limor Fried veröffentlicht `mainboard.sch` als
EAGLE-4-Datei. Das ist die **Textquelle** für Bauteilwerte — Scans lesen oder
Netze im Bild verfolgen ist der falsche Weg, solange diese Datei existiert.

Das Binärformat ist nicht dokumentiert, aber Bezeichner und Werte liegen als
ASCII darin und stehen paarweise beieinander. Das reicht, um jeden Wert, aus
dem eine DSP-Konstante abgeleitet wurde, gegenzuprüfen.

    curl -sSLO https://raw.githubusercontent.com/x0xb0x/x0xb0x.github.io/\\
        master/assets/media/x0xb0x/mainboard.sch
    python3 tools/bench/partcheck.py mainboard.sch

Nicht abgedeckt: Verbindungen. Dafür bleibt `nettrace.py`. Und Werte, die die
Schaltung nicht hergibt — Arbeitspunkte, Pinfunktionen eines BA662A — stehen
auch hier nicht drin.
"""
import re
import sys

# Was ACIDIFY aus der Schaltung ableitet, mit dem erwarteten Wert.
# x0xb0x-Nummerierung; die TB-303-Bezeichner stehen daneben, wo sie abweichen.
EXPECTED = [
    # VCA-Summenzweige und Arbeitspunkt
    ("R121", "220K", "Filterzweig an den VCA -> Gewicht 1"),
    ("R122", "100K", "Kompensationszweig (VR4-Schleifer) -> Gewicht 2,2"),
    ("C20", ".01", "Koppelkondensator Comp-Zweig (TB-303: C22)"),
    ("C21", ".01", "Koppelkondensator Filterzweig"),
    ("R124", "2.2K", "Summenknoten gegen Referenz -> Hochpassecken 71,6/155,7 Hz"),
    ("C37", "10/16", "Entkopplung am Summenknoten"),
    # VCA-Huellkurve
    ("R123", "1.5M", "VCA-Decay mit C42 -> 1500 ms"),
    ("C42", "1/35", "VCA-Huellkurvenkondensator"),
    ("R132", "100", "VCA-Ladepfad mit C42 -> Steuerglaettung 1591,5 Hz"),
    ("R131", "220K", "Q31-Arbeitspunkt"),
    ("R133", "2.2K", "Gate-/Accent-Zulauf an den Q31-Knoten"),
    ("R134", "22K", "Gate-Zulauf an die Q32-Basis"),
    ("C41", ".1", "Gate-Glaettung mit R134 -> 2,2 ms"),
    # Accent am VCA, asymmetrisch durch D27
    ("R119", "47K", "Accent-Fallpfad mit C36 -> 1,551 ms"),
    ("R120", "22k", "Accent-Ladepfad mit C36 -> 726 us"),
    ("C36", ".033", "Accent-Kondensator am VCA"),
    # Filterhuellkurve
    ("R152", "100", "MEG-Attack mit C62 -> 100 us"),
    ("C62", "1/35", "MEG-Huellkurvenkondensator"),
    ("R138", "68K", "fester Anteil im MEG-Decay"),
    ("R151", "22K", "fester Anteil im MEG-Decay"),
    # Accent-Sweep
    ("R46", "47K", "Zulauf zur zweiten VR4-Ebene"),
    ("C13", "1/50", "Accent-Sweep-Kondensator"),
    # Cutoff- und Env-Mod-Abbildung: identische Netze -> gleiche Spanne
    ("R47", "10K", "Vorwiderstand am Cutoff-Poti VR3"),
    ("R61", "10K", "Vorwiderstand am Env-Mod-Poti VR5"),
    # Diodenleiter: die vierte Stufe ist NICHT gleich
    ("C19", ".033", "Leiterstufe (TB-303: C98/C99/C100)"),
    ("C24", ".033", "Leiterstufe"),
    ("C26", ".033", "Leiterstufe"),
    ("C18", ".018", "VIERTE Leiterstufe — Pol um 33/18 hoeher (TB-303: C101)"),
]


def values(path):
    data = open(path, "rb").read()
    toks = [m.group(0).decode("ascii")
            for m in re.finditer(rb"[ -~]{2,}", data)]
    out = {}
    for i, t in enumerate(toks):
        if re.fullmatch(r"[RCDQ]\d{1,3}", t) and i + 1 < len(toks):
            nxt = toks[i + 1]
            if re.fullmatch(r"[\d.]+(/[\d]+)?[kKMmuUnNpP]?|\.\d+", nxt):
                out.setdefault(t, nxt)
    return out


def main():
    path = sys.argv[1] if len(sys.argv) > 1 else "mainboard.sch"
    found = values(path)
    print(f"{len(found)} Bauteile mit Wert aus {path}\n")
    bad = 0
    for des, want, role in EXPECTED:
        got = found.get(des)
        if got is None:
            print(f"  [?]    {des:6} {want:8} nicht gefunden — {role}")
            bad += 1
        elif got.upper() != want.upper():
            print(f"  [FAIL] {des:6} erwartet {want:8} Datei: {got:8} — {role}")
            bad += 1
        else:
            print(f"  [ok]   {des:6} {got:8} — {role}")
    print()
    if bad:
        print(f"{bad} von {len(EXPECTED)} nicht bestaetigt")
        return 1
    print(f"Alle {len(EXPECTED)} Werte gegen die Quelldatei bestaetigt.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
