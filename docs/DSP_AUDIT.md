# Durchsicht des gesamten DSP

Vollständige Prüfung von `ACIDIFYDSP.cmajor` gegen die Schaltung, Stand
`af40320`. Getrennt geführt nach **gemessen**, **abgeleitet** und **Verdacht** —
ein Verdacht ist hier kein Befund.

Gegenprobe zu allem Folgenden: `preflight --strict` sauber, `smoke_test`
`peak = 0,69247`, `dsp_matrix_test` 11/11, `dsp_articulation_test` `ok`.

---

## 1. Der 8-Hz-Bereich ist nicht ausgelassen, sondern umgekehrt

**Gemessen**, analytisch aus den Koeffizienten in
`updateOutputNetworkCoefficients` und `updateRateConstants` bei 48 kHz
(Allpass 14,008 Hz → Hochpass 24,167 Hz → Notch 7,5164 Hz):

| f / Hz | 2 | 4 | 6 | **7,5** | **8** | 10 | 20 | 65,4 | 1000 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| dB | −26,4 | −27,3 | −33,1 | **−71,6** | **−41,9** | −27,0 | −11,4 | −1,8 | −0,01 |

Stinchcombe verortet in der Hardware an dieser Stelle eine **Spitze** und hält
sie für „a large contributing factor to the sound of the TB-303 overall".
ACIDIFY setzt dort einen **Notch mit −71,6 dB**.

Das ist der Punkt: Der bisherige Audit-Eintrag 8 nennt den Bereich „faktisch
entfernt". Das untertreibt. Er wird nicht entfernt, er wird **aktiv
ausgekerbt** — und zwar auf der Frequenz, auf der die Vorlage ihr Maximum hat.
Die Ursache ist benennbar: der Notch stammt aus Open303s Ausgangsnetz und ist
damit eine Fit-Entscheidung, kein Bauteil.

**Prüfstein**, falls das korrigiert wird: Nach der Änderung muss bei 8 Hz ein
**Maximum** stehen, nicht bloß „weniger Absenkung". Ein flacher Verlauf wäre
ebenfalls falsch.

---

## 2. Ein möglicher Rest desselben Fehlers, den `dc2fa7b` behoben hat

`updateDecayMapping` wurde korrigiert, weil `T` in der Zeichnung die
**10-%-Zeit** ist und nicht die Zeitkonstante — also `τ = T / ln(10)`.

Im selben Modul steht unverändert:

```cmajor
accentDecayCoeff = timeCoefficient (200.0f, sampleRate);
```

`timeCoefficient` erwartet eine **Zeitkonstante**. Die Zeichnung nennt
`MIN T = 200 ms` — dieselbe Zahl, dieselbe Zeichnung, aber hier ohne die
Umrechnung. Wären beide dieselbe Größe, fehlte der Faktor `ln(10) = 2,30`, und
das Accent-Decay liefe 2,3× zu lang — exakt der Fehler, der am normalen Decay
schon einmal gefunden wurde.

**Nicht geändert.** Der Wert stammt laut `REVIEW_0.4.0.md` aus Open303, ist
dort also ein gefitteter τ und keine Zeichnungsangabe. Dann wäre er richtig.
Ob Open303s Autor die 200 ms seinerseits aus derselben Zeichnung übernommen
hat, ist **nicht geklärt** — und genau das entscheidet.

**Der Test, der das trennt:** Am Gerät oder an einer Aufnahme messen, wie lange
eine akzentuierte Note bis auf ein Zehntel der Filterhüllkurve braucht. 200 ms
belegen die Fit-Lesart, ~460 ms die Zeichnungs-Lesart. Bis dahin bleibt der
Wert stehen; ihn „zur Sicherheit" anzupassen wäre Raten.

---

## 3. Der VCA ist weiterhin ein Multiplizierer mit freien Konstanten

```cmajor
ampControl += 0.45f * filterEnvelope + 4.0f * accentVcaRC;
...
let cleanVoice = coupled * ampControl * 0.42f * outputGain;
```

Drei Zahlen ohne Bauteil: `0.45`, `4.0`, `0.42`. Dazu die
Multiplikation selbst — der VCA ist `IC15 BA662A`, ein OTA mit Steuerstrom und
eigener Kennlinie.

