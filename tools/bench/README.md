# Messstand

Eigenständige Messwerkzeuge für die technische Prüfung. Sie ersetzen die
Rauchtests in `tools/` nicht — die prüfen, *dass* etwas läuft, diese hier
messen, *wie gut*. Die Ergebnisse stehen in [`docs/REVIEW_0.4.0.md`](../../docs/REVIEW_0.4.0.md).

Alle Skripte sind abhängigkeitsfrei (Python-Standardbibliothek, eigene FFT).

## `bench.py`

Baut zur Laufzeit einen Cmajor-Rig, der beliebige Parameter setzt und MIDI an
den `Acidify`-Graph sendet, rendert mit dem echten `cmaj` und analysiert das WAV.

```python
import bench
bench.build_rig({2: 0.5, 3: 0.72}, [(0, "0x90", 36, 110)])   # Cutoff, Resonanz, Note
sig = bench.trim(bench.render(48000, 1.5))
```

`trim()` entfernt den festen Vorlauf, den `cmaj render` jedem Ergebnis
voranstellt (siehe `docs/VALIDATION.md`).

## `filtermeas.py`

Misst den isolierten Leiterfilter über seine Impulsantwort — ohne Oszillator,
Hüllkurven und Ausgangsstufe. Nur so ist die Übertragungsfunktion sichtbar; am
Gesamtsignal füllen die `softClip`-Stufen den Sperrbereich mit
Verzerrungsprodukten.

`filter/Filt.cmajor` enthält dafür den Filtercode aus `ACIDIFYDSP.cmajor`
wörtlich als eigenständigen Prozessor. **Bei Änderungen am Filter muss diese
Kopie nachgezogen werden**, sonst misst der Stand etwas anderes als das Plug-in.

```bash
python3 tools/bench/filtermeas.py
```

## `ui_audit.mjs`

Lädt die echte Web-Component und misst Schriftgrößen, WCAG-Kontrastverhältnisse
und Klickflächen bei nativer Fenstergröße.

```bash
node tools/bench/ui_audit.mjs
```

## Voraussetzung

Ein lauffähiger `cmaj` und Playwright.

Das Arbeitsverzeichnis kommt aus `ACIDIFY_BENCH_DIR`; ohne die Variable wird
`tools/bench/_work/` verwendet. Dort werden `cmaj-bin/`, Rigs und WAVs erwartet.
Früher stand hier ein fest verdrahteter Pfad — der Messstand war damit nicht
reproduzierbar.

```bash
export ACIDIFY_BENCH_DIR=/pfad/mit/cmaj-bin
```

## `zdf/Zdf.cmajor` und `zdfmeas.py`

Topologie-hergeleiteter Diodenleiterfilter (ZDF/TPT) als isolierter Prototyp,
plus Impulsantwort-Messung. Ergebnisse und Kalibrierdaten stehen in
[`docs/FILTER_TOPOLOGY.md`](../../docs/FILTER_TOPOLOGY.md).

**Noch nicht im DSP eingebaut** — `ACIDIFYDSP.cmajor` nutzt weiterhin den
Open303-Polynomfit.

```bash
python3 -c "import sys; sys.path.insert(0,'tools/bench'); import zdfmeas as Z; \
  ir,_=Z.measure(1610, 16.5); print(max(Z.resp(ir,48000), key=lambda p:p[1]))"
```

## `nettrace.py`

Netzverfolgung in Schaltplan-Rastergrafiken. Zerlegt das Bild in waagerechte
und senkrechte Leiterläufe und verbindet zwei Läufe nur, wenn sie sich am
**Ende** eines der beiden berühren (Ecke oder T) oder wenn an einer echten
Kreuzung ein **Knotenpunkt** sitzt — geprüft über die Füllung einer Scheibe
abseits beider Linienachsen. EAGLE zeichnet Kreuzungen ohne Verbindung als
schlichte Überlagerung; genau diese Unterscheidung macht Augenverfolgung über
lange Strecken unzuverlässig.

```bash
python3 tools/bench/nettrace.py plan.png X1 Y1 X2 Y2
```

Zwei Startpunkte, Ausgabe je Netz: Größe, umschließendes Rechteck und ob beide
im selben Netz liegen. Damit wurde die Zuordnung der beiden VCA-Summenzweige
geklärt (siehe [`docs/HARDWARE_AUDIT.md`](../../docs/HARDWARE_AUDIT.md)).

## `hardware_checks.py`

Die widerlegbaren Prüfsteine des Hardwareabgleichs, ausführbar. Schneidet den
Filterkern aus `ACIDIFYDSP.cmajor` heraus und misst ihn als eigenständigen
Prozessor — der Stand misst damit immer den echten Plug-in-Code, nicht eine
Kopie, die auseinanderläuft (der Fehler K3).

```bash
ACIDIFY_BENCH_DIR=/pfad/mit/cmaj-bin python3 tools/bench/hardware_checks.py
```

Geprüft wird:

1. kein Anschwingen bei 200 / 1000 / 5000 Hz und vollem Regler
2. Anschwinggrenze frequenzabhängig — Reserve schrumpft zu hohen Frequenzen
3. Steilheit steigt über der Frequenz und bleibt unter 24 dB/Okt
4. Resonanz monoton über den ganzen Reglerweg, oberes Drittel trägt
5. Koppelnetz trifft Stinchcombes Übertragungsfunktion

Rückgabewert ungleich null, wenn ein Prüfstein fällt.

## `partcheck.py`

Prüft jeden Bauteilwert, aus dem eine DSP-Konstante abgeleitet ist, gegen die
**EAGLE-Quelldatei** des x0xb0x. Der x0xb0x ist quelloffen; `mainboard.sch`
ist die Textquelle. Scans lesen oder Netze im Bild verfolgen ist der falsche
Weg, solange diese Datei existiert.

```bash
curl -sSLO https://raw.githubusercontent.com/x0xb0x/x0xb0x.github.io/master/assets/media/x0xb0x/mainboard.sch
python3 tools/bench/partcheck.py mainboard.sch
```

Nicht abgedeckt: Verbindungen (dafür `nettrace.py`) und alles, was die
Schaltung nicht hergibt — Arbeitspunkte, Pinfunktionen des BA662A.
