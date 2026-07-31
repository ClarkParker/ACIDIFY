# Fehlerprotokoll: Modell gegen Schaltung (vollständiger Audit)

> **Status 2.12.0:** Befunde 1–3 sind umgesetzt und gemessen (siehe
> „Umsetzung 2.12.0" am Ende); Befund 4 (VCO) bleibt offen, seine
> „gerundeter Sägezahn"-Teilthese ist auf Rang 4 herabgestuft (der
> herleitbare Kern — Stromquelle in C34, schnelle FET-Entladung — spricht
> für einen weitgehend linearen Sägezahn; belastbar ist nur der
> Former-Umbau des Rechtecks). Kleinbefund K1 (C23-Glättung) ist NICHT
> eingebaut: die Zuordnung (dynamische CV vs. FREQ-Trim-Siebung) braucht
> erst die Netzverfolgung.

Anlass: A/B-Test des Projektinhabers gegen eine echte TB-303 — „Ähnlichkeiten,
aber meilenweit entfernt". Dieses Protokoll ist der vollständige Abgleich des
DSP gegen die inzwischen im Repo gesicherten Rang-1-Quellen
(docs/reference/). Stand der Prüfung: 2.11.6, Commit 363ca8d.

Regel: Jeder Befund trägt Beleg und Prüfstein. Ein Prüfstein ist ein Test,
der scheitern kann.

## Verbindliche Quellenordnung

