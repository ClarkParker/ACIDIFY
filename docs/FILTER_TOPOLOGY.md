# Filterkern: vom Kurvenfit zur Topologie

Stand der Prüfung gegen 0.7.2. Alle Zahlen mit Cmajor 1.0.3175 gemessen,
Messstand in [`tools/bench/`](../tools/bench/), reproduzierbar.

**Status: eingebaut.** `processLadder` in `ACIDIFYDSP.cmajor` rechnet seit dem
dritten Anlauf diesen Kern. Übertragung stellengenau gegen den Prototyp
gemessen, Ergebnisse in [`DSP_AUDIT.md`](DSP_AUDIT.md#filterkern-eingebaut).
Die Abschnitte „Was heute im DSP steht" und die beiden gescheiterten
Einbauversuche stehen weiter unten als **Verlaufsprotokoll** — sie beschreiben
den Weg, nicht den Stand.

---

## Was vor dem Einbau im DSP stand (überholt)

`processLadder` rechnet mit Polynomen aus Open303:

```cmajor
let numerator   = 0.00045522346f + 6.1922189f * fx;
let denominator = 1.0f + 12.358354f * fx + 4.4156345f * fx * fx;
let rawK = fx * (fx * (fx * (fx * (fx * (fx + 7198.6997f)
            - 5837.7917f) - 476.47308f) + 614.95611f) + 213.87126f) + 16.998792f;
```

Das sind **Anpassungen an gemessenes Verhalten** — der Kommentar im Quelltext
sagt es selbst: „Measured Open303 TB-303 recurrence". Kein Bauteil, kein Knoten,
keine Diode. Für eine Emulation ist das die falsche Richtung: Verhalten gehört
auf die Prüfseite, nicht in den Entwurf.

Die Grenzen davon sind messbar:

| Resonanzregler | Spitze |
|---:|---:|
| 0,5 | +11,2 dB |
| 0,72 | +14,6 dB |
| 0,9 | +16,4 dB |
| 1,0 | +17,2 dB |

Das obere Reglerdrittel bringt 2,6 dB. Anschwingen ist prinzipiell unmöglich.

---

## Der Ersatz

Zero-Delay-Feedback nach Zavalishins topologieerhaltender Transformation, für
die Diodenleiter hergeleitet von Pirkle (AN-6). Referenzumsetzung: Faust
`vaeffects.diodeLadder` von Eric Tarr, **MIT-style STK-4.3** — lizenzkompatibel.

Der Kern ist diese Rekursion:

```
G4 = 0.5*g / (1 + g);
G3 = 0.5*g / (1 + g - 0.5*g*G4);
G2 = 0.5*g / (1 + g - 0.5*g*G3);
G1 =     g / (1 + g -     g*G2);
```

Jede Stufenverstärkung hängt von der darunterliegenden ab. **Das ist die
fehlende Entkopplung der Diodenleiter** — genau der Punkt, an dem sie sich vom
Moog-Transistorstack unterscheidet, und der Grund für die andere Polbewegung bei
Resonanzänderung. Sie wird nicht nachgebildet, sie fällt aus der Topologie an.

### Abweichung von der Faust-Vorlage

Dort steht in der Rückkopplungssumme für die zweite Stufe `SG3`:

```
_-(((s4*B4*d3+s3)*B3*d2 + s2)*B2*SG3*k) :
```

Der Pfad von Stufe 2 zum Ausgang läuft über `G3*G4` = `SG2`. Hier steht `SG2`.

---

## Messungen

> **Referenzdefinition — verbindlich.** „Spitze" heißt hier: Pegel des Maximums
> zwischen 40 Hz und 20 kHz **minus Pegel bei 20 Hz bei demselben k**. Der alte
> Filter wurde in `REVIEW_0.4.0.md` gegen **250 Hz** referenziert. Beide Zahlen
> sind nicht vergleichbar — siehe „Korrektur" am Ende dieses Dokuments.

### Steilheit — der Test, der hätte scheitern können

Stinchcombes Hardwareanalyse sagt: Der 303-Filter ist **vierpolig**, verhält
sich aber über weite Teile des Hörbereichs wie 18 dB/Okt. Wenn das Modell die
Topologie trifft, muss dieses Verhalten von selbst herauskommen — ohne dass es
hineingeschrieben wird.

Gemessen, Eckfrequenz-Parameter 1000 Hz, ohne Resonanz:

| Bereich | Steilheit (33 nF, **überholt**) | Steilheit (18 nF, Schaltplan) |
|---|---:|---:|
| 1000 → 2000 Hz | −16,2 dB/Okt | **−14,8 dB/Okt** |
| 2000 → 4000 Hz | −20,7 dB/Okt | **−19,6 dB/Okt** |
| 4000 → 8000 Hz | −23,1 dB/Okt | **−22,7 dB/Okt** |

> Die linke Spalte ist mit vier gleichen 33-nF-Stufen gemessen — siehe **K4**
> unter „Korrektur". Die rechte gilt für die Schaltplanwerte. Die Aussage
> bleibt in beiden Spalten dieselbe: steigende Steilheit über der Frequenz,
> asymptotisch 24 dB, im Hörbereich flacher.

Asymptotisch 24 dB, im Hörbereich flacher. Genau die beschriebene Eigenschaft,
ungetrimmt. Der bisherige Fit liefert konstante 18 dB/Okt über den ganzen
Bereich — flacher als die Hardware im Sperrbereich.

### Resonanz

**Achtung: zwei Tabellen.** Die erste wurde mit vier gleichen 33-nF-Stufen
gemessen — dem Ursprungs-Prototyp aus `5c58833`, der noch kein `CAP4` kannte.
Die Schaltplanwerte kamen erst mit `82ff49e`. **Maßgeblich ist die zweite.**

Vier gleiche 33 nF (historisch, nicht schaltplangerecht):

| k | Spitze | Zustand |
|---:|---:|---|
| 12 | +14,0 dB | stabil |
| 16,5 | +35,7 dB | stabil |
| 16,99 | +67,7 dB | schwingt |
| 17,0 | +83,0 dB | schwingt |

**Schaltplan 33/33/33/18 nF — die gültigen Werte:**

| k | Spitze | bei | Zustand |
|---:|---:|---:|---|
| 4 | +0,9 dB | 513 Hz | stabil |
| 8 | +5,5 dB | 911 Hz | stabil |
| 12 | +11,0 dB | 1121 Hz | stabil |
| 16,5 | +20,5 dB | 1279 Hz | stabil |
| 17,0 | +22,3 dB | 1293 Hz | stabil |
| 18,0 | +26,9 dB | 1321 Hz | stabil |
| 19,0 | +36,4 dB | 1349 Hz | stabil |
| **19,4** | **+48,2 dB** | 1358 Hz | **stabil** |
| 19,6 | +63,2 dB | 1364 Hz | schwingt |

Monoton über den ganzen Weg, kein totes Drittel — das gilt für beide.

**Die Anschwinggrenze liegt bei k ≈ 19,5, nicht bei 17,0.** Der Kalibrierpunkt
„knapp unter Anschwingen" ist damit k ≈ 19,4, nicht 16,8. Ein bei 16,8
festgelegter Maximalwert läge mitten im linearen Bereich statt am Rand.

### Selbstoszillation ist kein Ziel

Wichtig für die Kalibrierung, aus Whittles Devil-Fish-Dokumentation:

> „The hand-soldered resistor which controls the resonance gain when the
> Resonance pot is fully clockwise was chosen to tweak the feedback level to
> **just under that required for self-oscillation**"

Der serienmäßige 303 schwingt also absichtlich **nicht** an — der Devil-Fish-Mod
fügt das erst nachträglich hinzu. Maximale Resonanz gehört daher **knapp unter
k ≈ 19,5** (Schaltplan-Kondensatoren), nicht knapp unter 17. Der handverlötete
Widerstand ist der Kalibrierpunkt.

Ergänzend: laut derselben Quelle schwingt der Filter überhaupt nur bei mittleren
und hohen Frequenzen an. Ob das Modell diese Frequenzabhängigkeit von selbst
zeigt, ist noch nicht geprüft.

### Kalibrierung

Der Parameter `g` entspricht nicht dem hörbaren Eckpunkt. Gemessen über vier
Oktaven, beide Verhältnisse konstant:

| Parameter | −3 dB (k=0) | Spitze (k=12) |
|---:|---:|---:|
| 1000 | 76 Hz | 620 Hz |
| 2000 | 151 Hz | 1238 Hz |
| 4000 | 299 Hz | 2477 Hz |
| 8000 | 601 Hz | 4969 Hz |

Beide skalieren linear mit dem Parameter; das Verhältnis zueinander bleibt bei
8,2. Das Modell ist in sich stimmig, es braucht nur einen **Skalar**: Für einen
Regler, der die Resonanzspitze führt — und darauf hört man bei einem 303 —
gilt `Parameter ≈ Spitze × 1,61`.

---

## Was noch offen ist

Das ist ein geprüfter Filterkern, keine fertige Emulation. Offen:

- Einbau mit Neukalibrierung von Cutoff- und Resonanzabbildung
- Zusammenspiel mit Hüllkurve, Env Mod und dem Accent-Sweep-Netzwerk
- Pegelanpassung: die Passbandverstärkung unterscheidet sich vom bisherigen Kern
- Nichtlinearität: wo die Diodensättigung sitzt, ist im Modell noch nicht besetzt
- Das Koppelnetzwerk aus fünf Hochpassgruppen (Stinchcombe) bleibt vereinfacht
- Frequenzabhängigkeit der Anschwinggrenze gegen die Hardwarebeschreibung prüfen

Vor dem Einbau gilt: Jede dieser Änderungen braucht einen Test, der sie
widerlegen könnte — nicht einen, der sie bestätigt.

---

## Einbauversuch — gescheitert an der Pegelstaffelung

Der Kern wurde eingebaut und wieder zurückgenommen. Was dabei herauskam:

**Was funktionierte.** Kompiliert, über den ganzen Resonanzweg stabil, kein
Anschwingen bei k = 16,8. Und die Resonanz wirkt endlich durchgehend — der
spektrale Schwerpunkt läuft 214 → 422 → 572 → 614 Hz über den Reglerweg,
während der Polynomfit bei 457 → 516 → 523 Hz oben feststeckt.

**Woran es scheiterte.** Die Rückkopplung senkt den Durchlassbereich zwischen
k = 0 und k = 16,8 um **25 dB**; gemessen folgt das der Form 1/(1+k). Meine
erste Kompensation `(1 + k·Γ)` griff nicht, weil `Γ = G1·G2·G3·G4` bei diesen
Eckfrequenzen in der Größenordnung 10⁻⁵ liegt — der Einbruch kommt nicht aus
`alpha0`, sondern aus der Schleifenverstärkung. Mit `(1 + k)` stimmt der
Durchlassbereich, aber die Resonanzspitze wächst mit: Spitzenpegel 2,65,
`dsp_matrix_test` meldet „unsafe processed peak".

**Warum nicht einfach ein Faktor davor.** Weil das Anpassen an die Testschwelle
wäre, nicht an die Schaltung. Der Schaltplan zeigt für dieses Problem einen
eigenen Zweig — „Reso. Comp." vom Filter an den VCA. Die Kompensation gehört
also nicht in den Filter, sondern in die Pegelstaffelung dahinter, und dafür
muss die Ausgangsstufe mitgeplant werden.

### Zweiter Anlauf: Diodensättigung — löst es auch nicht

Vermutung war, der Pegel sei kein Verstärkungsproblem, sondern die fehlende
Nichtlinearität: In der Schaltung begrenzen die Leiterdioden die Resonanz
selbst. Also `tanh` in den Rückkopplungszweig, mit einer Sättigungsschwelle
`vSat` als freiem Parameter, und die Kompensation weggelassen.

Gemessen über `vSat`, Peak und Schwerpunkt bei Resonanz 0 / 0,5 / 1,0:

| vSat | Peak | Schwerpunkt |
|---:|---|---|
| 1,0 | 0,64 / 0,33 / 0,34 | 214 → 355 → 391 Hz |
| 2,5 | 0,64 / 0,19 / 0,14 | 214 → 413 → 579 Hz |
| 5,0 | 0,64 / 0,18 / 0,12 | 214 → 420 → 605 Hz |
| 20,0 | 0,64 / 0,17 / 0,12 | 214 → 422 → 613 Hz |

**Das Ergebnis widerlegt die Vermutung.** Bei kleiner Schwelle erstickt die
Sättigung die Resonanz (391 Hz statt 613), bei großer ist sie praktisch
linear und der Pegel fällt unverändert auf 0,12. Es gibt keine Stellung, bei
der sie beides tut. Sättigung und Durchlassbereichsverlust sind **zwei
getrennte Effekte** — ich hatte sie als einen behandelt.

Damit stünden zwei freie Parameter zur Verfügung, `vSat` und ein
Kompensationsfaktor, die sich gegeneinander auf die Testschwelle tunen
ließen. Das wäre wieder Anpassen an das Messergebnis. Deshalb erneut
zurückgenommen.

### Was tatsächlich fehlt

Der Durchlassbereichsverlust von 25 dB bei hoher Resonanz ist physikalisch
echt — Gegenkopplung senkt den Durchlassbereich, und ein 303 dünnt bei hoher
Resonanz hörbar aus. Die Frage ist nicht **ob** kompensiert wird, sondern
**wie viel**, und das steht in der Schaltung.

Im Plan führen zwei Zweige an den VCA: `C49 = 10 nF` beschriftet „from Filter"
und `C76` mit `R100 = 10 nF` beschriftet „from Reso. Comp.". Die Kompensation
ist dort also kein Faktor auf das Audiosignal, sondern ein **zweiter
Summenzweig in die VCA-Steuerung** — eine andere Architektur als die, die ich
angenommen hatte.

**Nächster Schritt.** Die Bauteilwerte um `R100`/`C76` und den zugehörigen
Verstärker vollständig ablesen und den Zweig als eigene Stufe in die
VCA-Ansteuerung bauen, statt als Verstärkung in den Filter. Erst dann kann der
Kern eingesetzt werden. Er selbst ist gemessen und stabil und braucht keine
Änderung.

### Nachtrag — die Werte sind abgelesen, und sie korrigieren das Ziel

Erledigt über den x0xb0x-Schaltplan und dessen Stückliste; Werte, Summenknoten
und Quellenprüfung stehen in
[`HARDWARE_AUDIT.md`](HARDWARE_AUDIT.md#aus-dem-x0xb0x-abgelesen).
Kurz: `R121 = 220 kΩ`, `R122 = 100 kΩ`, `C20 = C21 = 10 nF`, beide Zweige
summieren in **Pin 3 von IC15** (BA662A/BA6110, 9-SIP).

Damit steht die Gewichtung fest: `1/220k : 1/100k = 1 : 2,2`, also **6,85 dB**
— ein **fester** Versatz.

**Das widerlegt die Formulierung oben.** „Die Frage ist nicht ob kompensiert
wird, sondern wie viel" unterstellt, der Zweig hebe den Einbruch auf. Ein fester
Versatz von 6,85 dB kann einen **resonanzabhängigen** Einbruch von 25 dB nicht
aufheben — das ist ein Abzählargument, keine Messung. Und
`H_zu = H/(1 + k·H)` erzwingt `H_zu ≈ 1/(1+k)` im Durchlassbereich für **jede**
gegengekoppelte Tiefpassstruktur, also auch für die echte Schaltung.

Der Zweig ist eine **feste, teilweise** Vorwärtseinkopplung. Er soll den
Einbruch nicht aufheben — der 303 dünnt bei hoher Resonanz hörbar aus, und das
ist Schaltungsverhalten.

**Prüfstein für Anlauf 3:** Nach dem Einbau muss der Durchlassbereich bei
maximaler Resonanz **immer noch messbar absinken**, nur weniger als 25 dB.
Kommt er flach heraus, ist die Kompensation zu groß — und ein Faktor, der ihn
flach macht, wäre erneut Anpassen an die Testschwelle.

**Offen und nicht geraten:** welcher der beiden Zweige „from Filter" führt und
welcher „from Reso. Comp.". Das entscheidet die Richtung der 6,85 dB.


---

## Korrektur — drei Fehler in diesem Dokument

Nachgeprüft und bestätigt. Sie betreffen Schlussfolgerungen, nicht die
Messungen: der Messstand reproduziert alle dokumentierten Zahlen exakt.

**K1 — Resonanztabelle und Anschwinggrenze galten für die falschen
Kondensatoren.** Beide wurden am Ursprungs-Prototyp `5c58833` gemessen, der
vier gleiche 33-nF-Stufen hatte; `CAP4` und damit C101 = 18 nF kamen erst mit
`82ff49e`. Mit den Schaltplanwerten sind es bei k = 16,5 **+20,5 dB statt
+35,7 dB**, und die Anschwinggrenze liegt bei **k ≈ 19,5 statt 17,0**. Das ist
der schwerwiegendste der drei: Der Kalibrierpunkt wäre 2,7 Einheiten zu tief
angesetzt worden, mitten im linearen Bereich.

**K2 — die „Lücke von 18 dB" mischte zwei Referenzpunkte.**
`REVIEW_0.4.0.md` misst den alten Filter gegen **250 Hz**, dieses Dokument den
ZDF gegen den **20-Hz-Durchlassbereich**. Der alte Filter hat den 150-Hz-Hochpass
im Rückkopplungszweig und liegt bei 20 Hz darum rund 15 dB über seinem
250-Hz-Pegel; der ZDF hat diesen Hochpass nicht. Konsistent gemessen, Spitze
jeweils auf ~1000 Hz, Schaltplan-Kondensatoren:

| Referenz | alter Filter | ZDF k = 16,5 | Differenz |
|---|---:|---:|---:|
| 250 Hz | +17,3 dB | +20,0 dB | **2,7 dB** |
| 20 Hz | +2,2 dB | +20,5 dB | **18,3 dB** |

Die dokumentierten „18 dB" entsprechen zufällig der 20-Hz-Zeile, entstanden
aber aus der Mischung beider Referenzen. Die Spanne kommt daher, dass sich die
Kerne im **Tieftonverhalten** unterscheiden, nicht nur in der Resonanz.

**K4 — auch die Steilheitstabelle galt für die falschen Kondensatoren.**
Derselbe Fehler wie K1, an einer weiteren Stelle: Die Tabelle unter „Steilheit"
stammt ebenfalls vom 33-nF-Prototyp. Mit den Schaltplanwerten sind es
**−14,8 / −19,6 / −22,7** statt −16,2 / −20,7 / −23,1. Beide Messungen wurden
nachgeprüft und reproduzieren sich exakt; K1 hatte nur Resonanztabelle und
Anschwinggrenze aufgeführt. Die *Aussage* der Messung — Steilheit steigt mit
der Frequenz, im Hörbereich flacher als 24 dB — trägt in beiden Fällen.

**K3 — `tools/bench/filter/Filt.cmajor` war veraltet**, obwohl die README das
ausdrücklich verbietet: enthielt noch die in `e676bd8` entfernte
Exponentialkennlinie, den Rückkopplungs-Hochpass mit anderen Koeffizienten und
zusätzliche Skalare. Folge: Die Tabelle „Resonanzregler → Spitze" oben ist ein
Vor-Linearisierungs-Stand — die **Reglerpositionen** dort bilden das heutige
Verhalten nicht ab, die **k-Werte** schon.

### Was die Prüfung überlebt hat

Das Argument für den ZDF-Kern ist strukturell, nicht in dB:

- Resonanz durchgehend monoton über den ganzen Reglerweg
- eine überhaupt erreichbare Anschwinggrenze — ohne die ist der handverlötete
  Widerstand nicht darstellbar
- die nicht-identische vierte Stufe aus C101 = 18 nF
- frequenzabhängige Steilheit (−16,2 / −20,7 / −23,1 dB/Okt)

Das fällt aus der Topologie an. Die dB-Schlagzeile nicht.

---

## Die Leiter wird stark ausgesteuert — und die Schwelle ist nicht fest

Aus ausschliesslich belegten Werten: VCO-Hub 5,33…10,5 V (Whittle,
x0x-VCF-Mods), `R62 = 220 kΩ` als Vorwiderstand in den VCF, `C98 = 33 nF`,
`V_T = 26 mV`.

```
Signalstrom  = 5,17 Vss / 220 kΩ = 23,5 µAss
Steuerstrom  = 2π · f_c · C · 2·V_T
```

| Eckfrequenz | Steuerstrom | Signal / Steuerstrom |
|---|---:|---:|
| 300 Hz | 3,23 µA | **7,3** |
| 1000 Hz | 10,78 µA | **2,2** |
| 2500 Hz | 26,95 µA | 0,87 |

**Der Signalstrom übersteigt den Steuerstrom bei normalen Pegeln um das Zwei-
bis Siebenfache.** Die Leiter arbeitet also tief in ihrer Nichtlinearität, nicht
am Rand. Der eingebaute ZDF-Kern ist demgegenüber **vollständig linear**.

### Warum der frühere `vSat`-Versuch scheitern musste

Weiter oben steht der zurückgenommene Anlauf mit `tanh` im Rückkopplungszweig
und einer festen Schwelle `vSat`. Gemessen wurde damals: bei kleiner Schwelle
erstickt die Resonanz, bei grosser ist es praktisch linear — „es gibt keine
Stellung, bei der sie beides tut".

Der Grund steht jetzt da: **Die Schwelle ist keine Konstante.** Sie ist der
Steuerstrom, und der folgt der Eckfrequenz. Über den Cutoff-Regler ändert sich
`I_c` um mehr als eine Grössenordnung — eine feste Schwelle kann das per
Konstruktion nicht abbilden. Der Versuch war nicht schlecht ausgeführt, er war
falsch parametrisiert.

### Was ein Einbau bedeutet

Kein freier Parameter mehr: Der Aussteuerungsgrad `u = I_signal / I_c` ist aus
den obigen Werten bestimmt. Aber es ist ein **Eingriff in den Kern**, nicht ein
Konstantentausch — die Zustandsgleichungen des ZDF müssen die Strombegrenzung
je Stufe mitführen, und die Zero-Delay-Auflösung muss das überstehen.

Prüfsteine, die dafür schon feststehen und scheitern können:

1. Kein Anschwingen bei irgendeiner Eckfrequenz (`hardware_checks.py` 1)
2. Anschwinggrenze weiter frequenzabhängig (`hardware_checks.py` 2)
3. Die Verzerrung muss mit **sinkender** Eckfrequenz zunehmen — bei 300 Hz ist
   das Verhältnis 7,3, bei 2,5 kHz 0,87. Kommt sie cutoff-unabhängig heraus,
   ist die Kopplung an `I_c` falsch.
