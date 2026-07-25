# ACIDIFY

ACIDIFY ist ein monophones, analog modelliertes 303-Class-Bassline-Instrument für
den [Amorph Host](https://github.com/ClarkParker/Amorph_DEV_KIt). Das Projekt
verbindet eine hardwareinspirierte Bedienoberfläche mit einem 4× oversampelten
Cmajor-DSP-Kern und einem 16-Step-Sequencer.

> Status: **Research Prototype 0.2.2**. UI, Parametervertrag und ein spielbarer
> DSP-Kern sind implementiert. Die Bezeichnung „AAA“ ist ein Qualitätsziel, kein
> bereits abgeschlossener Messnachweis; dafür fehlen noch Hardware-Captures,
> Null-/Residualtests und ein kalibrierter Hörtest gegen mehrere Originalgeräte.

## Inhalt

- `ACIDIFY.cmajorpatch` – Amorph-Manifest
- `ACIDIFYDSP.cmajor` – MIDI-Instrument, Sequencer und 4×-DSP
- `ACIDIFYUI.js` – selbständige, skalierbare Web-Component ohne Abhängigkeiten
- `docs/CONCEPT.md` – Produkt-, UI- und DSP-Konzept mit Quellen
- `docs/PARAMETERS.md` – stabiler `param1..param44`-Vertrag
- `mockup/preview.html` – lokaler UI-Preview-Host
- `tools/render_mockup.mjs` – rendert den Preview als PNG
- `tools/ui_smoke_test.mjs` – prüft Controls, Interaktionen und Skalierung

## Start

In Amorph `ACIDIFY.cmajorpatch` öffnen und kompilieren. Alternativ:

```bash
python3 ../Amorph_DEV_KIt/tools/preflight.py .
cmaj generate --target=cpp --output=/dev/null ACIDIFY.cmajorpatch
node tools/smoke_test.mjs /path/to/cmaj 48000
```

MIDI-Noten spielen den Synth direkt. Velocity ab 100 aktiviert Accent. Überlappende
Noten gleiten mit der festen 303-Slide-Zeit. Der interne Sequencer wird mit
`RUN/STOP` gestartet; Tonhöhe, Gate, Accent und Slide lassen sich pro Step am Panel
editieren.

## Classic Surface / Studio Intelligence

ACIDIFY startet immer in der hardwaregetreuen Classic-Ansicht. Der
`CLASSIC / STUDIO`-Schalter öffnet bei Bedarf eine zweite, moderne
Bearbeitungsebene, ohne neue DSP-Parameter einzuführen:

- Shift-Auswahl und Mehrfachauswahl von Steps,
- Drag-Paint für Gate, Accent und Slide,
- Pitch-Änderung per Mausrad,
- Undo/Redo sowie Copy/Paste,
- Rotate, Oktavtransposition, Rest und dosiertes Randomize,
- präzise temporäre Reglerwerte, Fine-Modus mit `Shift` und Default-Marker.

Die Studio-Werkzeuge schreiben direkt in `param13..param44`. Pattern bleiben
dadurch vollständig kompatibel mit Amorph-Automation, Presets und dem
bestehenden DSP.

## Panel-Raster

Das Panel nutzt eine kleine Fibonacci-Abstandsskala (8, 13 und 21 px).
Klangregler, Waveform und Master-Bucht besitzen dadurch feste Schutzzonen;
geprägte Trennlinien laufen nicht in Regler oder Schalter. Volume sitzt als klar
erkennbare Master-Sektion in einer eigenen, eingelassenen Bucht, während die
sechs klangformenden Regler eine zusammenhängende Bank bleiben.

Die 16 Sequencer-Schritte sind als vier musikalische Vierergruppen organisiert.
Im Classic-Editor bilden Status, Keyboard und Timing drei gleich hohe
Modulbuchten mit jeweils 13 px Abstand. Das Keyboard verwendet die korrekte
Klaviergeometrie aus sieben lückenlosen weißen Tasten und fünf darüberliegenden,
schmaleren schwarzen Tasten.

## Herkunft und Lizenz

Der Filter- und Hüllkurvenentwurf orientiert sich an Schaltungsunterlagen, Tim
Stinchcombes Analyse sowie am MIT-lizenzierten Open303 von Robin Schmidt. Portierte
Open303-Ideen sind in `ACIDIFYDSP.cmajor` gekennzeichnet. Das Projekt verwendet
keine Roland-Logos, Samples oder Bitmap-Kopien.

Der eigene Projektcode steht unter der MIT-Lizenz, siehe `LICENSE`.
