# Klanglücken-Analyse: Modell gegen Gerät

Anlass: A/B-Test des Projektinhabers gegen eine echte TB-303 — „Ähnlichkeiten,
aber meilenweit entfernt". Diese Analyse benennt die strukturellen Abweichungen,
erklärt, warum sie die bisherigen Audits überlebt haben, und legt die
Behebungs-Roadmap fest. Stand der Prüfung: 2.11.6.

Regel für dieses Dokument: Jeder Befund trägt Beleg und Prüfstein. Ein
Prüfstein ist ein Test, der scheitern kann.

## Verbindliche Quellenordnung (Korrektur nach berechtigtem Einwand)

Die Erstfassung dieser Analyse behandelte Forenaussagen als Belege — derselbe
Fehler, den sie am Prozess diagnostiziert. Ab jetzt gilt:

| Rang | Quelle | Status |
|---|---|---|
| 1 | Schaltung: Servicezeichnung (Feb 1982), annotierte TD-3-Fassung, x0xb0x-EAGLE-Quelle | beweisfähig (Werte + Netzverfolgung) |
| 2 | Messungen am Referenzgerät des Projektinhabers | beweisfähig |
| 3 | Nachrechenbare Ingenieursliteratur über das Original (Whittle, Stinchcombe) | belastbar, wo herleitbar oder als benannte Messung |
| 4 | Foren, Open303-Konstanten | **nur Hypothesenquelle** — erzeugt Tests, niemals DSP-Konstanten |

**Keine Zahl aus Rang 4 geht in den DSP.** Die Befunde unten sind entsprechend
neu klassifiziert; der ⅓-Offset in Befund 1 ist damit ausdrücklich eine
**Hypothese**, kein Fixwert.

---

## Befund 1 — Env-Mod-Abbildung strukturell falsch (eigene Regression)

**Gerät:** Die Filterhüllkurve erhält im Env-Mod-Pfad eine negative
Arbeitspunkt-Verschiebung von rund einem Drittel ihres Hubs; der
Env-Mod-Regler wirkt außerdem statisch auf die Cutoff. Belege:

- MOD WIGGLER, „303 circuit modelling": die Hüllkurve läuft „from −x to 1−x
  and back to −x … about 1/3 of the EG swing".
- KVR, „TB-303 envelope": „increasing the envelope modulation also decreases
  the cutoff"; „the envmod pot controls the cutoff frequency, even when there
  is no envelope present".
- Open303 (Messung an einem echten Gerät): `envOffset = 0.32` ≈ 1/3 —
  unabhängige Bestätigung der Foren-Analyse.

**Modell (2.11.6):** `exponent = 3·envMod·(envelope − 0)` — beweisbar nie
negativ; die Cutoff fällt nie unter die Reglerstellung. Gemessen am
Produktions-DSP (C1, Cutoff Mitte, eingeschwungener Ausklang):

| Env Mod | Schwerpunkt | 95-%-Rolloff | Pegel |
|---:|---:|---:|---:|
| 0,0 | 231,5 Hz | 590,3 Hz | −4,081 dB |
| 0,5 | 231,7 Hz | 590,3 Hz | −4,078 dB |
| 1,0 | 231,9 Hz | 590,3 Hz | −4,074 dB |

Der Regler ist im Ausklang und statisch wirkungslos — am Gerät ist genau dort
sein halber Job. **Damit fehlt der Kern des Squelch-Zusammenspiels
Cutoff/Env-Mod/Decay.**

**Hergang, ehrlich:** Open303 hatte zwei verwobene Eigenheiten — ein Polynom
mit Restmodulation bei Env Mod 0 (envScaler 0,864 statt 0; das war ein Fehler
ohne Bauteil) und `envOffset = 0.32` (das war Hardware-Verhalten). Die
Neuherleitung der Cutoff-Abbildung hat beides zusammen als „Fit ohne Bauteil"
entfernt. Die Struktur `envScaler·(env − offset)` skaliert den Offset
automatisch mit dem Regler; bei Env Mod 0 bleibt trotzdem exakt null
Modulation. Die „sauberere" Formel war eine Verschlimmbesserung.

**Neu klassifiziert:**

- **Rang-1-Fakt (eigene Messung am Modell):** Env Mod ist statisch und im
  Ausklang wirkungslos — die Tabelle oben. Das steht unabhängig von jeder
  Fremdquelle.
