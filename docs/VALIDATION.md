# Validierung 0.4.0

## Automatische Prüfungen

| Prüfung | Ergebnis |
|---|---|
| Amorph `preflight.py --strict` | bestanden |
| DSP-Lint | 0 Fehler, 0 Warnungen |
| UI-Lint | 0 Fehler, 0 Warnungen |
| DSP↔UI-Sync | 44/44 Parameter konsistent |
| JavaScript Syntax (`node --check`) | bestanden |
| Live-Browser-Render (1180 × 580 px) | bestanden |
| Makromodule Transport/Synthese/Master | je 13 px Abstand |
| Synthese-/Master-Achsen | identische Ober-/Unterkante |
| Waveform/Klangregler/Volume | max. 0,5 px Achsabweichung |
| Schutzabstände Accent/Master/Volume | mindestens 24 px |
| Vier Step-Gruppen mit 4 × 4 Steps | je 13 px Gruppenabstand |
| Classic-Modulraster (Status/Keyboard/Timing) | gleiche Ober-/Unterkante, je 13 px Abstand |
| Classic-Funktionsmatrix | 3 × 2, vollständig innerhalb der Modulbucht |
| Keyboard-Geometrie (7 weiße / 5 schwarze Tasten) | Overlay und Z-Reihenfolge bestanden |
| Classic-UI (Dial, Toggle, Run, Step) | bestanden |
| Studio-UI (Moduswechsel, 64 Lane-Cells, 11 Aktionen) | bestanden |
| Studio-Workflow-Schalter | 156 × 32 px, aktive Ansicht eindeutig beschriftet |
| Studio-Lane-Raster | 4 Lanes × 4 Gruppen × 4 Steps, je 8 px Gruppenabstand |
| Classic `CLEAR` | setzt Pitch und Flags des gewählten Steps zurück |
| Studio-Bereichsauswahl und Drag-Paint | bestanden |
| Studio-Undo, Copy/Paste, Batch-Transpose und Batch-Rest | bestanden |
| Studio-Tastaturkürzel und temporäres Reglerfeedback | bestanden |
| Responsive UI-Skalierung (590 × 290 px) | bestanden |
| Cmajor 1.0.3175 C++-Codegen | in 0.4.0 erneut ausgeführt, bestanden |
| Manifestprüfung `manifest_check.py --strict` | bestanden |
| MIDI→Stereo Render 44,1 kHz | Peak 0,45522; RMS 0,11637 |
| MIDI→Stereo Render 48 kHz | Peak 0,44916; RMS 0,14604 |
| MIDI→Stereo Render 88,2 kHz | Peak 0,43836; RMS 0,12477 |
| MIDI→Stereo Render 96 kHz | Peak 0,43773; RMS 0,12552 |
| MIDI→Stereo Render 176,4 kHz | Peak 0,44083; RMS 0,12874 |
| MIDI→Stereo Render 192 kHz | Peak 0,44119; RMS 0,15497 |
| Wiederholbarkeit der Renders | je drei Läufe bei 48/96/192 kHz, identische Werte |
| Note-Off-Freigabe (renderer­unabhängig) | bei 44,1/48/96/192 kHz bestanden |

Der Rauchtest rendert eine akzentuierte C2-Note für zwei Viertelnoten, prüft
Stereoformat, endliche Samples, Nicht-Stille und Full-Scale-Sicherheit.
Der UI-Rauchtest lädt die echte Web-Component, prüft Elementzahlen,
Parameteränderung per Tastatur, Waveform-/Run-/Step-Interaktion, Classic als
Startmodus, den Wechsel zu Studio, Shift-Bereichsauswahl, Drag-Paint über
mehrere Accent-Zellen, Undo, Copy/Paste, Tastatur-Undo, Batch-Transpose,
Batch-Rest, die echte Classic-Clear-Aktion, temporäres Reglerfeedback und die
skalierten Panelgrenzen. Der Test prüft außerdem die sichtbare Größe und den
Status des Workflow-Schalters sowie die 4 × 4-Gruppierung aller Studio-Lanes. Classic
und Studio werden zusätzlich aus der laufenden Web-Component als getrennte
PNG-Mockups gerendert. Geometrietests messen die Freiräume zwischen Accent-Ring,
Master-Bucht und Volume-Ring sowie Step-Gruppen, Classic-Modulen und den
überlagerten Keyboard-Tasten. Damit können weder geprägte Linien noch
Nachbarbereiche bei nativer Größe in Bedienelemente laufen.

0.4.0 verändert ausschließlich UI, Manifestversion, Mockups und Dokumentation;
`ACIDIFYDSP.cmajor` ist gegenüber 0.2.1 unverändert. Die Audiozahlen oben sind
trotzdem für 0.4.0 frisch gemessen: Der fehlende GUI-Unterbau der Cmajor-Binärdatei
(`libwebkit2gtk-4.0.so.37`, `libjavascriptcoregtk-4.0.so.18`, `libsoup-2.4.so.1`,
`libjack.so.0`) lässt sich mit denselben Stub-Bibliotheken überbrücken, die das
Dev-Kit bereits in seiner CI verwendet. Codegen und Render laufen damit headless;
`.github/workflows/ci.yml` führt beides bei jedem Push aus.

## Eigenschaften des `cmaj render`-Harness

Die früher notierte Grenze „oberhalb von 48 kHz nicht wiederholbar“ trifft so
nicht zu. Gemessen an Cmajor 1.0.3175 gilt:

- **Wiederholbar.** Je drei Läufe bei 48, 96 und 192 kHz liefern identische Peak-
  und RMS-Werte. Auch 88,2 und 176,4 kHz rendern sauber.
- **Fester Vorlauf.** `cmaj render` schreibt vor dem ersten Audiosample rund
  20 100 Samples Stille – unabhängig von der Samplerate und damit keine
  Plugin-Latenz. Mit `Amorph_DEV_KIt/examples/02_PolySynth` tritt derselbe
  Versatz auf (≈ 20 096 Samples), er gehört also zum Renderer.
- **MIDI-Datei-Pfad verliert Note-Offs.** Bei 48 und 192 kHz klingt die Note im
  Render endlos weiter, bei 44,1 und 96 kHz nicht. Deshalb schwanken die
  RMS-Werte oben zwischen den Raten; die Peak-Werte sind stabil. Die RMS-Spalte
  eignet sich daher nicht zum Vergleich der Raten untereinander.

Der Note-Off-Pfad des DSP selbst ist davon nicht betroffen. Ein Prüfaufbau ohne
MIDI-Datei – ein Cmajor-Quellprozessor sendet Note-On und 0,5 s später Note-Off
direkt an den `Acidify`-Graph – gibt die Note bei 44,1, 48, 96 und 192 kHz
korrekt frei und klingt in allen vier Fällen vollständig ab.

## Noch nicht abgedeckt

- Referenzmessung gegen echte TB-303-Hardware,
- automatisierte Extremwert-Sweeps aller Regler,
- Preset-/Projekt-Reload in Amorph,
- CPU-Messung im finalen Host,
- Blindtest und Gerätevarianz.
