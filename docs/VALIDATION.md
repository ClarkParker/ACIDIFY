# Validierung 0.9.0

## 0.9.0

| Prüfung | Ergebnis |
|---|---|
| `preflight.py --strict` | sauber |
| `smoke_test` | peak 0,85534 |
| `dsp_matrix_test` | 11/11 `ok`, höchster Effekt-Peak 0,9384 |
| `dsp_articulation_test` | `ok` |
| Kein Anschwingen bei 200 / 1000 / 5000 Hz, volle Resonanz | Tail 0,00001 … 0,00004 |
| Tieftonspitze bei voller Resonanz | −7,0 dB @ 9 Hz gegen −19,7 dB @ 4 Hz |

---

# Validierung 0.8.0

## 0.8.0 — Hardwareabgleich

| Prüfung | Ergebnis |
|---|---|
| `preflight.py --strict` | 50/50 Parameter, sauber |
| `smoke_test` | bestanden, peak 0,88806 |
| `dsp_matrix_test` | 11/11 `ok`, höchster Effekt-Peak 0,9395 |
| `dsp_articulation_test` | `ok`, Tails 1,9e-08 / 3,5e-08 |
| `dsp_transport_test` | 12/12 Prüfungen `ok` |
| Filterkern gegen den vermessenen Prototyp | stellengenau identisch (k=14/16,5/19,4 und Steilheit) |
| Koppelnetz gegen die analytische Funktion | Abweichung ≤ 0,0001 dB |
| Kein Anschwingen über den ganzen Reglerweg | Tail-RMS 0,0 bei Resonanz 0…1 |
| Reso-Comp bei Resonanz null wirkungslos | RMS auf 8 Stellen identisch zum Stand davor |

Details und die widerlegten Vorhersagen in [`DSP_AUDIT.md`](DSP_AUDIT.md).

---

# Validierung 0.7.2

## Automatische Prüfungen

| Prüfung | Ergebnis |
|---|---|
| Amorph `preflight.py --strict` | für 0.7.2 lokal nicht ausgeführt; das DEV-Kit blieb vertragsgemäß unangetastet |
| Lokale DSP-/UI-Prüfung | Cmajor-Codegen und `node --check` ohne Fehler; externer DEV-Kit-Lint für 0.7.2 nicht erneut ausgeführt |
| ACIDIFY-lokaler DSP↔UI-Abgleich | 50/50 Parameter konsistent; Amorph `transportIn` plus 3 Cmajor-Timeline-Eingänge separat |
| Cmajor 1.0.3175 C++-Codegen | bestanden, ohne Compilerwarnung |
| JavaScript-Syntax aller Test-/Render-Skripte | bestanden |
| Live-Browser-Render Classic/Hoststatus-Simulation/Studio/Notenwahl/Distortion bei 1180 × 580 px | bestanden |
| Live-Browser-Render Classic/Hoststatus-Simulation/Studio/Notenwahl/Distortion bei 590 × 290 px | bestanden |
| Distortion-Overlay | Open/Close, Escape, Außenklick, Fokus und Status bestanden |
| Distortion-Parameter | Enable, drei Typen, Drive, Mix und Echo-Schutz bestanden |
| Amorph `data-endpoint-id` an globalen Controls | 18/18 |
| INT/DAW-UI | Tempo-Spiegelung, wertgleicher DAW→INT-Übergang, unabhängiger Transport-Lock, Internal-Fallback und Host-Lampe bestanden |
| Tempo-Fine-Control | 0,1 BPM normal und 0,01 BPM mit `Shift` bestanden |
| Swing-UI | 0…100 %, Parametersend und englischer 2:1-Hinweis bestanden |
| Englische Tooltips | 142 Ziele, Anzeige, On/Off und 0 verbleibende native `title`-Tooltips bestanden |
| Gehäuseoberfläche | 0 dekorative Schraubenelemente; regelmäßige Linien aus 0.7.1 entfernt; neutrales mittleres Silber mit unregelmäßiger Körnung, breiten Reflexzonen und klaren Falzkanten in Classic, Studio, Notenwahl, Distortion und 590 × 290 kontrolliert |
| Step-Pitch | Note/Oktave, Keyboard, Rechts-/Doppelklick, 25-Noten-Menü und Mausrad bestanden |
| Step-Zustände | Accent/Slide einzeln und gemeinsam als 18 × 18 px Badges mittig im freien Step-Bereich bestanden |
| Step-Zustände bei 590 × 290 | Accent/Slide effektiv je 9 × 9 px bestanden |
| Live-Pitch-Map | 16 Knoten, Tonhöhenkontur sowie Accent/Slide/Rest/Auswahl/Playback bestanden |
| Parameter-Echo-Schutz und Web-Component-Reconnect | bestanden |
| Transport/Synthese/Master | je 13 px Abstand, identische Ober-/Unterkante |
| Waveform/Klangregler/Volume | max. 0,5 px Achsabweichung |
| Schutzabstände Accent→Master / Volume-Innenkanten | 27,7 px / je 24 px |
| Vier Step-Gruppen mit je vier Steps | je 13 px Gruppenabstand |
| Classic-Modulraster Status/Keyboard/Timing | gleiche Kanten, je 13 px Abstand |
| Keyboard-Geometrie | 7 weiße / 5 schwarze Tasten bestanden |
| Classic-Funktionsmatrix | 3 × 2, vollständig innerhalb der Modulbucht |
| Studio-Raster und 15 Aktionen | 4 Lanes × 4 Gruppen × 4 Steps, Reverse, Pitch Mirror, Generate/Mutate und Undo bestanden |
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

