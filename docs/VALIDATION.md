# Validierung 0.6.4

## Automatische Prüfungen

| Prüfung | Ergebnis |
|---|---|
| Amorph `preflight.py --strict` | bestanden |
| DSP-Lint / UI-Lint | je 0 Fehler, 0 Warnungen |
| DSP↔UI-Sync | 49/49 Parameter konsistent; Amorph `transportIn` plus 3 Cmajor-Timeline-Eingänge separat |
| Cmajor 1.0.3175 C++-Codegen | bestanden, ohne Compilerwarnung |
| JavaScript-Syntax aller Test-/Render-Skripte | bestanden |
| Live-Browser-Render Classic/Hoststatus-Simulation/Studio/Notenwahl/Distortion bei 1180 × 580 px | bestanden |
| Live-Browser-Render Classic/Hoststatus-Simulation/Studio/Notenwahl/Distortion bei 590 × 290 px | bestanden |
| Distortion-Overlay | Open/Close, Escape, Außenklick, Fokus und Status bestanden |
| Distortion-Parameter | Enable, drei Typen, Drive, Mix und Echo-Schutz bestanden |
| Amorph `data-endpoint-id` an globalen Controls | 17/17 |
| INT/DAW-UI | Tempo-Spiegelung, wertgleicher DAW→INT-Übergang, unabhängiger Transport-Lock, Internal-Fallback und Host-Lampe bestanden |
| Tempo-Fine-Control | 0,1 BPM normal und 0,01 BPM mit `Shift` bestanden |
| Englische Tooltips | 136 Ziele, Anzeige, On/Off und 0 verbleibende native `title`-Tooltips bestanden |
| Step-Pitch | Note/Oktave, Keyboard, Rechts-/Doppelklick, 25-Noten-Menü und Mausrad bestanden |
| Step-Zustände | Accent/Slide einzeln und gemeinsam als 18 × 18 px Badges bestanden |
| Step-Zustände bei 590 × 290 | Accent/Slide effektiv je 9 × 9 px bestanden |
| Parameter-Echo-Schutz und Web-Component-Reconnect | bestanden |
| Transport/Synthese/Master | je 13 px Abstand, identische Ober-/Unterkante |
| Waveform/Klangregler/Volume | max. 0,5 px Achsabweichung |
| Schutzabstände Accent→Master / Volume-Innenkanten | 27,7 px / je 24 px |
| Vier Step-Gruppen mit je vier Steps | je 13 px Gruppenabstand |
| Classic-Modulraster Status/Keyboard/Timing | gleiche Kanten, je 13 px Abstand |
| Keyboard-Geometrie | 7 weiße / 5 schwarze Tasten bestanden |
| Classic-Funktionsmatrix | 3 × 2, vollständig innerhalb der Modulbucht |
| Studio-Raster und 12 Aktionen | 4 Lanes × 4 Gruppen × 4 Steps bestanden |
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

## Clock- und Transportmatrix

`tools/dsp_transport_test.mjs` taktet vier parallele Instanzen des öffentlichen
Produktionsgraphen `Acidify` innerhalb desselben Cmajor-Renders:

- Kanal 1: interne Uhr,
- Kanal 2: DAW-Uhr mit Amorphs rollendem 6-Slot-`transportIn`,
- Kanal 3: DAW-Modus ohne Host-Transportstream; interner BPM- und
  Run/Stop-Fallback,
- Kanal 4: effektives Tempo einer DAW-Instanz vor, während und nach dem
  Rückschalten auf `Internal`.

| Samplerate | INT 120 BPM | DAW 120→180 BPM | DAW→INT bleibt 180 | ohne Position | Stop/Start | No-Host-Fallback | Startposition / Seek |
|---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| 44,1 kHz | bestanden | bestanden | bestanden | bestanden | bestanden | bestanden | Step 2 / Step 0 |
| 48 kHz | bestanden | bestanden | bestanden | bestanden | bestanden | bestanden | Step 2 / Step 0 |
| 88,2 kHz | bestanden | bestanden | bestanden | bestanden | bestanden | bestanden | Step 2 / Step 0 |
| 96 kHz | bestanden | bestanden | bestanden | bestanden | bestanden | bestanden | Step 2 / Step 0 |

