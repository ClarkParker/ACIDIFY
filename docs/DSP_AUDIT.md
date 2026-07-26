# Durchsicht des gesamten DSP

Vollständige Prüfung von `ACIDIFYDSP.cmajor` gegen die Schaltung. Getrennt
geführt nach **gemessen**, **abgeleitet** und **Verdacht** — ein Verdacht ist
hier kein Befund.

Die Durchsicht entstand am Stand `af40320`; der Abschnitt „Reso-Comp eingebaut"
am Ende hält die daraus folgende Änderung fest. Punkte 1, 2, 4 und 5 sind
davon unberührt.

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

> **Teilweise erledigt.** Der zweite Summenzweig ist eingebaut, siehe
> „Reso-Comp eingebaut" am Ende dieses Dokuments. Die Multiplikation und die
> drei freien Konstanten bestehen weiter.

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

1. ~~**Reso-Comp-Zweig am VCA**~~ — **erledigt**, siehe unten. Beide Prüfsteine
   bestanden.
2. **OTA-Kennlinie statt Multiplikation** (Punkt 3) — Voraussetzung dafür, dass
   die drei freien Konstanten durch Bauteile ersetzt werden können.
3. **Filterkern** (Punkt 4) — geprüft und wartend.
4. **8-Hz-Notch** (Punkt 1) — größte einzelne Abweichung im Frequenzgang, aber
   sie braucht erst die fünf Hochpassgruppen aus Stinchcombes Zerlegung.
5. **Accent-Decay klären** (Punkt 2) — billig zu messen, sobald eine Referenz
   vorliegt.


---

## Reso-Comp eingebaut — gemessen

Umgesetzt als das, was die Netzverfolgung zeigt: **zwei Summenzweige am
VCA-Eingang**, nicht eine Verstärkung im Filter.

Dafür musste Open303s eingebaute Pegelkorrektur aus `processLadder` **raus** —
sonst wird doppelt kompensiert. Der Vergleich der beiden Gesetze:

| Cutoff | Open303-Makeup, r=0→1 | Topologie `1 + 2,2·r` |
|---:|---:|---:|
| 300 Hz | +6,50 dB | +10,10 dB |
| 1000 Hz | +7,55 dB | +10,10 dB |
| 2400 Hz | +9,47 dB | +10,10 dB |
| 5000 Hz | +12,48 dB | +10,10 dB |

**Der strukturelle Punkt liegt in der Spalte, nicht in den Zahlen.** Das
Open303-Makeup hängt vom **Cutoff** ab, weil `rawK` von der Eckfrequenz
abhängt. `R121` und `R122` sind feste Widerstände — die Schaltung *kann* diese
Abhängigkeit nicht haben. Das Makeup war an dieser Stelle nicht nur ungenau,
es hatte eine Abhängigkeit, für die es kein Bauteil gibt.

Bei `r = 0` ist das alte Makeup für jeden Cutoff exakt `2,0`; der Faktor bleibt
deshalb im Filter stehen, und der Tausch ist dort pegelneutral.

### Die zwei Prüfsteine, die das Modell hätten widerlegen können

**1 — Bei Resonanz null darf der Zweig nichts beitragen.** Gemessen gegen den
Stand davor, Note erst nach 0,3 s, damit die 5-ms-Parameterglättung
eingeschwungen ist:

| | Peak | RMS |
|---|---:|---:|
| vorher | 0,74925601 | 0,09491204 |
| nachher | 0,74925172 | **0,09491204** |

RMS auf acht Stellen identisch. Der Peak-Rest von 4,3·10⁻⁶ ist Fließkomma: Die
Glättung läuft asymptotisch gegen null, erreicht es nie exakt, und die beiden
Gesetze haben bei `ε → 0` verschiedene Steigungen. **Bestanden.**

**2 — Der Durchlassbereich muss weiter absinken, nur weniger.** RMS über den
Reglerweg, Cutoff-Parameter 0,55, Velocity 90 (kein Accent):

| Resonanz | vorher | nachher |
|---:|---:|---:|
| 0,0 | 0,088583 | 0,088639 |
| 0,5 | 0,033974 | 0,045800 |
| 1,0 | 0,028562 | 0,042561 |
| **r=0 → r=1** | **−9,83 dB** | **−6,38 dB** |

Der Einbruch bleibt, er ist nur kleiner. **Bestanden.** Wäre er verschwunden,
wäre die Kompensation zu groß angesetzt gewesen — und ein Faktor, der ihn
flach macht, wäre Anpassen an die Testschwelle.

### Was dabei bewusst **nicht** gemacht wurde

- Der Skalar `0.42f` in der Ausgangsstufe bleibt unverändert. Er gehört zur
  Ausgangsstufe und wird mit der OTA-Kennlinie ersetzt, nicht vorher
  nachgezogen.
- Die **unterschiedlichen Hochpassecken** der beiden Zweige — `R121`/`C21`
  ergibt 72 Hz, `R122`/`C22` ergibt 159 Hz — sind **noch nicht** modelliert.
  Der Kompensationszweig ist in der Schaltung also bassärmer als der
  Filterzweig. Das gehört zusammen mit dem Koppelnetzwerk gemacht, weil sich
  sonst der vorhandene 24,167-Hz-Hochpass und die echten Zweigecken doppeln.