`tools/dsp_transport_test.mjs` taktet sechs parallele Instanzen des öffentlichen
Produktionsgraphen `Acidify` innerhalb desselben Cmajor-Renders:

- Kanal 1: interne Uhr,
- Kanal 2: DAW-Uhr mit Amorphs rollendem 6-Slot-`transportIn`,
- Kanal 3: DAW-Modus ohne Host-Transportstream; interner BPM- und
  Run/Stop-Fallback,
- Kanal 4: effektives Tempo einer DAW-Instanz vor, während und nach dem
  Rückschalten auf `Internal`,
- Kanal 5: interne Uhr mit 100 % Swing,
- Kanal 6: DAW-Uhr mit 100 % Swing und Amorph-PPQ.

| Samplerate | INT 120 BPM | DAW 120→180 BPM | DAW→INT bleibt 180 | ohne Position | Stop/Start | No-Host-Fallback | Startposition / Seek | INT Swing 2:1 | DAW Swing 2:1 |
|---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| 44,1 kHz | bestanden | bestanden | bestanden | bestanden | bestanden | bestanden | Step 2 / Step 0 | bestanden | bestanden |
| 48 kHz | bestanden | bestanden | bestanden | bestanden | bestanden | bestanden | Step 2 / Step 0 | bestanden | bestanden |
| 88,2 kHz | bestanden | bestanden | bestanden | bestanden | bestanden | bestanden | Step 2 / Step 0 | bestanden | bestanden |
| 96 kHz | bestanden | bestanden | bestanden | bestanden | bestanden | bestanden | Step 2 / Step 0 | bestanden | bestanden |

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
Die fünfte und sechste Instanz prüfen bei 100 % Swing samplegenau das
2:1-Verhältnis aus langem und kurzem 16tel. Das Zweierpaar behält seine
Gesamtdauer; Internal-Clock und DAW-PPQ treffen dieselben verschobenen
Step-Grenzen.

## Was 0.7.2 technisch belegt

- Der Patch kompiliert und der 50-Parameter-Vertrag ist synchron.
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
  Zustand visuell unterscheidbar und halten mittig mehr Abstand zum Notenwert.
- Die englischen Tooltips sind vollständig per kleinem UI-Schalter deaktivierbar
  und führen keinen neuen DSP-Parameter ein.
- Swing hält bei Internal- und DAW-Takt die Zweierpaarlänge stabil und erreicht
  bei 100 % das definierte 2:1-Verhältnis.
- Reverse, Pitch Mirror, skalenbewusstes Generate/Mutate und deren Undo-Pfade
  arbeiten auf den vorhandenen Step-Parametern.
- Die Live-Pitch-Map bildet alle 16 Step-Tonhöhen und Zustände ohne
  Layoutkollision in beiden Zielgrößen ab.
- Die dekorativen Schraubenköpfe sind vollständig entfernt; die neue
  Silbermetall-Oberfläche bewahrt das bestehende Modul- und Bedienraster.

## Realer Amorph-Hostbefund

Der 0.6.2-Test lieferte an den drei typisierten `std::timeline::*`-Eingängen
keine Ereignisse. Dieser Befund wurde fälschlich als fehlende Amorph-Hostbridge
interpretiert. Der Dev-Kit dokumentiert jedoch den separaten
`input event float64 transportIn`, und bestehende Amorph-Plugins bestätigen den
6-Slot-Stream praktisch. Seit 0.6.3 verarbeitet ACIDIFY genau diesen Eingang.

Der grüne Produktionsgraphtest belegt die vollständige Patchverarbeitung des
Amorph-Streamformats. Der Nutzer hat den exakten 0.6.4-Stand
`a34d0a3813a20ddb5241b587d5502ebd4b67fdac` anschließend in Amorph getestet
und als grundsätzlich passend bestätigt; detaillierte Angaben zu DAW,
Amorph-Version und Einzelfällen wurden dabei nicht protokolliert. Für 0.7.2
bleibt deshalb die reale Abnahme von Swing, neuen Studio-Werkzeugen,
Pitch-Map, der überarbeiteten Oberfläche und den geschützten
Transportfunktionen offen.

## Noch nicht abgedeckt

- kalibrierte Referenzmessung gegen mehrere echte TB-303,
- signalabhängige Diodenkennlinie und Gerätevarianz anhand dieser Messungen,
- Preset-/Projekt-Reload und Automation im finalen Amorph Host,
- detaillierter 0.7.2-Lauf von Tempo, Transport, Position, Swing und
  Parameterautomation im finalen Amorph-Build und in der Ziel-DAW,
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
Linux-Umgebung bei 44,1 kHz Audio, bleibt bei 48/88,2/96 kHz jedoch still. Der
unveränderte 0.6.4-Ausgangsstand `a34d0a3…` zeigt bei 48 kHz denselben Befund;
damit ist er nicht durch Swing oder die 0.7.x-UI-Änderungen entstanden.
Die verbindliche DSP-, Artikulations- und Transportmatrix verwendet interne,
samplegenaue Cmajor-Ereignisgeber und besteht bei allen vier Raten. Das
Produktions-MIDI-Endpoint kompiliert; der endgültige MIDI-/Hostlauf oberhalb
44,1 kHz bleibt dennoch im Amorph Host zu bestätigen.
