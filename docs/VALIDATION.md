# Validierung 2.9.0

## 2.9.0

A-bewichtete Lautheitsmessung (FFT 2^17, IEC-A-Kurve normiert auf
1 kHz, Referenzpattern @48k) deckte die Schwäche der bisherigen
RMS-Angleichung auf: bei Roh-RMS 0,00 dB lag MACKIE A-bewichtet
−2,80/−6,74/−6,82/−6,44 dB (Drive 0,1/0,35/0,65/1,0) und PHONO
−2,28…−12,21 dB unter Raw; PURE wirkte ≤ 0,25 dB (praktisch kein
Effekt). Nach dem Umbau: PURE mit drive-abhängigem Shaper-Pegel
(sättigt Drive 1,0 den Peak 0,74 → 0,28), PHONO als Emphasis-Clipper
(Pre-Emphasis → tanh ×1…16 → De-Emphasis; Kleinsignal exakt
transparent, Kurven algebraisch invers), Autogain-Tabellen auf
A-Lautheit neu gefittet (Werte in ACIDIFYDSP.cmajor). Ergebnis:
A-rel 0,00 dB an allen 12 Prüfpunkten (3 Modi × 4 Drives) bei Master
−6 dB UND −18 dB (Invarianz aus 2.8.0 bestätigt); einzige Ausnahme
PHONO Drive 1,0 mit −2,61 dB durch die Peak-Kappe am Raw-Peak 0,74
(0,7401 gemessen, keine Übersteuerung). Audio-Nachweise (Raw, PURE,
MACKIE, PHONO je Drive 0,5) als WAV an den Nutzer geliefert.
Master-Range −36…+6 dB (Init −6 unverändert), Sync 64/64. Batterie
grün: Serien-Smoke bit-identisch 0,69105, matrix (Bypass-Identitäten
inkl. PURE Drive 0), arp/articulation/transport, Messstand alle
Prüfsteine, partcheck 28/28, Lints strict, ui_smoke 3/3.

---

# Validierung 2.8.0

## 2.8.0

Arbeitspunkt-Drift der Distortion nachgewiesen (Referenzpattern @48k,
Drive 0,35/1,0, volumeDb/outputGain-States überschrieben): mit Master
VOR der Distortion lagen die Modi bei Master −18 dB um +6,44/+9,51 dB
(MACKIE) bzw. +4,73/+11,39 dB (PHONO) über Raw, bei Master 0 dB um
−3,81/−5,81 bzw. −4,12/−5,88 dB darunter; der PHONO-Peak klemmte bei
0,0636 unabhängig von der Reglerstellung. Nach der Verlegung des
Masters hinter die Distortion (fester Referenzpegel 0,501187 = alter
−6-dB-Punkt): 0,00 dB Modi-zu-Raw an allen sechs Rasterpunkten bei
Master −18, −6 und 0 dB; Peaks skalieren linear (PHONO 0,016 → 0,064
→ 0,127). Serien-Smoke bit-identisch 0,69105 @48k (Default-Pfad
unverändert), dsp_matrix Bypass-Identitäten mit neuem Clean-Tap grün,
dsp_arp/articulation/transport grün, Messstand alle Prüfsteine,
partcheck 28/28, Lints strict, gen_phrases synchron. Miniregler:
dB-Display 125–133, Labels 133–139, Dials 140–164 bündig zur
DIST/MOD-Unterkante 164 (beide Themes per Screenshot), ui_smoke 3/3
mit Dial-Unterkanten-Assertion.

---

# Validierung 2.7.3

## 2.7.3

Miniregler-Platzierung headless belegt: `.master-minis` rechts bündig
an der Master-Zelle (rechte Kante 1048 bei Zellgrenze 1049), 11 px
Abstand zum DIST-Taster (1059), Unterkanten 165/164 (Versatz 1 px),
Dial-Durchmesser 24 px (vorher 20, Zeiger mitskaliert). Beide Themes
per Screenshot abgenommen. `ui_smoke_test` 3/3 inkl. neuer
Platzierungs-Assertion, `ui_lint --strict` sauber. Kein DSP-Eingriff.

