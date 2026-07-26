# Abgleich gegen die Hardware

Nicht gegen Open303 — gegen die Schaltung. Geprüfter Stand: 0.7.2.

Quellen mit Belegkraft:

- **Tim Stinchcombe**, [Analyse des TB-303-Filters](https://www.timstinchcombe.co.uk/index.php?pge=diode2)
  und [Diodenleiter allgemein](https://www.timstinchcombe.co.uk/index.php?pge=diode)
- **Robin Whittle**, [Devil-Fish-Dokumentation zur Accent-Schaltung](https://www.firstpr.com.au/rwi/dfish/303-unique.html)
  und [Devil-Fish-Handbuch](https://www.firstpr.com.au/rwi/dfish/)
- **Eddy Bergman**, [Nachbau des TB-303-VCF](https://www.eddybergman.com/2025/03/TB303-VCF.html)

Open303 ist hier **keine** Quelle. Es ist selbst ein Modell und teilt mehrere der
unten stehenden Lücken.

---

## Ergebnis

| # | Stufe | Original laut Quelle | Stand 0.7.2 | |
|---|---|---|---|---|
| 1 | Accent-Sweep | RC-Netz an der zweiten Poti-Ebene, Ladung bleibt über Notengrenzen | Knotenanalyse mit Leitwerten, Diodenzustand, Kondensatorstrom | ✅ |
| 2 | Ausgangs-Koppelstufen | Allpass, Notch, Hochpass | vorhanden | ✅ |
| 3 | Filterordnung | vierpolig, im Hörbereich ~18 dB/Okt | Polynomfit, konstant 18 dB/Okt | ⚠️ |
| 4 | Resonanzgrenze | handverlöteter Widerstand, **knapp unter** Anschwingen | Maximum +17,2 dB, weit darunter | ❌ |
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
**dicht an** die Anschwinggrenze, nicht weit darunter. Gemessen liegt 0.7.2 bei
+17,2 dB Spitze; der topologiehergeleitete Kern erreicht bei k = 16,5 bereits
+35,7 dB und schwingt erst bei 17,0 an. Die Lücke beträgt rund 18 dB.

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

- **Einzelne Kondensatorwerte des Koppelnetzwerks.** Die verfügbaren
  Schaltpläne (schematicheaven, experimentalistsanonymous) sind Rasterscans ohne
  Textebene; Stinchcombe nennt die Werte auf der Analyseseite nicht.
- **VCO-Topologie** im Detail — Sägezahnkern und Rechteckableitung.
- **VCA-Topologie.** Whittle beschreibt nur den Accent-Zulauf (47 k / 0,033 µF).
- **Ausgangsübertrager.** Weder bestätigt noch widerlegt. Ein DAC existiert im
  303, erzeugt aber die Pitch-Steuerspannung (1–5 V), nicht Audio — der
  Audioweg ist durchgehend analog.
- **MEG-/VEG-Zeitkonstanten aus der Schaltung.** Die verwendeten Werte stammen
  aus Open303, sind also gefittet, nicht aus Bauteilen hergeleitet.

Diese Punkte brauchen einen lesbaren Schaltplan oder Messungen an einem Gerät.
Ohne die Werte bleibt jede Modellierung des Koppelnetzwerks eine Schätzung —
und die gehört dann auch so benannt, nicht als Schaltung ausgegeben.

---

## Reihenfolge

1. **Resonanzgrenze** (4, 6) — größte messbare Lücke, Kalibrierpunkt ist bekannt
2. **Filterkern** (3) — Voraussetzung für 1, Prototyp ist geprüft
3. **Bauteilstreuung** (7) — klein umzusetzen, wirkt auf den Charakter
4. **Koppelnetzwerk** (5, 8) — braucht erst die Bauteilwerte
