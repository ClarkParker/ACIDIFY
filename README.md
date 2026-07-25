# ACIDIFY

ACIDIFY ist ein monophones, analog modelliertes 303-Class-Bassline-Instrument für
den [Amorph Host](https://github.com/ClarkParker/Amorph_DEV_KIt). Das Projekt
verbindet eine hardwareinspirierte Bedienoberfläche mit einem 4× oversampelten
Cmajor-DSP-Kern und einem 16-Step-Sequencer.

> Status: **DSP/Distortion Release Candidate 0.5.0**. Die fixierte
> Classic-/Studio-Oberfläche wurde nur um einen kleinen `DIST`-Button mit
> ausklappbarem Overlay erweitert. Clean-Core, 48-Parameter-Vertrag und drei
> getrennte Post-Stufen sind implementiert und automatisiert geprüft. Die
> Bezeichnung „AAA Clone“ bleibt bis zu kalibrierten Hardware-Captures und
> Blindtests ausdrücklich ein Ziel, kein bereits beanspruchtes Messergebnis.

## Inhalt

- `ACIDIFY.cmajorpatch` – Amorph-Manifest
- `ACIDIFYDSP.cmajor` – MIDI-Instrument, Sequencer und 4×-DSP
- `ACIDIFYUI.js` – selbständige, skalierbare Web-Component ohne Abhängigkeiten
- `CHANGELOG.md` – vollständige Versionshistorie
- `docs/CONCEPT.md` – Produkt-, UI- und DSP-Konzept mit Quellen
- `docs/PARAMETERS.md` – stabiler `param1..param48`-Vertrag
- `THIRD_PARTY_NOTICES.md` – festgepinnte Quellstände und MIT-Hinweise
- `docs/VERSIONING.md` – verbindlicher Release- und Versionsablauf
- `mockup/preview.html` – lokaler UI-Preview-Host
- `tools/render_mockup.mjs` – rendert Classic, Studio und Distortion in beiden Zielgrößen
- `tools/ui_smoke_test.mjs` – prüft Controls, Interaktionen und Skalierung
- `tools/dsp_matrix_test.mjs` – vergleicht Clean- und Effektpfad im selben Render
- `tools/dsp_articulation_test.mjs` – prüft Slide, Retrigger und gehaltene Noten
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
```

MIDI-Noten spielen den Synth direkt. Velocity ab 100 aktiviert Accent. Überlappende
Noten gleiten mit der festen 303-Slide-Zeit; beim Loslassen kehrt der monophone
Notenstapel zur zuletzt noch gehaltenen Note zurück. Der interne Sequencer wird
mit `RUN/STOP` gestartet; Tonhöhe, Gate, Accent und Slide lassen sich pro Step am
Panel editieren.

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
- Pitch-Änderung per Mausrad,
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
