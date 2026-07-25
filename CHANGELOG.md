# Changelog

Alle nachvollziehbaren ACIDIFY-Versionen werden in dieser Datei festgehalten.
Das Format orientiert sich an [Keep a Changelog](https://keepachangelog.com/de/1.1.0/);
die Versionsnummern folgen [Semantic Versioning](https://semver.org/lang/de/).

## [Unreleased]

## [0.7.1] - 2026-07-26

### Changed

- Die vier rein dekorativen Schraubenköpfe wurden vollständig aus Markup und
  Styles entfernt.
- Gehäuse, Bedienpanel, helle Taster und Overlays verwenden nun eine kühlere,
  fein gebürstete Silbermetall-Palette nach den bereitgestellten
  Hardware-Referenzfotos statt der zuvor warmen beige-grauen Oberfläche.
- Geometrie, Beschriftung, Parametervertrag und DSP bleiben unverändert.

### Validated

- Der Browserworkflow bestätigt null verbliebene `.screw`-Elemente sowie die
  unveränderten 18 Controls, 15 Studio-Aktionen und 142 Tooltip-Ziele.
- Zehn Live-Render bei 1180 × 580 und 590 × 290 wurden aus demselben
  0.7.1-Quellstand neu erzeugt und visuell auf Classic, DAW-Sync, Studio,
  Notenwahl und Distortion geprüft.

## [0.7.0] - 2026-07-26

### Added

- Append-only `param50` für 0…100 % Swing. 0 % bleibt gerade, 100 % ergibt
  innerhalb jedes 16tel-Zweierpaars ein 2:1-Triolenverhältnis.
- Gemeinsame Swing-Phasenberechnung für interne Uhr und DAW-PPQ; die
  Gate-Länge folgt der tatsächlich langen beziehungsweise kurzen Step-Dauer.
- Studio-Aktionen `REVERSE` und `MIRROR` für Reihenfolge und Tonhöhenkontur.
- Skalenbewusstes `GENERATE` und behutsames `MUTATE` mit temporärer Auswahl
  zwischen Minor Pentatonic, Minor, Major und Chromatic. Alle Änderungen laufen
  über die bestehende Undo-Historie und speichern ausschließlich die stabilen
  Step-Parameter.
- Kompakte Live-`PITCH MAP` mit 16 Knoten für Tonhöhe, Accent, Slide, Rest,
  Auswahl und aktuelle Wiedergabeposition.

### Changed

- Accent- und Slide-Badges sitzen jetzt mittig im freien Bereich der
  Step-Taster und halten mehr Abstand zum Notenwert.
- Der bisherige feste Randomize-Workflow ist in getrenntes musikalisches
  Generate und schonendes Mutate aufgegliedert.
- Der stabile Vertrag umfasst nun exakt `param1..param50`; alle von Amorph
  garantierten dynamischen Parameter sind damit belegt.

### Validated

- Sechskanaliger Produktionsgraphtest bestätigt gerades Timing,
  2:1-Maximalswing, DAW-Tempo/Transport/PPQ, Seek, Stop/Start,
  No-Host-Fallback und DAW→INT-Tempoübergabe bei 44,1/48/88,2/96 kHz.
- Browserworkflow bestätigt 18 globale Controls, 15 Studio-Aktionen,
  skalenreine Generate-/Mutate-Ergebnisse, vollständiges Undo, 16
  Pitch-Map-Knoten, 142 Tooltip-Ziele und Reconnect-/Echo-Schutz.
- Zehn Live-Render bei 1180 × 580 und 590 × 290 wurden aus demselben
  0.7.0-Quellstand neu erzeugt und auf Überlappungen geprüft.
- Der Nutzer hat den direkten Vorgänger 0.6.4 (`a34d0a3…`) in Amorph als
  grundsätzlich passend bestätigt. Die neuen 0.7.0-Funktionen benötigen noch
  eine reale Abnahme in Amorph und der Ziel-DAW.

### Known limitation

- Der historische externe `cmaj render --midi`-Smoke ist in dieser
  Linux-Umgebung bei 48/88,2/96 kHz still. Der unveränderte 0.6.4-Ausgangsstand
  zeigt bei 48 kHz denselben Befund; die internen samplegenauen DSP-,
  Artikulations- und Transporttests sind bei allen vier Raten grün.

## [0.6.4] - 2026-07-25

### Added

- Englische Tooltips für Hauptregler, Transport, Step-Zustände, Classic- und
  Studio-Werkzeuge sowie Distortion-Bedienung.
- Kleiner globaler `? TIPS ON/OFF`-Schalter; die UI-Einstellung wird
  bestmöglich im eingebetteten Webview gespeichert und benötigt keinen neuen
  DSP-Parameter.

### Changed

- Bei aktivem DAW-Sync folgt die sichtbare Tempo-Reglerstellung dem empfangenen
  Hosttempo und spiegelt den Wert in `param9`.
- Beim Ausschalten von DAW-Sync bleibt das letzte Hosttempo im DSP und in der UI
  als manueller Ausgangswert erhalten.
- Manuelles Tempo lässt sich mit Mausrad oder Pfeiltasten in 0,1-BPM-Schritten
  und mit `Shift` in 0,01-BPM-Schritten einstellen.

### Validated

- Browserworkflow prüft DAW-Wert 135,27 BPM, Regler-/Parameter-Spiegelung,
  Eingabesperre während Sync, wertgleichen Übergang auf `INT` und anschließende
  Feinänderung auf 135,38 BPM.
- Englischer Tooltip, globales On/Off, 136 Tooltip-Ziele und vollständiges
  Entfernen nicht abschaltbarer nativer `title`-Tooltips geprüft.
- Der Produktionsgraph hält nach 120→180 BPM beim Abschalten von Sync weiterhin
  180 BPM; der Test läuft über den öffentlichen `Acidify`-Graph.

## [0.6.3] - 2026-07-25

### Fixed

- DAW-Sync verwendet jetzt den bereits im Amorph-Dev-Kit dokumentierten
  Hosteingang `input event float64 transportIn` statt ausschließlich auf
  `std::timeline::*`-Ereignisse zu warten, die der getestete Amorph-Build nicht
  an ACIDIFY lieferte.
- Der rollende Amorph-6-Slot-Stream speist Play/Stop, BPM und absolute
  Quarter-Note-Position in die vorhandene Sequencer-Uhr. Startposition, Loop und
  Seek folgen damit dem DAW-Raster.
- Ein defensiver Slot-Lerner übernimmt das in produktiven Amorph-Plugins
  verwendete Verhalten für Play- und Tempo-Slot; die dokumentierten Slots 2–4
  bleiben Time-Signature und PPQ.
- Die bisherigen typisierten Cmajor-Timeline-Eingänge bleiben als zusätzlicher
  Standardpfad erhalten.

### Corrected

- Die falsche Behauptung, `transportIn` sei kein belegter Amorph-Vertrag, wurde
  aus Dev-Kit und ACIDIFY-Dokumentation entfernt. Der Eingang war bereits im
  ursprünglichen Dev-Kit als optionaler Hosttransport dokumentiert und ist in
  bestehenden Amorph-Plugins praktisch bestätigt.

### Validated

- Der öffentliche Produktionsgraph verarbeitet den realen Amorph-6-Slot-Vertrag
  bei 44,1/48/88,2/96 kHz: 120→180 BPM, Play/Stop, Startposition und Seek.
- Der DAW-Modus ohne Hoststream behält den internen BPM-/Run-Stop-Fallback.
- Der installierte Amorph-Build muss nach dem Update noch einmal in der Ziel-DAW
  geprüft werden; dieser reale Hosttest wird nicht durch den Harness ersetzt.

## [0.6.2] - 2026-07-25

### Fixed

- Accent und Slide sind auf jedem Step als kontrastreiche 18 × 18 px große
  Zustandsbadges sichtbar. Rot markiert Accent, Gelb mit Diagonalpfeil markiert
  Slide; beide bleiben auf demselben Step gleichzeitig erkennbar.
- Bei der kleinsten geprüften Panelgröße 590 × 290 bleiben beide Badges mit
  effektiv 9 × 9 px sichtbar, statt zu kaum lesbaren Kleinstglyphen zu schrumpfen.
- Step-Tooltips und Screenreader-Texte nennen Gate/Rest, Accent und Slide jetzt
  vollständig.

### Corrected

- Der reale Amorph-Hosttest wird ausdrücklich als fehlgeschlagen dokumentiert:
  Der getestete Runtime-Build liefert weder BPM noch Play/Stop noch Position an
  die vorhandenen Cmajor-Timeline-Eingänge.
- `DAW · INT FALLBACK` wird nicht mehr als DAW-Sync interpretiert. Der
  Cmajor-Graph ist für Timeline-Ereignisse korrekt verdrahtet; die fehlende
  Hostbridge muss jedoch in Amorph selbst BPM, Transport und Position an den
  Patch senden.

### Validated

- Browserworkflow einschließlich gleichzeitiger Accent-/Slide-Badges,
  Zustandsbeschreibung und unveränderter Interaktionen bestanden.
- Badgegröße: 18 × 18 px bei 1180 × 580 und effektiv 9 × 9 px bei 590 × 290.
- Alle zehn Live-Render wurden aus dem 0.6.2-Quellstand neu erzeugt.

## [0.6.1] - 2026-07-25

### Added

- Direktes 25-Noten-Menü für jeden Step per Rechtsklick oder Doppelklick sowie
  über einen sichtbaren `NOTE`-Button in Studio.
- Dauerhafte absolute Noten- und relative Oktavanzeige (`+0/+1/+2`) auf allen
  Step-Buttons, in der Studio-Notenzeile und im ausgewählten Step-Status.
- Expliziter `DAW · INT FALLBACK`, wenn der Amorph-Runtime-Build keine
  Cmajor-Timeline-Ereignisse weitergibt.

### Fixed

- Mausrad-Pitch auf den oberen Step-Buttons bleibt nun auch bei geöffneter
  Studioansicht aktiv und bearbeitet eine vorhandene Mehrfachauswahl gemeinsam.
- `RUN / STOP` und interner BPM-Regler bleiben im DAW-Modus bedienbar, solange
  die jeweilige Hostfunktion nicht tatsächlich empfangen wurde; ein fehlender
  Host-Bridge-Pfad lässt das Instrument nicht mehr stillstehen.
- Transporttest läuft nun durch den öffentlichen Produktionsgraphen `Acidify`
  statt den äußeren Timeline-Anschluss durch einen direkten Kerntest zu umgehen.

### Changed

- Tempo- und Transport-Lock sind unabhängig: Nur eine wirklich empfangene
  Hostfunktion sperrt ihren internen Regler.
- Dev-Kit-Nachweis präzisiert: `std::timeline::*` ist der gültige
  Cmajor-Patchvertrag, aber kein Beleg dafür, dass ein bestimmter
  Amorph-Runtime-Build die DAW-Timeline weiterreicht.

### Validated

- UI-Smoke-Test mit 25-Noten-Menü, Rechtsklick, Doppelklick, Studio-Mehrfachwahl,
  sichtbaren Oktaven, Studio-Step-Mausrad, Escape und responsiven Panelgrenzen.
- Produktionsgraph-Transportmatrix einschließlich vollständigem
  No-Host-Internal-Fallback bei 44,1, 48, 88,2 und 96 kHz bestanden.

## [0.6.0] - 2026-07-25

### Added

- Append-only `param49` für die Taktquelle `Internal` oder `DAW`; ältere
  Presets bleiben durch den Initialwert `Internal` unverändert.
- Typisierte Cmajor-Hosteingänge für Tempo, Transportstatus und musikalische
  Timeline-Position.
- Kompakter `INT/DAW`-Schalter mit effektivem BPM-, Lock- und Wait-Status im
  bestehenden Transportmodul.
- Direkte Halbtonänderung per Mausrad auf jedem Classic-Step sowie
  verständlichere Auswahl-/Klaviaturhinweise.
- Reproduzierbarer interner Cmajor-Transporttest für BPM-Wechsel, Stop/Start,
  Timeline-Neustart und Seek.

### Changed

- In `INT` steuern Tempo und `RUN / STOP` weiterhin die interne 16tel-Uhr.
- In `DAW` folgen Tempo und Start/Stop dem Host; bei vorhandener Position wird
  die Pattern-Phase auch bei Loop und Seek am DAW-16tel-Raster ausgerichtet.
- Tempo und manueller Run-Schalter werden in DAW-Stellung sichtbar gesperrt,
  während die Run-Lampe den tatsächlichen Hostzustand anzeigt.

### Validated

- Cmajor 1.0.3175 C++-Codegen ohne Warnung.
- Amorph-Preflight: 0 Fehler, 0 Warnungen, 49/49 Parameter synchron; drei
  Timeline-Eingänge korrekt als Host-Kontext erkannt.
- Internal/DAW-Transportmatrix bei 44,1, 48, 88,2 und 96 kHz bestanden.
- UI-Smoke-Test mit 17 globalen Controls, beiden Clock-Modi, Host-Wait/Lock,
  gesperrtem DAW-Transport und Classic-Step-Pitch per Mausrad.

## [0.5.0] - 2026-07-25

### Added

- Kleine `DIST`-Statusschaltfläche im unveränderten Master-Kopf; Klick öffnet
  ein fokussierbares Overlay für True Bypass, Charakter, Drive und Mix.
- Append-only `param45..param48` für Distortion Enable, Type, Drive und Mix.
- Drei klar vom Instrumentenkern getrennte Post-Stufen: Airwindows
  `PurestDrive`, Airwindows `Mackity` und ein generisches
  RIAA-/Phono-Übersteuerungsmodell.
- Physikalisches Ideal-Dioden-Knotenmodell des 47-kΩ/100-kΩ/1-µF-
  Accent-Sweep-Netzwerks einschließlich der zweiten Resonance-Potisektion.
- Separater 47-kΩ/0,033-µF-Accentpfad zum VCA.
- Monophoner MIDI-Notenstapel mit Slide zur neuen Note und Rückkehr zur zuletzt
  noch gehaltenen Note sowie Unterstützung für MIDI All Sound Off/All Notes Off.
- DSP-Matrix, die Clean- und Effektpfad innerhalb derselben Instanz
  samplegenau vergleicht, sowie interner Cmajor-Artikulationstest für
  Legato versus Retrigger.
- Festgepinnte Open303-/Airwindows-Quellstände und vollständige MIT-Hinweise in
  `THIRD_PARTY_NOTICES.md`.

### Changed

- VCO läuft frei weiter; neue Einzelnoten setzen weder Phase noch Filterzustände
  hart zurück.
- Square verwendet die aus Open303s gemessenem 303-Shaper abgeleitete
  Pulsposition und den halben Pegel.
- Clean-Core verwendet die gemessene Open303-TB-Rekursion ohne generischen
  `tanh`-Waveshaper im Filter.
- Vollständiges Ausgangsnetzwerk aus 14,008-Hz-Allpass,
  24,167-Hz-Hochpass und 7,5164-Hz-Bandreject ergänzt.
- Einpolige Koppelfilter, 200-Hz-VCA-De-Clicker, MEG-/VEG-Zeiten und
  50-%-Gate-Länge an die festgepinnte Referenz angeglichen.
- Klang-, Typ-, Mix- und Bypass-Änderungen werden geglättet beziehungsweise
  überblendet; deaktivierter Pfad und `MIX = 0` sind sampletransparent.
- Live-Renderer erzeugt zusätzlich das Distortion-Overlay bei 1180 × 580 und
  590 × 290 px.

### Validated

- Cmajor 1.0.3175 C++-Codegen ohne Warnung.
- Amorph-Preflight: 0 Fehler, 0 Warnungen, 48/48 Parameter synchron.
- Clean/Distortion-Matrix und Legato/Retrigger bei 44,1, 48, 88,2 und 96 kHz.
- UI-Smoke-Test einschließlich Overlay, Tastaturbedienung, Parameter-Echo,
  Reconnect und unveränderter Modulgeometrie.

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
