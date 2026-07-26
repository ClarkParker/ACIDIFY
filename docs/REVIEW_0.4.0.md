> **ÜBERHOLT — nicht als Befundlage verwenden.**
>
> Dieses Dokument prüft `main` (0.4.0). Der tatsächliche Arbeitsstand ist 0.7.2
> auf `agent/dual-mode-ui-repair-20260725` (PR #1), vierzehn Commits weiter.
> Verzerrerstufe, Accent-Sweep-Schaltung sowie `allpass` und `notch` sind dort
> gebaut — die entsprechenden Befunde hier sind gegenstandslos, ebenso alle
> UI-Messungen, die gegen die abgelöste Graphit-Oberfläche entstanden.
>
> Ursache: Der Ausgangsklon enthielt den Branch nicht, und ich habe `git branch -a`
> statt `git ls-remote` geprüft. Eine Neuprüfung gegen 0.7.2 steht aus.

# Technische Prüfung 0.4.0 — DSP, Signalfluss und UI

Unabhängige Prüfung mit eigenem Messstand (`tools/bench/`), nicht mit den
vorhandenen Rauchtests. Alle Zahlen sind mit Cmajor 1.0.3175 gemessen und
reproduzierbar.

Referenz für den Signalfluss ist das MIT-lizenzierte
[Open303](https://github.com/RobinSchmidt/Open303) von Robin Schmidt, auf das
sich `ACIDIFYDSP.cmajor` im Kopfkommentar ausdrücklich beruft.

---

## 1. Signalfluss gegenüber der Referenz

Open303 `getSample()` verarbeitet in dieser Reihenfolge:

```
-oscillator            ← Vorzeichen invertiert
  → highpass1 (44.486 Hz)      ┐
  → filter (TeeBee-Leiter)     │ 4× überabgetastet
  → antiAliasFilter            ┘
  → allpass (14.008 Hz)
  → highpass2 (24.167 Hz)
  → notch (7.5164 Hz, BW 4.7)
  → × ampEnvOut                ← vorher durch ampDeClicker (200 Hz)
  → × ampScaler
```

ACIDIFY:

```
 oscillator            ← nicht invertiert
  → Hochpass 44.486 Hz         ┐
  → processLadder              │ 4× überabgetastet (ganzer Kern)
                               ┘
  → Hochpass 24.167 Hz
  → × ampEnvelope × accentGain
  → softClip
  → × outputGain
```

### Was korrekt übernommen ist

Die Konstanten stimmen durchweg mit der Referenz überein — das ist ein
sorgfältiger Port, kein Ratespiel:

| Größe | Open303 | ACIDIFY |
|---|---|---|
| Eingangs-Hochpass | 44.486 Hz | 44.486 Hz |
| Ausgangs-Hochpass | 24.167 Hz | 24.167 Hz |
| Hochpass im Resonanzpfad | 150 Hz | 150 Hz |
| Accent-Decay | 200 ms | 200 ms |
| Amp-Decay (`ampEnv`) | 1230 ms | 1230 ms |
| Slide (0.2 × 60 ms) | 12 ms | 12 ms |
| Accent-RC (`rc2`) | 15 ms | 15 ms |
| `envScaler` / `envOffset` | Polynom | identisch |

### Abweichungen

**A1 — Drei Ausgangsstufen fehlen.** `allpass` (14.008 Hz), `notch`
(7.5164 Hz, Bandbreite 4.7) und damit deren Phasen- und Tiefbassprägung sind
nicht vorhanden. ACIDIFY hat nur `highpass2`.

**A2 — Kein `ampDeClicker`.** Open303 glättet die Amplitudenhüllkurve mit einem
Biquad-Tiefpass bei 200 Hz (Gain √0.5), bevor sie das Signal multipliziert.
ACIDIFY multipliziert die Hüllkurve ungeglättet — bei 1 ms Attack ist das eine
Klickquelle an jedem Notenanfang.

**A3 — Oszillator nicht invertiert.** Open303 nutzt `-oscillator.getSample()`.
Weil der Filterpfad nichtlinear ist (`softClip` am Ein- und Ausgang der Leiter),
ist die Polarität hörbar: sie entscheidet, welche Halbwelle zuerst sättigt.

**A4 — `rc1` ist in der Referenz null.** Open303 setzt `rc1.setTimeConstant(0.0)`,
glättet die Filterhüllkurve also **nicht**. ACIDIFY legt mit
`filterAttackAlpha = 1 − timeCoefficient(3 ms)` eine 3-ms-Glättung darüber. Das
nimmt dem Filteranschlag genau den Biss, der den 303 ausmacht.

**A5 — Accent-Kopplung zur Amplitude ist anders verdrahtet.** Open303:

```cpp
if (ampEnv.isNoteOn())
    ampEnvOut += 0.45*mainEnvOut + accentGain*4.0*mainEnvOut;
```

ACIDIFY:

```cmajor
let accentGain = 1.0f + accentControl * (0.45f * filterEnvelopeRC + 3.2f * accentEnvelopeRC);
```

Drei Unterschiede: additiv gegen multiplikativ, 4.0 gegen 3.2, und — am
wichtigsten — der `0.45`-Term hängt bei ACIDIFY am **Accent-Regler**. In der
Referenz wirkt er immer. Steht Accent auf 0, verliert ACIDIFY die
Hüllkurven-Amplitudenkopplung auf **jeder** Note, nicht nur auf akzentuierten.

**A6 — Amp-Attack.** Referenz `ampEnv.setAttack(0.0)`, ACIDIFY 1 ms.

Nicht als Mangel gewertet: der fehlende `antiAliasFilter` in der
Überabtastschleife. Cmajor macht die Sinc-Resampling-Filterung des `* 4`-Knotens
selbst; das ist der sauberere Weg.

---

## 2. Gemessenes Verhalten

Messstand: isolierter Leiterfilter, Impulsantwort, 32768-Punkt-FFT.

### Filterflanke — korrekt

| Cutoff | Flanke |
|---:|---:|
| 200 Hz | −18.1 dB/Okt |
| 500 Hz | −18.5 dB/Okt |
| 1000 Hz | −18.7 dB/Okt |
| 2000 Hz | −18.9 dB/Okt |
| 4000 Hz | −18.9 dB/Okt |

18 dB/Oktave ist der richtige Wert für die 303-Diodenleiter — nicht die 24 dB
einer Moog-Kaskade. Das ist gut getroffen.

### Resonanz — zu schwach und oben tot

Antwort bei Cutoff 1000 Hz, relativ zu 250 Hz:

| Resonanz | Spitze | Frequenz |
|---:|---:|---:|
| 0.0 | −1.6 dB | — |
| 0.3 | +6.6 dB | 864 Hz |
| 0.5 | +11.2 dB | 964 Hz |
| 0.72 | +14.6 dB | 1012 Hz |
| 0.9 | +16.4 dB | 1031 Hz |
| 1.0 | +17.2 dB | 1039 Hz |

Zwei Befunde:

1. **+17 dB Maximum ist zu wenig.** Der charakteristische Acid-Squelch lebt von
   einer Resonanz nahe der Selbstoszillation. Der Filter bleibt über den ganzen
   Bereich stabil und schwingt nie an.
2. **Das obere Reglerdrittel ist funktionslos.** Von 0.72 auf 1.0 — 28 % des
   Wegs — kommen 2.6 dB dazu. Ursache ist die Kennlinie
   `resonanceSkewed = (1−e^(−3r))/(1−e^(−3))`, die bei r = 0.72 schon 0.93
   erreicht. Der Regler fühlt sich oben tot an.

### Aliasing — sauber

Stärkste nicht-harmonische Komponente bei offenem Filter:

| Note | Pegel rel. Grundton |
|---|---:|
| C4 (262 Hz) | −70.9 dB |
| C5 (523 Hz) | −69.2 dB |
| C6 (1047 Hz) | −62.1 dB |

PolyBLEP plus 4× Überabtastung arbeiten sauber. Kein Handlungsbedarf.

### Pegel

| Einstellung | Spitze |
|---|---|
| Volume 0 dB, mit Accent | −1.30 dBFS |
| Volume −6 dB (Werk) | −7.30 dBFS |

Gute Aussteuerung, kein Clipping. Gleichspannungsanteil +1.6·10⁻³ (≈ −56 dBFS) —
klein, aber vorhanden; `allpass` und `notch` aus A1 würden ihn mit erledigen.

---

## 3. Verzerrung

**Es gibt keine Verzerrerstufe.** Vorhanden sind drei beiläufige `tanh`-Begrenzer:

```cmajor
softClip (signal * 0.82f) * 1.18f          // Leiter-Eingang
softClip (2.0f * gain * ladder4 * 1.08f)   // Leiter-Ausgang
softClip (coupled * ampEnvelope * accentGain * 1.45f)   // Ausgang
```

`tanh` ist punktsymmetrisch und erzeugt daher **ausschließlich ungeradzahlige
Harmonische**. Das klingt aufgeräumt und hi-fi — nicht nach der asymmetrischen,
geradzahlig gefärbten Härte, die Acid-Sounds ihren Biss gibt. Es gibt keinen
Regler, keine Klangformung, keine Wahl der Charakteristik.

### Vorschlag: Airwindows `Focus` adaptieren

Nicht neu erfinden — `Focus` von Chris Johnson ist **MIT-lizenziert** (also
kompatibel mit ACIDIFY) und liegt im Repo unter
`plugins/LinuxVST/src/Focus/Focus.cpp`. Es kombiniert einen Bandpass mit fünf
wählbaren Kennlinien und ist auf Aliasing-Armut ausgelegt.

Die Kennlinien sind trivial nach Cmajor portierbar — reine Mathematik, kein
Zustand:

```cpp
case 2: // Spiral
    if (x >  1.2533141373155) x =  1.2533141373155;
    if (x < -1.2533141373155) x = -1.2533141373155;
    x = sin(x) ...
case 3: // Mojo
    mojo = pow(fabs(x), 0.25);
    if (mojo > 0.0) x = (sin(x * mojo * M_PI * 0.5) / mojo) * 0.987654321;
case 4: // Dyno
    dyno = pow(fabs(x), 4);
    if (dyno > 0.0) x = (sin(x * dyno) / dyno) * 1.1654321;
```

Weil ACIDIFY den ganzen Kern bereits 4× überabtastet, liefe die Stufe ohne
Zusatzaufwand im überabgetasteten Bereich.

**Parameterbudget:** ACIDIFY hat 44 Parameter, Amorph nennt 50 als sichere
Grenze (80+ sind im Feld erprobt). Eine Verzerrerstufe mit Drive, Focus, Type
und Mix landet bei 48 — noch innerhalb der dokumentierten Zusage.

---

## 4. UI

Gemessen an der nativen Fenstergröße 1180 × 580 aus dem Manifest.

### Schriftgrößen — der größte Befund

161 Textknoten, davon **128 bei 9 px oder kleiner**:

| Größe | Knoten |
|---:|---:|
| 5 px | 23 |
| 5.5 px | 18 |
| 6 px | 8 |
| 6.5 px | 2 |
| 7 px | 41 |
| 8 px | 36 |
| 9 px | 16 |
| 10 px | 13 |
| 11 px | 2 |
| 16 px | 2 |
| 29 px | 2 |

Vier Knoten sind 11 px oder größer. 5-px-Text ist keine Beschriftung mehr,
sondern Dekoration. Die UI skaliert per CSS-`zoom` mit dem Fenster — aber die
Werkgröße ist nun einmal 1180 × 580, und dort steht das so.

### Kontrast — 11 Verstöße gegen WCAG AA

| Verhältnis | Nötig | Größe | Text |
|---:|---:|---:|---|
| 1.28:1 | 4.5 | 8 px | Tastenbuchstaben D, E, F, G, A, B |
| 2.58:1 | 4.5 | 8 px | Tastenbuchstabe C |
| 2.82:1 | 4.5 | 5.5 px | Fußzeile „ACIDIFY 0.4.0 …" |
| 3.49:1 | 4.5 | 6 px | „MONOPHONIC · 4× MODELLED CORE" |
| 3.49:1 | 4.5 | 5.5 px | „OUT", „CLASSIC PROGRAMMING" |

Die Notenbuchstaben auf den weißen Tasten sind bei 1.28:1 praktisch unsichtbar.

### Klickflächen — in Ordnung

Kein interaktives Element unter 24 × 24 px. Das ist sauber gelöst.

### Struktur und Gestaltung

**U1 — Reglerwerte ohne Einheit.** Cutoff zeigt „45", Decay „45", Resonance
„72". Ein professionelles Plug-in zeigt Hz und ms. Die Zahlen sind zudem klein
und schwach kontrastiert.

**U2 — Regler ohne Wertbogen.** Nur ein dünner Zeiger und ein Tickring. Ein
gefüllter Bogen macht den Wert auf einen Blick lesbar; das ist heute Standard.

**U3 — Doppelte Step-Darstellung in Studio.** Oben die 16 Step-Kacheln, darunter
dieselben 16 Steps als Lane-Matrix — in anderem Raster und ohne visuelle
Verbindung. Zwei Wahrheiten für dieselbe Sache.

**U4 — Klaviatur dominiert.** Das helle Keyboard ist das visuell lauteste
Element, obwohl es nur der Noteneingabe für den gewählten Step dient. Es zieht
den Blick von der Pattern-Zeile weg, die die eigentliche Arbeitsfläche ist.

**U5 — Flache Typo-Hierarchie.** „TRANSPORT", „SYNTHESIS", „MASTER",
„WAVEFORM", „STEP / PITCH" liegen in Größe und Gewicht dicht beieinander.

**U6 — Keine Klangrückmeldung.** Eine winzige OUT-LED, sonst nichts. Bei einem
filterzentrierten Instrument wäre die sichtbare Filterbewegung ein echter
Bediengewinn.

**U7 — Deaktivierte Schalter unlesbar.** UNDO, REDO und PASTE im Smart-Edit-Feld
sind im Aus-Zustand kaum vom Hintergrund zu unterscheiden.

---

## 5. Gegenprobe an der Hardware

Abschnitt 1 vergleicht gegen Open303 — also gegen ein Softwaremodell. Die
eigentliche Frage ist aber, ob der Aufbau die **Schaltung** abbildet. Dafür sind
zwei Quellen maßgeblich: Tim Stinchcombes Analyse des Filters und Robin Whittles
Devil-Fish-Dokumentation der Accent-Schaltung.

### H1 — Die Accent-Sweep-Schaltung fehlt vollständig

Das ist der wichtigste Befund der ganzen Prüfung.

In der Hardware ist Accent kein einfacher Hüllkurvenzuschlag, sondern ein
passives RC-Netzwerk, das **von der zweiten Ebene des Resonanz-Potis** gesteuert
wird ([Whittle](https://www.firstpr.com.au/rwi/dfish/303-unique.html)):

> „a diode and a 47k resistor in series driving the ACW end of a 100k pot, and a
> 1uF capacitor (to ground) hanging off the CW end"

Der Schleifer geht über einen 100-k-Mischwiderstand auf einen der beiden
Summenknoten für die Filterfrequenz. Daraus folgt dreierlei:

**a) Der Accent-Charakter hängt am Resonanzregler.** Ganz links liegt im
Wesentlichen die ungefilterte MEG-Spannung am Filter — ein direkter Impuls. Ganz
rechts glättet der 1-µF-Kondensator diesen Impuls, während er über Diode und
47 k lädt. Genau daraus entsteht der „acidee wow"-Sweep.

**b) Aufeinanderfolgende Accents summieren sich.**

> „Since the capacitor has not discharged fully from the one before, the second
> and subsequent response curves go *higher*."

**c) Die MEG-Spannung wirkt doppelt** — zusätzlich zur Filterfrequenz auch auf
den VCA-Steuerstrom, dort über ein RC-Glied aus 47 k und 0,033 µF (≈ 1,55 ms),
das den Anschlag leicht weichzeichnet.

ACIDIFY bildet keinen dieser drei Punkte ab:

```cmajor
accentEnvelope = hasAccent ? 1.0f : 0.0f;      // harter Reset, keine Ladung
accentEnvelope *= accentDecayCoeff;            // feste 200 ms, unabhängig von Resonanz
exponent = envScaler * (...) + accentControl * 1.75f * accentEnvelopeRC;
                                               // kein Resonanzterm
```

Der Reset auf `0.0f` bei unbetonten Noten ist dabei die deutlichste Abweichung:
In der Schaltung entlädt sich der Kondensator weiter, in ACIDIFY ist er sofort
leer. Damit fehlt die charakteristische Steigerung über eine Accent-Folge —
also genau das, was eine 303-Linie nach vorn treibt.

**Wichtig:** Open303 hat dieselbe Lücke (`if (accentGain > 0.0) tmp2 = mainEnvOut;`,
`rc2` fest bei 15 ms, kein Resonanzterm). Ein treuerer Open303-Port behebt das
also **nicht**. Hier liegt die Chance, über die Vorlage hinauszugehen.

### H2 — Koppelnetzwerk stark vereinfacht

Stinchcombe findet in der Schaltung „basically five sets" von Hochpasswirkungen
durch Koppelkondensatoren, **verteilt um den Filterkern**, sowie eine
Übertragungsfunktion aus vierter Ordnung Tiefpass plus sechs weiteren Polen und
Nullstellen. Open303 fasst das zu vier Stufen zusammen (highpass1, allpass,
highpass2, notch), ACIDIFY zu zwei.

### H3 — Die 18 dB sind eine Näherung, kein Entwurfsziel

Stinchcombe zeigt, dass der Filter **vierpolig** ist und die verbreitete
18-dB-Angabe daher rührt, dass er sich über weite Teile des Hörbereichs so
verhält. Meine Messung von −18 bis −19 dB/Okt im Bereich 2×…4× Cutoff passt
dazu. Kein Mangel — aber die Zahl ist ein Verhalten, keine Vorgabe.

### H4 — Die 8-Hz-Spitze

Stinchcombe hält die tieffrequente Resonanzspitze bei ~8 Hz für real und
vermutet, sie sei „a large contributing factor to the sound of the TB-303
overall". Gemessen am fertigen ACIDIFY-Ausgang liegt bei 8 Hz jedoch nichts
(−111,8 dB gegenüber dem Grundton); der einzige Tieftonanteil ist die
Gleichspannung bei 1 Hz (−57,5 dB). Der 24-Hz-Ausgangshochpass entfernt den
Bereich, statt ihn zu formen — die fehlenden `allpass`- und `notch`-Stufen aus
A1 sind genau die, die ihn in der Referenz modellieren.

Einschränkung, die ich nicht überdehnen will: Ein gehaltener Ton mit 65 Hz
Grundfrequenz regt 8 Hz ohnehin kaum an. Die Wirkung liegt im Einschwingen und
in der Phase. Belegen ließe sie sich erst durch einen A/B-Vergleich nach
Einbau der Stufen.

### Was daraus folgt

Auf die Frage, ob der Aufbau die Hardware widerspiegelt: **im Signalweg ja, im
Accent-Zweig nein.** Oszillator → Koppelhochpass → Leiterfilter → Koppelhochpass
→ VCA → Ausgang ist die richtige Kette, und die Filterflanke stimmt. Der
Accent-Zweig ist dagegen ein linearer Hüllkurvenzuschlag statt der
resonanzgesteuerten, ladungsspeichernden RC-Schaltung der Vorlage.

---

## 6. Was übernommen statt neu gebaut werden kann

| Zweck | Quelle | Lizenz | Aufwand |
|---|---|---|---|
| Verzerrerstufe | Airwindows `Focus` | MIT | Kennlinien sind 2–4 Zeilen, zustandslos |
| Ausgangsstufen A1 | Open303 `allpass`/`notch` | MIT | Werte bekannt, Einpol/Biquad |
| `ampDeClicker` A2 | Open303 | MIT | Biquad-Tiefpass 200 Hz |
| Accent-Sweep H1 | Devil-Fish-Beschreibung | Schaltungsbeschreibung | RC-Netzwerk, ~15 Zeilen |

Für H1 gibt es bewusst keinen Code zum Übernehmen — weil kein bekanntes freies
Modell ihn abbildet. Die Schaltungsbeschreibung *ist* hier die Spezifikation:
Diode, 47 k, 1 µF, 100-k-Poti als Blende zwischen „roher Impuls" und
„geglätteter Sweep", Ladung bleibt über Notengrenzen erhalten.

---

## 7. Priorisierung

**H1 zuerst** — die Accent-Sweep-Schaltung. Sie ist der einzige Punkt, an dem
ACIDIFY über Open303 hinausgehen kann, und sie betrifft den prägendsten Teil des
Klangs: Ladung über Notengrenzen halten, Zeitkonstante und Glättung an den
Resonanzregler koppeln, Doppelwirkung auf Filter und VCA.

**Dann die Referenzabweichungen** — klein, belegbar, in dieser Reihenfolge:

1. A5 — Accent-Amplitudenkopplung wie in der Referenz verdrahten
2. A4 — `rc1` auf 0, Filteranschlag freilegen
3. A2 — `ampDeClicker` ergänzen
4. Resonanzkennlinie strecken und Maximum anheben
5. A1 — `allpass` und `notch` ergänzen (adressiert zugleich H4 und den DC-Anteil)
6. A3 — Oszillatorpolarität

**Dann die Verzerrerstufe** auf Basis von Airwindows `Focus`.

**UI parallel:** Schriftgrößen und Kontraste sind mechanisch zu beheben und
sofort spürbar. U1/U2 machen aus dem Panel ein ablesbares Instrument.
U3/U4 sind ein Layout-Entwurf, kein Detailfix.
