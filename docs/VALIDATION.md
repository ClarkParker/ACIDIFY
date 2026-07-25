# Validierung 0.5.0

## Automatische Prüfungen

| Prüfung | Ergebnis |
|---|---|
| Amorph `preflight.py --strict` | bestanden |
| DSP-Lint / UI-Lint | je 0 Fehler, 0 Warnungen |
| DSP↔UI-Sync | 48/48 Parameter konsistent |
| Cmajor 1.0.3175 C++-Codegen | bestanden, ohne Compilerwarnung |
| JavaScript-Syntax aller Test-/Render-Skripte | bestanden |
| Live-Browser-Render Classic/Studio/Distortion bei 1180 × 580 px | bestanden |
| Live-Browser-Render Classic/Studio/Distortion bei 590 × 290 px | bestanden |
| Distortion-Overlay | Open/Close, Escape, Außenklick, Fokus und Status bestanden |
| Distortion-Parameter | Enable, drei Typen, Drive, Mix und Echo-Schutz bestanden |
| Amorph `data-endpoint-id` an globalen Controls | 16/16 |
| Parameter-Echo-Schutz und Web-Component-Reconnect | bestanden |
| Transport/Synthese/Master | je 13 px Abstand, identische Ober-/Unterkante |
| Waveform/Klangregler/Volume | max. 0,5 px Achsabweichung |
| Schutzabstände Accent→Master / Volume-Innenkanten | 27,7 px / je 24 px |
| Vier Step-Gruppen mit je vier Steps | je 13 px Gruppenabstand |
| Classic-Modulraster Status/Keyboard/Timing | gleiche Kanten, je 13 px Abstand |
| Keyboard-Geometrie | 7 weiße / 5 schwarze Tasten bestanden |
| Classic-Funktionsmatrix | 3 × 2, vollständig innerhalb der Modulbucht |
| Studio-Raster und 11 Aktionen | 4 Lanes × 4 Gruppen × 4 Steps bestanden |
| Responsive Panelgrenzen bei 590 × 290 px | bestanden |

## DSP-Audiomatrix

`tools/dsp_matrix_test.mjs` erzeugt pro Fall einen temporären Testbuild mit
internem, samplegenauem Cmajor-Notengeber. Der linke Kanal gibt direkt
`cleanVoice`, der rechte denselben Zustand nach der Distortion Stage aus.
Dadurch werden Bypass und Effektdifferenz innerhalb derselben DSP-Instanz
verglichen; MIDI- oder Phasenabweichungen zwischen getrennten Rendererprozessen
können das Ergebnis nicht verfälschen.

| Samplerate | Clean Peak | Höchster Effekt-Peak | Bypass / `MIX=0` |
|---:|---:|---:|---:|
| 44,1 kHz | 0,678842 | 0,933069 | Differenz-RMS 0 |
| 48 kHz | 0,682583 | 0,933047 | Differenz-RMS 0 |
| 88,2 kHz | 0,684949 | 0,932926 | Differenz-RMS 0 |
| 96 kHz | 0,685351 | 0,932916 | Differenz-RMS 0 |

Geprüfte Fälle:

- deaktiviert mit `PHONO` und maximalem Drive,
- `PURE` bei Drive 0, 0,75 und 1,
- `MACKIE` bei Drive 0,75 und 1,
- `PHONO` bei Drive 0,75 und 1,
- `MACKIE` mit 50 % Parallel-Mix,
- `MACKIE` mit `MIX = 0`.

Alle Samples sind endlich und nicht still; kein Fall überschreitet
Full Scale. `PURE`, `MACKIE` und `PHONO` unterscheiden sich bei aktivem Drive
eindeutig vom Clean-Kanal.

## Artikulation

`tools/dsp_articulation_test.mjs` erzeugt MIDI-Ereignisse intern in Cmajor und
treibt zwei parallele 4×-Kerne samplegenau:

- links bleibt C2 gehalten, G2 gleitet hinein und beim Loslassen zurück zu C2;
- rechts wird vor jedem Tonwechsel Note-off gesendet und MEG/VEG werden
  neu getriggert.
- die Legato-Seite endet über MIDI CC 123, die Retrigger-Seite über Note-off.

| Samplerate | Legato↔Retrigger Differenz-RMS | Max. Einzelsprung | Höchster Tail-RMS |
|---:|---:|---:|---:|
| 44,1 kHz | 0,039651 | 0,165372 | 0,000000064 |
| 48 kHz | 0,039654 | 0,152828 | 0,000000028 |
| 88,2 kHz | 0,039617 | 0,084227 | 0,000000001 |
| 96 kHz | 0,039637 | 0,077709 | 0 |

Damit sind Slide ohne Hüllkurven-Retrigger, Retrigger mit neuer MEG/VEG-Kurve,
Rückkehr zur gehaltenen Note, Note-off, All Notes Off und ausklingender Zustand
abgedeckt.

## Was 0.5.0 technisch belegt

- Der Patch kompiliert und der 48-Parameter-Vertrag ist synchron.
- Der Clean-Pfad enthält keine fest eingebackene Produktionsverzerrung.
- Distortion-Bypass und Null-Mix sind innerhalb derselben Instanz
  sampletransparent.
- Alle drei Distortion-Modi arbeiten und bleiben bis 96 kHz innerhalb der
  definierten Ausgangsgrenze.
- Legato, Retrigger, Notenpriorität und Release verhalten sich bis 96 kHz
  unterschiedlich und stabil.
- Die zuvor fixierte Classic-/Studio-Geometrie bleibt trotz Overlay erhalten.

## Noch nicht abgedeckt

- kalibrierte Referenzmessung gegen mehrere echte TB-303,
- signalabhängige Diodenkennlinie und Gerätevarianz anhand dieser Messungen,
- Preset-/Projekt-Reload und Automation im finalen Amorph Host,
- CPU-Messung im finalen Host,
- Hostlauf bei 176,4/192 kHz,
- Blindtest mit Produzenten,
- Vergleich des generischen `PHONO`-Modells mit einem festgelegten,
  vermessenen DJ-Mixer.

Der Status ist deshalb **technisch validierter Modellkandidat**, nicht bereits
belegter AAA-/Hardware-Nulltest.

## CLI-Renderer-Grenze

Der separate historische Rauchtest verwendet `cmaj render --midi`. Dieser
externe MIDI-Dateipfad von Cmajor 1.0.3175 liefert in der vorliegenden
Linux-Umgebung bei 96 kHz nicht reproduzierbar Audio. Deshalb verwenden die
verbindliche DSP-Matrix und der Artikulationstest interne, samplegenaue
Cmajor-Ereignisgeber. Das Produktions-MIDI-Endpoint kompiliert; der endgültige
MIDI-Datei-/Hostlauf bei 96 kHz bleibt dennoch im Amorph Host zu bestätigen.