Was daran **belegt** ist: `accentVcaAlpha = exponentialAlpha (102.616f, …)`
entspricht `R26 = 47 kΩ`, `C26 = 33 nF` (τ = 1,551 ms → 102,6 Hz) und ist
sauber aus abgelesenen Bauteilen gerechnet. Diese eine Stelle stimmt.

Was **fehlt**: der zweite Summenzweig. Nach der Netzverfolgung
(siehe [`HARDWARE_AUDIT.md`](HARDWARE_AUDIT.md)) liegen am OTA-Eingang
`R121 = 220 kΩ` vom **festen Potiende** und `R122 = 100 kΩ` vom **Schleifer**
von VR4. ACIDIFY hat nur einen Pfad.

---

## 4. Der Filterkern

Unverändert der Open303-Polynomfit; der topologiehergeleitete Kern liegt
gemessen in `tools/bench/zdf/`. Bekannt und dokumentiert in
[`FILTER_TOPOLOGY.md`](FILTER_TOPOLOGY.md), hier nur der Vollständigkeit halber.

Ein Detail, das beim Lesen auffiel und **kein** Fehler ist: `processNotch`
schreibt `+ notchA1 * y1 + notchA2 * y2`, die übrigen Biquads `− a1·y1 − a2·y2`.
Die Vorzeichen sind in `notchA1 = 2·cos·scale` und `notchA2 = (α−1)·scale`
bereits eingerechnet. Nachgerechnet: identisch zur Standardform. Kein Befund,
aber eine Stolperstelle für die nächste Änderung.

Ebenso geprüft und korrekt: `processAllpass` (`b0 = (t−1)/(t+1)`, `a1 = −b0`
ergibt die Standard-Einpol-Allpassform) und die Hochpässe
`y = g·(x − x₁) + p·y₁` mit `g = (1+p)/2`.

---

## 5. Kleinere Stellen, geprüft

| Stelle | Befund |
|---|---|
| `glideCoeff` 12 ms | Open303 (0,2 × 60 ms), kein Bauteilwert |
| `filterAttackAlpha` 3 ms | Open303-Fit |
| `ampBodyCoeff` 1230 ms, `ampReleaseCoeff` 1 ms | Open303-Fit |
| `preHighpassPole` 44,486 Hz | Open303; entspräche mit `C19 = 1 µF` einem R von ~3,6 kΩ — nicht gegengeprüft |
| `feedbackHighpassPole` 150 Hz | Open303-Fit im Resonanzpfad |
| `triggerNote` setzt `currentFrequency` direkt | richtig: Glide nur bei gebundenen Noten, `slideToNote` lässt es stehen |
| `resonanceSkewed` speist Leiter **und** `processAccentSweep` | richtig — in der Schaltung ist es dasselbe Poti (dual) |
| `processDistortion` rechnet alle drei Former immer | beabsichtigt: hält den Zustand mit, sonst klickt das Umschalten |
| `holdNote` bei 128 gehaltenen Noten | Note fällt still weg; praktisch unerreichbar, kein Klangbefund |

---

## Was diese Durchsicht **nicht** geprüft hat

- Sequencer-, Clock- und Transportlogik. Sie war Gegenstand von
  `dsp_transport_test` und ist kein Hardwareabgleich.
- Die drei Distortion-Modelle. Sie sind ausdrücklich **kein** 303-Bestandteil,
  sondern eine Zutat des Plug-ins; ein Hardwareabgleich ist dort gegenstandslos.
- CPU-Verhalten und Verhalten oberhalb 96 kHz.

---

## Rangfolge nach dieser Durchsicht

1. **Reso-Comp-Zweig am VCA** (Punkt 3) — Zuordnung ist jetzt verfolgt, die
   Bauteilwerte liegen vor, und der Zusatzprüfstein „bei Resonanz null trägt er
   nichts bei" macht ihn widerlegbar.
2. **OTA-Kennlinie statt Multiplikation** (Punkt 3) — Voraussetzung dafür, dass
   die drei freien Konstanten durch Bauteile ersetzt werden können.
3. **Filterkern** (Punkt 4) — geprüft und wartend.
4. **8-Hz-Notch** (Punkt 1) — größte einzelne Abweichung im Frequenzgang, aber
   sie braucht erst die fünf Hochpassgruppen aus Stinchcombes Zerlegung.
5. **Accent-Decay klären** (Punkt 2) — billig zu messen, sobald eine Referenz
   vorliegt.