Bei 120 BPM liegen Internal und DAW auf denselben samplegenauen
Step-Grenzen. Die erste halbe Sekunde erhält die DAW-Instanz bewusst nur Tempo
und Transport; der Fallback läuft korrekt und das spätere Positions-Lock
verursacht keinen Phasensprung. Nach einem Stop bei 1,0 s startet Internal bei Step 1 neu; die
DAW startet bei 1,25 s mit 180 BPM und Quarter-Note 8,5 korrekt auf Step 3
(interner Index 2). Ein Seek auf Quarter-Note 12 springt auf Step 1
(interner Index 0). Stop setzt die sichtbare Step-Position auf inaktiv.
Die dritte Instanz erhält ausschließlich `param9`, `param10` und
`param49 = DAW`; sie trifft dieselben Step-/Stop-/Start-Grenzen wie die interne
Referenz und belegt den spielbaren Fallback ohne Hostdaten.
Die vierte Instanz beginnt intern bei 120 BPM, folgt im DAW-Modus dem Wechsel
auf 180 BPM und hält nach dem Rückschalten auf `Internal` weiterhin 180 BPM.
Damit ist der Tempo-Handoff im DSP unabhängig von der geöffneten UI belegt.

## Was 0.6.4 technisch belegt

- Der Patch kompiliert und der 49-Parameter-Vertrag ist synchron.
- Der öffentliche Produktionsgraph reicht Amorphs dokumentierten
  6-Slot-`transportIn` bis in den 4×-Kern; Uhr und Transportlogik reagieren bis
  96 kHz reproduzierbar auf BPM, Play/Stop, Startposition und Seek.
- Fehlt der Host-Transportstream, bleiben interner BPM und Run/Stop in
  DAW-Stellung reproduzierbar funktionsfähig.
- Bei vorhandenem Hosttempo folgen Regler und `param9` dem DAW-Wert; beim
  Abschalten von Sync bleibt derselbe Wert im DSP erhalten und lässt sich
  anschließend mit 0,1/0,01 BPM fein verändern.
- Der Clean-Pfad enthält keine fest eingebackene Produktionsverzerrung.
- Distortion-Bypass und Null-Mix sind innerhalb derselben Instanz
  sampletransparent.
- Alle drei Distortion-Modi arbeiten und bleiben bis 96 kHz innerhalb der
  definierten Ausgangsgrenze.
- Legato, Retrigger, Notenpriorität und Release verhalten sich bis 96 kHz
  unterschiedlich und stabil.
- Die zuvor fixierte Classic-/Studio-Geometrie bleibt trotz Overlay erhalten.
- Note und Oktave sind in beiden Editoren sichtbar; Rechtsklick, Doppelklick,
  `NOTE`-Aktion und Mausrad sind im Browser-Workflow geprüft.
- Accent und Slide bleiben in Original- und Halbgröße sowie bei gemeinsamem
  Zustand visuell unterscheidbar.
- Die englischen Tooltips sind vollständig per kleinem UI-Schalter deaktivierbar
  und führen keinen neuen DSP-Parameter ein.

## Realer Amorph-Hostbefund

Der 0.6.2-Test lieferte an den drei typisierten `std::timeline::*`-Eingängen
keine Ereignisse. Dieser Befund wurde fälschlich als fehlende Amorph-Hostbridge
interpretiert. Der Dev-Kit dokumentiert jedoch den separaten
`input event float64 transportIn`, und bestehende Amorph-Plugins bestätigen den
6-Slot-Stream praktisch. Seit 0.6.3 verarbeitet ACIDIFY genau diesen Eingang.

Der grüne Produktionsgraphtest belegt die vollständige Patchverarbeitung des
Amorph-Streamformats. Nach Installation beziehungsweise Neucompilierung von
0.6.4 bleibt als letzter Schritt der reale DAW-Test für BPM, Play/Stop, PPQ und
den sichtbaren Tempo-Handoff.

## Noch nicht abgedeckt

- kalibrierte Referenzmessung gegen mehrere echte TB-303,
- signalabhängige Diodenkennlinie und Gerätevarianz anhand dieser Messungen,
- Preset-/Projekt-Reload und Automation im finalen Amorph Host,
- tatsächliche Weitergabe von Tempo, Transport und Position durch den finalen
  Amorph-Build in den unterstützten DAWs; die öffentlichen Amorph-v0.99/v1-
  Beta-Unterlagen dokumentieren diesen Hostvertrag derzeit nicht,
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
