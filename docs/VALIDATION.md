# Validierung 2.17.0

## 2.17.0

Gate→Ton-Totzone: hörbarer Start (2-%-Schwelle) 3,47 ms nach dem
Zustand ohne Totzone, plus 0,5-ms-Anstieg ≈ 4 ms nach Gate — in
Whittles Messfenster 1–5 ms („typically 4 ms"). Accent→VCA-Struktur
per Rang-3-Primärtext bewiesen (Whittle 303-unique: additiv über
R119/C36 in den Steuerstrom); MEG-Accent-Kurzschluss und
reso-abhängige Sweep-Glättung textlich bestätigt (bereits modelliert).
Attack-Checkpoint mit 25-%-Onset-Schwelle: 597,1 Hz ≥ 500 grün (der
BA662-Durchgriff vor dem Öffnen liegt bei ~−20 dB und fängt den
Detektor nicht mehr; der 10-ms-Lag-Fehlerfall bliebe bei ~221 Hz).
Autogain-Refit nach Totzone (7-Punkt, Restabweichung ≤ 0,34 dB an den
Testpunkten, gain test grün). Serien-Smoke Peak 0,50919 / RMS 0,01821.
Volle Batterie grün: smoke, hardware (5 Checkpoints), gain, arp,
articulation, matrix, transport, ui_smoke, Lints strict.

---

# Validierung 2.16.1

## 2.16.1

K1-Rücknahme belegt: Attack-Trajektorie (C2, Cutoff 0,45, Reso 0,72,
Env Mod 0,9; Schwerpunkt 100–4000 Hz im 4-ms-Fenster ab Note-On) —
korrigiert 728 Hz, 2.12.0-Referenz 727 Hz, fehlerhafter
2.13.0–2.16.0-Stand 221 Hz. Netzbeleg: x0x-Vektorplan, C23 = 1 µF am
Q18-Emitter mit R94 = 10 k gegen GND (Bypass-Grenze ≈ 16 Hz). Neuer
CI-Checkpoint attackFirstWindowCentroidHz = 727,5 ≥ 500 grün; der
Lag-Zustand wäre gescheitert. Autogain-Refit: A-Restabweichung
0,00–0,01 dB an 6 geprüften Stützstellen nach 7-Punkt-Fit; neue
Serien-Smoke-Referenz Peak 0,50919 / RMS 0,01848. Volle Batterie
grün: smoke, hardware (jetzt 5 Checkpoints), gain, arp, articulation,
matrix, transport, ui_smoke, Lints strict.

---

# Validierung 2.16.0

## 2.16.0

kMax-Entscheid gemessen: Serie — Top-5-Linien bei C2/Reso max alle
0–1 % vom Obertonraster (65,2/65,9/1308/131/130 Hz); Faktor 2 —
dominante Linie 1477,3 Hz mit 41 % Rasterabstand (freilaufender
Grenzzyklus). Accent-Kette netzverfolgt (Roland S. 5, Rasterkrops im
Sitzungsprotokoll): D27→R120→C36→R119→BA662-Steuerpin. Gewicht 4,0
wiederhergestellt; Autogain-Tabellen = 2.13.0-Messstand, gain_probe
bestätigt A-Restabweichung 0,00 dB (4 Stützstellen je Typ geprüft),
dsp_gain_test grün. Blocking isoliert: Δmean(Serie −
Bias-eingefroren) −6e−5 → 0 binnen ~70 ms (2-Perioden-Fenster).
Serien-Smoke-Referenz wieder Peak 0,48012 / RMS 0,01858 (Stand
2.13.0, da Gewicht 4,0). Volle Batterie grün: smoke, hardware, gain,
arp, articulation, matrix, transport, ui_smoke, Lints strict.
SCHEMATIC_COVERAGE.md neu; OPEN_ITEMS ohne offene A-Punkte.

---

# Validierung 2.15.0

## 2.15.0

PHONO-Slew-Limit (1 V/µs, 4558-Datenblatt; 63 462 Einheiten/s auf der
1,65-Einheiten-Rail-Spanne, volle Flanke ≈ 26 µs) eingebaut und
EHRLICH vermessen: Bandanteile > 4/8/12 kHz am A3-Ton, Drive 1,0,
gegen 2.14.0 identisch (−24,5/−33,3/−40,5 dB) — die RIAA-Entzerrung
in der Schleife begrenzt die Flanken bereits stärker als der OP; das
Glied wirkt nur bei Extremmaterial und bleibt als Korrektheitsglied.
Kein Autogain-Refit nötig (A-Restabweichung unverändert 0,00 dB an
den geprüften Stützstellen; gain test grün). Serien-Smoke unverändert
Peak 0,64623 / RMS 0,02356. Batterie grün: smoke, hardware, gain,
matrix, Lints; docs/OPEN_ITEMS.md neu (vollständige Offen-Liste).

---

# Validierung 2.14.0

## 2.14.0

Accent-VCA-Gewicht 6,0 aus der Schaltung: nodale Rechnung belegt
(i_env,max = 50 µA aus Q31/R131 220 k; i_acc,max = 298 µA aus
D27/R120 22 k + R133 2,2 k/D35 bei MEG-Spitze 10 V und Knoten-Bias
1,6 V → 5,95; Toleranzband 4,8–6,7 über die dokumentierten Spannen).
Accent-Release-Intervall hergeleitet (untere Schranke R119·C36 =
1,55 ms, obere Schranke MEG-Decay ≥ 200 ms; Messwert 50 ms im
Intervall, bleibt Anker). Autogain-Refit per gain_probe:
A-Restabweichung 0,00 dB an 12 Stützstellen. Neue
Serien-Smoke-Referenz Peak 0,64623 / RMS 0,02356 (Accents kräftiger).
Volle Batterie grün: smoke, hardware (Stimmvorschrift 457,8 Hz,
Env-Mod-Monotonie, Slide-Symmetrie), gain, arp, articulation, matrix,
transport, ui_smoke, Lints strict, check_sync 66/66. Kein Eingriff in
Sequencer/UI.

---

# Validierung 2.13.0

## 2.13.0

VCO-Former: Formeln im JS-Spiegel exakt belegt (Duty 46,86 %, Dach
0,310 → 0,500 in ±0,5-Einheiten, Boden −0,500 flach, Reset 0,302 ms
Halbkosinus, Rampe konstant fallend); Ketten-Render belegt die
Rampen-Inversion (Median-Steigung +/− gegen 2.11.6, Duty-Kennzahlen
verschoben wie erwartet — das Koppelnetz differenziert bei 55 Hz).
Scope-Grundlage pixelvermessen (Fabmanual S. 8/9): Saw 11,25 → 6,09 V
fallend, Reset 2–4 px = 0,3–0,6 ms inkl. Bloom; Square Tiefpegel
5,000 V, Dachanstieg ≈ 17–21 % von Vss (drei saubere Pulse), Vmax
9,063 V am Dachende. K1: Netzverfolgung R98 → R97 10 k → C23 1 µF →
R94 → Antilog am Seite-5-Scan. PHONO (55 Hz, Drive 0,8): H2 −8,2 /
H3 −25,7 / H4 −16,4 / H5 −23,9 dB rel H1 (geradzahlige Signatur;
2.11.6: monoton −8,5/−19,2/−26,2/−30,5). Autogain-Refit per
gain_probe: A-Restabweichung 0,00 dB an 12 Stützstellen (PURE/MACKIE/
PHONO je 4 geprüft nach 7-Punkt-Fit). Neue Serien-Smoke-Referenz
Peak 0,48012 / RMS 0,01858. Volle Batterie grün: smoke, matrix,
articulation, arp (inkl. Phrase-Accent/Slide), gain, transport
(20 Checks), hardware (Stimmvorschrift 457,8 Hz unverändert, Env-Mod-
Monotonie, Slide-Asymmetrie 21,9 % < 30 %), ui_smoke, Lints strict.
A/B-Hörbelege (Saw/Square/PHONO, 2.13.0 gegen 2.11.6) im
Sitzungsbericht.

---

# Validierung 2.12.1

## 2.12.1

Header-/Dokumentations-Release, kein DSP-Eingriff — per Serien-Smoke
bit-identisch belegt: Peak 0,50678 / RMS 0,01828 unverändert nach dem
Header-Tausch in `ACIDIFYDSP.cmajor`. `dsp_hardware_test` grün
(Stimmvorschrift 457,8 Hz, Env-Mod-Monotonie, Slide-Symmetrie),
`cmajor_lint` (bekannte Param-Anzahl-Warnung), `ui_lint --strict`,
`node --check`, `manifest_check`, `check_version` grün; `ui_smoke_test`
nach dem UI-Header-Tausch grün. Quelltext-Grep bestätigt: kein
Open303-Copyright mehr in Quelldateien; die drei zitierten Messwerte
sind an ihren Stellen einzeln markiert und in THIRD_PARTY_NOTICES.md
tabelliert.

---

# Validierung 2.12.0

## 2.12.0

Hardware-Fixes gemessen (Details docs/SOUND_GAP_ANALYSIS.md,
„Umsetzung 2.12.0"): Roland-Stimmvorschrift per Verhältnis-Spektrum
Reso max/Reso 0 → Resonanzspitze 457,8 Hz (Soll 500 ± 100; linear
vorher 884 Hz). Env-Mod-Ausklang monoton dunkler: Schwerpunkt
138,6/105,4/69,6 Hz bei Env Mod 0/0,5/1,0 (vorher 231,5/231,7/231,9 —
Regler wirkungslos); > 4 dB Abfall über 800 Hz belegt. Slide in der
Oktav-Domäne: Kreuzung der geometrischen Mitte 17,9/19,6 ms auf/ab,
Asymmetrie 9 % (τ·ln 2 = 15,25 ms + Spur-Quantisierung). Autogain-Refit
per gain_probe: A-Abweichung 0,00 dB an allen 21 Stützstellen, Peaks
≤ 0,4615 < Raw-Peak 0,5082. Neue Serien-Smoke-Referenz Peak 0,507.
Volle Batterie grün: smoke, matrix, articulation, arp (inkl.
Phrase-Accent/Slide), gain, transport (20 Checks), hardware (neu),
ui_smoke, Lints strict, check_sync 66/66. Messmethodik-Korrekturen im
neuen Test dokumentiert (Resonanzlage quellunabhängig per
Verhältnis-Spektrum; Slide-Timing aus der Tonhöhenspur selbst).

---

# Validierung 2.11.6

## 2.11.6

Headless belegt (Arp-Figur aktiv, Step 9 = Rest): Rad hoch setzt
Flags 0 → 1, nochmals Rad hoch ändert nichts, Rad runter setzt
zurück auf 0; die Tonhöhe des Steps bleibt über alle Rad-Events
identisch. Phrase 00 PATTERN: Rad runter schließt das Gate eines
aktiven Steps (Beleg der Entsperrung nach der Bank-Phrase-Sperre).
Tooltips nennen „wheel up opens the gate, wheel down mutes the
step". Classic-Rad (Halbton) und Studio-Rad unverändert durch die
bestehenden Checks abgedeckt. `ui_smoke_test`, `ui_lint --strict`,
`node --check` grün. Kein DSP-Eingriff.

---

# Validierung 2.11.5

## 2.11.5

Headless belegt (Arp-Figur aktiv, Default-Pattern): Step 9 (Flags 0)
zeigt „REST" mit grauer LED statt „···"; Doppelklick setzt Flags
0 → 1 (Anzeige verlässt REST, LED grün), erneuter Doppelklick stellt
Flags 0 und „REST" wieder her. Tooltips der Arp-Ansicht nennen
Doppelklick (Gate/Rest) und A/S-Pills als Editierweg; Phrasen-Rests
im Bank-Modus zeigen ebenfalls „REST". Screenshot: Live-Noten amber,
REST deutlich lesbar. `ui_smoke_test`, `ui_lint --strict`,
`node --check` grün. Kein DSP-Eingriff.

---

# Validierung 2.11.4

## 2.11.4

Headless belegt (Arp-Figur RND aktiv, PHRASE nicht gewählt): Klick
auf das Phrasen-Display öffnet kein Menü, ±-Tasten und Mausrad
lassen `param64` unverändert, `aria-disabled="true"` auf Control und
Display, Tooltip „Inactive: select the PHRASE figure…". Nach Wahl
der PHRASE-Figur öffnet das Menü wie zuvor (91 Einträge, bestehende
Checks unverändert grün). `ui_smoke_test`, `ui_lint --strict`,
`node --check` grün. Kein DSP-Eingriff.

---

# Validierung 2.11.3

## 2.11.3

Phrase-Accents/-Slides am Produktions-DSP gemessen (`dsp_arp_test`,
48 kHz, cmaj render mit SMF-Eingabe): OCT 8TH akzentuiert die
Root-Steps 0/4/8/12, die Steps 2/6/10/14 spielen dieselbe Tonhöhe
ohne Accent — Peak-Verhältnis akzentuiert/plain = 3,40 (gefordert
> 1,1). SLD UP bindet Step 0→1, 2→3, …: RMS im Fenster 80–98 % der
Steplänge ist auf Slide-Steps um Größenordnungen höher als auf
Nicht-Slide-Steps (dort schließt das Halbstep-Gate; gefordert > 3×).
Datenbasis: alle 90 Bank-Phrasen enthalten Accents (254 gesamt)
und 95 Slides; keine Phrase ist leer. UI headless belegt: Step-Reihe
spiegelt im Bank-Phrase-Modus die Phrasen-Flags (alle 16 Steps von
ACID UP gegen tools/data/arp_phrases.json), einfacher Klick ändert
die Auswahl nicht mehr, Cursor default; Step-LED-Hintergründe in
Classic (rot), Arp-Figur (grün) und Phrase-Modus (amber) paarweise
verschieden, Playbar folgt. `dsp_arp_test`, `ui_smoke_test`,
`ui_lint --strict`, `check_sync` 66/66 grün.

---

# Validierung 2.11.2

## 2.11.2

Bank-Phrase-Zustand headless belegt: Step-Reihe opacity 0.45,
Snapshot vor/nach Wheel+Dblclick+Pill+Kontextmenü identisch,
Pitch-Menü bleibt geschlossen, Step-Tooltip nennt „bypassed and
locked" samt Auswegen, Hint „PHRASE ERSETZT DAS PATTERN" ohne
Overflow (scrollWidth ≤ clientWidth; der lange Erstentwurf maß
213/178 px und wurde gekürzt). PHRASE-Taste: eigene Klasse,
Hintergrund ungleich Figuren-Tasten, Amber-LED (#ffb84a) im
Aktivzustand — hell und dunkel per Screenshot belegt. Phrase 00
PATTERN entsperrt (Wheel editiert wieder, Hint zurück). Erster
Testlauf fing zudem, dass der Hint von `_renderArpHeld`
zurücküberschrieben wurde — Logik dorthin verlagert.
`ui_smoke_test` grün, `ui_lint --strict` sauber. Kein DSP-Eingriff.

---

# Validierung 2.11.1

## 2.11.1

FOLLOW-Label headless vermessen: im DAW-Lock (Sync-Flags 7,
Transport 1) zeigt die RUN-Taste „FOLLOW" mit 6,5 px/0,4 px
Letter-Spacing, `scrollWidth ≤ clientWidth` (42/42 px, kein
Overflow), Screenshots hell/dunkel mit sichtbarem Randabstand.
`ui_smoke_test` grün (inkl. neuem Fit-Check), `ui_lint --strict`
sauber, `node --check` ok. Kein DSP-Eingriff.

---

# Validierung 2.11.0

## 2.11.0

Grid (`param65`) und Play-Modus (`param66`) headless gegen den
Produktionsgraphen vermessen (`dsp_transport_test`, zweiter Render,
8 Trace-Kanäle, 48 kHz, Toleranz 4 Frames):

- Grid 1/8 intern @120 BPM: Steps exakt alle 12000 Frames; Grid
  1/16T: exakt alle 4000 Frames (16er-Wrap über 37 Übergänge).
- Grid 1/8 × Swing 100 %: Paare 16000+8000 Frames (2/3+1/3
  Viertelnote) — der Swing-Versatz skaliert korrekt mit dem Grid.
- REV: 15→0 exakt; FWD&REV: 0…7,6…1,0,… ohne Endpunkt-Doppel
  (Periode 2L−2); INVERT (L=8): 0,7,1,6,2,5,3,4 wiederholt exakt.
- RND: Sequenz 4,0,6,5,6,7,1,4,… bit-identisch zum JS-gespiegelten
  Lehmer-Generator (Seed 20260731, keine Direkt-Wiederholung).
- DAW-PPQ bei Grid 1/8: Steps an jeder halben Viertelnote, Seek auf
  PPQ 100.25 → absoluter Step 200 → Pattern-Step 8, danach
  positionsgenaue Fortsetzung; Stop setzt auf −1.
- Rückwärtskompatibilität: alle 12 bestehenden Transport-Checks
  (intern/DAW/Fallback/Swing/Seek/Tempo-Handoff) unverändert grün —
  Init Grid 1/16 + FWD ist bit-identisch zum 2.10-Timing.

Swing-Paritätsbasis ist jetzt die metrische Zählzeit (wie im
DAW-Pfad schon immer); bei gerader Pattern-Länge in FWD unverändert.
UI headless belegt (`ui_smoke_test`): RUN-Taste 44×34 in der
CLOCK-Zelle, oberkantenbündig mit INT/DAW (Δ ≤ 1 px), TRANSPORT-Zelle
entfernt, GRID/PLAY-MODE-Stepper in der neuen Zelle (Init „1/16"/
„FWD", ±-Tasten, Mausrad-Kontrakt, Clamp, Tooltips), FOLLOW-Label
bei DAW-Kontrolle. Volle Batterie: smoke, matrix, arp, articulation,
gain, transport, ui_smoke, cmajor_lint, ui_lint --strict, check_sync
66/66, manifest_check --strict grün.

---

# Validierung 2.10.1

## 2.10.1

Beyond-Length headless belegt: Length 12 → Step 15 hat Klasse
beyond, Note „--", Oktave leer, cap-led ohne Rotanteil; aktiver
Step 5 zeigt weiter seinen Notennamen; Length 16 stellt die Anzeige
wieder her. Dabei gefundener Live-Bug behoben: param11/param12
lösten im lokalen Send-Pfad kein Rendern aus (Echo-Schutz verwirft
das Host-Echo) — Length-/Root-Änderungen zeichnen jetzt sofort.
`ui_smoke_test` 3/3, `ui_lint --strict` sauber. Kein DSP-Eingriff.

---

# Validierung 2.10.0

## 2.10.0

PHONO als Vorverstärker-Overdrive (Clip → RIAA-Wiedergabe →
25-Hz-Subsonic) neu vermessen: Baseline ohne Tabelle A-rel −8,23
(Drive 0,1) … −3,80 dB (Drive 1,0); nach Refit (Tabelle
2,5793…1,5022, Peak-Kappe nur am obersten Punkt) A-rel +0,11 dB
(Drive 0,35) und +0,13…−0,27 dB (Drive 1,0, event-getrieben bzw.
state-gepatcht), Peaks ≤ 0,74 = Raw-Peak. PURE/MACKIE unverändert
(+0,04/+0,19 dB). 60-s-Dauerlauf event-getrieben stabil (RMS
0,163…0,168, keine nicht-endlichen Samples); das inverse Filter aus
2.9.x ist entfernt, damit existiert kein grenzstabiler Pol mehr.
Quellen der Topologie-Recherche in CHANGELOG/Bericht (RIAA im
Feedback der MM-Stufe, Line-in-Phono-Überlastung, Infraschallfilter).
Batterie grün: Serien-Smoke bit-identisch 0,69105, dsp_gain/matrix/
arp/articulation/transport, Messstand alle Prüfsteine, partcheck
28/28, Lints strict, ui_smoke 3/3. Neue Hörbeweise (PHONO Drive 0,5
und 1,0) an den Nutzer geliefert.

---

# Validierung 2.9.4

## 2.9.4

Clip-Latch headless belegt: meterOut 0,8 → Strip aus, 1,4 → latcht,
0,2 → bleibt gelatcht, Meter-Klick → aus. DSP-Kappung von meterOut
auf 8 angehoben (vorher 1,0 — Clips unsichtbar), Audiopfad
unverändert (Serien-Smoke bit-identisch 0,69105, dsp_gain/matrix/
transport grün, Lints strict, ui_smoke 3/3). Screenshot des
leuchtenden Strips abgenommen.

---

# Validierung 2.9.3

## 2.9.3

Meter-Kette geprüft: meterOut lieferte die 12-ms-Mittelwert-Envelope
des Ausgangs, die UI mappte linear auf 80 px Balken — beim
Referenzpeak 0,691 (−3,2 dBFS) stand der Balken bei ~20 %. Neu:
Peak-Detektor (max(|sample|, env·release), Release 400 ms), UI-Skala
dB-basiert (−42…0 dBFS → 0…1): −3,2 dBFS → 0,924 Balkenfüllung.
Audio unangetastet — Serien-Smoke bit-identisch 0,69105 @48k,
dsp_gain (A-bewichtet, Event-Pfad) grün, matrix/arp/articulation/
transport grün, Lints strict, ui_smoke 3/3.

---

# Validierung 2.9.2

## 2.9.2

Live-Pfad-Verifikation: Parameter als Events in den
Produktions-Graphen (Host-Weg) vs. Zustands-Patches — identische
Ergebnisse; Raten 44,1/48/96 kHz konsistent; 60-s-Dauerlauf PHONO
event-getrieben stabil (RMS 0,0588…0,0595 über sechs
10-s-Segmente, keine nicht-endlichen Samples). Pol-Analyse der
Pre-Emphasis: Wiedergabe-Nullstellen in q = z⁻¹ bei −1 (Nyquist)
und q2 = −(1+z2)/(1−z2); Inverse gedämpft auf z-Pol −0,995
(q = −1/0,995). Der erste Fixversuch (q = −0,995 → z-Pol −1,005,
instabil) wurde durch die Messung gefangen: state-gepatcht
−14,64 dB A-rel — Beleg, dass der Messstand echte Fehler findet.
Nach Korrektur und Phono-Refit (Tabelle 1,1722…3,7975):
`dsp_gain_test` A-rel +0,04 (PURE 0,35), +0,19 (MACKIE 0,35),
+0,10 (PHONO 0,35), +0,24 dB (PHONO 1,0) — alle über den
Event-Pfad, Peak-Decke eingehalten. Master-Doppelklick-Reset auf
0 dB per ui_smoke belegt (−12 → Doppelklick → 0). Batterie grün:
Serien-Smoke bit-identisch 0,69105, matrix/arp/articulation/
transport, Messstand alle Prüfsteine, partcheck 28/28, Lints
strict, ui_smoke 3/3.

---

# Validierung 2.9.1

## 2.9.1

Bass-Line-Kontur headless belegt: Wheel-Event auf dem dritten
Kontur-SVG bei 37,5 % Breite trifft Step 10 (Gruppe 2, lokal 1),
Pitch +1 Halbton, Selektion folgt dem Zeiger, Undo stellt den
Vorzustand wieder her. `ui_smoke_test` 3/3, `ui_lint --strict`
sauber. Kein DSP-Eingriff.

---

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
