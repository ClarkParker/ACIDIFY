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

> **Dieser Prüfstein war falsch.** Siehe „Koppelnetz eingebaut" am Ende: Aus
> Stinchcombes Übertragungsfunktion folgt, dass das Koppelnetz bei Resonanz
> null **kein** Maximum bei 8 Hz hat — es steigt monoton. Die Spitze ist eine
> Resonanzspitze und entsteht erst dadurch, dass die Rückkopplung das
> Koppelnetz **einschließt**. Der Prüfstein hätte also nur bestehen können,
> wenn ich gleichzeitig die Struktur geändert hätte.

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

### Die eine ungestützte Zahl — inzwischen gestützt

> **Erledigt.** Der Abschnitt bleibt als Protokoll stehen; der Stand darunter
> galt bis `1.0.0-rc2`. `otaDrive` ist jetzt **0,4971 = (2,2/220) · 2,585 V /
> 52 mV** und abgeleitet, nicht angenommen. Zwei Belege haben das geschlossen:
>
> 1. **Der Spannungsmaßstab** steht über den VCO-Hub fest — x0x-VCF-Mods,
>    „The VCO output is from 5.33v to ~10.5v", beides Absolutwerte auf der
>    5,333-V-Vorspannung, also 5,17 Vss auf 2,0 Modelleinheiten ss →
>    **2,585 V je Modelleinheit**.
> 2. **Der Faktor 2 am Filterausgang ist entfallen.** Stinchcombes `L(0) = 1`,
>    `C(s) → 1,06`, also Durchlassbereich 1,06 statt 2,12; nachgemessen
>    Modell/|C| → 1,9987. Damit gilt derselbe Maßstab durchgehend bis zum
>    Summenknoten, und beide Zahlen sind nicht mehr aneinander gekoppelt.
>
> Die unten geäußerte Sorge — der OTA stehe „zu weit im Knick" — hat sich damit
> teilweise bestätigt und teilweise erledigt: Der Pegel am Poti liegt jetzt bei
> rund 2,8 V ss, also in der Größenordnung der 2 V ss aus der Literatur, und die
> gemessene Kompression ist auf **−0,39 dB** bei Resonanz null zurückgegangen.

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

---

## Filterkern eingebaut

`processLadder` rechnet nicht mehr den Open303-Polynomfit, sondern die
topologiehergeleitete Diodenleiter (ZDF/TPT, Zavalishin/Pirkle, Referenz
Faust `vaeffects.diodeLadder`, MIT-style STK-4.3).

Schaltplanwerte: `C98 = C99 = C100 = 33 nF`, **`C101 = 18 nF`** — die vier
Stufen sind nicht gleich. Resonanz **linear** über den Reglerweg abgebildet,
weil VR4 ein B-Poti ist, mit `kMax = 19,4` knapp unter der gemessenen
Anschwinggrenze. Der **Rückkopplungs-Hochpass bei 150 Hz ist entfallen** — er
stammte aus Open303 und ist im vermessenen Prototyp nicht enthalten.

### Übertragung geprüft

Handübertragener Code braucht eine Gegenprobe. Der eingebaute Kern wurde als
eigenständiger Prozessor herausgezogen und gegen den Prototyp gemessen:

| Messung | Prototyp | eingebaut |
|---|---:|---:|
| k = 14, Parameter 1610 | +14,44 dB @ 1196,8 Hz | **+14,44 dB @ 1196,8 Hz** |
| k = 16,5 | +20,53 dB | **+20,53 dB** |
| k = 19,4 | +48,21 dB | **+48,21 dB** |
| Steilheit, Parameter 1000 | −14,82 / −19,63 / −22,68 | **−14,82 / −19,63 / −22,68** |

Stellengenau identisch. Die Übertragung ist belegt, nicht angenommen.

Nebenbefund: Die **Steilheitstabelle** in `FILTER_TOPOLOGY.md` war ebenfalls
eine 33-nF-Messung — nachgeprüft, `CAP4 = 33` liefert exakt die dokumentierten
−16,23 / −20,68 / −23,13. Als **K4** dort eingetragen.

