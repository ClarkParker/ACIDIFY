# ACIDIFY

ACIDIFY ist ein monophones, analog modelliertes 303-Class-Bassline-Instrument für
den [Amorph Host](https://github.com/ClarkParker/Amorph_DEV_KIt). Das Projekt
verbindet eine hardwareinspirierte Bedienoberfläche mit einem 4× oversampelten
Cmajor-DSP-Kern und einem 16-Step-Sequencer.

> Status: **DSP/Transport Release Candidate 0.6.1**. Die fixierte
> Classic-/Studio-Oberfläche wurde nur um einen kleinen `DIST`-Button mit
> ausklappbarem Overlay sowie die kompakte `INT/DAW`-Uhrwahl erweitert.
> Clean-Core, 49-Parameter-Vertrag, Cmajor-Timeline-Logik, sicherer
> Internal-Fallback und drei getrennte Post-Stufen sind implementiert und
> automatisiert geprüft. Die tatsächliche Timeline-Weitergabe bleibt eine
> Fähigkeit des jeweiligen Amorph-Runtime-Builds. Die
> Bezeichnung „AAA Clone“ bleibt bis zu kalibrierten Hardware-Captures und
> Blindtests ausdrücklich ein Ziel, kein bereits beanspruchtes Messergebnis.

## Inhalt

- `ACIDIFY.cmajorpatch` – Amorph-Manifest
- `ACIDIFYDSP.cmajor` – MIDI-Instrument, Sequencer und 4×-DSP
- `ACIDIFYUI.js` – selbständige, skalierbare Web-Component ohne Abhängigkeiten
- `CHANGELOG.md` – vollständige Versionshistorie
- `docs/CONCEPT.md` – Produkt-, UI- und DSP-Konzept mit Quellen
- `docs/PARAMETERS.md` – stabiler `param1..param49`-Vertrag
- `THIRD_PARTY_NOTICES.md` – festgepinnte Quellstände und MIT-Hinweise
- `docs/VERSIONING.md` – verbindlicher Release- und Versionsablauf
- `mockup/preview.html` – lokaler UI-Preview-Host
- `tools/render_mockup.mjs` – rendert Classic, DAW-Sync, Studio, Notenwahl und Distortion in beiden Zielgrößen
- `tools/ui_smoke_test.mjs` – prüft Controls, Interaktionen und Skalierung
- `tools/dsp_matrix_test.mjs` – vergleicht Clean- und Effektpfad im selben Render
- `tools/dsp_articulation_test.mjs` – prüft Slide, Retrigger und gehaltene Noten
- `tools/dsp_transport_test.mjs` – prüft interne und DAW-geführte Step-Uhr
- `tools/check_version.py` – prüft konsistente Versionsmetadaten

## Versionierung

Die Produktversion in `ACIDIFY.cmajorpatch` ist die verbindliche Quelle.
Jeder Release-Stand muss gleichzeitig im [Changelog](CHANGELOG.md) dokumentiert
sein und mit README sowie Validierungsdokument übereinstimmen. Die Prüfung
`python3 tools/check_version.py` läuft zusätzlich bei jedem Push und Pull
Request über GitHub Actions. Der vollständige Ablauf steht in
[docs/VERSIONING.md](docs/VERSIONING.md).

## Start

In Amorph `ACIDIFY.cmajorpatch` öffnen und kompilieren. Alternativ:

```bash
python3 ../Amorph_DEV_KIt/tools/preflight.py .
cmaj generate --target=cpp --output=/dev/null ACIDIFY.cmajorpatch
node tools/smoke_test.mjs /path/to/cmaj 48000
node tools/dsp_matrix_test.mjs /path/to/cmaj 48000
node tools/dsp_articulation_test.mjs /path/to/cmaj 48000
node tools/dsp_transport_test.mjs /path/to/cmaj 48000
```

MIDI-Noten spielen den Synth direkt. Velocity ab 100 aktiviert Accent. Überlappende
Noten gleiten mit der festen 303-Slide-Zeit; beim Loslassen kehrt der monophone
Notenstapel zur zuletzt noch gehaltenen Note zurück.

## Tempo und Transport

Der kleine `INT/DAW`-Schalter im Transportmodul wählt die Taktquelle:

- `INT`: Der Tempo-Regler bestimmt 40…300 BPM; `RUN / STOP` startet und stoppt
  den internen 16tel-Sequencer.
- `DAW`: Empfangene Cmajor-Hostereignisse übernehmen ihre jeweilige Funktion.
  Host-Tempo sperrt nur den BPM-Regler, Host-Transport nur `RUN / STOP`. Sind
  beide vorhanden, folgen Tempo und Play/Stop der DAW. Liefert der Host außerdem
  die Songposition, folgen Pattern-Phase, Loop und Seek dem DAW-16tel-Raster.
- `DAW · INT FALLBACK` bedeutet, dass der Host noch keine Cmajor-Timeline
  weitergibt. Der Sequencer bleibt dann mit internem BPM und `RUN / STOP`
  vollständig bedienbar, statt stillzustehen.
- Teilweise Hostdaten werden als `DAW … · INT RUN` beziehungsweise
  `INT … · DAW RUN` ausgewiesen; die jeweils fehlende Funktion bleibt intern.
- Die öffentlichen Amorph-v0.99/v1-Beta-Unterlagen dokumentieren aktuell keinen
  Timeline-Forwarding-Vertrag. Der Patch kann den Empfang eindeutig anzeigen
  und verarbeiten, eine fehlende Runtime-Brücke aber nicht innerhalb des DSP
  ersetzen.

`INT` ist der Initialwert von `param49`; ältere Presets behalten damit ihr
bisheriges Verhalten.

## Tonhöhe einzelner Steps

Absolute Note und relative Oktavlage (`+0`, `+1`, `+2`) stehen dauerhaft auf
jedem Step. In Classic gibt es vier direkte Wege:

1. Step anklicken und auf der kleinen Klaviatur die Tonklasse wählen.
2. Mit `OCT − / OCT +` die Oktavlage ändern.
3. Rechtsklick oder Doppelklick auf einen Step öffnet die direkte Auswahl aller
   25 möglichen Noten.
4. Das Mausrad über einem Step ändert die Tonhöhe halbtonweise.

Studio bietet dieselbe direkte Auswahl per Rechts-/Doppelklick auf der
`NOTE`-Zeile sowie einen sichtbaren `NOTE`-Button. Bei Mehrfachauswahl setzt das
Menü alle gewählten Steps gemeinsam. Das Mausrad funktioniert sowohl in der
`NOTE`-Zeile als auch weiterhin auf den oberen Step-Buttons. `ROOT` transponiert
das gesamte Pattern, während jeder Step seinen Offset von 0…24 Halbtönen behält.

## Distortion Stage

Der kleine `DIST`-Button im Master-Kopf zeigt per LED, ob die Stage aktiv ist,
und öffnet das Overlay. Das Hauptpanel wird nicht vergrößert oder umgebaut. Im
Overlay stehen True Bypass, Charakter, Drive und Mix zur Verfügung:

- `PURE` – subtiler, pegelabhängiger Airwindows-PurestDrive-Port,
- `MACKIE` – Port des pre-VLZ-Mackie-1202-Signalwegs aus Airwindows Mackity,
- `PHONO` – bewusst generisches Line-in-Phono-Abuse-Modell mit
  3180/318/75-µs-RIAA-Kurve; keine Behauptung, einen bestimmten Mixer zu emulieren.

Die Stage liegt ausschließlich hinter dem Clean-Instrument, läuft innerhalb des
4×-Kerns und überblendet Bypass, Typ und Mix ohne harte Parametersprünge.
Deaktiviert oder bei `MIX = 0` bleibt der Ausgang sampletransparent.

## Classic Surface / Studio Intelligence

ACIDIFY startet immer in der hardwaregetreuen Classic-Ansicht. Der prominent in
der Pattern-Kopfzeile platzierte `CLASSIC / STUDIO`-Schalter – alternativ die
Taste `M`, solange ein UI-Control fokussiert ist – öffnet eine zweite, moderne
Bearbeitungsebene, ohne neue DSP-Parameter einzuführen:

- Shift-Auswahl und Mehrfachauswahl von Steps,
- Drag-Paint für Gate, Accent und Slide,
- sichtbare Note/Oktave, direkte 25-Noten-Auswahl sowie Halbton-Mausrad,
- Undo/Redo sowie Copy/Paste,
- Rotate, Oktavtransposition, Rest und dosiertes Randomize,
- präzise temporäre Reglerwerte, Fine-Modus mit `Shift` und Default-Marker,
- vier musikalisch gruppierte Viererblöcke mit durchgehender Step-Nummerierung.

Die Studio-Werkzeuge schreiben direkt in `param13..param44`. Pattern bleiben
dadurch vollständig kompatibel mit Amorph-Automation, Presets und dem
bestehenden DSP.

## Hardware Performance Surface

Das Panel nutzt eine kleine Fibonacci-Abstandsskala (8, 13 und 21 px).
Transport, Synthese und Master bilden drei gleich hohe Module in der etablierten
hellen Metall-/Hardware-Sprache von ACIDIFY. Waveform und die sechs Klangregler
liegen mit dem Volume-Regler auf einer gemeinsamen optischen Achse. Der
Output-Meter gehört vollständig zum Master-Modul. Zwischen allen drei Modulen
liegen 13 px; keine Rahmen- oder Trennlinie läuft in Regler oder Schalter.

Die 16 Sequencer-Schritte sind als vier musikalische Vierergruppen organisiert.
Im Classic-Editor bilden Status, Keyboard und Timing drei gleich hohe,
eigenständige Module mit jeweils 13 px Abstand. Das Keyboard verwendet die
korrekte Klaviergeometrie aus sieben lückenlosen weißen Tasten und fünf
darüberliegenden, schmaleren schwarzen Tasten. `CLEAR` setzt den gewählten Step
eindeutig zurück. Die sechs Step-Funktionen sitzen in einer vollständig
eingefassten 3 × 2-Matrix. Studio verwendet dieselbe Oberfläche und wechselt
nur den Editor in das präzise Vier-Lane-Raster.

## Herkunft und Lizenz

Der Filter-, Hüllkurven- und Artikulationsentwurf orientiert sich an
Schaltungsunterlagen, Robin Whittles Accent-Analyse, Tim Stinchcombes
Filteranalyse sowie am MIT-lizenzierten Open303 von Robin Schmidt. `PURE` und
`MACKIE` portieren gekennzeichnete Signalwege aus dem ebenfalls
MIT-lizenzierten Airwindows. Exakte Commits, Quelldateien, Blob-SHAs und
Lizenztexte stehen in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). Das
Projekt verwendet keine Roland-Logos, Samples oder Bitmap-Kopien.

Der eigene Projektcode steht unter der MIT-Lizenz, siehe `LICENSE`.
