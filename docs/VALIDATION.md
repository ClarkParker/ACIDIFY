# Validierung 0.4.1

## Automatische Prüfungen

| Prüfung | Ergebnis |
|---|---|
| Amorph `preflight.py --strict` | bestanden |
| DSP-Lint | 0 Fehler, 0 Warnungen |
| UI-Lint | 0 Fehler, 0 Warnungen |
| DSP↔UI-Sync | 44/44 Parameter konsistent |
| JavaScript Syntax (`node --check`) | bestanden |
| Live-Browser-Render Classic/Studio (1180 × 580 px) | bestanden |
| Live-Browser-Render Classic/Studio (590 × 290 px) | bestanden |
| Makromodule Transport/Synthese/Master | je 13 px Abstand, identische Ober-/Unterkante |
| Waveform/Klangregler/Volume | max. 0,5 px Achsabweichung |
| Schutzabstände Accent→Master / Volume-Innenkanten | 27,7 px / je 24 px |
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
| Parameter-Echo-Schutz inkl. lokalem Root-Zustand | bestanden |
| Web-Component Reconnect ohne doppelte Handler | bestanden |
| Amorph `data-endpoint-id` an globalen Controls | 12/12 |
| Responsive UI-Skalierung und Kleinformat-Typografie (590 × 290 px) | bestanden |
| Cmajor 1.0.3175 C++-Codegen | in 0.2.1 bestanden; DSP in 0.3.0 unverändert |
| MIDI→Stereo Render 44,1 kHz | 0.2.1: Peak 0,45522; RMS 0,11637; DSP unverändert |
| MIDI→Stereo Render 48 kHz | 0.2.1: Peak 0,44916; RMS 0,14604; DSP unverändert |

Der Rauchtest rendert eine akzentuierte C2-Note für zwei Viertelnoten, prüft
Stereoformat, endliche Samples, Nicht-Stille und Full-Scale-Sicherheit.
Der UI-Rauchtest lädt die echte Web-Component, prüft Elementzahlen,
Parameteränderung per Tastatur, Waveform-/Run-/Step-Interaktion, Classic als
Startmodus, den Wechsel zu Studio, Shift-Bereichsauswahl, Drag-Paint über
mehrere Accent-Zellen, Undo, Copy/Paste, Tastatur-Undo, Batch-Transpose,
Batch-Rest, die echte Classic-Clear-Aktion, temporäres Reglerfeedback,
Parameter-Echos, einen vollständigen Disconnect/Reconnect und die skalierten
Panelgrenzen. Der Test prüft außerdem die sichtbare Größe und den Status des
Workflow-Schalters, die 4 × 4-Gruppierung aller Studio-Lanes und die von Amorph
erwarteten Endpoint-Attribute. Classic und Studio werden aus der laufenden
Web-Component in beiden Zielgrößen als vier getrennte PNG-Mockups gerendert.
Geometrietests messen die gemeinsamen Modulachsen und die Freiräume zwischen
Accent-Ring, Master-Bucht und Volume-Ring sowie Step-Gruppen, Classic-Modulen
und den überlagerten Keyboard-Tasten. Damit können weder Rahmen noch
Nachbarbereiche bei nativer Größe in Bedienelemente laufen.

0.4.1 verändert ausschließlich UI, Render-/Test-Harness, Manifestversion,
Mockups und Dokumentation. `ACIDIFYDSP.cmajor` ist bytegenau gegenüber dem
Remote-Ausgangsblob `71c60e382edce2025feb00704505ec9ceb58d810`
beziehungsweise SHA-256
`779b0e437fa03507a7d9df53bef22cd0ed344f1a46406e58c18f3b56d4374f20`
unverändert. In der aktuellen Umgebung ist kein Cmajor-Compiler installiert;
deshalb werden die Audiozahlen oben ausdrücklich als historischer
0.2.1-Nachweis und nicht als neuer Lauf ausgegeben.

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