### Der Prüfstein, der zählt

Der Serien-303 schwingt **absichtlich nicht** an. Tail-RMS 0,6 s nach Note-off:

| Resonanz | 0,0 | 0,25 | 0,5 | 0,75 | 1,0 |
|---|---:|---:|---:|---:|---:|
| Tail-RMS | 0,0 | 0,0 | 0,0 | 0,0 | **0,0** |

Kein Anschwingen, auch bei voller Resonanz nicht. **Bestanden.**

### Was die Messung sonst zeigt

RMS des Notenkörpers über den Reglerweg: 0,0740 → 0,0356 → 0,0297 → 0,0303 →
0,1255. Erst der Durchlassbereichseinbruch, dann die Resonanzspitze, die ihn
überholt. Der Sprung im letzten Reglerviertel ist groß (rund 12 dB) und folgt
aus `kMax = 19,4` dicht an der Grenze, wo `1/(1+k·H)` steil wird.

**Offen, ausdrücklich nicht nachgezogen:** Ob `kMax = 19,4` musikalisch richtig
sitzt, hängt am handverlöteten Widerstand und ruht weiter auf Whittle plus der
Nachbaubeobachtung (siehe `HARDWARE_AUDIT.md`). `kMax` gegen den Höreindruck
oder eine Testschwelle zu verschieben wäre das verbotene Tunen.

### Kalibrierung

`peakToParameter = 1,345` rechnet vom hörbaren Eckpunkt auf den Modellparameter
um, kalibriert bei k = 14, also bei der Vorgabe-Resonanz 0,72. Das Verhältnis
hängt schwach von k ab (1,26 bei k = 16,5 … 1,44 bei k = 12); es ist eine
Einheitenumrechnung, keine Verhaltensanpassung.

### Pegel

Smoke-Peak 0,907 → **0,910**, RMS 0,0692 → 0,0437 — der Kern hat den echten
Durchlassbereichseinbruch, den der Fit nicht hatte. `preflight --strict`
sauber, `dsp_matrix_test` 11/11 `ok` mit höchstem Effekt-Peak **0,9124**,
`dsp_articulation_test` `ok`.


---

## Koppelnetz eingebaut — und mein eigener Prüfstein widerlegt