---

# Validierung 2.7.2

## 2.7.2

Tastenreihe headless belegt: drei `.brand-key` mit Breiten-Spread
0,0 px (47,7 / 47,7 / 47,7), jede mit Status-LED, TIPS- und POWER-LED
initial an, Containment in Zeile und Zelle unverändert grün, POWER-
Echtklick-Test unverändert grün. Beide Themes per Screenshot
abgenommen (Silber + Anthrazit). `ui_smoke_test` 3/3, `ui_lint
--strict` sauber, Sync 64/64. Kein DSP-Eingriff.

---

# Validierung 2.7.1

## 2.7.1

POWER-Regression headless belegt: vor dem Fix ragte die POWER-Zelle
bis x = 223,6 über die Brand-Zellgrenze (215) und den Zeilenrand
(198) hinaus; nach dem Entfernen des DARK-Chips liegen TIPS, DARK und
POWER vollständig in der Zeile und die Zeile in der Zelle
(`ui_smoke_test`-Containment-Assertion). POWER schaltet per echtem
Playwright-Klick beidseitig (param60 1→0→1, LED und aria-pressed
folgen). Dark Mode zweite Stufe: Gunmetal-Overrides für Step-Rocker
(alle 8 Winkel-/Selected-Varianten), Waveform, INT/DAW, RUN/STOP,
Stepper-Tasten, Aktions-Matrix, Studio-Aktionen, Arp-Panel-Tasten,
DIST/MOD, CLASSIC/STUDIO/ARP-Schalter und beide Overlays; belegt per
Screenshot-Durchsicht (Classic, Arp, Studio, Distortion-Stage,
Circuit-Mods) und computed-Style-Assertion (Chassis rgb(74,78,79),
Aktionstaste rgb(90,95,97)). `ui_smoke_test` 3/3, `ui_lint --strict`
sauber, Sync 64/64, Serien-Smoke unverändert 0,69105 @48k (kein
DSP-Eingriff).

---

# Validierung 2.7.0

## 2.7.0

Distortion-Autogain gemessen (Referenzpattern, 16tel-Basslauf mit
Accents @48k, `cmaj render`): vor dem Fix RMS-Abweichung zur Raw-Spur
bis −1,34 dB (PHONO Drive 1,0) und −1,29 dB (MACKIE Drive 0,35); nach
Einbau der Stützstellen-Lookups (7 Drive-Punkte je Modus, linear
interpoliert) liegen alle 21 Punkte des Rasters bei 0,00 dB
(±0,005 dB). PURE bei Drive 0 bleibt bit-exakt transparent
(`dsp_matrix` pure-zero-drive differenceRms 0). Ausgangs-Makeup +6 dB
nach der Distortion: Serien-Smoke-Peak 0,34552 → 0,69105 @48k,
Bypass-Identität aller drei expectBypass-Fälle erhalten, Peak-Decke
1,05 nicht verletzt; VU-Skala kompensiert (Anzeige unverändert).
Mausrad headless belegt (`ui_smoke_test` 3/3): Dial-Rast = 2 % des
Regelwegs (Cutoff 0,45 → 0,47), Stepper-Rast = 1 Schritt (Swing),
Mehrfach-Taster-Rast = nächster Wert (Waveform), Tempo-Vertrag
0,1/0,01 BPM unverändert. Dark Mode: DARK-Taste im Logo-Bereich
schaltet `theme-dark` (Chassis-Verlauf ab rgb(74,78,79) belegt),
Zustand ON/OFF + localStorage geprüft, Abschalten stellt Silber
wieder her; DOM-Sweep über alle sichtbaren Flächen fand nach den
Overrides keine helle Restfläche (einzig gemeldeter Treffer
tips-power-row wurde behoben). Übrige Batterie grün:
dsp_arp/articulation/transport, Messstand alle Prüfsteine, partcheck
28/28, Lints strict, `gen_phrases.py --check` synchron.

---

# Validierung 2.6.0

## 2.6.0