| Rang | Quelle | Status |
|---|---|---|
| 1 | Schaltung: Roland-Servicenotes Feb 1982 (docs/reference/hyperreal/, bes. Seite 5 analog, Seite 8 „VCF ENVELOPE MODULATION"), x0xb0x-EAGLE-Quelle + Fabrikationshandbuch | beweisfähig |
| 2 | Messungen an einem Referenzgerät | beweisfähig |
| 3 | Nachrechenbare Ingenieursliteratur über das Original (Whittle, Stinchcombe) | belastbar, wo herleitbar oder als benannte Messung |
| 4 | Foren, Open303-Konstanten | nur Hypothesenquelle — erzeugt Tests, niemals DSP-Konstanten |

Keine Zahl aus Rang 4 geht in den DSP.

---

## Befund 1 — Env-Mod-Verhalten strukturell falsch (eigene Regression)

**Rang-1-Beleg, Roland selbst** (Servicenotes Seite 8, „VCF ENVELOPE
MODULATION"): Der konventionelle Aufbau — Hüllkurve hebt die CV nur an —
wird dort ausdrücklich als unbrauchbar beschrieben („only to open up
filter … whereas notes are brightened"; exakt das Verhalten des aktuellen
Modells). Der 303 hat dagegen den dokumentierten „gimmick": **Q9 erzeugt
einen Bias, VR5 blendet zwischen diesem Bias (Terminal 1) und der Hüllkurve
(Terminal 3) über** — „Rotating wiper 2 of VR5 closer to terminal 3
increases ENV MOD voltage … while changing the bias which in turn lowers
VCF cutoff frequency. **This is equal to turning CUTOFF knob
counterclockwise.**"

**Netz, aus Seite 5 gelesen:** Q9 (2SA733) Emitterfolger mit Basisteiler
R64/R65 = 10 k/10 k → VQ9 an VR5-Terminal 1; VR5 = 50 k(A); Schleifer über
R61 = 10 k in den Summenknoten; Cutoff-Poti gleichgewichtig über
R47 = 10 k; Summenknoten über R72 = 100 k (mit R63 = 220 k, R73 = 100 k +
TM3 = 470 k „FREQ") an die Basis des Antilog-Paars Q10/Q11 (Oktaven linear
in Knotenspannung), CV-Glättung R97 = 10 k + C23 = 1 µ.

**Modellstruktur, die daraus zwingend folgt:**
`V_wiper = VQ9 + p_eff · (V_env(t) − VQ9)` ⇒
`exponent = envScaler(p_eff) · (env(t) − offsetFraction)` mit
`offsetFraction = (VQ9 − V_env_rest) / ΔV_env` — der Offset ist der mit dem
Regler wegfallende Q9-Bias, kein Zusatzterm. Bei Env Mod 0 exakt null
Modulation; der Regler wirkt statisch UND auf den Ausklang.

**Messbeleg am aktuellen Modell** (Note C1, Cutoff Mitte, eingeschwungener
Ausklang): Schwerpunkt 231,5/231,7/231,9 Hz und identischer Rolloff bei
Env Mod 0/0,5/1,0 — der Regler ist dort komplett wirkungslos.

**Hergang:** Open303s envOffset = 0,32 wurde bei der Neuherleitung als
„Fit ohne Bauteil" zusammen mit einem echten Polynomfehler entsorgt. Das
Bauteil existiert: Q9. Meine Regression.

**Offen (ehrlich):** Der Zahlenwert von offsetFraction. Kandidaten hängen an
der Versorgungszuordnung des R64/R65-Teilers (12 V ⇒ VQ9 ≈ 5,4 V;
5,333 V ⇒ VQ9 ≈ 2,1 V) und am Ruhepegel/Hub der MEG (Zeichnung „10 V =
100 %"). Entscheid per Netzverfolgung (nettrace, Rail-Symbol am Teiler)
plus Kalibrierung an den Rang-1-Ankern (Stimmvorschrift, Befund 4).
Open303s 0,32 dient nur als Plausibilitätsvergleich, wird nicht verbaut.

**Prüfsteine:** (a) Ausklang wird mit steigendem Env Mod messbar dumpfer;
(b) Sweep-Minimum fällt unter die Basis („equal to turning CUTOFF
counterclockwise"); (c) Env Mod 0 bleibt bit-identisch modulationsfrei.

---

## Befund 2 — Potikennlinien fehlen: Cutoff/Env Mod linear statt A-Taper

**Rang-1-Belege:** Seite 5: VR3 = 50 k(A), VR5 = 50 k(A) — logarithmische
Kennlinien (x0xb0x-Stückliste führt dort sogar D-Taper). Und die offizielle
Stimmvorschrift (Roland-Handbuch, zitiert im x0xb0x-Fabrikationshandbuch,
VCF-Abschnitt): **„C1 (65,4 Hz), Cutoff-Knopf 50 %, Sägezahn, Resonanz
100 % → Resonanzfrequenz 500 Hz (±100 Hz)."**

**Modell:** `updateFilterMapping` bildet die Reglerstellung **linear** auf
Oktaven ab: bei 50 % ⇒ 2500·2^(−1,5) = **884 Hz** — 0,82 Oktaven über der
Vorschrift. Mit A-Kennlinie (~15 % elektrisch bei 50 % Weg) ergeben sich
~430–500 Hz. Die Kennlinien standen im HARDWARE_AUDIT („Potentiometer-
Kennlinien") und wurden nie in die Abbildung übernommen — die halbe
Reglerreise des Geräts spielt in einem anderen Frequenzband als das Modell.
Gleiches gilt für VR5 (Env-Mod-Dosierung) und ist bei VR6 (Decay) über die
exponentielle Zeitabbildung bereits implizit richtig.

**Prüfstein:** Die Stimmvorschrift als Test — C1, Cutoff-Parameter 0,5,
Resonanz 1,0 ⇒ Resonanzspitze 500 Hz ± 100 Hz. Zusätzlich Endpunkte
unverändert (312,5 Hz / 2500 Hz, belegt).

---

## Befund 3 — Slide gleitet in Hertz statt in der CV-Domäne (Oktaven)

**Rang-1-Fakten (Seite 5 + HARDWARE_AUDIT):** Slide-RC = 100 k
(DAC-Quellwiderstand) mit 0,22 µF **auf der Pitch-CV**; VCO-Kennlinie
„WIDTH: 1 OCT/VOLT". Die Tonhöhe nähert sich also exponentiell **in
Oktaven**; Auf- und Abwärts-Slides sind tonhöhensymmetrisch.

**Modell:** exponentielle Annäherung von `currentFrequency` **in Hertz**
(Zeile ~2423). Abwärts anfangs zu schnell, aufwärts zu langsam; nach einer
Zeitkonstante liegt der Hz-Pfad ~0,07–0,08 Oktaven neben dem CV-Pfad. Die
Zeitkonstante (22 ms) wurde korrigiert, der Definitionsbereich nie geprüft.

**Prüfstein:** Pitch-Tracking auf Renderings: Auf- und Abwärts-Slide über
eine Oktave müssen zeitsymmetrische Oktavkurven ergeben; τ = 22 ms in
Oktaven.

---

## Befund 4 — Die Klangquelle ist ein Lehrbuch-Oszillator

**Rang-1-Fakten (Seite 5, VCO-Abschnitt):** Sägezahnkern = Integrator
IC11a (AN6562) mit C34 = 1 nF, R104 = 22 k, Entladung über 2SK30-FET,
Expo-Wandler Q26 (2SC1583-Paar) mit **Posistor R100 = 560 Ω**
(Temperaturkompensation); Hub laut Zeichnung 5,5→12 V. Das Rechteck
entsteht NICHT per Komparator, sondern im **Ein-Transistor-Former
Q24/Q25/Q27 mit D25**, gespeist aus dem Sägezahn, mit R106 = 27 k,
R118 = 100 k und **TM5 = 4,7 k „WIDTH" — die Pulsbreite ist ein
Werksabgleich**, und Duty/Amplitude/Offset sind über den Former verkoppelt.

**Modell:** mathematisch idealer PolyBLEP-Sägezahn (Obertöne exakt 1/n) und
idealer ±1-Komparator bei fester Duty 46,88 % (Open303-Messwert), Pegel
×0,5. Beides steht am Eingang der Kette — die Dioden-Sättigung der Leiter
reagiert auf die Wellenform, nicht nur auf ihr Spektrum.

**Prüfstein:** Wellenform-Herleitung aus dem Former-Netz (Arbeitspunkt-
Analyse Q24/Q25/Q27/D25) und Abgleich gegen Scope-Referenzen; die
46,88 %-Duty bleibt als Messwert-Anker zulässig, die Form nicht.

---

## Geprüft und als Ursache ausgeschlossen (Basis steht)

- **Gate-Länge** 50 % (3/6 Clocks; µPD650C-133-Timinganalyse, Gerät
  50,25–50,5 %) — Modell `stepSamples/2` ✓; Slide-Gate über die
  Step-Grenze ✓.
- **Filterkern**: ZDF-Leiter mit 33/33/33/18 nF, Koppelnetz in der
  Resonanzschleife, frequenzabhängige Diodensättigung an den belegten
  Knoten, Anschwinggrenze; Accent-Sweep-Netz D24/R46 = 47 k an VR4-Ebene 2
  mit C13 = 1 µ und persistentem Zustand (Wow/Aufbau) — deckungsgleich mit
  Seite 5 ✓.
- **MEG/VEG-Zeiten**: Attack 100 µs (D37/R152/C62), Decay 200 ms–2,5 s
  (10-%-Lesart), VCA-Decay τ 1,5 s, Release 16 ms (Whittle-Messung am
  Original), CV-Glättung 100 µs ✓. **Neu bestätigt:** die CV-Glättung
  R97/C23 (τ = 10 ms) am Antilog-Eingang ist als eigener Posten zu prüfen
  (siehe „Kleinbefunde").
- **VCA**: BA662-OTA-Kennlinie, hergeleiteter Drive/Gain, zwei Summenzweige
  (71,6/155,7 Hz) ✓.
- **Sequencer/Transport/Arp**: kein Hardwarebezug verletzt; eigene
  Testbatterien.

## Kleinbefunde (nachrangig, aber benannt)

| # | Stelle | Schaltung | Modell | Einordnung |
|---|---|---|---|---|
| K1 | CV-Glättung R97+C23 → τ ≈ 10 ms auf der GESAMTEN Cutoff-CV | vorhanden | 5-ms-Parameterglättung nur auf Reglerwerten, nicht auf Env/Accent-Weg | prüfen: glättet am Gerät auch die Hüllkurven-CV (formt den Sweep!) — Kandidat für hörbaren Unterschied, gehört in R1-Herleitung |
| K2 | Decay-Obergrenze | 2,5 s (Zeichnung) | 2,5 s seit 10-%-Lesart ✓ | erledigt |
| K3 | Posistor R100 (Temp.-Kompensation VCO) | vorhanden | nicht modelliert | bewusst offen: Sollverhalten = kompensiert; kein Klangfaktor bei Solltemperatur |
| K4 | TM3 „FREQ"-Trimmer 470 k | Werksabgleich der Cutoff-Lage | fester Endwert 2500 Hz | über Befund-4-Anker mitkalibrieren |
| K5 | Saw-Hub-Angaben 5,5–12 V (S. 5) vs. 5,33–10,5 V (x0x-vcfmods) | zwei Angaben | otaDrive nutzt 5,17 Vss | bei R3 an einem Punkt festmachen (Messpunkt benennen) |

## Warum das die Audits überlebt hat — Prozessanalyse

1. Die Audits prüften **Herleitungen**, nie **Geräteverhalten**. Kein Test
   kodierte „Env Mod hoch ⇒ Ausklang dumpfer" oder die Roland-
   Stimmvorschrift — beides stand seit 1982 in den Servicenotes.
2. **Dokumentierte Lücke ≠ eskalierte Lücke** (VCO stand als „nicht belegt"
   im Audit und versandete).
3. **Zahl geprüft, Struktur nicht** (Slide-τ korrigiert, Domäne nie
   hinterfragt; Kennlinien notiert, nie angewandt).
4. **Quellen lagen nicht im Repo** — die beigestellten Pläne lebten in der
   flüchtigen Session-Umgebung. Seit 363ca8d versioniert (docs/reference/).

**Konsequenz — `dsp_hardware_test`:** Jeder belegte Geräte-Fakt wird als
scheiterbarer Test kodiert: Roland-Stimmvorschrift (500 Hz), Env-Mod-
Ausklang-Monotonie, Sweep-Minimum unter Basis, Slide-Symmetrie in Oktaven,
Gate-Anteil 50 %, Accent-Aufbau über Folgen, Wellenform-Kennwerte (sobald
hergeleitet). Verhaltens-Fakten erhalten denselben Status wie
UI-Regressionen in `ui_smoke_test`.

---

## Roadmap (Reihenfolge = Klangwirkung ÷ Aufwand)

1. **R1 — Env-Mod-Netz einbauen** (Befund 1 + K1): Netzverfolgung des
   R64/R65-Rails (nettrace auf Seite-5-Scan) → VQ9 und offsetFraction
   herleiten; `exponent = envScaler(p_eff)·(env − offsetFraction)` mit
   A-Taper-p_eff (Befund 2 gemeinsam); CV-Glättung R97/C23 auf den
   Summenpfad. Prüfsteine Befund 1 a–c.
2. **R2 — Potikennlinien** (Befund 2): A-Taper auf VR3/VR5-Abbildung;
   Kalibrierung an der Stimmvorschrift (500 Hz ± 100). Endpunkte bleiben.
3. **R3 — Slide in die Oktav-Domäne** (Befund 3): Glättung auf
   log2(Frequenz), τ = 22 ms; DF-Mod skaliert weiter τ. Symmetrie-Test.
4. **R4 — VCO-Umbau** (Befund 4): Former-Netz Q24/Q25/Q27/D25 +
   TM5-Arbeitspunkt herleiten (Rechteckform aus dem Sägezahn), Saw-Form aus
   Integrator/Entladung; Antialiasing-Strategie; Duty-Messwert 46,88 % als
   Anker.
5. **R5 — `dsp_hardware_test`** mit allen Prüfsteinen dieses Protokolls;
   die Kleinbefund-Tabelle wird dort abgetragen.
6. **R6 — (optional, Rang 2)** Referenzaufnahmen irgendeines belegten
   Geräts, wenn verfügbar — zur Endabnahme, nicht als Voraussetzung.

---

## Umsetzung 2.12.0 — gemessen

- **Befund 1 (Env-Mod-Netz):** `exponent = envScaler·(env − 0,327)` mit
  offsetFraction = VQ9/ΔV_env = (5,333/2 + 0,6)/10 — hergeleitet aus dem
  Q9-Folger am 5,333-V-Rail; unabhängige Konvergenz: Open303 hat 0,32 am
  Gerät gemessen (Bestätigung, nicht Quelle). Env-Spanne 5,625 Okt bei
  Vollausschlag (3 Okt pro 5,333 V mal 10 V MEG-Hub; die
  VR3-Domänen-Annahme ist im Quelltext benannt). Messung: Ausklang-
  Schwerpunkt 138,6 / 105,4 / 69,6 Hz bei Env Mod 0 / 0,5 / 1,0 —
  vorher 231,5 / 231,7 / 231,9 (wirkungslos).
- **Befund 2 (Kennlinien):** A-Taper auf VR3/VR5; Krümmung innerhalb der
  A-Familie am Roland-Anker kalibriert (Basis 10 → 24 % bei halbem Weg).
  Messung per Verhältnis-Spektrum (Reso max / Reso 0): Resonanzspitze
  **457,8 Hz** bei C1/Cutoff 50 % — Vorschrift 500 ± 100. Linear standen
  hier 884 Hz.
- **Befund 3 (Slide):** Glättung der Tonhöhe in Oktaven (τ = 22 ms).
  Messung: Kreuzung der geometrischen Mitte auf/ab 17,9 / 19,6 ms,
  Asymmetrie 9 % (Spur-Quantisierung); theoretisch τ·ln 2 = 15,25 ms.
  Hz-Domäne läge bei ~45–60 % Asymmetrie.
- **Folgekorrektur:** Die A-bewichteten Autogain-Tabellen der Distortion
  sind auf dem neuen (dunkleren) Serien-Referenzspektrum nachgemessen —
  Restabweichung 0,00 dB an allen Stützstellen, alle Peaks unter dem
  Raw-Peak. Neue Serien-Smoke-Referenz: Peak 0,507 (vorher 0,691; ein Zwischenstand mass 0,459 vor der Taper-Kalibrierung).
- **R5:** `tools/dsp_hardware_test.mjs` kodiert Stimmvorschrift,
  Env-Mod-Monotonie (inkl. ≥4 dB über 800 Hz) und Slide-Symmetrie als
  scheiterbare Tests.

Quellen: docs/reference/hyperreal/roland.TB-303.schem-5.gif und -8.gif
(Roland, Feb 1982) · docs/reference/x0xb0xfabmanual.pdf (VCF-Abschnitt,
Stimmvorschrift; Stücklisten) · docs/reference/x0xb0x_mainboard.sch ·
docs/reference/DevilFishManual.pdf (Originalgerät-Stellen) ·
docs/HARDWARE_AUDIT.md · Sonic Potions, „Analysis of the µPD650C-133 CPU
timing" · Open303 nur als Messwert-Vergleich (Rang 4).
