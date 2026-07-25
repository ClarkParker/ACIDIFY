# Changelog

Alle nachvollziehbaren ACIDIFY-Versionen werden in dieser Datei festgehalten.
Das Format orientiert sich an [Keep a Changelog](https://keepachangelog.com/de/1.1.0/);
die Versionsnummern folgen [Semantic Versioning](https://semver.org/lang/de/).

## [Unreleased]

## [0.4.1] - 2026-07-25

### Fixed

- Nicht abgenommene Graphit-Haut durch die etablierte helle
  ACIDIFY-Metall-/Hardware-Sprache ersetzt, ohne auf die ältere unsichere
  Geometrie zurückzufallen.
- Transport, Synthese und Master auf identische Ober- und Unterkanten gesetzt;
  Accent besitzt 27 px Abstand zum Master, der Volume-Ring je 24 px Innenabstand.
- Parameter-Echos werden abgefangen, ohne lokale Root-/Step-Zustände zu verlieren.
- Wiederverbinden der Web-Component erzeugt keine doppelten DOM-Handler oder
  zurückbleibenden Timer.
- Alle zwölf globalen UI-Controls tragen die von Amorph erwarteten
  `data-endpoint-id`-Attribute.

### Changed

- Classic und Studio verwenden wieder dieselbe 303-nahe Instrumentenhülle; der
  vollständige Studio-Workflow und der 44-Parameter-Vertrag bleiben erhalten.
- Kleine Zielgröße 590 × 290 erhält eine angepasste Typografiehierarchie.
- Der Live-Renderer erzeugt Classic und Studio bei 1180 × 580 sowie 590 × 290
  direkt aus demselben Quellstand.
- UI-Smoke-Test um Dreifach-Modulausrichtung, Echo-Schutz und
  Reconnect-Lifecycle erweitert.

## [0.4.0] - 2026-07-25

### Added

- Verbindliche Release- und Versionierungsregeln.
- Automatische Konsistenzprüfung für Manifest, README, Changelog und
  Validierungsdokument.

### Changed

- Vollständige moderne Performance-Oberfläche in Graphit statt der bisherigen
  beige-grauen Prototypen-Haut.
- Transport, Synthese und Master als drei gleich hohe Module mit 13 px Abstand.
- Volume und Output vollständig in das Master-Modul integriert.
- Klangregler, Waveform und Volume auf einer gemeinsamen optischen Achse.
- Sequencer, Classic-Editor und Studio-Matrix auf ein einheitliches dunkles
  Produkt- und Interaktionssystem umgestellt.
- Produktversion direkt auf der Oberfläche sichtbar gemacht.

## [0.3.0] - 2026-07-25

### Added

- Sichtbarer `CLASSIC / STUDIO`-Workflow mit Tastaturzugang über `M`.
- Studio-Matrix für Note, Gate, Accent und Slide mit vier musikalischen
  Vierergruppen.
- Mehrfachauswahl, Drag-Paint, Undo/Redo, Copy/Paste, Rotate, Transpose,
  Rest und Randomize.
- Eindeutige `CLEAR`-Aktion im Classic-Editor.

### Changed

- Studio-Werkzeuge und Step-Raster als gleichwertige zweite Bedienebene
  innerhalb derselben Instrumentenoberfläche ausgearbeitet.
- Manifest, Dokumentation und Mockups auf 0.3.0 angehoben.

## [0.2.3] - 2026-07-25

### Changed

- Transport, Synthese und Master als klar getrennte Makromodule angeordnet.
- Waveform, Klangregler und Volume auf eine gemeinsame optische Achse gesetzt.
- Output dem Master-Modul zugeordnet.
- Classic-Aktionsmatrix als vollständig eingefasstes 3×2-Raster gestaltet.

## [0.2.2] - 2026-07-25

### Changed

- Keyboard auf sieben weiße und fünf überlagerte schwarze Tasten korrigiert.
- 16 Steps in vier musikalische Vierergruppen gegliedert.
- Status, Keyboard und Timing als gleich hohe Modulbuchten angeordnet.

## [0.2.1] - 2026-07-25

### Added

- Erster im GitHub-Repository veröffentlichter ACIDIFY-Prototyp.
- Cmajor-DSP, 44-Parameter-Vertrag, skalierbare UI, Dokumentation und Mockups.

## Vor der Repository-Historie

Die lokalen Pakete `0.1.0`, `0.1.1` und `0.2.0` entstanden vor dem ersten
vollständigen Repository-Commit. `0.2.0` führte den modernen Studio-Workflow
ein. Sie werden hier ausdrücklich als historische Vorstufen festgehalten,
besitzen aber keinen eigenen Commit-Anker im Repository.

[0.3.0]: https://github.com/ClarkParker/ACIDIFY/commit/ff2457e8288ed165a55c121fb63e8c30ad5abfca
[0.2.3]: https://github.com/ClarkParker/ACIDIFY/commit/0ed21fcaa3684815db23c9a3761a4aa10fc2d9c3
[0.2.2]: https://github.com/ClarkParker/ACIDIFY/commit/d4b20a284f6d88064784058c76fcaccd997647ca
[0.2.1]: https://github.com/ClarkParker/ACIDIFY/commit/9c15df8a4935a885991486ee80a72a91d49c14dd
