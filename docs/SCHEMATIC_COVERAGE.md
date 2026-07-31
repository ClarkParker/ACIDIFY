# Schaltplan-Abdeckung — vollständige Tabelle

> Stand 2.16.0. Jede Baugruppe der Roland-Servicenotes (Seite 4/5) hat
> genau einen Status: **U** = umgesetzt mit Herleitung/Anker,
> **X** = begründet ausgeschlossen, **A** = umgesetzt mit publiziertem
> Messwert-Anker, wo die Schaltung keinen eindeutigen Wert hergibt.
> Es gibt keine Zeile „offen". Diese Tabelle ist der Maßstab für
> „entspricht dem Schaltplan"; jede zukünftige Änderung führt sie nach.

## Digitalteil / Sequencer-Timing (Seite 4)

| Baugruppe | Status | Beleg / Begründung |
|---|---|---|
| Gate-Länge µPD650C-133 (3/6 Clocks ≈ 50 %) | U | Sonic-Potions-Timinganalyse; `stepSamples/2`, Slide-Gate über Stepgrenze |
| Accent-/Slide-Flags je Step | U | Sequencer-Engine, Testbatterie |
| DAC/Keyboard-CV (IC9 4174 + R74–R90 200k matched) | X | ideale Pitch-CV; die 0,1-%-Selektion der Leiter macht Bauteilfehler am Gerät bewusst unhörbar — nichts zu modellieren |
| Slide-Schalter (IC12 4066) + RC 100 k × 0,22 µF | U | τ = 22 ms in der CV-Domäne (Oktaven), 2.12.0; Symmetrie-Test in CI |

## VCO (Seite 5)