Capture „→ PATTERN" headless belegt (`ui_smoke_test` 3/3): Phrase 13
„ACID UP" wird Step für Step gegen `tools/data/arp_phrases.json`
verifiziert (16 Steps, Accent-Bits auf Step 1/9, Pitches 0…15 exakt),
Live-Capture friert den `arpNoteOut`-Puffer ein (Pitch = Note − Root
für jeden gespielten Step, Gate gesetzt; ungespielte Steps als Rest),
beide Undo-Pfade stellen das Vorher-Pattern bitgenau wieder her
(JSON-Vergleich der Snapshots). Button liegt vollständig in der
Status-Zelle (26…204 / 512…537 in 17…213 / 457…563).
`gen_phrases.py --check` prüft jetzt DSP-Tabelle, UI-Bank inklusive
`data`-Steps und JSON gegen die Quelle (90 Phrasen / 1440 Steps
synchron). DSP unverändert (nur UI + Tools angefasst): Serien-Smoke
bit-identisch 0,34552 @48k, dsp_arp/matrix/articulation/transport
grün, Messstand alle Prüfsteine, partcheck 28/28, Lints strict sauber.

---

# Validierung 2.5.1

## 2.5.1

Arp-Panel headless vermessen (vorher → nachher): OCTAVES-Stepper 180 px
in 137-px-Block mit 12,5 px Überhang über die Panelkante → 132 px,
vollständig in der Zelle; PHRASE-Zeile lief 2 px unter die Unterkante →
bündig (Zellinhalt 863…1163 / 457…563, alle Elemente enthalten);
−/+-Tasten beider Stepper 3,5 px unter den LED-Displays (geerbtes
`margin-top: 7px` der Stapel-Stepper) → LED- und Tastenoberkanten
pixelgleich (481/481 bzw. 531/531). Tooltip-Audit über 23 Ziele in
Classic-, Arp- und Studio-Ansicht: Blase immer im Chassis, nie über dem
eigenen Ziel, vertikaler Abstand 4–30 px; Überstreichen und Verweilen
unter 500 ms zeigen keine Blase, echtes Verweilen (900 ms ohne
Bewegung) zeigt sie; die 16 Figuren-Tasten haben eigene Tooltips
(Befund: Blase hing zuvor 46 px entfernt am gesamten DIRECTION-Feld).
Live-Noten: `arpNoteOut` im DSP an jedem Step-Start (−1 bei
Rest/Stopp), UI-Zellen zeigen im Arp-Modus die gespielte Note in
Bernstein, `···` vor der ersten Runde, Pattern-Anzeige kehrt beim
Verlassen zurück (ui_smoke-Assertions liveCells/arp-live/Restore).
Serien-Smoke bit-identisch 0,34552 @48k, dsp_arp/matrix/articulation/
transport grün, Messstand alle Prüfsteine, partcheck 28/28, Lints
strict sauber, `gen_phrases.py --check` synchron, `ui_smoke_test` 3/3
(179 Tooltip-Ziele, Latenz-Vertragstest 500/1200 ms).

---

# Validierung 2.5.0

## 2.5.0

`dsp_arp_test` (48 kHz, Akkord 36/40/43 per SMF, Autokorrelation pro
Step) mit exakten Sequenz-Nachweisen: Up-Down+ [36 40 43 43 40 36],
Down-Up [43 40 36 40], Down-Up+, Played (Reihenfolge E-C-G belegt),
Double, Converge [36 43 40], Diverge [40 43 36], Pinky [36 43 40 43 36 43],
Thumb [36 40 36 43 36 40], Rnd-Once (echte Permutation, geloopt,
Doppel-Render bit-identisch), Walk (poolgetreu, nur Nachbarschritte),
Phrase 00 = eigenes Pattern transponiert, Phrasen 01/13 stimmen Step
für Step mit `tools/data/arp_phrases.json` überein, Basisnoten-Zyklus
bei zwei gehaltenen Tasten (36 → 43 am Phrasenumbruch), Arp aus:
Render mit/ohne MIDI bit-identisch. `gen_phrases.py --check`: 90
Phrasen / 1440 Steps in DSP, UI und JSON synchron. Serien-Smoke
bit-identisch 0,34552 @48k, matrix/articulation/transport grün,
Messstand: alle Prüfsteine bestanden, partcheck 28/28, Lints strict
sauber (param-count-Hinweis 64 dokumentiert). `ui_smoke_test` 3/3
grün: 31 Controls, 16 Figuren im DIRECTION-Raster, Phrasen-Menü mit
91 Einträgen, Auswahl „ACID UP" (param64 = 13) inkl. gedimmtem
Step-Strip, Stepper-Rückschritt auf 12, Rücksprung CLASSIC setzt
param61 = 0. Stepper-Displays lösen keine Wertänderung mehr aus
(Fix der `data-step`-Kollision am Control-Container).

