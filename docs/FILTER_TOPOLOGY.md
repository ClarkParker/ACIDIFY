# Filterkern: vom Kurvenfit zur Topologie

Stand der Prüfung gegen 0.7.2. Alle Zahlen mit Cmajor 1.0.3175 gemessen,
Messstand in [`tools/bench/`](../tools/bench/), reproduzierbar.

**Status: geprüfter Prototyp, noch nicht integriert.** `ACIDIFYDSP.cmajor` ist
unverändert.

---

## Was heute im DSP steht

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

### Steilheit — der Test, der hätte scheitern können

Stinchcombes Hardwareanalyse sagt: Der 303-Filter ist **vierpolig**, verhält
sich aber über weite Teile des Hörbereichs wie 18 dB/Okt. Wenn das Modell die
Topologie trifft, muss dieses Verhalten von selbst herauskommen — ohne dass es
hineingeschrieben wird.

Gemessen, Eckfrequenz-Parameter 1000 Hz, ohne Resonanz:

| Bereich | Steilheit |
|---|---:|
| 1000 → 2000 Hz | −16,2 dB/Okt |
| 2000 → 4000 Hz | −20,7 dB/Okt |
| 4000 → 8000 Hz | −23,1 dB/Okt |

Asymptotisch 24 dB, im Hörbereich flacher. Genau die beschriebene Eigenschaft,
ungetrimmt. Der bisherige Fit liefert konstante 18 dB/Okt über den ganzen
Bereich — flacher als die Hardware im Sperrbereich.

### Resonanz

Parameter 1610 Hz, Spitze bei ~1000 Hz:

| k | Spitze | Zustand |
|---:|---:|---|
| 4 | +1,5 dB | stabil |
| 8 | +7,0 dB | stabil |
| 12 | +14,0 dB | stabil |
| 14 | +19,3 dB | stabil |
| 15,5 | +25,8 dB | stabil |
| 16,5 | +35,7 dB | stabil |
| 16,9 | +49,4 dB | stabil |
| 16,99 | +67,7 dB | schwingt |
| 17,0 | +83,0 dB | schwingt |

Monoton über den ganzen Weg, kein totes Drittel. Bei k = 16,5 liegt die Spitze
**18,5 dB über dem, was der bisherige Filter überhaupt erreichen kann**.

### Selbstoszillation ist kein Ziel

Wichtig für die Kalibrierung, aus Whittles Devil-Fish-Dokumentation:

> „The hand-soldered resistor which controls the resonance gain when the
> Resonance pot is fully clockwise was chosen to tweak the feedback level to
> **just under that required for self-oscillation**"

Der serienmäßige 303 schwingt also absichtlich **nicht** an — der Devil-Fish-Mod
fügt das erst nachträglich hinzu. Maximale Resonanz gehört daher auf ein k
knapp unterhalb 17, nicht darauf. Der handverlötete Widerstand ist der
Kalibrierpunkt.

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

**Nächster Schritt.** Reso.-Comp.-Zweig als eigene Stufe zwischen Filter und
VCA aufbauen, wie im Plan, und die Ausgangsstaffelung dazu neu rechnen. Der
Kern selbst braucht keine Änderung — er ist gemessen und stabil.
