# Validierung 0.2.1

## Automatische Prüfungen

| Prüfung | Ergebnis |
|---|---|
| Amorph `preflight.py --strict` | bestanden |
| DSP-Lint | 0 Fehler, 0 Warnungen |
| UI-Lint | 0 Fehler, 0 Warnungen |
| DSP↔UI-Sync | 44/44 Parameter konsistent |
| JavaScript Syntax (`node --check`) | bestanden |
| Live-Browser-Render (1180 × 580 px) | bestanden |
| Schutzabstände Accent/Master/Volume | 13 px |
| Classic-UI (Dial, Toggle, Run, Step) | bestanden |
| Studio-UI (Moduswechsel, 64 Lane-Cells, 11 Aktionen) | bestanden |
| Studio-Bereichsauswahl und Drag-Paint | bestanden |
| Studio-Undo, Copy/Paste, Batch-Transpose und Batch-Rest | bestanden |
| Studio-Tastaturkürzel und temporäres Reglerfeedback | bestanden |
| Responsive UI-Skalierung (590 × 290 px) | bestanden |
| Cmajor 1.0.3175 C++-Codegen | bestanden |
| MIDI→Stereo Render 44,1 kHz | Peak 0,45522; RMS 0,11637 |
| MIDI→Stereo Render 48 kHz | Peak 0,44916; RMS 0,14604 |

Der Rauchtest rendert eine akzentuierte C2-Note für zwei Viertelnoten, prüft
Stereoformat, endliche Samples, Nicht-Stille und Full-Scale-Sicherheit.
Der UI-Rauchtest lädt die echte Web-Component, prüft Elementzahlen,
Parameteränderung per Tastatur, Waveform-/Run-/Step-Interaktion, Classic als
Startmodus, den Wechsel zu Studio, Shift-Bereichsauswahl, Drag-Paint über
mehrere Accent-Zellen, Undo, Copy/Paste, Tastatur-Undo, Batch-Transpose,
Batch-Rest, temporäres Reglerfeedback und die skalierten Panelgrenzen. Classic
und Studio werden zusätzlich aus der laufenden Web-Component als getrennte
PNG-Mockups gerendert. Ein zusätzlicher Geometrietest misst die Freiräume
zwischen Accent-Ring, Master-Bucht und Volume-Ring, damit keine geprägte Linie
bei nativer Größe in ein Bedienelement läuft.

## Bekannte Test-Harness-Grenze

Der `cmaj render`-MIDI-Pfad von Cmajor 1.0.3175 erzeugt in dieser Linux-Umgebung
oberhalb von 48 kHz keine verlässlich wiederholbare Ausgabe. Dasselbe Verhalten tritt mit dem offiziellen
`Amorph_DEV_KIt/examples/02_PolySynth` auf und ist daher nicht ACIDIFY-spezifisch.
Der Patch selbst kompiliert. 88,2/96/176,4/192-kHz-Laufzeittests müssen im Amorph Host
oder mit einem korrigierten Renderer nachgeholt werden.

## Noch nicht abgedeckt

- Referenzmessung gegen echte TB-303-Hardware,
- automatisierte Extremwert-Sweeps aller Regler,
- Preset-/Projekt-Reload in Amorph,
- CPU-Messung im finalen Host,
- Blindtest und Gerätevarianz.
