# Changelog

Alle nachvollziehbaren ACIDIFY-Versionen werden in dieser Datei festgehalten.
Das Format orientiert sich an [Keep a Changelog](https://keepachangelog.com/de/1.1.0/);
die Versionsnummern folgen [Semantic Versioning](https://semver.org/lang/de/).

## [Unreleased]

## [1.1.0] - 2026-07-26

### Added

- **MOD-Sektion, fünf Mods eingebaut** (`param51`…`param59`), alle Defaults =
  Serienstand, Smoke-Peak bit-identisch 0,34552 bei Mods aus. Jeder Mod hat ein
  klares Enable; Amounts wirken nur bei Enable = an (A/B-Vergleich per Toggle):
  - **DF Filter Overdrive** 1…66,6× (`R62` 220k→3,3k) — Faktor auf den
    hergeleiteten Leiter-Drive. Nachweis: Crest 12,16 → 10,79 bei 66,6×.
  - **Resonance Boost** (x0x: `R97` 10k→8,2k ⇒ k×1,2195) — Selbstoszillation
    bei voller Resonanz nachgewiesen.
  - **Cutoff Range** 2,5 → 5 kHz (DF). Nachweis: Schwerpunkt 2975 → 5074 Hz.
  - **Env Mod ×3** (DF).
  - **Slide Time** 22…132 ms (DF, 500k-Poti in Reihe). Nachweis: 252 → 156 Hz
    kurz nach Slide-Start.
  - **Soft Attack** 0,5…30 ms (DF), am VCA-Steuerknoten, wirkt auf Hüllkurve
    UND Accent gemeinsam. Nachweis: Attack-Energie 1,71 → 0,47. Der erste
    Einbau multiplizierte nur die Hüllkurve und liess den Accent vorbei —
    an der Messung aufgeflogen und korrigiert.
  - UI-Einträge in `ACIDIFY_GLOBALS` registriert (Anzeige in ×/ms),
    preflight-konsistent (59 Parameter, dokumentierte Warnung — „50 ist die
    sichere Linie, field-tested bis 80+" — bewusst akzeptiert). Das
    Overlay-Layout folgt in Claude Design; `docs/MODS.md` ist die Übergabe.

## [1.0.1] - 2026-07-26

### Fixed

- **VCA-Release gemessen statt hergeleitet.** Whittle, DF-Handbuch, über den
  Serien-303: „the decay at the end of an unaccented note was about 16 ms —
  8 ms of normal volume and 8 ms of linear decay". Das widerlegt die 77 ms aus
  der Abschaltanalyse (ihr fehlte der schnelle Entladepfad). Unaccentiert jetzt
  8 ms Halten + 8 ms lineare Rampe; Accent-Release 50 ms (Open303, aus
  Aufnahmen eines echten 303). Alle Tests grün.

### Changed

- `docs/MODS.md` ist jetzt die **GUI-Übergabe**: pro Mod Schaltungsbasis,
  konkrete DSP-Änderung (Konstante/Funktion) und benötigtes GUI-Element.
  Kein Mod ist eingebaut — sechs sind Konstantentausch-fertig.

## [1.0.0] - 2026-07-26

### Added

- **Viertes begrenzendes Paar auf `y4`** (oberes Transistorpaar der Leiter,
  Stinchcombes `d = 1` in `H_tb` — der Ausgangsstrom läuft hindurch). Anschwinggrenze
  unverändert auf die Stelle (2,66796875 / 1,02734375), Klirr 47,98 / 17,60 / 6,90 %,
  Faltung unverändert −62,9 dB.

### Fixed

- Accent-Quelle `Q36`: Stromquellen-Hypothese am Schaltbild **widerlegt**
  (Emitter direkt an +12 V, `R145` am Kollektor, `C72` stützt die Basis).
  `4.0` bleibt der eine gefittete VCA-Wert; die VCO-Rechteckschwelle bleibt
  absichtlich (Messung an echter Hardware).

### Removed

- **Der Faktor 2 am Filterausgang** — ersatzlos, und damit ist die letzte
  gemeinsame Unbekannte zu. Stinchcombes Leiterkern ist
  `L(s) = s⁴/ωc⁴ + 2^(11/4)s³/ωc³ + 10√2 s²/ωc² + 2^(13/4)s/ωc + 1`, also
  **L(0) = 1**; bei `k = 0` ist `H(s) = C(s)/L(s)`, und `C(s)` läuft oberhalb
  der Koppelecken gegen **1,06**. Der Durchlassbereich des ganzen Filters ist
  damit 1,06, nicht 2,12. Nachgemessen mit geöffneter Cutoff-Klemme bei 384 kHz:
  Modell/|C| = 1,6834 / 1,9432 / 1,9904 / **1,9987** bei f_c = 20 / 50 / 100 /
  150 kHz — die Leiter hat Gleichspannungsverstärkung 1 wie `1/L(s)`, der
  Faktor 2 hatte kein Gegenstück in der Übertragungsfunktion.

### Changed

- `otaDrive` **0,1923 → 0,4971**, jetzt abgeleitet statt geraten:
  `(2,2/220) · 2,585 V / 52 mV`. Vorher steckte darin die Annahme „Vollaussteuerung
  = 1 V Spitze am Poti"; der Spannungsmaßstab steht jetzt über den belegten
  VCO-Hub fest (5,17 Vss auf 2,0 Modelleinheiten ss → 2,585 V je Einheit) und
  gilt seit dem Wegfall des Faktors 2 durchgehend bis zum Summenknoten.
- Ausgangspegel dadurch rund **6 dB leiser** (Smoke-Peak 0,676 → 0,335). Das ist
  Folge der Ableitung, nicht eine Pegelentscheidung: 0,335 · 2,585 V ≈ 0,87 V
  liegt im plausiblen Bereich eines 303-Ausgangs.
- OTA-Kompression neu vermessen (Cutoff 0,7, gegen denselben Lauf mit linearer
  Stufe): **−0,39 / −0,18 / −0,19 dB** bei Resonanz 0 / 0,5 / 1,0. Der früher
  festgehaltene Befund — Kompression bei Resonanz **null** am größten — bestätigt
  sich unter dem neuen Maßstab.

### Added

- **Diodensättigung im Leiterkern**, an allen vier Paaren:
  `N(v) = tanh(v · drive) / drive` mit `drive = 1089,8 / f_c`. Kein freier
  Parameter — Zähler `2,585 V / 220 kΩ = 11,75 µA` aus dem belegten VCO-Hub
  (`10,5 − 5,33 = 5,17 Vss` auf der 5,333-V-Vorspannung) über `R62`, Nenner
  `2π · 33 nF · 52 mV`. Die Schwelle folgt damit `1/f_c`; genau daran war der
  frühere `vSat`-Versuch mit fester Schwelle gescheitert.
- Prüfstein 6 im Messstand: Klirr gegen Eckfrequenz, gemessen mit Sinus bei
  `f_c/8`, damit über alle Eckfrequenzen dieselben Oberwellen im selben
  relativen Abstand zur Flanke liegen. **47,61 % / 17,34 % / 6,73 %** bei
  300 / 1000 / 2500 Hz, dazu 0,16 % bei 1 % Aussteuerung.
- **Prüfstein 7: Faltung.** Anregung bewusst nicht bin-gerastet, damit
  Faltungsprodukte als Nicht-Vielfache der Grundwelle erkennbar sind. Grenze
  −40 dB, gemessen −107,3 / −86,7 / **−62,9 dB**.

### Fixed

- **Die Begrenzung saß am falschen Ort und faltete.** `N` stand zunächst auch
  auf dem Eingangsstrom `u`. Ein breitbandiges `tanh` auf dem rohen Oszillator
  erzeugt Oberwellen weit über Nyquist: bei `f_c = 200 Hz` und 7011 Hz Eingang
  lag die größte inharmonische Linie **+44,3 dB über dem Nutzsignal** — genau im
  klassischen Acid-Bereich, hohe Note über tiefem Cutoff. Gegenprobe bei
  192 kHz (−37,7 dB) belegt Faltung, nicht Rauschen.

  Die begrenzenden Bauteile sind die Diodenpaare **zwischen** den
  Kondensatorebenen, getrieben von der bereits integrierten Knotenspannung. Der
  Zulauf über `C17`/`R62` ist dagegen eine **Stromquelle** — ein eingeprägter
  Strom wird von einem Diodenpaar nicht begrenzt. Mit `N` nur auf `y1`, `y2`,
  `y3`: **−107,3 / −86,7 / −62,9 dB**, also bis zu 107 dB besser, während der
  Klirr sogar **steigt** (47,61 % statt 41,97 % bei 300 Hz). Die
  Nichtlinearität ist nicht schwächer, sie sitzt am richtigen Ort — kein
  Oversampling nötig.
- `oscillates()` im Messstand prüfte auf **Divergenz** — etwas, das ein Kern mit
  Sättigung per Konstruktion nicht zeigt. Bei 8 kHz und `k = 8·kMax` lief eine
  stehende Schwingung mit konstantem RMS 0,716 durch und wurde als „klingt ab"
  gewertet, weil der letzte Abtastwert zufällig nahe einem Nulldurchgang lag.
  Bewertet wird jetzt die Hüllkurve. Der lineare Kern wurde mit dem neuen
  Kriterium **vor** dem Einbau nachgemessen (2,6973 / 1,0566), damit die
  Änderung eine Referenz hat und kein Zurechtbiegen ist.

### Changed

- Die Anschwinggrenze bleibt durch den Umbau **unverändert** (2,66796875 /
  1,02734375 bei 150 Hz / 8 kHz) — `N'(0) = 1`, das Kleinsignalverhalten ist
  unberührt. Das war die Vorhersage und ist der schärfste Test des Newton-Aufsatzes.

## [1.0.0-rc2] - 2026-07-26

### Fixed

- **Audit-Punkt 7 war falsch gestellt** und ist damit zu. Ein Bauteil hat einen
  Sollwert; Toleranz ist ein Fertigungsmangel, den die Selektion beseitigen
  soll. Eine Streuung zu modellieren hiesse, ein schlechter gefertigtes Gerät
  zu modellieren. ACIDIFY rechnet 33/33/33/18 nF — richtig so.
- Damit sind **alle acht Audit-Punkte** geschlossen.

### Added

- Empfindlichkeitsmessung statt Streuungsmodell: ±10 % an den vier
  Leiterkondensatoren verschieben die Resonanzspitze um **171 Cent**. Die
  Transistorpaarung (0,3 mV Vbe → 1,16 %) wird von der Kondensatortoleranz
  (±10 %) um fast das Zehnfache dominiert — die Paarung sichert den
  Arbeitspunkt, nicht die Eckfrequenzen.


## [1.0.0-rc1] - 2026-07-26

### Changed

- **VCA-Verstaerkung aus Bauteilwerten**: `I_abc = (12−0,2−0,6)/R131 = 50,9 µA`,
  Ausgang über `R119 = 47 k`, Eingangsteiler `R124/R121 = 1/100` →
  `0,460` statt Open303s `0,42`. Möglich durch die BA662-Pinbelegung
  (Roland-100M-Servicehandbuch): Pin 1 = CV1, Pin 3 = +IN1.
- **VCA-Release** aus dem Abschaltvorgang: kein Entladepfad an `C42`, der VCA
  schliesst über `R123 = 1,5 M`; Schwellenübertritt bei 51…104 ms → **77 ms**
  statt Open303s 1 ms (unterhalb des physikalisch Möglichen) und 50 ms.

### Removed

- `0.45f * filterEnvelope` am VCA. Verfolgt: Der MEG-Knoten läuft über `Q41`
  zu `VR5` und erreicht den VCA-Steuerknoten nicht — die Filterhüllkurve
  speist den VCA in der Schaltung nicht.

### Added

- `tools/bench/partcheck.py` — prüft **28 Bauteilwerte** gegen die
  EAGLE-Quelldatei des x0xb0x. Alle bestätigt, darunter `C18 = .018` gegen
  `C19/C24/C26 = .033` (die ungleiche vierte Leiterstufe) und
  `C42 = C62 = 1 µF`.

### Known

Von 14 gefitteten Konstanten sind **3** übrig, jede mit benanntem Grund:

- `4.0f` (Accent-Anteil) — Leitwertverhältnis am Knoten ist 220/2,2 = 100,
  aber der Pegel der Accent-Quelle ist unbelegt und `accentVcaRC` normiert.
- `2.0f` und `otaDrive` — gemeinsam **eine** Unbekannte, der Spannungsmassstab.
  Braucht eine Pegelmessung am Gerät.
- VCO-Rechteckschwelle `0.4687857` — **bewusst behalten**: gemessene Hardware,
  kein Modellkompromiss.


## [0.11.0] - 2026-07-26

### Changed

- **Cutoff- und Env-Mod-Abbildung** aus der Schaltung: `highCutoff = 2500 Hz`
  (Whittle, belegt) und `octaves = 3` (VR3+R47 und VR5+R61 sind identische
  Netze, also gleiche Spanne). Sieben Open303-Polynomkoeffizienten entfallen.
- **VCA-Steuerglaettung** aus `R132 = 100 Ω` mit `C42 = 1 µF` → einpolig
  1591,5 Hz statt Open303s 200-Hz-Butterworth zweiter Ordnung.

### Fixed

- `envScaler` lieferte bei Env Mod **null** 0,864 statt 0 — Restmodulation
  ohne Bauteil dahinter. `envOffset`, das nur als Gegengewicht existierte,
  entfällt mit.


## [0.10.0] - 2026-07-26

### Changed

- **Accent-Netz am VCA ist asymmetrisch**, wie D27 es macht: Laden über
  `R120 = 22 k` (726 µs), Fallen über `R119 = 47 k` (1,551 ms). Vorher ein
  einziger symmetrischer Wert — der Accent stieg 2,1× zu langsam an.
- **MEG-Attack** aus `D37` + `R152 = 100 Ω` mit `C62 = 1 µF` → **100 µs**
  statt Open303s 3 ms (30× zu langsam).
- **Accent-Decay** auf die 10-%-Konvention umgestellt (86,9 ms statt 200 ms).
  Es war 2,3× länger als das minimale normale Decay — verkehrt herum für
  einen Accent.
- **Cutoff-Skalar entfällt.** `peakToParameter = 1,345` war vor dem
  Schleifenumbau kalibriert und schob den Cutoff danach 34,5 % zu hoch.

### Fixed

- Bezeichnerfehler: die 47 k / 33 nF am VCA wurden als „R26/C26" geführt; in
  der TB-303-Nummerierung sind es `R119`/`C36`, und sie sind nur der Fallpfad.
- `IC15` Pin 1 und Pin 3 liegen auf demselben Netz; frühere Notiz nannte nur
  Pin 3.

### Added

- `tools/bench/hardware_checks.py` — die widerlegbaren Prüfsteine ausführbar,
  Kern direkt aus dem Plug-in-Code geschnitten. Rückgabewert ≠ 0 bei Fehlschlag.
- Samplerate-Invarianz bis **192 kHz** belegt.

### Known

- Weiterhin Open303: VCO, Release-Zeiten, Cutoff-/Env-Mod-Abbildung, die drei
  VCA-Steuerkonstanten `0.45` / `4.0` / `0.42`, sowie `otaDrive`.
- Zum Ersetzen der drei Steuerkonstanten fehlt genau **eine** Angabe: die
  Pinbelegung des BA662A. Alle Bauteilwerte drumherum sind gelesen.
- Der VCO ist gelesen, aber bewusst nicht ersetzt — er braucht eine eigene
  Antialiasing-Strategie, keinen Konstantentausch.


## [0.9.0] - 2026-07-26

### Changed

- **Koppelnetz liegt jetzt in der Resonanzschleife.** Der Rückkopplungspfad
  `Bfb(s) = (18.7/1.06)·k·s(s+46.5)(s+4.40)/[(s+109.9)(s+34.0)(s+7.41)]` fällt
  aus Stinchcombes Übertragungsfunktion an; beide Kaskaden gehen in die
  ZDF-Auflösung ein statt davorzuhängen. `kMax` kommt damit ebenfalls aus der
  Übertragungsfunktion (18,7/1,06) statt aus einer eigenen Anschwingmessung.
- **VCA-Summenknoten** mit beiden Zweigen und deren eigenen Hochpassecken:
  Filterzweig `R121+R124 = 222,2 k` mit `C21 = 10 nF` → 71,6 Hz, Comp-Zweig
  `R122+R124 = 102,2 k` mit `C22 = 10 nF` → 155,7 Hz.
- **VCA-Hüllkurve** aus `R123 = 1,5 M` und `C42 = 1 µF` → 1500 ms statt
  Open303s 1230 ms.
- **Slide** aus DAC-Impedanz 100 k und 0,22 µF → 22 ms statt Open303s 12 ms.

### Fixed

- Zwei belegte Hardwareverhalten, die vorher nachweislich fehlten, treten jetzt
  auf: kein Anschwingen bei 200/1000/5000 Hz Eckfrequenz **und** eine
  Tieftonspitze bei ~9 Hz (−7,0 dB gegen −19,7 dB bei 4 Hz). Beide sind nicht
  hineingeschrieben, sie fallen aus der Struktur an.
- Poti-Kennlinien gegen Rolands eigene Teileliste geprüft: RESONANCE
  `K162T00W-50kB ×2` (dual, linear — vierte unabhängige Bestätigung),
  CUT OFF FREQ und ENV MOD `50kA`. Der x0xb0x-D-Kennlinienbefund war eine
  Substitution des Nachbaus.

### Known

- Weiterhin Open303-Fits: VCO, MEG-Attack, Release-Zeiten, Accent-Decay,
  Cutoff-/Env-Mod-Kennlinien und die VCA-Steuerkonstanten `0.45`, `4.0`, `0.42`.
- `otaDrive` bleibt die einzige ungestützte Konstante im VCA.
- Kein Vergleich gegen ein reales Gerät. Das ist der Abschlussschritt, nicht
  eine Voraussetzung — die obigen Punkte sind aus dem Serviceplan herleitbar.


## [0.8.0] - 2026-07-26

### Changed

- **Resonanzkompensation** sitzt jetzt als zweiter Summenzweig am VCA-Eingang
  statt als Verstärkung im Filter. Gewichtung `1 + 2,2·r` aus `R121 = 220 kΩ`
  (festes Potiende) und `R122 = 100 kΩ` (Schleifer), beide am Schaltplan
  verfolgt. Open303s cutoff-abhängiges Makeup ist entfallen — feste
  Widerstände können diese Abhängigkeit nicht haben.
- **VCA** rechnet die BA662A-OTA-Kennlinie `tanh(v/(2·Vt))` statt zu
  multiplizieren.
- **Filterkern** ist die topologiehergeleitete Diodenleiter (ZDF/TPT) mit den
  Schaltplan-Kondensatoren 33/33/33/**18** nF; Resonanz linear über den
  Reglerweg, weil VR4 ein B-Poti ist. Ersetzt den Open303-Polynomfit.
- **Koppelnetz** aus Stinchcombes vollständiger Übertragungsfunktion
  hergeleitet: fünf Pole, fünf Nullstellen. Ersetzt Allpass, Notch und
  Hochpass des gebündelten Open303-Netzes. Bei 8 Hz waren das 21 dB.
- **Accent-Sweep** rechnet mit dem belegten 50-kΩ-Poti statt 100 kΩ
  (Devil-Fish-Handbuch S. 28 und x0xb0x-Stückliste).

### Fixed

- Vier Stellen der Filterdokumentation galten für vier gleiche 33-nF-Stufen,
  wurden aber für die Schaltplanwerte zitiert: Resonanztabelle,
  Anschwinggrenze (17,0 statt ~19,5), Steilheitstabelle und der daraus
  abgeleitete Kalibrierpunkt.

### Known

- Das Koppelnetz liegt hinter dem Kern, nicht in der Resonanzschleife. Damit
  fehlen die 8-Hz-Spitze und die Frequenzabhängigkeit der Anschwinggrenze;
  beide sind auf dieselbe Ursache zurückgeführt und in `docs/DSP_AUDIT.md`
  mit Messwerten belegt.
- `otaDrive` ist die einzige ungestützte Konstante im VCA und als solche
  markiert.


### Added

- CI-Workflow mit Preflight, Manifestprüfung, `node --check`, UI-Rauchtest in
  headless Chromium sowie C++-Codegen und MIDI-Render über alle Samplerates.
- `tools/check_version.py` prüft zusätzlich, dass jede veröffentlichte Version
  eine Commit-Linkdefinition im Changelog besitzt.
- `tools/bench/` – unabhängiger Messstand für Filtergang, Aliasing, Pegel und
  UI-Ergonomie.

### Fixed

- `tools/ui_smoke_test.mjs` und `tools/render_mockup.mjs` starteten Chromium nur
  dann mit `--allow-file-access-from-files`, wenn `ACIDIFY_CHROMIUM_PATH` gesetzt
  war. Mit dem von Playwright mitgelieferten Browser blockierte Chromium deshalb
  das ES-Modul über `file://`, und beide Werkzeuge liefen in einen Timeout. Das
  Flag wird jetzt immer gesetzt; die Sandbox-Flags bleiben auf ein extern
  vorgegebenes Binary beschränkt.
- Versionsprüfung läuft jetzt bei jedem Push, nicht nur auf `main`.

## [0.7.2] - 2026-07-26

### Fixed

- Die in 0.7.1 nahezu weiß gebliebene und durch regelmäßige Linien künstlich
  wirkende Oberfläche wurde ersetzt.
- Gehäuse, Panel, Funktionsbereiche und Overlays verwenden nun neutrales
  mittleres Silber, unregelmäßige feine Metallkörnung, breite gerichtete
  Reflexzonen sowie klarere helle und dunkle Falzkanten.
- Bediengeometrie, Funktionen, DSP und der 50-Parameter-Vertrag bleiben
  unverändert.

### Validated

- Classic, Studio, Notenwahl und Distortion wurden in 1180 × 580 sowie die
  kompakte Classic-Ansicht in 590 × 290 am finalen Render kontrolliert.
- Der Browserworkflow bestätigt weiterhin null Schraubenelemente, 18 Controls,
  15 Studio-Aktionen, 142 Tooltip-Ziele und unveränderte Modulgeometrie.

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

### Known issue

- Die Materialwirkung bestand die nachträgliche Sichtprüfung nicht: Die
  Oberfläche blieb zu hell und das regelmäßige Linienmuster wirkte wie ein
  aufgesetzter Filter. Das ist in 0.7.2 korrigiert.

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

[1.0.1]: https://github.com/ClarkParker/ACIDIFY/commit/d360c4cb82cfb522b037467aa6abbc1c070b756e
[1.0.0]: https://github.com/ClarkParker/ACIDIFY/commit/709aa54b03cb2dd48b46c1eacf5ea3dc13e1a5cc
[0.11.0]: https://github.com/ClarkParker/ACIDIFY/commit/edbc3755b605b344bf17f0d51f2e4e82c3939a6d
[0.10.0]: https://github.com/ClarkParker/ACIDIFY/commit/39381b827720a49d87b185bf4d52827e0be5d9d3
[0.9.0]: https://github.com/ClarkParker/ACIDIFY/commit/2bd55ed0920978c5c8f29d33f299ef2f045378d0
[0.8.0]: https://github.com/ClarkParker/ACIDIFY/commit/01cf8231d2871ea38058616ccba8aff2abc8da0c
[0.4.0]: https://github.com/ClarkParker/ACIDIFY/commit/cd309ef5b4f527619a30ea19bfe8b9b6beef47b4
[0.7.2]: https://github.com/ClarkParker/ACIDIFY/commit/e43de58cd8f4523e39e4854dfec24d400f564ed9
[0.7.1]: https://github.com/ClarkParker/ACIDIFY/commit/ffeb05dde01a59a628af894b806b4e58722d3711
[0.7.0]: https://github.com/ClarkParker/ACIDIFY/commit/9346b71776de579d9e5a5852506ac49ceb365dde
[0.6.4]: https://github.com/ClarkParker/ACIDIFY/commit/a34d0a3813a20ddb5241b587d5502ebd4b67fdac
[0.6.3]: https://github.com/ClarkParker/ACIDIFY/commit/e733256b1f66406cefe64934213677fbe189581f
[0.6.2]: https://github.com/ClarkParker/ACIDIFY/commit/31f90dea0d34ea287e9924ff15fbf58fb9fab8de
[0.6.1]: https://github.com/ClarkParker/ACIDIFY/commit/79731932daeecd49d0bdaa0c5539e8120448cbb4
[0.6.0]: https://github.com/ClarkParker/ACIDIFY/commit/6fac579a241860a771c0a87babb5b798061fa3c6
[0.5.0]: https://github.com/ClarkParker/ACIDIFY/commit/feafeb52db8b336e4e7e5c8e86473924d5c9efbf
[0.4.1]: https://github.com/ClarkParker/ACIDIFY/commit/33600ec553456e191a1b28197d08042303000d9c
[0.3.0]: https://github.com/ClarkParker/ACIDIFY/commit/ff2457e8288ed165a55c121fb63e8c30ad5abfca
[0.2.3]: https://github.com/ClarkParker/ACIDIFY/commit/0ed21fcaa3684815db23c9a3761a4aa10fc2d9c3
[0.2.2]: https://github.com/ClarkParker/ACIDIFY/commit/d4b20a284f6d88064784058c76fcaccd997647ca
[0.2.1]: https://github.com/ClarkParker/ACIDIFY/commit/9c15df8a4935a885991486ee80a72a91d49c14dd
