# Mods und Gerätevarianten — Material für später

**Nicht Teil des Serienstands.** ACIDIFY bildet den unmodifizierten TB-303 ab;
alles hier beschreibt gewollte oder gefertigungsbedingte Abweichungen davon.
Dieses Dokument sammelt, was dafür schon belegt ist.

---

## Bauteilstreuung — belegte Bänder und gemessene Wirkung

Für den Serienstand ausdrücklich **nicht** umgesetzt: Ein Bauteil hat einen
Sollwert, Toleranz ist ein Fertigungsmangel, und die Selektion ist da, um ihn zu
beseitigen. Begründung in
[`HARDWARE_AUDIT.md`](HARDWARE_AUDIT.md#punkt-7-war-falsch-gestellt).

Für eine **Varianten-Funktion** („dieses Gerät klingt anders als jenes") ist das
Material aber vollständig da.

### Toleranzbänder, belegt

| Bauteilgruppe | Band | Quelle |
|---|---|---|
| Kondensatoren, alle | **±10 %** | Stückliste: Codes enden auf `K` (`2A333K`, `2A183K`, `2A103K`, …) |
| Widerstände, alle | **±5 %** | Stückliste: „220K 5% resistor" usw. |
| Transistorpaarung Leiter | **0,3 mV** Vbe | Bergman, TB-303-VCF-Nachbau |
| Matcher-Schaltungen, üblich | ±1,5 mV Vbe | Musicfromouterspace u. a. |
| DAC-Widerstände R74–R90 | **0,1 % selektiert** | TB-303-Zeichnung, Vermerk „MATCHED PAIR .1% SELECTED" |

### Umrechnung Vbe → Strom

`ΔI/I = exp(ΔV/V_T) − 1`, mit `V_T = 26 mV`:

| ΔVbe | Stromabweichung |
|---:|---:|
| 0,3 mV | **1,16 %** |
| 1,5 mV | 5,9 % |

### Gemessene Wirkung

Zehn Ziehungen, jeder Leiterkondensator unabhängig ±10 %, Messstand
`tools/bench/spread`:

| | Spanne |
|---|---|
| Resonanzspitze | 732,4 … 808,6 Hz = **171 Cent** |
| Spitzenhöhe | +8,80 … +10,01 dB |

### Der Befund, der die Bastlerweisheit umdreht

Die Kondensatortoleranz (±10 %) dominiert die Transistorpaarung (1,16 %) um
fast das **Zehnfache**. Die Paarung sichert den **Arbeitspunkt** der Leiter,
nicht die Lage der Eckfrequenzen — dort entscheidet die Kondensatorgüte.

Für eine Varianten-Funktion heißt das: Die hörbare Gerätestreuung kommt aus den
Kondensatoren. Transistorstreuung zu modellieren, ohne die Kondensatoren zu
variieren, träfe die falsche Größe.

### Umsetzung, falls gewünscht

Im DSP stehen die vier Leiterkondensatoren als benannte Konstanten beieinander
(`cap1` … `cap4` in `processLadder`) — vier Zahlen, ein Edit. Offen wären dann
nur noch Produktentscheidungen, keine Schaltungsfragen:

- pro Instanz, pro Preset oder pro Note gewürfelt?
- bleibt die Ziehung beim Speichern erhalten?
- gleichverteilt oder mit Loch in der Mitte (selektierte Ware ist typischerweise
  **nicht** gleichverteilt, weil die engen Exemplare aussortiert wurden)?
- eigener Parameter — und damit Bruch des 50-Parameter-Vertrags mit der UI?

---

## Weiteres Material

- [TB-303-Archiv auf machines.hyperreal.org](http://machines.hyperreal.org/manufacturers/Roland/TB-303/)
  — Sammlung von Mod-Unterlagen, noch nicht ausgewertet.
- [x0x-VCF-Mods](https://www.ladyada.net/wiki/x0x/vcfmods) — Resonance Boost
  (`R97` 10 k → 8,2 k lässt einen x0xb0x „just like a 303" klingen und bringt
  „self resonance at the (very) top end"), Filter Overdrive, VCF External In.
- **Devil Fish** (Whittle) — verdoppelte Resonanz-Rückkopplung, Filter Tracking,
  Overdrive bis 66,6-fach, Slide-Time-Regler, Soft Attack. Das Handbuch liegt
  vor; für den Serienstand gilt es nur, wo es ausdrücklich das Originalgerät
  beschreibt.