Stinchcombe gibt die vollständige Übertragungsfunktion an
([„A Comprehensive TB-303 Diode Ladder Filter Model"](https://www.timstinchcombe.co.uk/index.php?pge=diode2)):

```
H(s) = 1.06 s³ (s+109.9)(s+34.0)(s+7.41)
     / [ L(s)(s+97.5)(s+38.5)(s+4.45)(s+578.1)(s+20.0)(s+7.41)
         + 18.7 k s⁴ (s+46.5)(s+4.40) ]
```

Damit lässt sich das Koppelnetz **herausrechnen** statt schätzen. Bei `k = 0`
fällt der Kern `L(s)` heraus, und es bleibt:

```
C(s) = 1.06 s³ (s+109.9)(s+34.0) / [(s+97.5)(s+38.5)(s+4.45)(s+578.1)(s+20.0)]
```

**Fünf Pole, fünf Nullstellen** — genau Stinchcombes „basically five sets of
these". Pole bei 0,708 / 3,18 / 6,13 / 15,52 / 92,0 Hz, Nullstellen dreifach
bei DC plus 5,41 und 17,49 Hz.

Eingebaut als Kaskade aus fünf Gliedern erster Ordnung, bilinear transformiert.
Das gebündelte Open303-Netz (Allpass 14,008 Hz, Hochpass 24,167 Hz, Notch
7,5164 Hz) ist entfallen, ebenso der 44,486-Hz-Vorhochpass — `C(s)` deckt alle
fünf Gruppen ab, beides zusammen würde doppeln. Der Kern ist linear, die
Reihenfolge im Signalweg also gleichgültig.

### Übertragung geprüft

| f / Hz | 2 | 8 | 20 | 65,4 | 200 | 1000 |
|---|---:|---:|---:|---:|---:|---:|
| analytisch `C(s)` | −38,685 | −20,941 | −12,727 | −4,192 | −0,323 | +0,470 |
| digitale Kaskade | −38,685 | −20,941 | −12,727 | −4,192 | −0,323 | +0,470 |

Größte Abweichung über den ganzen Bereich: **0,0001 dB**.

### Die Korrektur bei 8 Hz

| | 8 Hz |
|---|---:|
| ACIDIFY vorher (Open303-Notch) | −41,94 dB |
| Stinchcombes Netz | **−20,94 dB** |

**21 dB** zu tief. Das war der größte Einzelfehler im Frequenzgang.

### Mein Prüfstein ist gescheitert — und das ist der Ertrag

Oben unter Punkt 1 hatte ich geschrieben: „Nach der Änderung muss bei 8 Hz ein
**Maximum** stehen." Aus der Übertragungsfunktion folgt das Gegenteil. `C(s)`
hat ausschließlich **reelle** Pole und Nullstellen — eine solche Kaskade kann
gar kein Maximum erzeugen, sie steigt monoton. Bei Resonanz null gibt es keine
8-Hz-Spitze.

Die Spitze steckt im Term `18.7 k s⁴ (s+46.5)(s+4.40)` **im Nenner** — sie
entsteht erst, wenn die Rückkopplung das Koppelnetz **einschließt**. Genau das
meint Audit-Punkt 5 mit „um den Filterkern **verteilt**, nicht gebündelt".

**Damit steht der verbleibende strukturelle Mangel klar benannt:** ACIDIFY legt
`C(s)` **hinter** den Kern. Für den Frequenzgang bei fester Resonanz ist das
äquivalent, für die Schleife nicht. Solange die fünf Gruppen nicht zwischen den
Leiterstufen sitzen, **kann** die 8-Hz-Spitze nicht entstehen — unabhängig
davon, wie gut das Netz sonst stimmt.

### Und eine Quellenkorrektur

Der bisherige Audit-Eintrag stützte die 8-Hz-Spitze auf Stinchcombes Satz, sie
sei „a large contributing factor to the sound of the TB-303 overall". Der
Satz davor schränkt ein:

> „I took some measurements from my **TBX-303 clone**, and the test set-up I was
> using was **adding just enough capacitive load** to enable the filter to
> oscillate comfortably at around 8Hz."

Die *Spitze* ist real — sie steht in seiner hergeleiteten Übertragungsfunktion.
Das *Anschwingen bei 8 Hz* stammt dagegen von einem **Klon mit zusätzlicher
kapazitiver Last aus dem Messaufbau**. Beides zu vermengen würde die Aussage
überdehnen. Die Frequenzangabe „8 Hz" trägt damit weniger Gewicht als die
Existenz der Spitze.

### Pegel

Smoke-Peak 0,910 → **0,888**, RMS 0,0437 → 0,0435. `preflight --strict` sauber,
`dsp_matrix_test` 11/11 `ok` mit höchstem Effekt-Peak **0,9395**,
`dsp_articulation_test` `ok`, `dsp_transport_test` 12/12 `ok`.

---

## Anschwinggrenze über die Frequenz — Test gescheitert, Ursache gefunden

`FILTER_TOPOLOGY.md` führte als offen: Whittle sagt, der Filter schwinge
„only self oscillate at **mid and high** frequencies" an. Zeigt das Modell diese
Frequenzabhängigkeit von selbst?

Gemessen am eingebauten Kern, Schaltplan-Kondensatoren, Grenze per Bisektion:

| Parameter / Hz | 150 | 300 | 700 | 1610 | 4000 | 9000 |
|---|---:|---:|---:|---:|---:|---:|
| k-Grenze | 19,63 | 20,45 | 19,63 | 19,63 | 19,63 | 19,63 |

**Flach.** Das Modell zeigt die Frequenzabhängigkeit **nicht**. Der Test konnte
bestätigen und hat es nicht getan.

### Die Ursache ist dieselbe wie beim 8-Hz-Peak

Naheliegende Erklärung: In der Schaltung sitzt das Koppelnetz **innerhalb** der
Resonanzschleife. Seine Hochpasswirkung entzieht der Schleife bei tiefen
Eckfrequenzen Verstärkung — dort reicht es dann nicht mehr zum Anschwingen.

Am Messstand geprüft, ein Hochpass erster Ordnung in den Rückkopplungspfad des
Prototyps eingesetzt:

| Hochpass in der Schleife | Grenze @ 150 Hz | @ 4000 Hz | Spreizung |
|---|---:|---:|---:|
| ~0 Hz | 20,90 | 19,18 | 1,72 |
| 15 Hz | 23,48 | 20,04 | 3,44 |
| 30 Hz | 26,91 | 20,04 | **6,87** |

Die Spreizung wächst monoton mit der Eckfrequenz des eingefügten Hochpasses.
Bei tiefer Filtereckfrequenz steigt die Anschwinggrenze stark, bei hoher kaum —
bei festem k hieße das: unten schwingt er nicht an, oben schon. Genau Whittles
Aussage.

**Einschränkung, die ich nicht übergehe:** Die Zeile „~0 Hz" ist **kein**
sauberer Nullversuch. Das eingefügte Glied bringt auch ohne Hochpasswirkung
eine Verzögerung in den Rückkopplungspfad und bricht damit die
Zero-Delay-Eigenschaft; ihre Absolutwerte sind deshalb nicht mit der Tabelle
darüber vergleichbar. Belastbar ist der **Trend** über die drei Zeilen, und der
ist eindeutig.

### Damit steht der nächste Schritt fest

Zwei getrennte Hardwarebefunde haben dieselbe Ursache:

1. Die 8-Hz-Spitze entsteht nur, wenn die Rückkopplung das Koppelnetz
   einschließt (aus Stinchcombes Übertragungsfunktion hergeleitet).
2. Die Anschwinggrenze wird nur dann frequenzabhängig (hier gemessen).

**Das Koppelnetz gehört in die Schleife, verteilt zwischen die Leiterstufen** —
Audit-Punkt 5, „um den Filterkern verteilt, nicht gebündelt". Das ist keine
Verfeinerung mehr, sondern die Erklärung für zwei bekannte Lücken.

Technisch heißt das: Der ZDF-Kern löst die Schleife geschlossen auf. Glieder in
den Rückkopplungspfad zu setzen, ohne diese Eigenschaft zu verlieren, verlangt,
sie **in die Auflösung mit aufzunehmen** — nicht, sie davorzuhängen. Das ist der
Umbau, der als Nächstes ansteht.

### Nachtrag zu einer früheren Entfernung

Open303 hatte einen 150-Hz-Hochpass im Rückkopplungspfad, den ich mit dem
Kerntausch entfernt habe — zu Recht, denn er war ein Fit und im vermessenen
Prototyp nicht enthalten. Nach dieser Messung ist aber klar, **wofür** er dort
stand: als grobe Näherung genau dieses Effekts. Die Entfernung war richtig, sie
hat aber eine Näherung eines echten Verhaltens mitgenommen. Das ist kein Grund,
sie zurückzunehmen — der richtige Ersatz ist die Struktur, nicht der Fit.

---

## Nachtest: Anschwinggrenze ist jetzt frequenzabhängig

Der Test, der vor dem Schleifenumbau flach ausfiel, nach dem Umbau wiederholt.
Grenze als Vielfaches des vollen Reglerwegs (1,0 = Regler am Anschlag):

| Eckfrequenz | 150 Hz | 400 Hz | 1000 Hz | 3000 Hz | 8000 Hz |
|---|---:|---:|---:|---:|---:|
| Grenze | 2,316 | 1,379 | 1,145 | 1,145 | **1,027** |
| Reserve | 132 % | 38 % | 15 % | 15 % | **2,7 %** |

Vorher: 19,63 bei **jeder** Eckfrequenz, also keine Abhängigkeit.

Zwei Aussagen Whittles fallen damit gleichzeitig aus der Struktur an:

- „The filter will only self oscillate at **mid and high** frequencies" — die
  Reserve schrumpft von 132 % bei 150 Hz auf 2,7 % bei 8 kHz.
- „just under that required for **self-oscillation**" — bei Vollausschlag
  schwingt er nirgends an, liegt am oberen Ende aber nur 2,7 % darunter.

Beides ohne getrimmte Zahl: `kMax = 18,7/1,06` stammt aus Stinchcombes
Übertragungsfunktion, nicht aus einer Anpassung an dieses Ergebnis. Der Test
hätte scheitern können — eine Reserve von 2,7 % am oberen Ende war nicht
vorhersagbar, sie ist herausgekommen.

---

## Stand nach dem Schleifenumbau — Steilheit und Reglerweg

**Steilheit ohne Resonanz, Eckfrequenz 1000 Hz:**

| Bereich | 1→2 kHz | 2→4 kHz | 4→8 kHz |
|---|---:|---:|---:|
| dB/Okt | −12,72 | −17,71 | −21,69 |

Steigend über der Frequenz, asymptotisch gegen 24 — und im Mittel über die drei
Oktaven rund −17,4 dB/Okt. Das ist Stinchcombes „vierpolig, verhält sich aber
über weite Teile des Hörbereichs wie 18 dB/Okt", näher daran als der blanke Kern
vor dem Umbau.

**Resonanz über den Reglerweg** (Spitze gegen 250-Hz-Bezug, Eckfrequenz 1000 Hz):

| Regler | 0,0 | 0,2 | 0,4 | 0,6 | 0,8 | 1,0 |
|---|---:|---:|---:|---:|---:|---:|
| Spitze | +3,63 dB | +0,24 | +3,47 | +7,56 | +12,48 | **+19,80** |
| bei | 97 Hz | 415 Hz | 754 Hz | 932 Hz | 1053 Hz | 1146 Hz |
| Zuwachs | — | — | +3,24 | +4,08 | +4,92 | **+7,31** |

Monoton ab Reglerstellung 0,2, und die Zuwächse **wachsen** zum Anschlag hin.
Das obere Reglerdrittel bringt hier +12,2 dB; im Polynomfit von 0.7.2 waren es
2,6 dB. Der Befund „oberes Reglerdrittel funktionslos" aus `REVIEW_0.4.0.md`
ist damit erledigt.

Die Spitze wandert über den Reglerweg von 415 auf 1146 Hz — die Polbewegung der
Diodenleiter, die aus der fehlenden Entkopplung folgt.

Die Zeile bei Reglerstellung 0,0 (+3,63 dB bei 97 Hz) ist **keine** Resonanz,
sondern der Tieftonverlauf des Koppelnetzes.


---

## VCA-Steuerkonstanten — die Lücke ist jetzt exakt benannt

`0.45`, `4.0` und `0.42` sind weiterhin ohne Bauteil dahinter. Die Umgebung ist
inzwischen vollständig verfolgt (`tools/bench/nettrace.py`):

- **IC15 Pin 1 und Pin 3 liegen auf demselben Netz.** Dort treffen `R121 = 220 k`,
  `R122 = 100 k` und `R124 = 2,2 k` mit `C37 = 10 µF`. Das ist der Audioeingang,
  und er ist modelliert. *Korrektur an einer früheren Notiz: dort stand nur
  „Pin 3".*
- **Pin 2** hängt an `R125 = 2,2 k` und `R126 = 2,2 k` — der andere
  Differenzeingang, auf +5,333 V bezogen.
- `Q31` (2SA733P) wird von der VEG (`R123 = 1,5 M`, `C42 = 1 µF`) gesteuert und
  speist in **denselben Knoten** wie der Accent-Pfad `D27` → `R120 = 22 k` →
  `C36 = 33 nF`; `R119 = 47 k` koppelt diesen Knoten zur Ausgangsstufe.

**Was zum Ersetzen der drei Konstanten fehlt, ist eine einzige Angabe: die
Pinbelegung des BA662A.** Ohne sie lässt sich nicht entscheiden, welcher Pin den
Steuerstrom führt, und damit nicht, in welchem Verhältnis Hüllkurve und Accent
in ihn eingehen. Alle beteiligten Bauteilwerte sind gelesen; es fehlt nur die
Zuordnung.

Ein Hinweis, ausdrücklich als **unbelegt** markiert: Das Verhältnis der
ACIDIFY-Konstanten ist `4,0 / 0,45 = 8,9`, und im Netz stehen `R129 = 22 k`
gegen `R128 = 220 k`, Verhältnis `10`. Das ist auffällig nah, aber es ist eine
Beobachtung, keine Herleitung — die Zuordnung der beiden Widerstände zu Accent
und Hüllkurve ist nicht verfolgt.

## VCO — bewusst nicht ersetzt

Der Kern ist gelesen: Komparator `IC11` mit `C34 = 1 nF`, Stromquelle über das
`2SC1583`-Paar, `Thermistor 7,5` zur Temperaturkompensation, `Q8 = 2SA733P` mit
`R35 = 100 k` und `R36 = 10 k` für die Rechteckableitung.

**Nicht umgesetzt, und das ist eine Entscheidung, keine Lücke im Lesen.** Der
vorhandene PolyBLEP-Oszillator ist antialiasiert; ein direkt nachgebildeter
Komparator-Sägezahn wäre es nicht und würde bei hohen Noten hörbar aliasen. Ein
physikalischer VCO braucht eine eigene Antialiasing-Strategie (Oversampling oder
BLEP-Korrektur an den Reset-Kanten). Das ist ein eigener Arbeitsschritt, kein
Konstantentausch — und ein halb fertiger VCO wäre schlechter als der jetzige.

Die eine Konstante, die ohne diesen Umbau ersetzbar wäre, ist die Rechteck-
Schwelle `0,4687857` (Open303, gemessen). Sie folgt aus dem Spannungsbereich des
Sägezahns gegen die Komparatorschwelle an `Q8` — beides ist im Plan vorhanden,
aber noch nicht ausgewertet.


---

## Cutoff- und Env-Mod-Abbildung aus der Schaltung

Sieben Open303-Polynomkoeffizienten ersetzt durch zwei Werte:

- `highCutoff = 2500 Hz` — belegt (Whittle, DF-Handbuch 2.1C: DF-Maximum 5 kHz,
  „an octave above the standard frequency of the TB-303").
- `octaves = 3` — Cutoff und Env Mod speisen den Steuerknoten über **identische**
  Netze (VR3 50 k + R47 10 k; VR5 50 k + R61 10 k), haben also dieselbe Spanne.
  Drei Oktaven unter 2500 Hz sind 312,5 Hz; Open303s gefittete 313,8 Hz liegen
  0,4 % daneben.

**Behobener Defekt:** `envScaler` lieferte bei Env Mod null **0,864 statt 0** —
Restmodulation ohne Bauteil dahinter. Open303 brauchte deshalb `envOffset` als
Gegengewicht; beides entfällt.

Gemessen, spektraler Schwerpunkt:

| Env Mod = 0 | Cutoff 0,0 | 0,5 | 1,0 |
|---|---:|---:|---:|
| | 447,7 Hz | 482,9 Hz | 1097,1 Hz |

| Cutoff = 0,5 | EnvMod 0,0 | 0,5 | 1,0 |
|---|---:|---:|---:|
| | 482,9 Hz | 593,9 Hz | 728,5 Hz |


---

## BA662A-Pinbelegung — der Blocker ist weg

Aus dem **Roland-100M-Servicehandbuch** (Textquelle, kein Scan):

| Pin | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
|---|---|---|---|---|---|---|---|---|---|
| | CV1 | −IN1 | +IN1 | CV2 (Puffer) | −V | OUT1 | IN2 | OUT2 | +V |

Der BA662 ist OTA **und** Puffer in einem Gehäuse; Pin 4 steuert den Puffer.

Damit stimmt die bisherige Verfolgung: `R121`/`R122` liegen auf **Pin 3 = +IN1**,
also am Audioeingang — richtig modelliert. **Pin 1 = CV1** führt den Steuerstrom.

### Was damit feststeht

- `Q31` (2SA733P, PNP) ist die Steuerstromquelle an Pin 1.
- Emitterwiderstand **`R131` = 220 kΩ** nach +12 V, Basis an `C42` (VCA-Hüllkurve).
- Der Accent speist über `D35` + **`R133` = 2,2 kΩ** in **denselben Emitterknoten**.
- Leitwertverhältnis am Knoten: **220 / 2,2 = 100**.

### Was es nicht löst

`ampControl` ist im Modell ein **dimensionsloser Verstärkungsfaktor**, kein
Strom. Das Verhältnis 100 : 1 lässt sich nicht einfach für `4.0 / 0.45 = 8,9`
einsetzen — die beiden Größen sind nicht dieselbe Art von Zahl.

Der saubere Weg ist ein **Umbau statt eines Tauschs**: die Stufe in echten
Einheiten rechnen — Steuerstrom `I_abc` aus `(12 V − V_E)/R131` plus dem
Accent-Anteil über `R133`, daraus die OTA-Steilheit `g_m = I_abc/(2·V_t)`, und
der Ausgang als `g_m · tanh(v_in/(2·V_t)) · R_last`. Das ersetzt `0.45`, `4.0`,
`0.42` **und** `otaDrive` in einem Zug durch Bauteilwerte, die alle schon
geprüft sind (`partcheck.py`).

Offen bleibt dabei nur der Arbeitspunkt von `Q31` — die Basisspannung an `C42`
in Volt. Sie folgt aus der Hüllkurvenamplitude, die im Modell normiert ist.


### VCA-Verstaerkung eingebaut

`I_abc,max = (12 − 0,2 − 0,6)/R131 = 50,9 µA`, Ausgangsumsetzung über
`R119 = 47 k`, Eingangsteiler `R124/R121 = 1/100`:

`0,460 = 50,9 µA · 47 k · 0,01 / (2·0,026)`

Open303 stand bei `0,42`, also 9,6 % darunter. Der **Spannungsmaßstab kürzt
sich in der Kleinsignalverstärkung heraus** — er bleibt nur in `otaDrive`,
das den Knick der Kennlinie setzt.

Damit sind von den ursprünglich 14 gefitteten Konstanten noch **fünf** übrig:
`0.45`, `4.0` (Accent/Hüllkurve-Aufteilung), `otaDrive`, die
VCO-Rechteckschwelle und der Aufräumfaktor `2.0f`.

> **Stand jetzt: zwei.** `0.45` ist mit dem Wegfall des Hüllkurventerms am VCA
> entfallen, `otaDrive` und `2.0f` sind abgeleitet (siehe oben). Übrig sind
> `4.0` — die Accent-Höhe, weiter ohne Bauteil dahinter — und die
> VCO-Rechteckschwelle, die **absichtlich** bleibt: sie stammt aus einer Messung
> an einem echten 303, und gemessene Hardware schlägt geschätzte Schaltung.

**`0.45` und `4.0` bleiben offen**, weil nicht geklärt ist, ob `Q36` — die
Quelle hinter `D35`/`R133` — vom Gate oder vom Accent getrieben wird. Ohne das
ist nicht entscheidbar, welcher der beiden Terme an `R133 = 2,2 k` hängt.
Verfolgt ist der Weg bis `Q36` über `R145 = 10 k`.