- **Rang-4-Hypothese:** Größe und Form der Verschiebung („~⅓ des Hubs",
  „auch statisch wirksam") stammen aus Foren und Open303. Sie erzeugen den
  Prüfstein, aber **keinen Einbauwert**.
- **Rang-1-Stand der Herleitung (aus der EAGLE-Quelle extrahiert):**
  VR5 = 50K(A); R61 = 10 k in Serie; Summierknoten-Umfeld R71 = 2,2 k **an
  +5,333 V** (Bias am Knoten!), R72 = R73 = 100 k, R63 = 220 k; Kandidaten
  C32 = 10 µ/16, C33 = 10 n, C34 = 1 n im MEG-Umfeld. Werte belegt —
  **Topologie offen**: Ob und wie der MEG-Pfad kapazitiv/vorgespannt in den
  Knoten läuft, entscheidet die Netzverfolgung (nettrace) auf den
  Servicezeichnungen. Die Scans liegen dieser Umgebung nicht mehr vor und
  müssen erneut beigestellt werden — oder die Frage wird direkt am Gerät
  gemessen (R4), was jede Herleitung schlägt.

**Prüfstein für den Fix:** Mit steigendem Env Mod muss (a) der eingeschwungene
Ausklang messbar dumpfer werden und (b) das Sweep-Minimum unter die
Cutoff-Basis fallen; bei Env Mod 0 muss die Modulation exakt null bleiben.
Der Zahlenwert des Offsets kommt aus Rang 1 oder Rang 2, nicht aus Rang 4.

---

## Befund 2 — Die Klangquelle ist ein Lehrbuch-Oszillator

**Gerät:** Der Sägezahn des diskreten Kerns ist sichtbar gerundet; die
Obertonreihe fällt oben schneller als 1/n. Das Rechteck entsteht per
**Ein-Transistor-Waveshaper aus dem Sägezahn** — gerundete Flanken, und Duty,
Amplitude und Offset sind verkoppelt und arbeitspunktabhängig (KVR „Strange
comment … square waves", MOD WIGGLER „TB-303 no Square Wave"; die zwei
getrennten Abgriffe R36/Q8 und R105/Q28 stehen bereits im Quelltext-Kommentar).

**Modell:** mathematisch idealer PolyBLEP-Sägezahn (Harmonische exakt 1/n) und
idealer Komparator bei fester Duty 46,88 %, Pegel ×0,5. Beides ist am Eingang
der Kette — jede nachgelagerte Präzision (Leiter, Koppelnetz, OTA) filtert
eine falsche Exzitation, und die Dioden-Sättigung reagiert auf die
Wellen**form**, nicht nur auf das Spektrum.

**Prüfstein für den Fix:** Wellenform-Abgleich gegen Scope-/Audio-Referenzen
eines echten Geräts (Zeitbereich und Obertonabfall), nicht gegen eine ideale
Form.

---

## Befund 3 — Slide gleitet in Hertz statt in Volt/Oktaven

**Gerät:** Das Slide-RC (100 kΩ DAC-Quellwiderstand, 0,22 µF) sitzt auf der
**Pitch-CV**, und die VCO-Kennlinie ist 1 Oktave/Volt (beides belegt in
HARDWARE_AUDIT.md). Die Tonhöhe nähert sich also exponentiell **in Oktaven**;
Auf- und Abwärts-Slides sind tonhöhensymmetrisch.

**Modell:** `currentFrequency = target + coeff·(current − target)` —
exponentielle Annäherung **in Hertz**. Ein Oktav-Slide abwärts läuft dadurch
anfangs schneller, aufwärts langsamer als am Gerät; nach einer Zeitkonstante
liegt der Hz-Pfad ~0,07–0,08 Oktaven neben dem CV-Pfad, mit hörbar anderer
Kurvenform. Die Zeitkonstante (22 ms) wurde korrigiert — der
Definitionsbereich nie geprüft. Zahl richtig, Struktur falsch.

**Prüfstein für den Fix:** Auf- und Abwärts-Slide über eine Oktave müssen
zeitsymmetrische Tonhöhenkurven ergeben (Pitch-Tracking auf dem Render);
τ = 22 ms in Oktaven, nicht in Hertz.

---

## Geprüft und als Ursache ausgeschlossen

- **Gate-Länge:** 3 von 6 Clocks an = 50 % (gemessen 50,25–50,5 %) — Analyse
  des µPD650C-133-Timings (Sonic Potions). Modell: `stepSamples/2`. Treffer;
  die 0,25–0,5 % Übermaß sind vermerkt, kein Charakterfaktor.
- **Filterkern:** ZDF-Leiter mit 33/33/33/18 nF, Koppelnetz in der
  Resonanzschleife, frequenzabhängige Diodensättigung an den belegten Knoten,
  Anschwinggrenze knapp erreicht — vermessen (FILTER_TOPOLOGY.md).
- **MEG:** Attack 100 µs (D37/R152/C62), Decay 200 ms–2,5 s in 10-%-Lesart,
  Accent-Decay-Umschaltung. **VCA:** BA662-OTA-Kennlinie mit hergeleitetem
  Drive/Gain, zwei Summenzweige (71,6/155,7 Hz), 16-ms-Release nach Whittles
  Messung. **Accent-Wow:** Knotenmodell 47 k/Dual-50 k/1 µF mit persistentem
  Kondensator — Aufbau über Accent-Folgen vorhanden und in `dsp_arp_test`
  hörbar belegt (Accent 3,4× bei gleicher Tonhöhe).
- **Slide-Gate:** gebundene Steps halten das Gate über die Step-Grenze ✓.

Diese Basis erklärt die „Ähnlichkeiten". Die Lücke liegt in den drei Befunden.

---

## Offene Kalibrierpunkte (nur mit Referenzaufnahmen schließbar)

| Punkt | Stand | Unsicherheit |
|---|---|---|
| `kMax` (Resonanz-Vollausschlag) | „knapp unter Anschwingen", gestützt auf Forums-Hörangabe | Faktor ~2 zwischen den Whittle-Lesarten |
| Accent-VCA-Gewicht `4.0` | Open303-Messwert | ungeprüft gegen Referenzgerät |
| Accent-Decay 200 ms | Open303-Lesart | 200 vs. ~460 ms (Zeichnungs-Lesart) |
| VCO-Rechteck-Kennwerte | Open303-Messwert (Duty 46,88 %, ×0,5) | Gerätestreuung des Ein-Transistor-Shapers |

---

## Warum das die Audits überlebt hat — Prozessanalyse

1. **Die Audits prüften Herleitungen, nicht Verhalten.** Jede Änderung wurde
   gegen Quellen und Messungen der *eigenen* Struktur geprüft (Pegel,
   Frequenzgang, Stabilität, Timing). Es gab keinen einzigen Test, der
   **Geräteverhalten als Erwartung kodiert** („Env Mod hoch ⇒ Ausklang
   dumpfer"). Eine falsche Begründung („Offset ist Fit-Artefakt") konnte so
   als Korrektur durchgehen — der Test dafür hätte sofort rot gestanden.
2. **Dokumentierte Lücke ≠ eskalierte Lücke.** Der VCO stand von Beginn an als
   „nicht belegt" im HARDWARE_AUDIT und blieb dort stehen, während die
   Sitzungen am Filter/VCA vertieften. Eine offene Position ohne Fälligkeit
   versandet.
3. **Zahl geprüft, Struktur nicht.** Beim Slide wurde die Zeitkonstante
   korrigiert (22 ms statt 12 ms), aber nie gefragt, in welchem
   Definitionsbereich das RC wirkt.

**Konsequenz — neue Testklasse `dsp_hardware_test`:** Jeder belegte
Geräte-Fakt wird als messbarer, scheiterbarer Test kodiert (Env-Mod-Ausklang,
Slide-Symmetrie, Gate-Anteil, Accent-Aufbau, Wellenform-Kennwerte, sobald
Referenzen vorliegen). Verhaltens-Fakten bekommen damit denselben Status wie
UI-Regressionen in `ui_smoke_test`: Sie können nie wieder still verschwinden.

---

## Roadmap

1. **R1 — Env-Mod-Offset herleiten, dann einbauen** (Reihenfolge korrigiert):
   ERST Netzverfolgung des VR5-Pfads auf den erneut beizustellenden
   Servicezeichnungen (oder Direktmessung am Gerät, R4) — DANN
   `exponent = envScaler·(env − offset)` mit dem hergeleiteten bzw. gemessenen
   Offset. Die ⅓-Literaturzahl ist nur die Hypothese, die der Test prüft;
   sie wird nicht verbaut. Prüfsteine s. o.
2. **R2 — Slide in die CV-Domäne** (klein): Glättung auf der Tonhöhe in
   Oktaven (log2-Domäne), τ = 22 ms; DF-Slide-Mod skaliert weiter die
   Zeitkonstante. Prüfstein: Auf-/Ab-Symmetrie.
3. **R3 — VCO-Umbau** (groß): Sägezahnform des diskreten Kerns (Rundung,
   Obertonabfall) und Rechteck als Shaper aus dem Sägezahn mit verkoppelter
   Duty/Amplitude/Offset; Antialiasing-Strategie neu (BLEP + Formfilter oder
   bandbegrenzte Tabelle). Braucht Wellenform-Referenzen.
4. **R4 — A/B-Kalibrierung am Referenzgerät**: sechs kurze Aufnahmen mit
   notierten Reglerstellungen — (1) Sägezahn nackt (Filter offen, Reso 0),
   (2) Rechteck nackt, (3) Cutoff-Sweep bei Reso max, (4) Accent-Viererreihe,
   (5) Slide-Paar auf/ab über eine Oktave, (6) Env Mod hoch vs. tief bei
   mittlerem Cutoff. Damit werden kMax, Accent-Gewicht, Decay-Lesart und die
   VCO-Form Messgrößen statt Lesarten.
5. **R5 — `dsp_hardware_test` aufsetzen** und alle Prüfsteine dieser Analyse
   hineinziehen; die Tabelle „Offene Kalibrierpunkte" wird dort abgetragen.

Quellen: MOD WIGGLER „303 circuit modelling" (modwiggler.com/forum/viewtopic.php?p=4306167) ·
KVR „TB-303 envelope" (kvraudio.com/forum/viewtopic.php?t=258816) ·
KVR „Strange comment … square waves" (kvraudio.com/forum/viewtopic.php?t=261379) ·
Sonic Potions, „Analysis of the µPD650C-133 CPU timing" ·
Open303 (rosic_Open303) als Messwertquelle, ausdrücklich nicht als Code-Vorlage ·
docs/HARDWARE_AUDIT.md (CV 1 Okt/V, Slide-RC, VR5-Netz).