| Baugruppe | Status | Beleg / Begründung |
|---|---|---|
| Expo-Wandler Q26 (2SC1583) + R104 2,2 k/R45 22 k | U | ideal-exponentiell 1 Okt/V (Zeichnungsangabe „WIDTH: 1 OCT/VOLT") |
| Posistor R100 560 Ω (Temp.-Kompensation) | X | Sollverhalten = kompensiert; bei Solltemperatur kein Klangfaktor (K3) |
| TM4 „TUNE" | U | Tuning-Parameter (param1); Werksabgleich als idealer Trim |
| Sägezahnkern (C34 1 nF, Reset-One-Shot Q8/R34/R35/C10/C11) | U/A | fallende Rampe, Reset 300 µs Halbkosinus — Scope-vermessen (Fabmanual S. 8: 11,25→6,09 V, Tip rund); Rampe im auswertbaren Bereich gerade |
| Sägezahn-Puffer Q28 (2SK30) + R105 10 k | U | Pegelanker 5,17 Vss am Abgriff R105/Q28 (x0x-vcfmods) → ladderDriveRef |
| Rechteck-Former Q24/Q25/Q27/D25, R101/R106/R118, TM5 | U/A | Topologie netzverfolgt (Schmitt, 2.13.0); Tiefpegel flach, Dach +19 % Vss, Flanke auf Saw-Reset (Scope); Duty 46,88 % = Messwert-Anker, TM5 ist Werksabgleich |
| Schwellen-DC-Kette D30/D31/R107 (ab TP4) | A | Kette identifiziert (TP4 − 2 Diodenstrecken); DC-Auflösung am Raster nicht eindeutig — Duty/Pegel/Dachanstieg tragen als Messanker (Analyse: SOUND_GAP_ANALYSIS „Umsetzung 2.13.0/2.16.0") |
| Wellenformschalter + C17/R62 220 k in die Leiter | U | Eingangsstrom-Herleitung (drive = (V/220k)/(2π·f_c·33n·52mV)) |

## VCF (Seite 5)

| Baugruppe | Status | Beleg / Begründung |
|---|---|---|
| Diodenleiter (C98–C101 = 33/33/33/18 nF) | U | ZDF-Kern, frequenzabhängige Diodensättigung an belegten Knoten, Newton-Schleife |
| Koppelnetz (5 Gruppen) in der Resonanzschleife | U | Stinchcombes vollständige Übertragungsfunktion, bilinear |
| Resonanzweg, kMax = 18,7/1,06 | U | 2.16.0 GEMESSEN bestätigt: Serie oszilliert nicht selbst (alle Linien auf dem Obertonraster); Faktor 2 = freilaufende Linie 41 % neben dem Raster = Devil-Fish-„double feedback"-Mod |
| VR3 Cutoff 50k(A) | U | A-Taper, kalibriert an der Roland-Stimmvorschrift (457,8 Hz gemessen, Soll 500 ± 100) |
| VR5 Env Mod 50k(A) + Q9-Bias-„Gimmick" | U | Servicenotes S. 8; exponent = envScaler·(env − 0,327), Ausklang-Monotonie in CI |
| CV-Glättung R97 10 k/C23 1 µF | U | Netz verfolgt (R98→R97→C23→R94→Antilog); τ = 10 ms auf dem Summen-Exponenten (2.13.0) |
| TM3 „FREQ" 470 k | U | Endpunkt-Kalibrierung 312,5/2500 Hz (K4; Werksabgleich als Endwert) |
| Accent-Sweep D24/R46 47 k/C13 1 µF an VR4 | U | nodales Modell mit persistentem C13 (Wow/Aufbau über Folgen) |

## Hüllkurven (Seite 5)

| Baugruppe | Status | Beleg / Begründung |
|---|---|---|
| MEG-Attack (D37/R152 100 Ω/C62 1 µF) | U | τ = 100 µs, nettrace-belegt |
| MEG-Decay (VR6 1 M Rheostat, 4066-geschaltet) | U | 200 ms–2,5 s in 10-%-Lesart (Spannweite beweist die Lesart) |
| MEG „Release" | U | läuft weiter (kein eigener Pfad) — Grundlage des Slide-Verhaltens |
| VEG (Q32/R132 100 Ω/C42 1 µF/R123 1,5 M) | U | Attack schnell, Decay τ = 1,5 s aus Bauteilen |
| VEG-Release unaccentiert | A | 16 ms (8+8, Whittle-MESSUNG am Serien-303); der schnelle Entladepfad ist am Raster nicht bauteilgenau zuordenbar |
| VEG-Release accentiert | A | 50 ms (publizierter Open303-Fit an Aufnahmen); Schaltungsintervall hergeleitet: 1,55 ms (C36/R119) … MEG-Fortlauf; Struktur vollständig verfolgt (2.16.0) |

## VCA / Accent-Steuerkette (Seite 5)

| Baugruppe | Status | Beleg / Begründung |
|---|---|---|
| BA662A-OTA (IC15) | U | tanh-Kennlinie, otaDrive/vcaGain aus Bauteilwerten |
| Steuerkette Q31-Knoten → D27 → R120 22 k → C36 33 n → R119 47 k → BA662-Steuerpin | U | 2.16.0 vollständig netzverfolgt (Roland S. 5); Anstieg 726 µs = R120·C36 ✓ im Modell |
| Zusammenführung Hüllkurve (Q31/R131 220 k) + Accent (D35/R133 2,2 k) | U/A | Struktur belegt; Sum-/Max-/Stromlenkungs-Lesart am Raster nicht eindeutig trennbar → Gewicht 4,0 = gerätekalibrierter Fit als Anker (2.14.0-Herleitung „6,0" war überkonfident und ist zurückgenommen) |
| Ausgangsnetzwerk (C38/C21/C22, R121 220 k/R122 100 k; Summenzweige 71,6/155,7 Hz) | U | updateOutputNetworkCoefficients + VCA-Zweige aus Bauteilwerten |
| R162 2,2 k/C40 (Bias) | X | reine DC-Arbeitspunktbildung; im Signalmodell implizit |

## Ausgang / Sonstiges

| Baugruppe | Status | Beleg / Begründung |
|---|---|---|
| Kopfhörerverstärker | X | nicht im Hauptausgangs-Signalweg |
| Volume (VR1) | U | param8 in dB (UI-Konvention statt Poti-Taper — bewusste Produktentscheidung) |
| Netzteil/Batteriespeisung | X | ideal versorgt; Ripple-Modellierung ohne Beleg wäre Erfindung |
| Ext-In (303extin) | X | Produktumfang: ACIDIFY hat keinen Audio-Eingang |
| Rauschen/Bauteilstreuung | X | ohne vermessenes Referenzgerät wäre jede Zahl erfunden (Rang-2-Punkt, optional A10) |

## Prüfsteine in CI

Stimmvorschrift 457,8 Hz · Env-Mod-Ausklang-Monotonie · Sweep-Minimum ·
Slide-Symmetrie (Oktaven) · Selbstoszillations-Verbot (implizit über
kMax; expliziter Test in tools/bench) · Serien-Smoke · Arp-/Transport-/
Matrix-/Gain-Batterien.
