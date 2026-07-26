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

Ein lauffähiger `cmaj` und Playwright. Der Pfad zum Compiler steht in
`bench.py` (`CMAJ`) und `filtermeas.py`.

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