---

# Validierung 2.4.0

## 2.4.0

`dsp_arp_test` (48 kHz, Akkord 36/40/43 per SMF, Pattern nur Gate):
Up [36 40 43]-Zyklus, Down [43 40 36], Up-Down [36 40 43 40], Random
deterministisch (Doppel-Render bit-identisch), poolgetreu ohne
Direkt-Wiederholung, Oktaven=2 → [36 40 43 48 52 55], Hold: Tail-RMS 0,0141
nach Loslassen vs. 0 ohne Hold, Arp aus: Render mit/ohne MIDI-Akkord
bit-identisch. Serien-Smoke bit-identisch 0,34552 @48k (param61 init 0),
matrix/articulation/transport grün, Messstand 11/11, partcheck 28/28,
Lints strict sauber, `ui_smoke_test` 3/3 mit Arp-Abdeckung (Schalter 3×44,
30 Controls, Panel-Interaktionen, Rücksprung setzt param61 = 0).

---

# Validierung 2.3.1

## 2.3.1

Headless vermessen: Titel-Linie MASTER/OUTPUT auf Knopf-Label-Höhe,
VOLUME-Label entfernt, Miniregler-Paar [975,137 52×27] auf der
DIST-Zeile (Taste [1059,143]), VU unverändert [1086,47]. `ui_smoke_test`
3/3 grün (inkl. Miniregler-Wheel/Reset am neuen Ort), `ui_lint --strict`
sauber, Sync 60/60 konsistent.

---

# Validierung 2.3.0

## 2.3.0

Distortion-Lautheit (Referenzpattern, 48 kHz, 4 s): Raw −33,1 dB RMS; nach
Kalibrierung PURE −33,1…−33,3, MACKIE −32,5…−33,1, PHONO −32,8…−33,5 dB über
Drive 0/0,35/0,75/1 (vorher MACKIE bis −12,1, PHONO bis −11,4 dB).
Matrix-Test grün, Bypass-Fälle ΔRMS = 0. Parität headless verifiziert:
Pill-Klick Flags 1→3→7, Doppelklick-Gate 5→4→5 (Classic) und 1→0 (Studio),
Scale-Menü 10 Optionen/Auswahl BLUES/Escape, POWER→BYPASS→POWER mit
LED-Zustand, Miniregler Wheel 0,35→0,37 und Reset, VU-Position unverändert
(1086/47). Smoke bit-identisch 0,34552 @48k, articulation/transport ok,
Messstand 11/11, partcheck 28/28, Lints strict sauber (60-Parameter-Hinweis
bleibt die dokumentierte Empfehlungswarnung), `ui_smoke_test` 3/3 grün mit
erweiterten Prüfungen.

---

# Validierung 2.2.0

## 2.2.0

