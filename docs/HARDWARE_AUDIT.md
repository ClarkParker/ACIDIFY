# Abgleich gegen die Hardware

Nicht gegen Open303 — gegen die Schaltung. Geprüfter Stand: 0.7.2.

Quellen mit Belegkraft:

- **Tim Stinchcombe**, [Analyse des TB-303-Filters](https://www.timstinchcombe.co.uk/index.php?pge=diode2)
  und [Diodenleiter allgemein](https://www.timstinchcombe.co.uk/index.php?pge=diode)
- **Robin Whittle**, [Devil-Fish-Dokumentation zur Accent-Schaltung](https://www.firstpr.com.au/rwi/dfish/303-unique.html)
  und [Devil-Fish-Handbuch](https://www.firstpr.com.au/rwi/dfish/)
- **Eddy Bergman**, [Nachbau des TB-303-VCF](https://www.eddybergman.com/2025/03/TB303-VCF.html)
- **Limor Fried**, x0xb0x — quelloffener lizenzierter Nachbau:
  Fabrikationshandbuch und Mainboard-Schaltplan, Werte im Klartext
  (Zugriff und Prüfsumme unter „Bessere Quelle als Pixellesen")

Noch nicht ausgewertet, vorgemerkt für die Mod-/Varianten-Arbeit:
[TB-303-Archiv auf machines.hyperreal.org](http://machines.hyperreal.org/manufacturers/Roland/TB-303/)
— Sammlung von Mod-Unterlagen. Für den Serienstand ist sie **keine** Quelle:
Mods beschreiben absichtliche Abweichungen von der Schaltung, und der
Kalibrierpunkt dieses Projekts ist gerade der **unmodifizierte** 303.

Open303 ist hier **keine** Quelle. Es ist selbst ein Modell und teilt mehrere der
unten stehenden Lücken.

---

## Ergebnis

| # | Stufe | Original laut Quelle | Stand 0.7.2 | |
|---|---|---|---|---|
| 1 | Accent-Sweep | RC-Netz an der zweiten Poti-Ebene, Ladung bleibt über Notengrenzen | Knotenanalyse mit Leitwerten, Diodenzustand, Kondensatorstrom | ✅ |
| 2 | Ausgangs-Koppelstufen | Allpass, Notch, Hochpass | vorhanden | ✅ |
| 3 | Filterordnung | vierpolig, im Hörbereich ~18 dB/Okt | Polynomfit, konstant 18 dB/Okt | ⚠️ |
| 4 | Resonanzgrenze | handverlöteter Widerstand, **knapp unter** Anschwingen | erreicht die Grenze nicht, Kalibrierpunkt k ≈ 19,4 | ❌ |
| 5 | Koppelnetzwerk | **fünf** Hochpassgruppen um den Filterkern verteilt | zu vier Stufen zusammengefasst, nicht verteilt | ❌ |
| 6 | Anschwingen | nur bei mittleren und hohen Frequenzen | überhaupt nicht möglich | ❌ |
| 7 | Leiterbauteile | 2SC945 als Dioden verschaltet, **gepaarte Paare kritisch** | keine Bauteilstreuung modelliert | ❌ |
| 8 | 8-Hz-Spitze | real, laut Stinchcombe klangprägend | am Ausgang −111 dB, faktisch entfernt | ❌ |

---

## Die Lücken im Einzelnen

### 4 und 6 — Resonanz und Anschwinggrenze

Whittle über den serienmäßigen 303:

> „The hand-soldered resistor which controls the resonance gain when the
> Resonance pot is fully clockwise was chosen to tweak the feedback level to
> **just under that required for self-oscillation**"

und

> „The filter will only self oscillate at mid and high frequencies."

Zwei getrennte Aussagen mit zwei Folgen. Erstens: Maximale Resonanz gehört
**dicht an** die Anschwinggrenze, nicht weit darunter. Der Polynomfit erreicht
sie prinzipiell nie; der topologiehergeleitete Kern schwingt mit
Schaltplan-Kondensatoren zwischen k = 19,4 und 19,6 an. Der Kalibrierpunkt ist
damit **k ≈ 19,4**.

Eine frühere Fassung nannte hier „rund 18 dB Lücke". Diese Zahl mischte zwei
Referenzpunkte und galt zudem für vier gleiche Kondensatoren. Konsistent
gemessen sind es 2,7 dB (gegen 250 Hz) oder 18,3 dB (gegen 20 Hz) — die Spanne
entsteht durch unterschiedliches **Tieftonverhalten** der beiden Kerne, nicht
durch die Resonanz. Belege in [`FILTER_TOPOLOGY.md`](FILTER_TOPOLOGY.md),
Abschnitt „Korrektur". **Die Rangfolge unten stützt sich daher nicht mehr auf
eine dB-Zahl, sondern auf die erreichbare Anschwinggrenze.**

Zweitens: Die Anschwinggrenze ist **frequenzabhängig**. Ob das ZDF-Modell das
von selbst zeigt, ist noch nicht gemessen — das ist der nächste Test, und er
kann scheitern.

### 5 und 8 — das Koppelnetzwerk

Stinchcombe findet in der Schaltung

> „basically five sets of these"

Hochpasswirkungen durch Koppelkondensatoren, **um den Filterkern verteilt**, und
eine Übertragungsfunktion aus vierter Ordnung Tiefpass plus sechs weiteren Polen
und Nullstellen. Er hält die daraus entstehende Spitze bei ~8 Hz für

> „a large contributing factor to the sound of the TB-303 overall"

0.7.2 hat vier Stufen, und zwar **gebündelt vor und hinter** dem Filter statt
zwischen den Leiterstufen. Gemessen liegt am Ausgang bei 8 Hz nichts
(−111,8 dB gegenüber dem Grundton). Der Bereich wird entfernt, nicht geformt.

Einschränkung, die ich nicht überdehne: Ein 65-Hz-Ton regt 8 Hz kaum an. Die
Wirkung liegt im Einschwingen und in der Phase, und belegen ließe sie sich erst
im A/B nach Einbau.

### 7 — Bauteilstreuung

Bergman zum Nachbau:

> „The transistor pairs at the top and bottom of the ladder and the transistors
> next to it with the common emitter connection need to be matched pairs!! Very
> important with this filter."

Wenn Paarung so kritisch ist, dass sie im Nachbau hervorgehoben wird, dann ist
die **Abweichung** davon Teil des Klangs jedes einzelnen Geräts. 0.7.2 rechnet
mit vier identischen Stufen. Das ist der Unterschied zwischen „ein 303" und
„der 303".

### 3 — Filterordnung

Stinchcombe zeigt, dass der Filter vierpolig ist und die verbreitete
18-dB-Angabe daher rührt, dass er sich über weite Teile des Hörbereichs so
verhält. Der Polynomfit in 0.7.2 liefert konstante 18 dB/Okt — im Sperrbereich
also **flacher als die Hardware**. Der topologiehergeleitete Kern misst
−16,2 / −20,7 / −23,1 dB/Okt über drei Oktaven und nähert sich 24. Details in
[`FILTER_TOPOLOGY.md`](FILTER_TOPOLOGY.md).

---

## Was ich in dieser Sitzung nicht belegen konnte

Ehrlichkeitshalber getrennt geführt:

- **Zuordnung der fünf Koppelgruppen zu Bauteilen.** Die Gruppen sind in
  Stinchcombes annotiertem VCF-Ausschnitt markiert, die Einzelwerte je Gruppe
  habe ich noch nicht vollständig zugeordnet.
- **VCO-Topologie** im Detail — Sägezahnkern und Rechteckableitung.
- ~~**VCA-Topologie.**~~ Erledigt: Werte und Summenknoten stehen unter
  „Aus dem x0xb0x abgelesen". **Offen bleibt allein die Zuordnung**, welcher der
  beiden Zweige „from Filter" und welcher „from Reso. Comp." führt.
- **Ausgangsübertrager.** Weder bestätigt noch widerlegt. Ein DAC existiert im
  303, erzeugt aber die Pitch-Steuerspannung (1–5 V), nicht Audio — der
  Audioweg ist durchgehend analog.
- **MEG-/VEG-Zeitkonstanten aus der Schaltung.** Die verwendeten Werte stammen
  aus Open303, sind also gefittet, nicht aus Bauteilen hergeleitet.

Diese Punkte brauchen einen lesbaren Schaltplan oder Messungen an einem Gerät.
Ohne die Werte bleibt jede Modellierung des Koppelnetzwerks eine Schätzung —
und die gehört dann auch so benannt, nicht als Schaltung ausgegeben.

---

---

## Aus dem Schaltplan gelesen

Quelle: TB-303 Service-Zeichnung (Feb. 19, 1982) und die annotierte TD-3-Fassung
(„Original: TB303, Blue: TD3"), beide vom Projektinhaber beigestellt. Damit
entfällt die zuvor notierte Grenze — die Werte sind jetzt belegt, nicht geschätzt.

### Diodenleiter

| Bauteil | Wert | Folge |
|---|---|---|
| C98 | 33 nF | Stufe 1 |
| C99 | 33 nF | Stufe 2 |
| C100 | 33 nF | Stufe 3 |
| **C101** | **18 nF** | **Stufe 4 — Pol um 33/18 höher** |

**Die vier Leiterstufen sind nicht identisch.** Weder Open303 noch ein
generischer ZDF-Diodenleiter bilden das ab; beide rechnen mit vier gleichen
Stufen. Gemessen am Prototyp verschiebt der Unterschied die Resonanzspitze von
1061 auf 1197 Hz und senkt sie bei gleichem k von +19,3 auf +14,4 dB.

Ladertransistoren: im Original 2SC1583-Paare, in der TD-3 sechs DMMT3904W.

### VCA-Accent-Pfad

`R26 = 47 k`, `C26 = 33 nF`, im Plan beschriftet „VCA-ACC modulation".
τ = 1,55 ms — **bestätigt Whittles Angabe** unabhängig.

### Hüllkurve

Zeichnungsvermerk am ENV-Block:

> „DECAY VR MAX T = 2.5 sec.  MIN T = 200 ms"

Der Decay-Bereich ist also **200 ms bis 2,5 s**. ACIDIFY rechnet
`200 · 10^decay` = 200 ms bis 2,0 s — die obere Grenze liegt 25 % zu tief.
Die Kurve ist mit „10 V = 100 %" und 10 % bei T annotiert.

### Potentiometer-Kennlinien

| Regler | Typ | |
|---|---|---|
| VR3 Cutoff | 50 k **(A)** | logarithmisch |
| VR4 Resonance | 50 k **(B)** | **linear** |
| VR5 Env Mod | 50 k (A) | logarithmisch |
| VR6 Env Decay | 1 M (A) | logarithmisch |
| VR7 Accent | 50 k **(B)** | **linear** |

Resonanz und Accent sind **lineare** Potis. ACIDIFY legt auf die Resonanz die
Kennlinie `(1−e^(−3r))/(1−e^(−3))`, also eine Krümmung, die die Hardware an
dieser Stelle nicht hat. Die Krümmung des Höreindrucks entsteht in der
Schaltung, nicht im Regler.

### Weitere abgelesene Werte

`C19 = 1 µF` Filtereingangskopplung · `C79 = C80 = 120 nF` Differenzverstärker
und Ausgangspuffer · `R23 = 20 k`, `R24 = 200 k` Leiterarbeitspunkt ·
VCO-Stimmung 110 Hz bei CV 2,75 V (Taste A), 1 Oktave/Volt.


## Reihenfolge

1. **Resonanzgrenze** (4, 6) — der Kalibrierpunkt ist benennbar (k ≈ 19,4),
   und ohne erreichbare Anschwinggrenze ist der handverlötete Widerstand
   überhaupt nicht darstellbar
2. **Filterkern** (3) — Voraussetzung für 1, Prototyp ist geprüft
3. **Bauteilstreuung** (7) — klein umzusetzen, wirkt auf den Charakter
4. **Koppelnetzwerk** (5, 8) — braucht erst die Bauteilwerte

---

## VCA — der Punkt, an dem ich zweimal falsch abgebogen bin

Aus dem hochauflösenden Serviceplan und der x0xb0x-Dokumentation:

**Der VCA ist ein `IC15 BA662A`** — ein Operational Transconductance
Amplifier, kein Multiplizierer. Seine Verstärkung wird über einen
**Steuerstrom** gesetzt, und er hat eine eigene, tanh-artige
Übertragungskennlinie. Die x0xb0x-Dokumentation nennt den BA662 „one of the
most difficult to source parts from the original 303" und ersetzt ihn durch
einen BA6110 mit vorgeschaltetem Stromspiegel, um das Eingangsverhalten
nachzubilden — die Eingangsstufe ist also klanglich relevant genug, dass ein
Nachbau sie eigens nachbaut.

ACIDIFY multipliziert die Hüllkurve schlicht mit dem Signal. Das ist kein
OTA.

**Die beiden Summenzweige.** Am VCA-Eingang liegen `C21 = 10 nF` und
`C22 = 10 nF` mit `R121` und `R122` — das sind die Bezeichner der
**TB-303-Servicezeichnung**. In der **TD-3-Fassung** heißen dieselben zwei
Zweige `C49` und `C76` mit `R88` und `R100`; dort tragen sie die Beschriftung
„from Filter" und „from Reso. Comp.". Zwei Bezeichnersätze für dieselbe
Funktion auf zwei verschiedenen Platinen — beide Angaben stimmen, sie gehören
nur unterschiedlichen Zeichnungen. Die
Resonanzkompensation ist damit bestätigt **kein Faktor auf das Audiosignal**,
sondern ein zweiter, über ein RC-Glied eingekoppelter Summenzweig. Meine
beiden gescheiterten Einbauversuche haben genau das falsch angenommen.

### Bessere Quelle als Pixellesen

Der **[x0xb0x](https://ladyada.net/make/x0xb0x/)** von Limor Fried ist ein
quelloffener, dokumentierter und lizenzierter Nachbau des 303. Sein
Fabrikationshandbuch und der Mainboard-Schaltplan führen Bauteilwerte im
Klartext.

**Zugriff.** `ladyada.net` liegt hinter Cloudflare und antwortet auf direkte
Abrufe mit HTTP 403 (Challenge-Seite, nicht die Datei). Beide Dokumente sind
über das Internet Archive erreichbar:

- Handbuch: `web.archive.org/web/2018id_/http://ladyada.net/wiki/_media/x0x/x0xb0xfabmanual.pdf`
  (49 Seiten)
- Schaltplan: `web.archive.org/web/2018id_/http://www.ladyada.net/media/x0xb0x/mainboard_beta.png`
  (3152 × 4074, „Mainboard Beta Release 3/8/2005, © 2005 Limor Fried")

Die über das Archiv geholte Handbuchfassung ist **byteidentisch** mit der vom
Projektinhaber beigestellten Kopie — gleiche Länge, gleicher SHA-256
(`5872b63ab542ca5d…`). Der Archivweg ist damit belegt, nicht bloß angenommen.

Quellen: [x0xb0x im Open Music Labs Wiki](http://wiki.openmusiclabs.com/wiki/x0xb0x) ·
[BA662A gegen BA6110 im x0xb0x](https://www.subatomicglue.com/x0xl0g/ba662a-analysis/)

---

## Aus dem x0xb0x abgelesen

Zwei unabhängige Belegstellen: die Stückliste des VCA-Abschnitts
(Handbuch S. 23–26; S. 27 beginnt „Headphone & Mixer", die Abschnittsgrenze ist
also geprüft) und der Mainboard-Schaltplan.

### Die beiden Summenzweige — Werte

| Bauteil | Wert | Quelle |
|---|---|---|
| **R121** | **220 kΩ 5 %** | Stückliste S. 25 + Schaltplan |
| **R122** | **100 kΩ 5 %** | Stückliste S. 25 + Schaltplan |
| **C20** | **10 nF** (`.01uF`, 2A103K) | Stückliste S. 25 + Schaltplan |
| **C21** | **10 nF** (`.01uF`, 2A103K) | Stückliste S. 25 + Schaltplan |
| R124 | 2,2 kΩ | Schaltplan |
| C37 | 10 µF / 16 V | Schaltplan |
| IC15A / IC15B | BA662A / BA6110 (9-SIP) | Stückliste S. 26 |

Der x0xb0x nennt die Kondensatoren **C20 und C21**, nicht C21/C22 — er ist ein
Redesign mit eigener Nummerierung. Die **Werte** stimmen mit der
TB-303-Zeichnung überein (zwei mal 10 nF), die Bezeichner nicht durchgehend.

### Die Topologie — abgelesen, nicht angenommen

Im Schaltplan ist `IC15` als **zwei Symbole eines 9-Pin-SIP** gezeichnet
(Pins 1–6 am OTA-Kern, 7–9 an der Ausgangsstufe). Beide RC-Zweige liegen mit
ihrem **linken Ende am selben Knoten: Pin 3**. An demselben Knoten hängen
`R124 = 2,2 kΩ` und `C37 = 10 µF` gegen Masse — Arbeitspunkt und Entkopplung.

```
   ──[ R121 220k ]──| C21 10n |──┐
                                 ├── Pin 3 (IC15)   ── R124 2k2 ─┬─ C37 10µ ─ GND
   ──[ R122 100k ]──| C20 10n |──┘                                └─ …
```

Damit ist der zweite Summenzweig **im Schaltplan bestätigt**, nicht erschlossen:
zwei wechselspannungsgekoppelte Zweige, die in denselben OTA-Eingang summieren.
Die Gewichtung liegt in den Leitwerten, also `1/220k : 1/100k = 1 : 2,2`
(**6,85 dB**). Die Hochpassecken der Zweige liegen bei
`1/(2π·220k·10n) = 72 Hz` und `1/(2π·100k·10n) = 159 Hz` — beide im Audioband,
beide unterhalb des Grundtonbereichs.

Ebenfalls abgelesen: Der BA6110-Pfad braucht `Q1–Q4` als vorgeschalteten
Stromspiegel, der BA662A-Pfad nicht (Handbuch S. 23: „If you decide to go with
a BA662, do not solder in Q1-4!"). Zwei verschiedene Eingangsstufen für
denselben Steckplatz — die Eingangskennlinie ist also auch im Nachbau eine
bewusste Entscheidung.

### Was damit **nicht** geklärt ist

**Welcher Zweig „from Filter" ist und welcher „from Reso. Comp."** Die
Zuordnung steht in der TD-3-Beschriftung, nicht im x0xb0x; die beiden
Leitungen laufen im x0xb0x-Plan über lange, mehrfach gekreuzte Strecken, und
Pixelverfolgung über solche Distanzen ist genau die Fehlerquelle, die dieses
Projekt schon zweimal bezahlt hat. **Nicht geraten.**

Die Folge ist keine Kleinigkeit: Die Zuordnung entscheidet, ob der
Kompensationszweig 6,85 dB **stärker** oder **schwächer** als der Filterzweig
einkoppelt.

### Befund, der das Ziel korrigiert

Ein **festes** Verhältnis von 2,2 kann keinen **resonanzabhängigen**
Pegelverlust von 24 dB ausgleichen. Das ist keine Messung, sondern ein
Abzählargument: 6,85 dB fester Versatz gegen 24 dB veränderlichen Einbruch.

Dazu kommt: Der Einbruch ist für **jede** gegengekoppelte Tiefpassstruktur
unvermeidlich. Aus `H_zu = H / (1 + k·H)` folgt im Durchlassbereich
(`H ≈ 1`) unmittelbar `H_zu ≈ 1/(1+k)`. Das gilt für den ZDF-Prototyp **und für
die echte Schaltung**. Der Serien-303 dünnt bei hoher Resonanz hörbar aus —
das ist Schaltungsverhalten, kein Modellfehler.

Damit ist die Formulierung „**auszugleichen sind ~24 dB**" als Ziel falsch.
Richtig ist: Der Zweig ist eine **feste, teilweise** Vorwärtseinkopplung. Er
soll den Einbruch **nicht** aufheben. Ein Modell, das ihn aufhebt, hat die
Schaltung nicht getroffen — und zwei freie Parameter gegen die
`dsp_matrix_test`-Schwelle zu stellen wäre wieder Anpassen ans Messergebnis.

**Der Prüfstein für Anlauf 3:** Nach dem Einbau muss der Durchlassbereich bei
maximaler Resonanz **immer noch messbar absinken**, nur weniger als 24 dB.
Kommt er flach heraus, ist die Kompensation zu groß angesetzt.

### Potentiometer — unabhängig bestätigt und ein Widerspruch

Aus der Stückliste, alle Kennlinien im Klartext:

| Regler | x0xb0x | ACIDIFY / TB-303-Zeichnung | |
|---|---|---|---|
| VR4 Resonance | **50 kΩ B (linear), _dual_** | 50 k (B) linear | ✅ |
| VR6 Env Decay | 1 MΩ A (log), _dual_ | 1 M (A) log | ✅ |
| VR7 Accent | 50 kΩ B (linear) | 50 k (B) linear | ✅ |
| VR3 Cutoff | 50 kΩ **D** (log) | 50 k (A) log | ⚠️ |
| VR5 Env Mod | 50 kΩ **D** (log) | 50 k (A) log | ⚠️ |

Zwei Bestätigungen, die zählen:

1. **VR4 ist linear.** Damit ist die Linearisierung aus `e676bd8` aus einer
   zweiten, unabhängigen Quelle belegt.
2. **VR4 ist ein _duales_ Poti.** Das ist die zweite Ebene, die Whittle für den
   Accent-Sweep beschreibt — die Architektur von `processAccentSweep` ist damit
   im Grundsatz bestätigt und nicht nur plausibel. Passend dazu steht im
   Resonanzbereich des Plans `R46 = 47 kΩ`, also der Wert, den Whittle für den
   Zulauf nennt.

**Der Widerspruch:** Whittle beschreibt für den TB-303 ein **100-kΩ**-Poti („a
diode and a 47k resistor in series driving the ACW end of a **100k** pot"),
der x0xb0x verbaut **50 kΩ**. `processAccentSweep` rechnet mit 100 kΩ, folgt
also Whittle. Das ist nicht gleichgültig: Die Potisektion lädt den 1-µF-
Kondensator, die Zeitkonstante hängt direkt am Wert — bei 50 kΩ wäre sie halb
so groß. Da der x0xb0x ein Redesign mit Substitutionen ist, haben Whittle und
die Servicezeichnung für eine **TB-303**-Emulation Vorrang; ACIDIFY bleibt
deshalb bei 100 kΩ. Der Konflikt ist hier festgehalten, nicht stillschweigend
entschieden — er gehört an einem lesbaren Serviceplan geklärt.

Dieselbe Vorsicht bei VR3/VR5: Der x0xb0x nutzt D-Kennlinien, die
TB-303-Zeichnung nennt A. ACIDIFY folgt der Zeichnung.
