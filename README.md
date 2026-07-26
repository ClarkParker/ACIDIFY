# ACIDIFY

ACIDIFY ist ein monophones, analog modelliertes 303-Class-Bassline-Instrument für
den [Amorph Host](https://github.com/ClarkParker/Amorph_DEV_KIt). Das Projekt
verbindet eine hardwareinspirierte Bedienoberfläche mit einem 4× oversampelten
Cmajor-DSP-Kern und einem 16-Step-Sequencer.

> Status: **DSP/Transport Release Candidate 0.10.0**. Clean-Core,
> 50-Parameter-Vertrag, Amorph-`transportIn`-Sync, sicherer Internal-Fallback,
> Swing und drei getrennte Post-Stufen sind implementiert und automatisiert
> geprüft. Studio ergänzt skalenbewusstes Generate/Mutate, Reverse, Pitch Mirror
> und eine Live-Pitch-Map. Der Nutzer hat den vorigen 0.6.4-Build in Amorph als
> grundsätzlich passend bestätigt; der neue 0.10.0-Build muss für die
> abschließende Produktbestätigung erneut in Amorph und der Ziel-DAW getestet
> werden. Die Bezeichnung „AAA Clone“ bleibt bis zu kalibrierten
> Hardware-Captures und Blindtests ausdrücklich ein Ziel, kein bereits
> beanspruchtes Messergebnis.

## Inhalt

- `ACIDIFY.cmajorpatch` – Amorph-Manifest
- `ACIDIFYDSP.cmajor` – MIDI-Instrument, Sequencer und 4×-DSP
- `ACIDIFYUI.js` – selbständige, skalierbare Web-Component ohne Abhängigkeiten
- `CHANGELOG.md` – vollständige Versionshistorie
- `docs/CONCEPT.md` – Produkt-, UI- und DSP-Konzept mit Quellen
- `docs/PARAMETERS.md` – stabiler `param1..param50`-Vertrag
- `THIRD_PARTY_NOTICES.md` – festgepinnte Quellstände und MIT-Hinweise
- `docs/VERSIONING.md` – verbindlicher Release- und Versionsablauf
- `mockup/preview.html` – lokaler UI-Preview-Host
- `tools/render_mockup.mjs` – rendert Classic, DAW-Sync, Studio, Notenwahl und Distortion in beiden Zielgrößen
- `tools/ui_smoke_test.mjs` – prüft Controls, Interaktionen und Skalierung
- `tools/smoke_test.mjs` – rendert eine akzentuierte C2-Note und prüft das Audio
- `tools/dsp_matrix_test.mjs` – vergleicht Clean- und Effektpfad im selben Render
- `tools/dsp_articulation_test.mjs` – prüft Slide, Retrigger und gehaltene Noten
- `tools/dsp_transport_test.mjs` – prüft interne und DAW-geführte Step-Uhr
- `tools/bench/` – Messstand für Filtergang, Aliasing, Pegel und UI-Ergonomie
- `tools/check_version.py` – prüft konsistente Versionsmetadaten

## Versionierung

Die Produktversion in `ACIDIFY.cmajorpatch` ist die verbindliche Quelle.
Jeder Release-Stand muss gleichzeitig im [Changelog](CHANGELOG.md) dokumentiert
sein und mit README sowie Validierungsdokument übereinstimmen. Die Prüfung
`python3 tools/check_version.py` läuft zusätzlich bei jedem Push und Pull
Request über GitHub Actions. Der vollständige Ablauf steht in
[docs/VERSIONING.md](docs/VERSIONING.md).

## Continuous Integration

Zwei Workflows laufen bei jedem Push und Pull Request:

- `.github/workflows/versioning.yml` – Versionsmetadaten und Changelog-Links,
- `.github/workflows/ci.yml` – Preflight und Manifestprüfung mit dem Dev-Kit,
  `node --check` der UI, der UI-Rauchtest in headless Chromium sowie C++-Codegen
  und MIDI-Render mit dem echten `cmaj`-Compiler über alle sechs Samplerates.

## Start

In Amorph `ACIDIFY.cmajorpatch` öffnen und kompilieren. Alternativ:

```bash
python3 ../Amorph_DEV_KIt/tools/preflight.py . --strict
cmaj generate --target=cpp --output=/dev/null ACIDIFY.cmajorpatch
node tools/smoke_test.mjs /path/to/cmaj 48000
node tools/dsp_matrix_test.mjs /path/to/cmaj 48000
node tools/dsp_articulation_test.mjs /path/to/cmaj 48000
node tools/dsp_transport_test.mjs /path/to/cmaj 48000
node tools/ui_smoke_test.mjs
```

Der UI-Rauchtest benötigt Playwright und einen Chromium-Build:

```bash
npm install playwright
npx playwright install chromium
node tools/ui_smoke_test.mjs
```

Ist kein von Playwright mitgeliefertes Chromium vorhanden, zeigt
`ACIDIFY_CHROMIUM_PATH` auf ein vorhandenes Binary. Beide Tools starten den
Browser immer mit `--allow-file-access-from-files`, weil `mockup/preview.html`
die UI als ES-Modul über `file://` lädt und Chromium solche Anfragen sonst als
cross-origin blockiert.

MIDI-Noten spielen den Synth direkt. Velocity ab 100 aktiviert Accent. Überlappende
Noten gleiten mit der festen 303-Slide-Zeit; beim Loslassen kehrt der monophone
Notenstapel zur zuletzt noch gehaltenen Note zurück.

## Tempo und Transport

Der kleine `INT/DAW`-Schalter im Transportmodul wählt die Taktquelle:

- `INT`: Der Tempo-Regler bestimmt 40…300 BPM; `RUN / STOP` startet und stoppt
  den internen 16tel-Sequencer.
- `DAW`: Der im Dev-Kit dokumentierte Amorph-Eingang
  `input event float64 transportIn` übernimmt BPM, Play/Stop und PPQ-Position.
  Host-Tempo sperrt nur den BPM-Regler, Host-Transport nur `RUN / STOP`. Sind
  beide vorhanden, folgen Tempo und Play/Stop der DAW. Liefert der Host außerdem
  die Songposition, folgen Pattern-Phase, Loop und Seek dem DAW-16tel-Raster.
- Solange Host-Tempo anliegt, folgt auch die sichtbare Stellung des
  Tempo-Reglers dem DAW-Wert und spiegelt ihn in `param9`. Beim Wechsel zurück
  auf `INT` bleibt dieser letzte Hostwert als manueller Ausgangspunkt erhalten.
  Mausrad und Pfeiltasten ändern anschließend 0,1 BPM; mit gedrückter
  `Shift`-Taste sind 0,01-BPM-Schritte möglich.
- `DAW · INT FALLBACK` bedeutet, dass der Host noch keinen
  Amorph-Transportstream weitergibt. Der Sequencer bleibt dann mit internem BPM und `RUN / STOP`
  vollständig bedienbar, statt stillzustehen.
- Teilweise Hostdaten werden als `DAW … · INT RUN` beziehungsweise
  `INT … · DAW RUN` ausgewiesen; die jeweils fehlende Funktion bleibt intern.

Der Stream besteht zyklisch aus sechs `float64`-Werten: Play, BPM,
Taktart-Zähler, Taktart-Nenner, absolute Quarter-Note-Position und einem
reservierten Slot. Die typisierten `std::timeline::*`-Eingänge bleiben zusätzlich
für standardkonforme Cmajor-Hosts verdrahtet.

`INT` ist der Initialwert von `param49`; ältere Presets behalten damit ihr
bisheriges Verhalten.

## Swing

`param50` fügt dem Sequencer 0…100 % Swing hinzu. Bei 0 % bleibt das
16tel-Raster gerade. Bei 100 % beginnt der zweite Step jedes Zweierpaars auf
der letzten Achteltriolenposition; lang und kurz stehen dann im Verhältnis
2:1, während die Gesamtdauer des Paars unverändert bleibt. Zwischenwerte
interpolieren stufenlos.

Dieselbe Berechnung steuert die interne Uhr und den DAW-PPQ-Pfad. Auch die
Gate-Mitte folgt der tatsächlich geswingten Step-Länge. Dadurch bleiben
Patternphase, Loop und Seek im DAW-Modus gebunden, ohne dass der Swing als
separate freie Uhr driftet. Der Initialwert 0 % bewahrt das Verhalten älterer
Projekte.

## English Tooltips

Alle bedienbaren Hauptfunktionen, Step-Zustände und Studio-Werkzeuge besitzen
englische Tooltips. Der kleine Schalter `? TIPS ON/OFF` unten links aktiviert
oder deaktiviert sie global. Die Einstellung ist reine UI-Hilfe, belegt keinen
weiteren Amorph-Parameter und wird – soweit der eingebettete Host
`localStorage` erlaubt – für die nächste UI-Instanz gespeichert.

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

Accent und Slide werden direkt auf den oberen Step-Tastern als große
Zustandsbadges dargestellt: rotes `A` für Accent und gelber Diagonalpfeil für
Slide. Die Badges sitzen mittig im freien Bereich der Taster statt direkt neben
dem Notenwert. Sind beide aktiv, bleiben beide gleichzeitig sichtbar.

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
- Rotate, Reverse, Pitch Mirror, Oktavtransposition und Rest,
- skalenbewusstes `GENERATE` und behutsames `MUTATE` für Minor Pentatonic,
  Minor, Major und Chromatic,
- präzise temporäre Reglerwerte, Fine-Modus mit `Shift` und Default-Marker,
- vier musikalisch gruppierte Viererblöcke mit durchgehender Step-Nummerierung.

Die Studio-Werkzeuge schreiben direkt in `param13..param44`. Pattern bleiben
dadurch vollständig kompatibel mit Amorph-Automation, Presets und dem
bestehenden DSP. Die Skalenwahl ist bewusst nur ein temporärer Editor-Kontext;
die erzeugten Noten und Flags selbst werden über die stabilen Step-Parameter
gespeichert. Die kompakte `PITCH MAP` in der Pattern-Kopfzeile zeigt alle
16 Tonhöhen sowie Accent-, Slide-, Rest-, Auswahl- und Playback-Zustände live.

Persistente Variationen und Bänke, zusätzliche Laufzeit-Play-Modes,
Step-Zeitraster, ein separates Position Lock, MIDI-/Audio-Drag-and-drop und
weitere Effektsektionen bleiben ausdrücklich einem späteren V2-Zustandsvertrag
vorbehalten.

## Hardware Performance Surface

Das Panel nutzt eine kleine Fibonacci-Abstandsskala (8, 13 und 21 px).
Transport, Synthese und Master bilden drei gleich hohe Module in einer neutralen,
körnigen Silbermetall-Oberfläche mit gerichteten Reflexzonen nach den
Hardware-Referenzfotos.
Dekorative Schraubenköpfe werden nicht verwendet. Waveform und die sechs
Klangregler liegen mit dem Volume-Regler auf einer gemeinsamen optischen Achse.
Der Output-Meter gehört vollständig zum Master-Modul. Zwischen allen drei
Modulen liegen 13 px; keine Rahmen- oder Trennlinie läuft in Regler oder
Schalter.

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