- Nur **eine** neue Zahl kam hinzu: das Verhältnis `2,2 = 220 k / 100 k`. Sie
  ist abgelesen, nicht eingestellt.

### Pegel

Peak steigt bei der Vorgabe-Resonanz 0,72 von 0,692 auf 0,921, weil dort das
neue Gesetz über dem alten liegt. Alle Grenzen halten: `dsp_matrix_test`
11/11 `ok` mit höchstem Effekt-Peak 0,9339, Artikulation `ok`, Transport
12/12 `ok`.

---

## OTA-Kennlinie eingebaut — und eine widerlegte Vorhersage

`IC15` ist ein **BA662A**, ein Operational Transconductance Amplifier. Die
Eingangs-Differenzstufe ist bipolar, die Kennlinie also

```
I_aus = I_abc · tanh( v_ein / (2·Vt) ),      2·Vt = 52 mV
```

Der Steuerstrompfad bleibt der bisherige `ampControl`. Neu ist die **Kennlinie**
— ACIDIFY hat bis hierher schlicht multipliziert.

Die Aussteuerung folgt aus dem Summenknoten: `R124 = 2,2 kΩ` (mit `C37` als
Wechselspannungsmasse) gegen `R121 = 220 kΩ` teilt auf **1/100** herunter.
Genau das hält den OTA im quasilinearen Bereich — der Teiler ist kein Zufall.

Belegt aus der Bauteilliteratur: Steuerstrom bis **1,5 mA**, Steilheit um
**9600 µS**, und **2 V ss** am Eingangsnetz erzeugen merkliche Verzerrung.

### Die eine ungestützte Zahl

`otaDrive = 0,1923 = (2,2/220) · 1 V / 52 mV`

Darin steckt die **Annahme**, dass Vollaussteuerung im Modell 1 V Spitze am
Poti entspricht. Der absolute Spannungsmaßstab ist **nicht belegt**. Sie ist
die einzige ungestützte Zahl dieser Stufe, sie wurde nach der Messung **nicht
nachgezogen**, und sie gehört an einer Pegelmessung am Gerät belegt.

**Und die Messung macht sie zusätzlich verdächtig:** Aus der gemessenen
Kompression von −0,60 dB bei Resonanz null folgt `tanh(x)/x = 0,933`, also
`x ≈ 0,52` — und damit ein Spitzenwert von `coupled` um **2,7** statt 1,0. Die
Annahme „Vollaussteuerung = 1 V Spitze" bedeutet dann rund **2,7 V Spitze** am
Poti, deutlich über den 2 V ss, bei denen die Literatur merkliche Verzerrung
ansetzt. Der OTA steht hier also vermutlich zu weit im Knick. Nicht korrigiert,
weil jede Korrektur ohne Beleg ein Tunen gegen die eigene Messung wäre.

### Die Vorhersage, die gescheitert ist

Ich hatte aus der Topologie gefolgert: Weil der Kompensationszweig am selben
Eingang liegt, steuert er den OTA mit aus — also müsse die Kennlinie sich bei
**hoher** Resonanz stärker krümmen.

Gemessen, OTA-Stand gegen den linearen Stand davor:

| Resonanz | linear | mit OTA | Kompression |
|---:|---:|---:|---:|
| 0,0 | 0,706010 | 0,658631 | **−0,60 dB** |
| 0,5 | 0,336367 | 0,331188 | −0,14 dB |
| 1,0 | 0,332430 | 0,327360 | −0,13 dB |

**Genau umgekehrt.** Die Kompression ist bei Resonanz **null** am größten.

Der Grund ist der Pegeleinbruch, den derselbe Abschnitt weiter oben behandelt:
Das Filtersignal bricht mit steigender Resonanz um mehr ein, als der Faktor
`(1 + 2,2 r)` hinzufügt. Ausgesteuert wird der OTA vom **Produkt** — und das
sinkt. Die rohe Filterausgangsgröße fällt über den Reglerweg um rund das
6,8-fache, der Kompensationsfaktor steigt nur um 3,2.

**Was daraus folgt und was nicht.** Die Topologie ist unberührt: Beide Zweige
liegen am selben Eingang, das bleibt richtig und ist verfolgt. Falsch war mein
**Zusatzschluss**, der den Pegeleinbruch übersah. Der Kommentar im Quelltext
ist entsprechend berichtigt.

Der Test hat getan, wozu er da war — er konnte scheitern, und er ist
gescheitert. Hätte ich stattdessen „mehr Kompression bei hoher Resonanz"
gemessen und abgehakt, wäre der Fehler stehen geblieben.

### Pegel

Smoke-Peak 0,921 → **0,907** (der OTA komprimiert). `preflight --strict`
sauber, `dsp_matrix_test` 11/11 `ok` mit höchstem Effekt-Peak **0,9339**,
`dsp_articulation_test` `ok`.