Distortion-Matrix nach der Pegel-Kalibrierung: clean/disabled/zero-drive/
zero-mix bit-transparent (ΔRMS = 0), PURE Wirkanteil 0,000585 (vorher
0,000028), MACKIE Drive 0,75 → 1: Peak 0,626 → 0,652 (steigt statt fällt),
PHONO Peak exakt 0,34552 (Soft-Clip-Decke), kein Fall über 1,05.
Env-×3-Nachweis: Schwerpunkt Env = 0 mit/ohne Mod 112/112 Hz identisch,
Env = 0,68: 115 → 126 Hz. Studio-Playhead headless verifiziert (LED-Glow,
Ruler-Highlight, Screenshot). Spiegel-Slider param57 unter TUNING erscheint
bei aktivem Mod, 22 ms → Wheel 24 ms. Smoke bit-identisch 0,34552 @48k
(alle 6 Raten), articulation/transport ok, Messstand 11/11, partcheck 28/28,
Lints strict sauber, `ui_smoke_test` 4/4 grün, Template-Abgleich unverändert
(max. Zone 1,8 %).

---

# Validierung 2.1.1

## 2.1.1

Mechanischer Soll/Ist-Abgleich gegen das dc-Template (`tools/uiport/`,
4 Zustände auf 1180×580, 16-Zonen-Diff, Schwelle >24 RGB): schlechteste Zone
Classic 1,6 %, Studio 1,6 %, Distortion 1,8 %, Mods 0,5 % (vorher 13/33/11/11).
Verbleibende Deltas sind Subpixel-AA: Best-Shift-Korrelation aller heißen
Regionen 0/0 px, Label-Tintenzentroide ≤0,5 px bei gleicher Tintenmenge,
plus die beabsichtigte Versionszeile im Brand. `ui_smoke_test` dreifach grün,
DSP-Smoke bit-identisch 0,34552 @48k (alle 6 Raten grün), dsp_matrix/
articulation/transport ok, Messstand 11/11, partcheck 28/28,
`ui_lint --strict`/`cmajor_lint`/`check_sync`/`manifest_check --strict` sauber.

---

# Validierung 2.1.0

## 2.1.0

Mechanischer Soll/Ist-Abgleich gegen das dc-Template (`tools/uiport/`,
4 Zustände auf 1180×580, 16-Zonen-Diff): schlechteste Zone Classic 13 %,
Distortion 11 %, Mods 11 %, Studio 33 % (Restdeltas Wippen-Glanz/Glow).
`ui_smoke_test` dreifach grün, DSP-Smoke 0,34552, `ui_lint --strict` sauber,
Sync sauber, partcheck 28/28, Messstand 11/11.

---

# Validierung 2.0.3

## 2.0.3

Studio-Modus nachgemessen (Matrix 562, Panel 563 — kein Überlauf mehr),
`ui_smoke_test` dreifach grün, DSP-Smoke 0,34552, `ui_lint --strict` sauber.

---

# Validierung 2.0.2

## 2.0.2

Referenzabgleich regionsweise (Soll/Ist-Paare), Layout im Browser nachgemessen
statt geschätzt (Editor 96 px, Kinder ≤ 88 px). `ui_smoke_test` dreifach grün,
DSP-Smoke 0,34552, `ui_lint --strict` sauber, Sync sauber.

---

# Validierung 2.0.1

## 2.0.1

Fidelity-Pass: `ui_smoke_test` dreifach grün, DSP-Smoke 0,34552,
`ui_lint --strict` sauber, Sync sauber.

---

# Validierung 2.0.0

## 2.0.0

Silver-Series-UI (voller Design-Port). `ui_smoke_test` dreifach grün auf der
neuen Geometrie, DSP-Smoke bit-identisch (0,34552), `cmajor_lint` nur die
dokumentierte Parameterzahl-Notiz, `ui_lint --strict` sauber, Sync und
Manifest sauber.

---

# Validierung 1.2.0

## 1.2.0

Mod-Overlay in der Produkt-UI. `ui_smoke_test` dreifach grün (27 Controls,
Mod-Interaktion, Reconnect), `preflight` sauber bis auf die dokumentierte
Parameterzahl-Notiz, DSP unangetastet (`smoke_test` 0,34552).

---

# Validierung 1.1.0

## 1.1.0

