# Abgleich gegen die Hardware

Nicht gegen Open303 — gegen die Schaltung. Geprüfter Stand: 0.7.2.

Quellen mit Belegkraft:

- **Tim Stinchcombe**, [Analyse des TB-303-Filters](https://www.timstinchcombe.co.uk/index.php?pge=diode2)
  und [Diodenleiter allgemein](https://www.timstinchcombe.co.uk/index.php?pge=diode)
- **Robin Whittle**, [Devil-Fish-Dokumentation zur Accent-Schaltung](https://www.firstpr.com.au/rwi/dfish/303-unique.html)
  und [Devil-Fish-Handbuch](https://www.firstpr.com.au/rwi/dfish/) — das
  Handbuch liegt als PDF vor und beschreibt an mehreren Stellen ausdrücklich
  das **Originalgerät**; nur dort ist es Quelle für den Serienstand, im
  Übrigen beschreibt es einen Mod. Wo beide Whittle-Texte sich widersprechen,
  gilt der ausführlichere (siehe „Der Resonanzpoti-Wert").
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

### Die Zuordnung — verfolgt, nicht ausgelegt

Der TB-303-Serviceplan bestätigt die x0xb0x-Lesung wörtlich: `IC15 BA662A` als
zwei Symbole eines 9-Pin-SIP, `R121` mit `C21 .01`, `R122 100K` mit `C22 .01`,
beide auf **Pin 3**, dazu `R124 2,2K` und `C37 10/16`. Der x0xb0x ist hier ein
netzgleicher Nachbau; nur `C22` heißt dort `C20`.

Welcher Zweig woher kommt, ist mit
[`tools/bench/nettrace.py`](../tools/bench/nettrace.py) **verfolgt** statt
angeschaut. Das Skript zerlegt den Plan in waagerechte und senkrechte Läufe und
verbindet zwei Läufe nur dann, wenn sie sich am **Ende** eines der beiden
berühren (Ecke oder T) oder wenn an einer echten Kreuzung ein **Knotenpunkt**
sitzt — geprüft über die Füllung einer Scheibe abseits beider Linienachsen.
Genau diese Unterscheidung macht Augenverfolgung über lange Strecken
unzuverlässig, und sie ist die Fehlerquelle, die dieses Projekt zweimal
bezahlt hat.

Ergebnis: **zwei getrennte Netze** (keine gemeinsamen Läufe), beide enden am
**Resonanzpoti VR4 50K(B)** — aber an verschiedenen Punkten:

| Zweig | Gewicht | Abgriff an VR4 | Signal |
|---|---|---|---|
| **R121 = 220 kΩ** + C21 | 1/220k | **festes Ende** | resonanzunabhängig |
| **R122 = 100 kΩ** + C22 | 1/100k | **Schleifer** | **∝ Reglerstellung** |

Damit ist die Zuordnung keine Auslegung mehr:

- **R121 (220 k) = „from Filter"** — greift das feste Potiende ab, also das
  Filtersignal in voller Höhe, unabhängig von der Resonanzstellung.
- **R122 (100 k) = „from Reso. Comp."** — greift den **Schleifer** ab. Sein
  Beitrag wächst mit der Reglerstellung: bei Resonanz null trägt er nichts bei,
  bei Vollausschlag am meisten.

**Das ist die Kompensation, und sie fällt aus der Topologie an.** Der
Pegeleinbruch wächst mit der Resonanz — und genau mit der Resonanz wächst auch
der Anteil, den der Schleiferzweig dazusummiert. Es braucht keine
resonanzabhängige Ankopplung von Hand; ein Poti-Schleifer als zweiter Abgriff
erzeugt sie.

**Unabhängige Bestätigung.** Die x0x-VCF-Mods-Seite führt einen Mod von
Nutzer `bcbox`:

> „you can increase resonance feedback by changing C21 and R122. Replace R122
> with 68k … **The sound level will stay more constant as you increase
> resonance — not so much of a drop off.**"

`R122` von 100 k auf 68 k senken heißt: Leitwert des **Schleiferzweigs** um den
Faktor 1,47 erhöhen. Die berichtete Wirkung — der Pegel fällt bei steigender
Resonanz weniger ab — ist genau das, was dieser Zweig laut Topologie tut. Eine
Beobachtung, die aus einer anderen Richtung kommt und dieselbe Zuordnung
stützt. (Der Mod nennt `C21` statt `C22`; die Bezeichner sind dort quer
gegriffen, der Widerstand ist eindeutig.)

Dieselbe Verfolgung klärt nebenbei die **zweite Ebene** des dualen Potis:
`D24 (1N4148)` und `R46 = 47 kΩ` treiben das eine Ende, `C13 = 1 µF/50 V`
hängt gegen Masse am anderen. Das ist Whittles Accent-Sweep-Netz, Bauteil für
Bauteil — und es bestätigt den 47-k-Zulauf sowie den **50-k**-Potiwert direkt
aus der Schaltung.

### Befund, der das Ziel korrigiert

**Korrektur an einer früheren Fassung dieses Abschnitts.** Hier stand, ein
**festes** Gewichtsverhältnis von 2,2 könne einen resonanzabhängigen Einbruch
nicht ausgleichen. Das Abzählargument war richtig — die **Annahme** war falsch:
Es galt nur, solange beide Zweige pegelfeste Signale führen. Die Netzverfolgung
zeigt, dass `R122` am **Schleifer** hängt. Der Zweig ist damit sehr wohl
resonanzabhängig, und zwar ohne dass es hineingeschrieben werden müsste.

Was **bestehen bleibt**: Der Einbruch selbst ist für jede gegengekoppelte
Tiefpassstruktur unvermeidlich. Aus `H_zu = H / (1 + k·H)` folgt im
Durchlassbereich (`H ≈ 1`) unmittelbar `H_zu ≈ 1/(1+k)`. Das gilt für den
ZDF-Prototyp **und für die echte Schaltung**. Der Serien-303 dünnt bei hoher
Resonanz hörbar aus — Schaltungsverhalten, kein Modellfehler.

Was **neu** ist: Die Kompensation folgt der Reglerstellung **linear** (der
Schleifer teilt linear, VR4 ist B-Kennlinie), der Einbruch dagegen der Form
`1/(1+k)`. Zwei verschiedene Gesetze. Sie können sich nicht über den ganzen
Weg aufheben — die Kompensation bleibt also **teilweise**, aber sie ist
**mitlaufend** statt fest.

Damit ist die Formulierung „**auszugleichen sind ~24 dB**" weiterhin als Ziel
falsch, nur aus einem anderen Grund als zuerst notiert: nicht weil die
Kompensation zu klein wäre, sondern weil sie einem anderen Gesetz folgt als der
Einbruch. Ein Modell, das den Durchlassbereich flach herausbringt, hat die
Schaltung nicht getroffen.

**Der Prüfstein für Anlauf 3, unverändert gültig:** Nach dem Einbau muss der
Durchlassbereich bei maximaler Resonanz **immer noch messbar absinken**, nur
weniger als 24 dB. Kommt er flach heraus, ist die Kompensation zu groß
angesetzt — und ein Faktor, der ihn flach macht, wäre Anpassen an die
Testschwelle.

**Zusatzprüfstein, der jetzt möglich ist:** Bei Resonanz **null** darf der
Kompensationszweig **nichts** beitragen (Schleifer am unteren Anschlag). Ein
Modell, das dort schon kompensiert, hat den Abgriff falsch angesetzt.

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

**Der Widerspruch — inzwischen entschieden, siehe unten.** Whittles
303-unique-Seite nennt ein **100-kΩ**-Poti („a diode and a 47k resistor in
series driving the ACW end of a **100k** pot"), der x0xb0x verbaut **50 kΩ**.
`processAccentSweep` folgte der 100-k-Angabe.

Dieselbe Vorsicht bei VR3/VR5: Der x0xb0x nutzt D-Kennlinien, die
TB-303-Zeichnung nennt A. ACIDIFY folgt der Zeichnung.

---

## Der Resonanzpoti-Wert — entschieden, mit Folge im DSP

Das **Devil-Fish-Handbuch** (Whittle, S. 28, Abschnitt „Replacements for the 6
small TB-303 pots") beendet den Widerspruch. Derselbe Autor, ausführlicher und
ausdrücklich über das **Originalteil**:

> „The Resonance pot is a **dual 50k** pot, with a **linear** taper, which is
> **‚B'** in the arcane world of potentiometer nomenclature. So **‚50KB' is the
> label of the original** and the replacement pots."

Der Satz steht in einem Erfahrungsbericht über Ersatzpotis, die er als
nicht-linear zurückweist — er kennt das Originalteil in der Hand. Das wiegt
schwerer als die beiläufige Angabe auf der 303-unique-Seite.

**Damit stehen zwei unabhängige Quellen auf 50 kΩ**: Devil-Fish-Handbuch und
x0xb0x-Stückliste. Die 100-k-Angabe ist der Ausreißer — und zwar gegen Whittles
eigenen, ausführlicheren Text. ACIDIFY folgte bis hierher dem Ausreißer.

Der Beleg liefert obendrein die **dritte** unabhängige Bestätigung der linearen
B-Kennlinie und der **dualen** Ausführung.

### Folge im DSP

`processAccentSweep` rechnete mit `100.0f * potPosition`. Der Kondensator lädt
über den Potiabschnitt, der Wert sitzt also direkt in der Zeitkonstante.
Gemessen an der Differenzengleichung des Modells, Sprungantwort auf
63 % des Endwerts:

| Potistellung | 100 kΩ (bisher) | 50 kΩ (belegt) | Faktor | Endwert |
|---:|---:|---:|---:|---|
| 0,25 | 116,8 ms | 74,8 ms | 1,56× | 0,581 → 0,627 |
| 0,50 | 99,2 ms | 66,8 ms | 1,48× | 0,508 → 0,581 |
| 0,72 | 82,3 ms | 59,3 ms | 1,39× | 0,457 → 0,546 |
| 0,90 | 67,8 ms | 52,9 ms | 1,28× | 0,422 → 0,521 |

**Nicht** exakt der Faktor 2, und das ist der Prüfstein dafür, dass hier ein
Netzwerk gerechnet wird und kein Zeitglied: Nur das Poti skaliert, die 47 kΩ
und der Summenwiderstand bleiben stehen. Ein reines RC-Glied hätte glatt
halbiert. Der Endwert steigt aus demselben Grund mit.

Die Resonanzabhängigkeit der Ladezeit bleibt erhalten — sie fällt weiter aus
der Knotenanalyse an und ist nicht angekoppelt.

**Unverändert, weil unbelegt:** der `100 kΩ`-Summenwiderstand (`gMix`) stammt
ebenfalls von der 303-unique-Seite und ist bisher aus keiner zweiten Quelle
bestätigt. Er bleibt stehen, bis ein Beleg vorliegt — eine Anpassung „weil das
andere sich auch geändert hat" wäre Anpassen ohne Quelle.

Quelle: Robin Whittle, *Devil Fish Manual*, S. 28. Das Handbuch beschreibt im
Übrigen einen **Mod**; für den Serienstand gilt es nur dort, wo es
ausdrücklich das Originalgerät beschreibt — wie an dieser Stelle.

---

## Offene Spannung: wie weit unter der Anschwinggrenze liegt der Serienstand?

Aus demselben Handbuch, S. 5, über den Resonanz-Mod:

> „The range of the Resonance control can be switched to **double the usual
> feedback** so as to allow the filter to self-oscillate at mid and high
> frequencies."

Das steht in Spannung zur Angabe, auf der die bisherige Kalibrierung beruht
(303-unique-Seite):

> „…chosen to tweak the feedback level to **just under that required for
> self-oscillation**"

**Die beiden Aussagen liefern zwei verschiedene Kalibrierpunkte.** Ist der
Serienstand „knapp unter" der Grenze, gehört maximale Resonanz an das gemessene
`k ≈ 19,4`. Reicht dagegen erst die **Verdopplung**, um Anschwingen zu
ermöglichen, läge der Serienstand eher bei `k ≈ 9,7` — ein Faktor 2 im
Resonanzgesetz, also kein Detail.

Auflösen lässt sich das hier **nicht**, und zwar aus zwei Gründen:

1. Beide Sätze stammen von Whittle, keiner ist beiläufiger als der andere.
   Sie sind formal vereinbar („knapp unter" bei mittleren Frequenzen, die
   Verdopplung schafft Reserve über den ganzen Bereich), aber die Vereinbarkeit
   legt keinen Zahlenwert fest.
2. Das `k` des ZDF-Modells ist **nicht** dasselbe wie „feedback level" in der
   Schaltung. Eine Verdopplung des Rückkopplungswiderstandsverhältnisses
   verdoppelt `k` nicht notwendigerweise. Die beiden Skalen erst
   gleichzusetzen und dann daraus einen Kalibrierpunkt abzuleiten, wäre genau
   die Referenzpunkt-Vermischung aus Regel 3.

### Auflösung — Drittbeleg aus dem Nachbau

Die x0x-VCF-Mods-Seite gibt der „knapp unter"-Lesart deutlich mehr Gewicht.
Im x0xb0x setzt `R97` die Resonanzstärke; ab Werk **10 kΩ**. Aus der Mod-Seite:

> „r46 = jumper / **r97 = 8.2k**" — Vorschlag, „for making a x0xb0x sound
> **just like a 303**", bestätigt von einem zweiten Nutzer mit dem Zusatz:
> „you tend to get **self resonance at the (very) top end**"

Zwei Aussagen in einer: Der Wert, der einen x0xb0x wie einen 303 klingen lässt,
liegt so, dass der Filter **am obersten Ende gerade anschwingt**. Das ist
„knapp unter der Anschwinggrenze" — mit dem Zusatz, dass die Grenze am oberen
Frequenzende bereits überschritten wird, genau wie Whittles „only self oscillate
at mid and high frequencies" es beschreibt.

Die „Verdopplung" des Devil Fish ist damit kein Widerspruch: Sie schafft
Reserve, damit der Filter über **mittlere und hohe** Frequenzen zuverlässig
anschwingt, statt nur ganz oben zu kippen.

**Konsequenz:** Der Kalibrierpunkt gehört an die obere Grenze, nicht auf die
Hälfte. `k ≈ 19,4` bleibt der Arbeitswert und ist damit **gestützt** statt nur
abgeleitet.

Belegkraft ehrlich eingeordnet: Das ist eine **Hörangabe aus einem Forum**,
kein Messwert und kein Schaltplanwert. Sie widerlegt die Halbierungs-Lesart
plausibel, sie legt aber keine Zahl fest. Ein abgelesener Wert des
handverlöteten Widerstands bliebe der bessere Beleg.

Vermerkt, weil es sonst wie ein festgelegter Wert aussähe: In
[`FILTER_TOPOLOGY.md`](FILTER_TOPOLOGY.md) steht `k = 19,4` als
„← Kalibrierpunkt" in der Messtabelle. Die **Messung** stimmt; die
**Zuordnung** zum Serienstand ruht auf Whittle plus dieser Nachbaubeobachtung.


---

## Belegte Randbedingung für die Cutoff-Abbildung

Devil-Fish-Handbuch, Versionsnotiz 2.1C, über eine Anpassung am **Mod**:

> „Internal adjustment to ensure that the maximum resonant filter frequency
> (no Env Mod, Filter Tracking or external CV In) is 5 kHz — **an octave above
> the standard frequency of the TB-303**."

Der Serienstand endet damit bei **2,5 kHz**. ACIDIFY rechnet oben
`2394,412 Hz` — aus Open303, also gefittet, und 4 % daneben.

Bemerkenswert: „maximum **resonant** filter frequency" ist genau die Größe, die
der Modellparameter seit der Kalibrierkorrektur führt (`peakToParameter`
entfiel, weil der Parameter mit dem Koppelnetz in der Schleife die hörbare
Spitze *ist*).

**Noch nicht eingesetzt, und zwar mit Grund.** `baseCutoff` geht nicht direkt in
die Eckfrequenz ein, sondern über
`instantaneousCutoff = baseCutoff · 2^(envScaler·(env − envOffset))`, und
`envScaler`/`envOffset` sind Open303-Polynome. Bei Env Mod null liefert
`envScaler` dort **0,864 statt 0** — es bleibt also eine Restmodulation, die es
in der Schaltung nicht geben dürfte. Den oberen Endwert an einer Stelle
festzunageln, während die Abbildung darum herum gefittet bleibt, verschöbe den
Fehler nur.

Die 2,5 kHz sind damit eine **belegte Randbedingung**, an der sich die
Neuherleitung der Cutoff-Abbildung messen lassen muss — nicht eine Konstante,
die man einzeln austauscht. Das untere Ende der Reglerspanne ist in keiner
Quelle genannt; `313,8 Hz` bleibt unbelegt.
