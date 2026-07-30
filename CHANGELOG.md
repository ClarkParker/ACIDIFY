# Changelog

Alle nachvollziehbaren ACIDIFY-Versionen werden in dieser Datei festgehalten.
Das Format orientiert sich an [Keep a Changelog](https://keepachangelog.com/de/1.1.0/);
die Versionsnummern folgen [Semantic Versioning](https://semver.org/lang/de/).

## [Unreleased]

## [2.9.3] - 2026-07-30

### Fixed

- **Output-Meter zeigte viel zu wenig an** — drei Ursachen: (1) die
  Envelope war ein 12-ms-Mittelwertfolger, der bei einer 16tel-Line
  mit Pausen weit unter dem Peak hängt, (2) die Balkenhöhe war
  LINEAR zur Amplitude gemappt (Peak 0,69 = −3,2 dBFS ergab nur
  ~20 % Balken), (3) keine Peak-Ballistik. Jetzt: Peak-Detektor im
  DSP (Attack sofort, Release ~400 ms) und dB-Skala im UI
  (−42…0 dBFS auf die volle Balkenhöhe) — ein Peak bei −3 dBFS
  füllt den Balken zu ~93 %, wie bei einem echten Meter. Der
  Audiopfad ist unberührt (Serien-Smoke bit-identisch 0,69105).

## [2.9.2] - 2026-07-30

### Fixed

- **Vollrevision des Distortion-Signalpfads nach Live-Diskrepanz-
  Verdacht**: Der komplette Pfad wurde erstmals über den ECHTEN
  Host-Weg verifiziert — Parameter als Events in den
  Produktions-Graphen (statt Zustands-Patches im Testharness), bei
  44,1/48/96 kHz, plus 60-Sekunden-Dauerläufe. Ergebnis: Event-Pfad
  und State-Pfad sind identisch, alle Raten konsistent. Dabei wurde
  die 2.9.0-Pre-Emphasis mathematisch gehärtet: Die
  RIAA-Wiedergabekurve hat eine Nullstelle exakt bei Nyquist
  (z = −1); ihre Inverse hätte dort einen grenzstabilen Pol AUF dem
  Einheitskreis. Der Pol liegt jetzt bei z = −0,995 im Inneren
  (Achtung Domäne: in q = z⁻¹ heißt das −1/0,995 — der erste
  Fixversuch mit q = −0,995 hätte einen INSTABILEN z-Pol bei −1,005
  erzeugt und wurde messtechnisch gefangen). PHONO-Autogain-Tabelle
  auf den gedämpften Filter neu gefittet; die Peak-Kappe bei
  Drive 1,0 entfällt (jetzt +0,24 dB statt −2,6 dB Rest).
- **Neuer Dauertest `tools/dsp_gain_test.mjs`** (läuft in der
  Batterie): rendert Raw + alle drei Modi über den Event-Pfad und
  prüft die A-bewichtete Lautheit gegen die Raw-Spur (±1 dB) sowie
  Peak-Decke und Endlichkeit — die Modi-Angleichung kann nie wieder
  nur auf dem Papier stimmen.
- **Doppelklick auf den Master-Knopf setzt jetzt auf 0 dB** (vorher
  auf den Initialwert −6 dB); alle anderen Regler behalten ihren
  Init-Reset. Neues optionales `resetValue` im Control-Vertrag.

### Hinweis

- Wer im Plugin weiterhin den alten (dumpf-leisen) PHONO-Klang hört,
  spielt einen veralteten Patch-Build: Die GUI zeigt die Version im
  Brand-Panel (v2.9.2) — bei Abweichung den Patch in Amorph neu
  laden/kompilieren.

## [2.9.1] - 2026-07-30

### Added

- **Mausrad auf der BASS-LINE-Kontur** (Studio): Die rote Pitch-Kontur
  reagiert jetzt wie die NOTE-Zeile aufs Rad — der Step unter dem
  Zeiger (bzw. die aktive Mehrfachauswahl) wandert halbtonweise, mit
  Undo-Eintrag; Tooltip an der Lane erklärt es. `ui_smoke_test` prüft
  Zeiger-zu-Step-Zuordnung, Transponierung und Selektionsübernahme.

## [2.9.0] - 2026-07-30

### Fixed

- **Distortion-Lautheit jetzt A-bewichtet kalibriert** — die bisherige
  Angleichung nutzte unbewichtete RMS und war damit taub für die
  massiven Spektralverschiebungen der Modi: A-bewichtet (FFT-Messung,
  IEC-A-Kurve) lag MACKIE **−2,3…−6,7 dB** und PHONO **−9,3…−12,2 dB**
  unter der Raw-Spur, obwohl die Roh-RMS „perfekt" abgeglichen war.
  Genau das war das „alles leise, Modi noch leiser". Die
  Autogain-Tabellen sind auf A-bewichtete Lautheit neu gefittet:
  jetzt 0,00 dB an allen Rasterpunkten, mit einer einzigen bewussten
  Ausnahme (PHONO Drive 1,0: −2,6 dB, Peak-Kappe exakt am Raw-Peak
  statt Übersteuerung). Master-Invarianz aus 2.8.0 bleibt erhalten.
- **PURE war faktisch keine Distortion**: Das laufende
  Programm-Material lag weit unterhalb des sin()-Knies des
  PurestDrive-Shapers — messbar ≤ 0,25 dB Wirkung selbst bei
  Drive 1,0. Der Shaper bekommt jetzt einen drive-abhängigen
  Eingangspegel (bis +18 dB, rückskaliert): Kleinsignale bleiben
  transparent, Spitzen werden hörbar gesättigt (Drive 1,0 komprimiert
  den Peak von 0,74 auf 0,28 vor Makeup). Drive 0 bleibt bit-exakt
  transparent.
- **PHONO-Klang repariert (Emphasis-Clipper)**: Bisher lief die nackte
  RIAA-Wiedergabekurve hinter dem tanh-Overload — Ergebnis war ein
  dumpfes, extrem leises Basswummern („Eingangssound zerstört").
  Jetzt klassische Kette Schneidkennlinie (Pre-Emphasis) → Overload →
  Wiedergabekurve (De-Emphasis): die Klangbalance bleibt erhalten
  (beide Kurven heben sich im Kleinsignal exakt auf), die Sättigung
  greift vor allem in den angehobenen Höhen — Vinyl-Overdrive statt
  Mulm. Overload-Bereich auf ×1…×16 gefasst.

### Changed

- **Master-Volume bis +6 dB** (vorher Endanschlag 0 dB): Bereich
  −36…+6 dB, Initialwert −6 dB unverändert. Gespeicherte
  dB-Preset-Werte bleiben gültig; nur normalisierte
  Host-Automation von param8 skaliert neu (dokumentiert).
- Audio-Nachweise: `tools`-Messkette rendert auf Wunsch Raw + alle
  drei Modi als WAV (an den Nutzer geliefert), A-bewichtete Messwerte
  in docs/VALIDATION.md.

## [2.8.0] - 2026-07-30

### Fixed

- **Master hinter die Distortion verlegt (Pegel-Invarianz)** — der
  eigentliche Grund für „generell zu leise" und „Distortion-Modi
  kaputt": Der Master-Regler saß VOR den pegelabhängigen
  Sättigungsstufen, die Kalibrierung galt daher nur exakt am
  Default (−6 dB). Gemessen (Referenzpattern @48k): bei Master
  −18 dB waren MACKIE/PHONO **+6,4…+11,4 dB zu laut**, bei 0 dB
  **−3,8…−5,9 dB zu leise**, und in den Sättigungs-Modi war der
  Master nahezu wirkungslos (PHONO-Peak 0,064 bei −18 UND 0 dB).
  Jetzt arbeitet die Distortion auf dem festen Referenzpegel des
  alten −6-dB-Punkts (pedalGain-Referenz und alle Autogain-Kurven
  bleiben exakt gültig) und der Master ist eine reine Post-Stufe.
  Nachgemessen: 0,00 dB Modi-zu-Raw bei Master −18/−6/0 dB, Peaks
  skalieren in allen Modi linear mit dem Regler. Bei Master −6 dB
  ist der Signalpfad bit-identisch zu 2.7.x (Serien-Smoke 0,69105).
- **DRV/MIX-Beschriftung über die Dials**: Durch das Label unter dem
  Dial saßen die Knopfkörper höher als die DIST/MOD-Taster. Labels
  jetzt oberhalb, Dial-Unterkanten bündig mit den Tastern (164/164),
  Dial-Körper und Taster auf einer Linie; kein Überlapp mit dem
  dB-Display (133/133…139/140 gestaffelt). Assertion misst jetzt die
  Dial-Unterkante statt der Containerkante.

## [2.7.3] - 2026-07-30

### Changed

- **DRV/MIX-Miniregler zur Distortion gerückt**: Das Paar saß mittig
  unter dem Master-Knopf und las sich dadurch wieder als Master-
  Zubehör. Jetzt sitzt es rechtsbündig auf der Höhe der DIST/MOD-
  Reihe (Unterkanten bündig, 11 px Abstand zum DIST-Taster) und die
  Dials sind von 20 auf 24 px gewachsen. `ui_smoke_test` prüft die
  Platzierung (Abstand zum DIST-Taster 4–16 px, Unterkanten-Versatz
  ≤ 2 px, Dial ≥ 23 px).

## [2.7.2] - 2026-07-30

### Changed

- **Tastenreihe unter dem Logo vereinheitlicht** (die 2.7.1-Zeile
  mischte drei visuelle Sprachen: TIPS mit ON/OFF-Chip, DARK nackt,
  POWER als Mini-Text mit separatem LED-Ring): TIPS, DARK und POWER
  sind jetzt drei identische Rast-Tasten — gleiche Breite (flex,
  gemessen pixelgleich), gleiche Höhe, gleiche Typo, je eine
  Status-LED links im Tastenfeld; aktiv = versenkte Taste + rote LED.
  Silber- und Anthrazit-Variante. Bypass zeigt weiterhin BYPASS in
  Rot als Tastenbeschriftung. `ui_smoke_test` prüft die Reihe auf
  exakt drei Tasten, Breiten-Spread ≤ 1 px und LED-Zustände.

## [2.7.1] - 2026-07-30

### Fixed

- **POWER-Taste**: Die in 2.7.0 ergänzte DARK-Taste hatte die
  TIPS/DARK/POWER-Zeile überfüllt — die POWER-Zelle ragte 8,6 px über
  die Zellen-Trennlinie hinaus (gemessen: rechte Kante 223,6 bei
  Zellgrenze 215), der sichtbar überstehende Teil des Rings lag
  außerhalb der klickbaren Zelle. DARK hat seinen ON/OFF-Chip
  abgegeben (der Zustand zeigt sich an der gedrückten Taste selbst),
  die Zeile passt wieder vollständig in die Zelle. `ui_smoke_test`
  prüft jetzt Containment der drei Tasten UND schaltet POWER per
  echtem Playwright-Klick beidseitig durch (param60, LED,
  aria-pressed) — der bisherige Test klickte nur programmatisch und
  maß kein Layout.
- Preview-Mock initialisiert param60–64 (POWER startete dort
  undefiniert).

### Changed

- **Dark Mode: Steuerelemente jetzt ebenfalls dunkel** (Gunmetal statt
  Silber): Step-Rocker inkl. aller Winkel-Varianten, Waveform-Tasten,
  INT/DAW, RUN/STOP, alle −/+-Stepper, Aktions-Matrix, Studio-Aktionen,
  Arp-Figuren/HOLD/CAPTURE, DIST/MOD-Taster, CLASSIC/STUDIO/ARP-
  Schalter sowie beide Overlays (Distortion-Stage und Circuit-Mods
  komplett, inkl. Zellen, Buttons und Beschriftungen). Chrom-Knöpfe,
  Klaviatur und LED-Displays bleiben bewusst als Kontrast.

## [2.7.0] - 2026-07-30

### Added

- **Dark Mode „Anthrazit-Metall"**: DARK-Taste im Logo-Bereich (neben
  ? TIPS) schaltet das komplette Panel auf dunkles Anthrazit — Decks,
  Programmer-Strip, vertiefte Zellen, Beschriftungen und Trennlinien;
  Chrom-Knöpfe, Silbertasten, LED-Displays und Klaviatur bleiben als
  Kontrast erhalten. Einstellung wird wie die Tooltips in
  `localStorage` gemerkt (`acidify.theme.dark`).
- **Mausrad überall**: Stepper (Swing, Length, Root, Octaves, Phrase)
  und Mehrfach-Taster (Waveform, Distortion-Typ, Arp-Figur) reagieren
  jetzt aufs Mausrad; ein Rast = ein Schritt bzw. nächster Wert.

### Fixed

- **Mausrad-Schrittweite der Drehregler**: Die Haupt-Dials nutzten die
  Wert-Quantisierung (0,001) als Rad-Schritt — 1000 Rasten für den
  vollen Weg. Ohne Shift jetzt 2 % des Regelwegs pro Rast (spürbar),
  mit Shift weiterhin fein; Tempo behält den dokumentierten
  0,1/0,01-BPM-Vertrag.
- **Distortion-Autogain, vorkalkuliert**: Die Rest-Abweichung der
  RMS-Angleichung (bis −1,34 dB, je nach Drive) ist jetzt über
  gemessene Stützstellen (7 Drive-Punkte je Modus, tools-Messung @48k)
  als Lookup mit linearer Interpolation im DSP hinterlegt — kein
  Messen zur Laufzeit. Am Referenzpattern liegen alle 21 Messpunkte
  auf 0,00 dB zur Raw-RMS; PURE bleibt bei Drive 0 bit-exakt
  transparent.
- **Ausgangspegel +6 dB**: Der Serienpegel lag mit ~0,37 Peak (Master
  −6 dB) deutlich unter üblichen Instrumentpegeln. Ein festes
  +6-dB-Makeup sitzt NACH der Distortion, damit deren kalibrierter
  Arbeitspunkt und die Autogain-Kurven unverändert gelten; die
  VU-Meter-Skala ist kompensiert. Hinweis: Die Modi haben bauartbedingt
  gleiche Energie (RMS), aber unterschiedliche Spitzenwerte — MACKIE/
  PHONO komprimieren; das Peak-Meter im Host zeigt dort systembedingt
  weniger an, obwohl die Lautheit gleich ist.

## [2.6.0] - 2026-07-30

### Added

- **Capture-Button „→ PATTERN"** im Arp-Panel (unter dem
  ARPEGGIATOR-Readout): übernimmt das, was der Arp gerade spielt, ins
  16-Step-Pattern — danach in Classic/Studio normal editierbar.
  - **Bank-Phrase** (PHRASE-Figur, Slot 01–90): exakte Kopie von Pitch,
    Gate, Accent und Slide; 8er-Phrasen werden auf 16 Steps gekachelt.
    Negative Phrasen-Offsets werden oktavweise auf die Pattern-Root
    normalisiert (das Pattern kennt nur 0…+24 über der Root).
  - **Figur/eigenes Pattern**: friert den Live-Noten-Puffer aus 2.5.1
    ein — die zuletzt an jedem Step gespielte Note wird zum Pitch,
    Gate/Accent/Slide bleiben das eigene Pattern, Steps ohne gespielte
    Note werden zum Rest. Ohne gespielte Runde meldet ein Toast
    „CAPTURE: NOCH NICHTS GESPIELT" statt etwas zu überschreiben.
  - Jede Übernahme ist ein normaler Undo-Eintrag (Capture-Label im
    Toast/Undo), Redo funktioniert ebenso.
- `tools/gen_phrases.py` emittiert die gepackten Phrasen-Steps jetzt
  auch in den UI-Block (`data` je Phrase, gleiche Kodierung wie die
  DSP-Tabelle); `--check` deckt damit alle drei Ziele inhaltlich ab.
- `ui_smoke_test`: Phrase-Capture wird Step für Step gegen
  `tools/data/arp_phrases.json` verifiziert (inkl. Kachelung und
  Accent-Bits), Live-Capture gegen den tatsächlichen Live-Puffer,
  beide Undo-Pfade stellen das Vorher-Pattern bitgenau wieder her.

## [2.5.1] - 2026-07-30

### Added

- **Live-Noten im Arp-Modus**: Die Step-Zellen zeigen nicht mehr die
  (im Arp-Modus irrelevanten) Pattern-Noten, sondern live die Note, die
  der Arp am jeweiligen Step tatsächlich spielt — gespeist vom neuen
  append-only Output-Event `arpNoteOut` (Note pro Step-Start, −1 bei
  Rest/Stopp). Noch nicht gespielte Steps zeigen `···`; Live-Noten
  leuchten bernstein zur ARP-Identität. Die Hinweiszeile im
  ARPEGGIATOR-Display zeigt zusätzlich live die per MIDI gehaltenen
  Tasten (`KEYS C2 · E2 · G2`).
- Alle 16 Figuren-Tasten tragen jetzt eigene Tooltips (die Blase hing
  zuvor am ganzen DIRECTION-Feld und erschien weit vom Zeiger entfernt).

### Fixed

- **Arp-Panel-Layout** (headless vermessen): Der OCTAVES-Stepper war
  180 px breit in einem 137-px-Block und ragte 12,5 px über die linke
  Panelkante; die PHRASE-Zeile lief 2 px unter die Unterkante, und die
  −/+-Tasten beider Stepper saßen 3,5 px tiefer als ihre LED-Displays
  (das vertikale `margin-top` der Stapel-Stepper wirkte auch in den
  horizontalen Arp-Zeilen). Octaves-LED jetzt 40 px, Margins genullt,
  HOLD-Taste 30 px — alles nachweislich in der Zelle und bündig.
- **Tooltip-Latenz**: Tooltips erscheinen erst nach echtem Verweilen
  (900 ms, Timer startet bei jeder Zeigerbewegung neu) statt nach
  360 ms — beim Überstreichen verdeckt keine Blase mehr die GUI.
  Tastatur-Fokus zeigt sie nach 250 ms. Positions-Audit über alle
  Zonen (Classic, Studio, Arp, Overlays) ohne Befund: Blase immer im
  Chassis, nie über dem eigenen Ziel.

## [2.5.0] - 2026-07-30

### Added

- **Arp-Ausbau: 16 Figuren statt 4** (`param61` append-kompatibel 0…16
  erweitert, Werte 0–4 unverändert): zusätzlich Up-Down+ und Down-Up(+)
  (inklusive/exklusive Pendel), Played (Anschlagsreihenfolge), Double,
  Converge/Diverge, Pinky/Thumb (Pedaltöne), Rnd-Once (Fisher-Yates-
  Permutation, geloopt), Walk (Zufallsspaziergang mit Reflexion) und
  Phrase. Das DIRECTION-Feld der Arp-Ansicht ist jetzt ein 8×2-Raster
  mit allen 16 Figuren.
- **PHRASE-Modus mit 90er-Bank** (`param64` append-only, 0…90): nach dem
  Vorbild von JP-8000-RPS und Cubase-Arpache spielen die gehaltenen
  Tasten eine transponierte Phrase. `00 PATTERN` nutzt das eigene
  16-Step-Pattern (Pitch, Gate, Accent, Slide), `01…90` die kuratierte
  Bank in 8 Kategorien (Octave, Acid, Synco, Slide, Accent, Zigzag,
  Rave, Electro; −12…+24 Halbtöne, Gate/Accent/Slide pro Step). Mehrere
  gehaltene Tasten zyklen die Basisnote pro Phrasendurchlauf. Die Bank
  wird aus einer Quelle generiert (`tools/gen_phrases.py`, Marker in DSP
  und UI, `--check` als Sync-Nachweis, Referenz `tools/data/arp_phrases.json`).
- **Arp-Ansicht**: PHRASE-Zeile mit LED-Display, −/+-Stepper und
  91-Einträge-Auswahlmenü (Klick aufs Display); bei aktiver Bank-Phrase
  dimmt der Step-Strip als Hinweis, dass Gate/Accent/Slide aus der
  Phrase kommen.
- `tools/dsp_arp_test.mjs` erweitert: exakte Sequenz-Nachweise für alle
  neuen Figuren (Autokorrelation pro Step), Rnd-Once-Permutations- und
  Determinismus-Beleg, Walk-Nachbarschaftsbeleg, Phrasen-Abgleich gegen
  `arp_phrases.json` und Basisnoten-Zyklus bei mehreren Tasten.

### Fixed

- **Stepper-Klickfläche**: Ein Klick auf das LED-Display eines Steppers
  (statt auf −/+) erhöhte den Wert, weil der Handler das `data-step`-
  Konfigurationsattribut des Control-Containers als Schrittrichtung las.
  Der Handler akzeptiert jetzt nur noch echte Stepper-Tasten.

## [2.4.0] - 2026-07-30

### Added

- **Arpeggiator als dritter Modus** (`param61..63`, append-only; Schalter
  jetzt CLASSIC/STUDIO/ARP mit 3×44-px-Segmenten):
  - Gehaltene MIDI-Noten liefern die Tonhöhen, das 16-Step-Pattern bleibt
    Taktgeber und liefert Gate, Accent und Slide — der Arp spielt also durch
    die programmierte Rhythmus- und Artikulationsmaske (Konzept nach dem
    Riff-Template-Ansatz von Phoscyon 2; Modi-Kanon nach Jupiter-8/SH-101:
    Up, Down, Up-Down ohne doppelte Endpunkte, Random, 1–4 Oktaven, Hold).
  - **Random** ist ein Lehmer-LCG mit festem Seed: reproduzierbar (zwei
    Renders bit-identisch), poolgetreu, keine Direkt-Wiederholung.
  - **Hold (Latch)**: Akkord läuft nach dem Loslassen weiter; ein neuer
    Anschlag nach vollständigem Loslassen beginnt den nächsten Akkord;
    Hold-Aus reduziert den Pool auf die physisch gehaltenen Tasten.
  - Bei laufendem Sequencer triggert MIDI im Arp-Modus nie direkt, sondern
    pflegt nur den Pool; mit Arp aus bleibt eingehendes MIDI am laufenden
    Sequencer wirkungslos (bit-identisch belegt).
  - **Arp-Ansicht** ersetzt die Editor-Zeile: LED-Readout des Modus,
    DIRECTION-Tastenfeld (UP/DOWN/UP-DN/RND), OCTAVES-Stepper, HOLD-Taste;
    der Step-Strip bleibt als Maske sichtbar und editierbar. ARP-Segment
    aktiv in Bernstein; Presets mit `param61 > 0` öffnen die Ansicht
    automatisch.
  - Neuer Nachweis-Test `tools/dsp_arp_test.mjs` (Akkord per SMF in
    `cmaj render --midi`, Tonhöhen je Step per Autokorrelation): Up/Down/
    Up-Down-Zyklen exakt, Random-Determinismus, 2-Oktaven-Zyklus,
    Hold-Verhalten, Arp-aus-Transparenz. `ui_smoke_test` deckt Schalter,
    Panel-Controls und Rücksprung ab (30 Controls).

## [2.3.1] - 2026-07-30

### Changed

- **Master/Output-Bereich nach Nutzervorgabe umgebaut** (die 2.3.0-Platzierung
  der Miniregler an den VU-Flanken war eine schlechte eigenmächtige
  Entscheidung — MIX neben dem Ausgangsmeter las sich als Master-Mix):
  - MASTER- und OUTPUT-Überschriften sitzen jetzt auf derselben Linie wie
    TUNING…ACCENT.
  - Das VOLUME-Label unter dem Master-Knopf entfällt (die Überschrift MASTER
    genügt); das dB-Display bleibt.
  - DRIVE- und MIX-Miniregler stehen als Paar im frei gewordenen Platz unter
    dem Master-Knopf — auf gleicher Höhe direkt links neben der DIST-Taste.
  - VU-Meter wieder unangetastet an der Template-Position.

## [2.3.0] - 2026-07-30

### Fixed

- **A/S-Pills über den Steps waren nie klickbar** — der Step-Handler kannte
  nur Selektion, für die Pills existierte kein Handler (die „klickbaren
  Pills" aus 2.0.0 waren nur optisch; der Test prüfte Existenz, keinen
  Klick). Jetzt togglet die A-Pill Accent, die S-Pill Slide, wählt den Step
  an und der `ui_smoke_test` klickt beide real.

### Changed

- **Distortion-Lautheit auf Raw-Pegel kalibriert** („4× lauter" behoben):
  MACKIE/PHONO lagen bis +21 dB RMS über dem Serienpegel. Die Ausgangs-RMS
  beider Stufen folgt am Referenzpattern einer Sättigungskurve
  (`rms ≈ c·G/(G+k)`, Fit ≤ 0,6 dB); deren Kehrwert hält jetzt jede
  Drive-Stellung auf Raw-Lautheit. Gemessen: alle drei Modi bei Drive
  0/0,35/0,75/1 innerhalb ±0,6 dB um Raw (−33,1 dB RMS); Spitzen sinken
  konstruktionsbedingt, weil Sättigung den Crest-Faktor abbaut. PURE war
  bereits pegelneutral. Alle Bypass-Pfade bleiben bit-transparent.
- **DRIVE- und MIX-Miniregler auf der Haupt-GUI** links und rechts des
  VU-Meters, direkt über der DIST-Taste (beauftragte Ergänzung, nicht im
  dc-Template): 20-px-Chromdials, Drag/Wheel/Pfeiltasten/Doppelklick-Reset,
  gedimmt bei inaktiver Stufe, ohne zweite Control-Registrierung
  (Endpoint-Besitzer bleiben die Overlay-Dials). VU-Meter bleibt pixelstabil.
- **Funktions-Parität mit der Design-Vorlage hergestellt** (Audit aller
  35 Template-Handler):
  - **POWER/BYPASS-Taste im Brand-Panel** ist jetzt funktional statt
    statisch: `param60` (append-only) blendet den Instrumentausgang weich
    auf Stille; Beschriftung POWER↔BYPASS und LED wie im Template.
  - **Scale-Auswahl als Dropdown-Menü** mit den zehn Template-Skalen
    (MIN/MAJ PENTA, NAT/HARM MINOR, DORIAN, PHRYGIAN, MAJOR, MIXOLYDIAN,
    BLUES, CHROMATIC) samt Untertiteln statt blindem Durchschalten;
    Escape schließt, aktive Skala markiert.
  - **Doppelklick auf Steps togglet Gate/Rest** (Classic und Studio) wie im
    Template; die direkte Notenwahl bleibt auf Rechtsklick.
  - **Doppelklick-Reset auf den Mod-Spiegel-Slidern** wie auf den Dials.
  - Vorlage vollständig abgeglichen: `selectPattern`/`prevPatch`/`nextPatch`
    existieren dort nur als toter Mock-Code ohne Markup — bewusst nicht
    portiert.
- `ui_smoke_test` deckt die neuen Pfade ab: Pill-Klicks, Gate-Doppelklick
  (symmetrisch), Scale-Menü (10 Optionen, Auswahl, Schließen), Power-Toggle,
  Miniregler (Wheel + Reset).

## [2.2.0] - 2026-07-29

### Fixed

- **Env Mod ×3 verzerrte die Cutoff-Spanne** (`updateFilterMapping`): der
  Mod verneunfachte auch die Spanne des Cutoff-Potis (3 → 9 Oktaven), wodurch
  das Filter bei mittlerem Cutoff von 884 Hz auf 110 Hz kollabierte — dafür
  gibt es kein Bauteil, der DF-Mod ändert nur das VR5-Netz des Env-Pfads.
  Jetzt entkoppelt. Nachweis: Spektral-Schwerpunkt bei Env = 0 mit/ohne Mod
  identisch (112/112 Hz); bei Env = 0,68 hebt der Mod den Sweep (115 → 126 Hz).
- **Studio-Modus: Playhead war unsichtbar.** Die Leucht-Regeln für
  Kappen-LED, Playbar, Notendisplay und Kappen-Glow galten nur für
  `.sequence-step` — Studio-Steps (`.studio-step`) blieben dunkel, und die
  Ruler-Nummern bekamen die `playing`-Klasse nie. Beides ergänzt; der
  laufende Step leuchtet jetzt wie im Classic-Modus.

### Changed

- **Distortion-Stufe auf Pedal-Referenzpegel kalibriert** (Verhalten der drei
  Modi, Struktur unverändert Airwindows-treu):
  - Alle drei Modelle arbeiten jetzt auf Vollaussteuerung
    (`pedalGain = 1 / 0,34552`, der dokumentierte Serien-Peak) statt auf dem
    rohen Stimmenpegel.
  - **PURE** war am Stimmenpegel praktisch wirkungslos (Wirkanteil −91 dB,
    sin() im linearen Bereich); jetzt hörbar (Wirkanteil ×21), bei Drive 0
    weiterhin bit-exakt transparent.
  - **MACKIE** wurde mit steigendem Drive leiser (drive-gekoppelter
    Ausgangs-Pad ÷macroGain drückte die Clip-Decke von −14 auf −22 dBFS).
    Der Pad liegt jetzt wie im Original fest — auf der Clip-Decke
    (1 − 0,1768) des x⁵-Limiters; mehr Drive = mehr Pegel und Sättigung.
  - **PHONO** sprang beim Aktivieren um −15 dB (pauschaler Faktor 0,18).
    Die RIAA-Kurve ist bei 1 kHz auf Einheitsverstärkung normiert; der
    Soft-Clip hält die Bass-Anhebung an der Stimmen-Decke (Peak exakt
    0,34552 im Matrix-Test).
  - Alle Bypass-Pfade bleiben sample-transparent, Smoke-Peak bit-identisch.
- **Slide Time Amount (`param57`) hat jetzt einen Spiegel-Slider auf der
  Haupt-GUI** unter TUNING (Slide = Pitch-Glide), sichtbar bei aktivem Mod —
  wie die bestehenden Spiegel unter CUTOFF (`param52`) und ACCENT
  (`param59`). Damit sind alle drei Mod-Amounts ohne Overlay erreichbar.

## [2.1.1] - 2026-07-29

### Fixed

- **Mechanischer 1:1-Abgleich, Runde 2 — DOM-vermessen statt Pixel-geschätzt**
  (`tools/uiport/` + Playwright-DOM-Dumps beider Seiten; schlechteste Zone
  vorher/nachher: Classic 13 %→1,6 %, Studio 33 %→1,6 %, Distortion 11 %→1,8 %,
  Mods 11 %→0,5 %; Rest ist Subpixel-AA, Best-Shift-Korrelation 0/0):
  - **Programmer-Kopf**: Header randlos über die volle Panelbreite
    (`margin: 0 -8px`), Legend-Pills 16×12 mit 6-px-Gruppenabstand,
    Positionsdisplay 70×15, Step-Pills 17×13.
  - **Steps**: Kappe 44 hoch, Notenfeld 24 hoch bündig unter der Playbar,
    Legacy-`translateY` auf `.selected` neutralisiert.
  - **Editor**: Readout-Abstand 8, Captions 13 hoch, Klaviatur 78/48 mit
    9×9-LED auf schwarzen Tasten, Funktionsmatrix ohne Legacy-`margin-top`
    und ohne Active-Versatz.
  - **Deck A**: Klangregler-Raster exakt 6×87 (Legacy-`justify-items: center`
    überschrieben, Labels volle Spaltenbreite), Volume-Bank-Padding 13,
    Zellentitel 16, VU-Meter 46 breit, DIST/MOD-Trigger ohne Versatz;
    Scope-Titel 15 (Kurve sitzt 1 px tiefer, wie im Template).
  - **Studio**: Werkzeugpanel 314/Matrix 824 (Template-Split), Lane-Zellen
    42×15, Ruler-Abstand, Pitch-Kappen 43, Aktionstasten füllen die
    31-px-Reihe (Icons als Elemente mit fester 11-px-Zeile), Scale-Button
    linksbündig mit rechtsgestelltem Wert ohne Rahmen, Noten in
    LED-Rot mit Glow, gedrückte Optik für selektierte Wippen,
    Accent/Slide-Aktivfarben gegen die Legacy-Gradienten durchgesetzt.
  - **Distortion-Overlay**: POWER-Schalter 80×58 flach (3D-Rocker-Legacy
    ausgeschaltet), Power-LED 13, Character-Titel als `strong` mit
    Template-Abstand, kein Active-Versatz, DRIVE/MIX-Dials 60 mit
    60×21-LED-Box an Template-Position.
  - **Mods-Overlay**: Zellen-LED 11, Tick-Ring 54, Wertdisplays 24/34 hoch
    in Template-Breite, FEEDBACK-Spaltenabstand 5.
- `tools/uiport/`-Harness über `ACIDIFY_UIPORT_SP`/`ACIDIFY_ROOT`/
  `ACIDIFY_CHROMIUM_PATH` parametrisiert (war auf das Scratchpad der
  Vorsession festgenagelt).
- `ui_smoke_test`: Studio-Werkzeugbreite auf die Template-Maße (314) angepasst.

## [2.1.0] - 2026-07-27

### Changed

- **Silver-UI 1:1 auf das dc-Template gezogen** (mechanischer Abgleich,
  Template-Render vs. Produkt-Render auf 1180×580, `tools/uiport/`):
  randlose Silberplatte statt Beige-Chassis (Footerzeile entfällt),
  Deck-A/B-Feinkorrekturen aus den Analyse-Listen (`tools/uiport/fixes_*.json`),
  Step-Reihe mit Template-Wippen/Chips/Notenfeldern und Beyond-Length-Dimmen,
  Editor mit 24-px-Readout und Template-Klaviatur, Studio-Matrix neu
  (ACCENT/SLIDE-Lanes, BASS-LINE-Kontur, PITCH-GATE-Wippen, 296-px-Werkzeugpanel
  mit EDIT/ARRANGE/SELECTED STEP/GENERATE), Distortion-Sheet 588×180 und
  Mods-Zellenraster 788×300 oben rechts. PITCH-MAP im Classic-Kopf entfernt
  (nicht im Template). Notenwahl im Pitch-Menü setzt jetzt auch das Gate.

## [2.0.3] - 2026-07-27

### Fixed

- **Studio-Modus war im Silver-Layout real kaputt** (Eigenjagd, Option 1 des
  Nutzers): leere LED-Wertdisplays (eine Studio-Regel versteckte
  `.value-label` bis zum Drag — für Silver-LEDs falsch), SLIDE-Lane und
  Aktionszeile liefen aus dem Panel, Note-Displays der Steps beschnitten.
  Jetzt: Kompakt-Steps (54 px) im Studio, Matrix/Tools auf 110 px eingepasst
  (Lanes 17 px, Zellen 12 px, Ruler 10 px), Aktionstasten 24 px — alle vier
  Lanes, alle 15 Aktionen und die Scale-Zeile sichtbar.
- Referenzklärung dokumentiert: verbindlich ist das dc-Template aus beiden
  Übergaben; der alte Session-Screenshot enthielt einen früheren Stand
  („PERFORMANCE BASSLINE", TIPS im Programmer-Kopf).

## [2.0.2] - 2026-07-27

### Fixed

- **Mechanischer Referenzabgleich eingeführt und abgearbeitet**: Design-Render
  und Produkt-Render werden auf 1180×580 normalisiert und regionsweise
  übereinandergelegt (`cmp_*.png`-Paare, oben Soll / unten Ist). Daraus behoben:
  - INT/DAW waren kleine Pillen statt 44×34-Wippen — der alte
    `.clock-mode`-Container erzwang `height: 19px`.
  - Editor-Zeile lief 18 px über den Panelrand: eine späte Theme-Regel setzte
    `.edit-status/.keyboard/.time-controls` auf feste 114 px in einer
    96-px-Zeile; dazu `.keyboard-keys { height: 100% }` gegen das Flex-Layout.
    Jetzt sichtbar: weiße Tastenbeschriftung (C–B), „OCT +0 · +0 SEMITONES…",
    Funktions-Untertitel.
  - Programmer-Kopf trägt die Auswahl-Caption „STEP nn · Note · OCT ±n".
  - Keyboard-Kopfzeile („KEYBOARD" / „TONHÖHE DES GEWÄHLTEN STEPS") ergänzt.
  - Knopfzeiger dicker/länger (4×23) wie im Entwurf.
- `ui_smoke_test`: Studio-Werkzeugabstand an den neuen Editor-Gap angepasst.

## [2.0.1] - 2026-07-27

### Fixed

- **Fidelity-Pass gegen den Design-Entwurf** (Abgleich Screenshot gegen
  Screenshot): Knopfzeiger lagen unter dem Chrom-Cap (Stacking) — auf allen
  Knöpfen sichtbar gemacht; Mod-Slots jetzt unter allen sechs Klangreglern
  (nicht nur CUTOFF/ACCENT); Rest-Steps zeigen **REST** statt gedimmter Note;
  Programmer-Kopf trägt Legende (A/S/PLAYING) und Positionsdisplay; MOD-Taste
  heißt MOD; Keyboard-Tasten haben LED-Punkte und rosa Aktiv-Färbung;
  Versionszeile im Brand zeigt die Release-Nummer; Editor-Zeile passt ohne
  Beschnitt ins 580-px-Fenster.
- Übergabe 2 geprüft: Design-Dateien byte-identisch mit Übergabe 1; die
  enthaltenen `mockup/*.png` sind Vorher-Renders der alten v0.7-Optik,
  keine neuen Vorgaben. LED-Detail-Scraps als Referenz gesichtet.

## [2.0.0] - 2026-07-27

### Changed

- **Silver-Series-UI — der komplette Port der Design-Übergabe.** `ACIDIFYUI.js`
  trägt jetzt die Optik aus `design/ACIDIFY GUI.dc.html` auf allen drei Decks:
  - **Deck A**: Logo-Zelle mit TIPS/POWER-Reihe, OSCILLATOR-Modul mit
    SAW/SQR-Wippen, sechs Chromknöpfe mit roten LED-Wertdisplays und
    Mod-Slots, MASTER-Knopf, VU-Meter (zweikanalig, pegelgetrieben),
    DIST/MODS-Tasten mit Lampen.
  - **Deck B**: Tempo-Knopf mit großem LED-Display, INT/DAW-Wippen mit
    Lampen, RUN/STOP-Wippe, drei Stepper mit LED-Displays, **Filter-Response-
    Visualizer** (Live-Kurve aus Cutoff/Resonanz, Hüllkurvenpfad aus
    Env Mod/Decay, Cutoff-Cursor, RES/ENV/DEC/ACC-Readouts).
  - **Deck C**: 16 Wippschalter-Steps mit klickbaren A/S-Pills, Kappen-LEDs,
    Playbar und LED-Notendisplays; Editor/Keyboard/Funktionsmatrix im
    Silver-Look mit Status-LEDs.
  - **Spiegel-Slider** unter CUTOFF und ACCENT gemäß Portierungsnotizen
    (`data-mirrors`, kein zweites Control; Drag/Wheel steuert den
    Endpoint-Besitzer param52/param59; sichtbar nur bei aktivem Mod).
- `ui_smoke_test` auf die neue Geometrie umgeschrieben (Deck-Struktur,
  Pill-Prüfung, Scope/VU-Existenz; Interaktionspfade unverändert).
  Dreifach-Lauf stabil. Alle Verhaltensflüsse (Transport, Studio, Tooltips,
  Distortion, Mods, Reconnect, 590×290) laufen im neuen Markup unverändert.
- DSP unangetastet: Smoke-Peak bit-identisch 0,34552.

## [1.2.0] - 2026-07-27

### Added

- **CIRCUIT-MODS-Overlay in der Produkt-UI** (`ACIDIFYUI.js`): MODS-Trigger mit
  Lampe neben DIST, sechs Mod-Reihen (Toggle + Amount-Dial bzw. Festwert),
  Statuszeile („STOCK 303" / „N MODS ACTIVE"), Schließen per ×, Scrim und
  Escape. Portiert aus dem Claude-Design-Export nach dem Muster des
  Distortion-Overlays; Controls verdrahten sich über `_buildControls`.
- **Design-Export eingecheckt** unter `design/` (dc.html, dc-runtime,
  Host-Mock, Portierungsnotizen). Die 14 MB Session-Screenshots bewusst nicht.
- `ui_smoke_test` erweitert: Zählungen (27 Controls, 9 Mod-Controls, 6 Reihen)
  plus Interaktionstest — öffnen, zwei Mods schalten, Status „2 MODS ACTIVE",
  Amount per Tastatur, zurück auf „STOCK 303", Escape. Dreifach-Lauf stabil.
- Mockup-Host initialisiert `param51`–`param59`.

### Fixed

- Mod-Statusanzeige lief dem Wertespeicher voraus (Render im `onChange` vor
  `_values`-Update, Echo wird verschluckt) — Render in den Microtask verlegt.

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

[2.9.2]: https://github.com/ClarkParker/ACIDIFY/commit/a33d6f54eb12f90051d33ea1c1f2d51564862f8a
[2.9.1]: https://github.com/ClarkParker/ACIDIFY/commit/6cebb1ff4267709e765a1331114697df32a29181
[2.9.0]: https://github.com/ClarkParker/ACIDIFY/commit/79b8845d2903684c3a055d0e12790995f95476e4
[2.8.0]: https://github.com/ClarkParker/ACIDIFY/commit/7289509bb2797da8753ab98d93f402d41fee21be
[2.7.3]: https://github.com/ClarkParker/ACIDIFY/commit/df18b8f03d3db3f3571a2b4ff63e4eff73d2c373
[2.7.2]: https://github.com/ClarkParker/ACIDIFY/commit/f7f22248333e026ff423b227493298cee417b77b
[2.7.1]: https://github.com/ClarkParker/ACIDIFY/commit/ab3fb759bceb2065bcd3f120461dfc203b50e3ff
[2.7.0]: https://github.com/ClarkParker/ACIDIFY/commit/0eca95b7c8252f1b21c6e6b9829cb1b6f95c8e81
[2.6.0]: https://github.com/ClarkParker/ACIDIFY/commit/d01815490097b85d47e493a56433c91f210888e4
[2.5.1]: https://github.com/ClarkParker/ACIDIFY/commit/295b42c868bff6d0103e9dccf8f873085a3388ab
[2.5.0]: https://github.com/ClarkParker/ACIDIFY/commit/dc96b8ae2f09dc52e407e135de296f929b4adcf0
[2.4.0]: https://github.com/ClarkParker/ACIDIFY/commit/234cd51967496a19d0850f02765d9b3bc36722b1
[2.3.1]: https://github.com/ClarkParker/ACIDIFY/commit/1c4d942664f33a0fd2823723c9d5bae69f09f018
[2.3.0]: https://github.com/ClarkParker/ACIDIFY/commit/db2ac9e65b7693bd26aa9aaafe41f4c534e5467d
[2.2.0]: https://github.com/ClarkParker/ACIDIFY/commit/5e6399cecfb09c0c1b6f15286eadf49fd1544026
[2.1.1]: https://github.com/ClarkParker/ACIDIFY/commit/a82ae838134e7f75fdc467c7006992917dcc2da2
[2.1.0]: https://github.com/ClarkParker/ACIDIFY/commit/0a4f0d6c4c3bb812143be1f0bd69bfc84eac81a8
[2.0.3]: https://github.com/ClarkParker/ACIDIFY/commit/98bffd00749c85967fd162034e57db0bfa95f6ab
[2.0.2]: https://github.com/ClarkParker/ACIDIFY/commit/87f504ea32ddfb5114b9e234326cf3c243af5573
[2.0.1]: https://github.com/ClarkParker/ACIDIFY/commit/01dbec5888bab34203999cecae5f95cfd254f083
[2.0.0]: https://github.com/ClarkParker/ACIDIFY/commit/6aee9bea60e8df99ff112375a0c08c66b01d4bb5
[1.2.0]: https://github.com/ClarkParker/ACIDIFY/commit/330097221de9cbb0c2735479a93737bba68f5a55
[1.1.0]: https://github.com/ClarkParker/ACIDIFY/commit/b423d7769364b837bb979511f127f7641f7bb049
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