MOD-Sektion (param51…59). Defaults bit-identisch zum Serienstand
(Smoke-Peak 0,34552). Wirkungsnachweise pro Mod gemessen (Crest, Schwerpunkt,
Selbstoszillation, Slide-Frequenz, Attack-Energie — Werte in `docs/MODS.md`).
`hardware_checks` 11/11, Matrix 11/11, Artikulation, Transport 12/12,
`preflight`: nur die dokumentierte Parameterzahl-Warnung (59 > 50, bewusst).

---

# Validierung 1.0.1

## 1.0.1

VCA-Release auf Whittles Messung umgestellt (8 ms Halten + 8 ms linear,
Accent 50 ms aus Open303). Filterkern unangetastet: `hardware_checks` 11/11,
`smoke_test` 0,34552, Matrix 11/11, Artikulation, Transport 12/12.

---

# Validierung 1.0.0

## 1.0.0

Diodensättigung an allen vier Paaren (`drive = 1089,8 / f_c`, kein freier
Parameter), Faktor 2 entfallen (`L(0) = 1`), `otaDrive = 0,4971` abgeleitet.
Alle Prüfungen gelaufen: `smoke_test` 0,34552, Matrix 11/11, Artikulation,
Transport 12/12, `hardware_checks` **11/11** (neu: Klirr-gegen-Cutoff,
Kleinsignal, Faltung < −40 dB), `partcheck` 28/28. Anschwinggrenze durch den
gesamten Umbau unverändert: 2,66796875 / 1,02734375 bei 150 Hz / 8 kHz.
Beide verbliebenen Konstanten sind **bewusst behalten** mit belegter Herkunft
(`4.0` Accent und VCO-Rechteckschwelle, beide aus Open303 = Messung/Kalibrierung
an echter Hardware; Schaltungsherleitung der Accent-Quelle nachweislich nicht
möglich, kein öffentliches Netz). Offen bleibt allein der Abgleich gegen ein
echtes Gerät.

---

# Validierung 1.0.0-rc2

## 1.0.0-rc2

Unverändert zu rc1 (nur Doku und Kommentare); alle Prüfungen erneut gelaufen:
`preflight --strict` sauber, `smoke_test` 0,73853, Matrix 11/11, Artikulation,
Transport 12/12, `hardware_checks` 8/8, `partcheck` 28/28.

---

# Validierung 1.0.0-rc1

## 1.0.0-rc1

| Prüfung | Ergebnis |
|---|---|
| `preflight --strict` | sauber |
| `smoke_test` | peak 0,73853 |
| `dsp_matrix_test` | 11/11 `ok` |
| `dsp_articulation_test` | `ok` |
| `dsp_transport_test` | 12/12 `ok` |
| `hardware_checks.py` | 8/8 bestanden |
| `partcheck.py` gegen EAGLE-Quelle | 28/28 Bauteilwerte bestätigt |

---

# Validierung 0.11.0

## 0.11.0

| Prüfung | Ergebnis |
|---|---|
| `preflight --strict` | sauber |
| `smoke_test` | peak 0,75355 |
| `dsp_matrix_test` 48/44,1/96/192 kHz | alle `ok`, `cleanPeak` 0,79224…0,79283 |
| `dsp_articulation_test` | `ok` |
| `hardware_checks.py` | 8/8 bestanden |

---

# Validierung 0.10.0

## 0.10.0

| Prüfung | Ergebnis |
|---|---|
| `preflight.py --strict` | sauber |
| `smoke_test` | peak 0,76596 |
| `dsp_matrix_test` | 11/11 `ok`, höchster Effekt-Peak 0,9384 |
| `dsp_articulation_test` | `ok` |
| `hardware_checks.py` | 8/8 Prüfsteine bestanden |
| Samplerate 44,1 / 88,2 / 96 / 192 kHz | alle `ok`, `cleanPeak`-Spanne 0,12 % |

---

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
| `hardware_checks.py` | 8/8 Prüfsteine bestanden |
| Samplerate-Invarianz `dsp_matrix_test` | 44,1 / 88,2 / 96 / **192** kHz alle `ok`; `cleanPeak` 0,79004 / 0,78909 / 0,78912 / 0,78985 — Spanne 0,12 % |

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
