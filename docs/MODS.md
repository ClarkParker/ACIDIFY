# MODs — Übergabe an die GUI-Session (Claude Design)

**Stand: KEIN Mod ist im DSP eingebaut.** ACIDIFY 1.0.x bildet den
unmodifizierten Serien-303 ab; das war die Vorgabe („für später"). Dieses
Dokument ist die Übergabe: Pro Mod steht, was die Schaltung sagt, welche
DSP-Änderung nötig ist (Datei/Konstante) und welches GUI-Element fehlt.
Jeder neue Regler bricht den 50-Parameter-Vertrag — das ist die zentrale
Design-Entscheidung der GUI-Session.

## Einbaufertig (DSP-Änderung ist ein Konstantentausch)

| Mod | Schaltungsbasis | DSP-Änderung | GUI-Bedarf |
|---|---|---|---|
| **Filter Overdrive** (Devil Fish) | `R62` 220 k → 3,3 k, stufenlos = 1…66,6-fache Übersteuerung der Leiter | `ladderDriveRef` in `processLadder` mit Faktor 1…66,6 multiplizieren — exakt die vorhandene Konstante | 1 Knob (log), Default 1× |
| **Resonance Boost** (x0x-Wiki: `R97` 10 k → 8,2 k, „just like a 303", „self resonance at the (very) top end") | Rückkopplungswiderstand kleiner → k um 10/8,2 = 1,22 höher | `kMax` in `processLadder` × 1,22 → 21,5, liegt **über** der Anschwinggrenze 19,5: Selbstoszillation oben wird real | 1 Toggle |
| **Erweiterter Cutoff** (Devil Fish) | Maximum 5 kHz statt 2,5 kHz („an octave above") | `highCutoff` in `updateFilterMapping` 2500 → 5000 | Toggle oder Range-Schalter |
| **Env Mod ×3** (Devil Fish) | „The Env Mod pot range has been tripled and made to include no Envelope Modulation" | `octaves`-Spanne ×3, Nullpunkt einschließen | erweiterte Skala am bestehenden Regler |
| **Slide Time** (Devil Fish) | Serie: τ = 22 ms fest (100 k DAC × 0,22 µF); DF macht den Widerstand regelbar | `glideCoeff`-τ als Parameter statt Konstante | 1 Knob |
| **Gerätestreuung / Varianten** | Kondensatoren ±10 % (Codes `2A333K`…), gemessen: ±10 % an den Leiter-Caps = **171 Cent** Resonanzverschiebung | `cap1…cap4` in `processLadder` — vier Zahlen, ein Edit | Produktentscheidung: pro Instanz/Preset/Note gewürfelt? Ziehung speichern? Verteilung (selektierte Ware hat ein Loch in der Mitte)? |

## Braucht DSP-Arbeit (mehr als Konstantentausch)

| Mod | Basis | Aufwand |
|---|---|---|
| **Soft Attack** (Devil Fish) | VCA-Attack 0,5…30 ms regelbar statt fest | Attack-Stufe in die VCA-Hüllkurve (Halte-/Rampenlogik existiert seit 1.0.1) |
| **Muffler/Bass** (Devil Fish) | 32 Hz: −5 dB Serie → −1 dB DF (Ausgangskopplung) | Koppel-Hochpass am Ausgang parametrisieren |
| **VCF External In** (x0x-Wiki) | Externes Audio in die Leiter | neuer Audio-Eingang im Graph |

## Messwerte für die Varianten-Funktion (belegt)

- Kondensatoren ±10 % (`K`-Codes), Widerstände ±5 %, Transistorpaarung 0,3 mV Vbe = 1,16 % Strom
- Die Caps dominieren die Paarung um ~10× — Streuung ohne Cap-Variation träfe die falsche Größe
- 10 Ziehungen ±10 %: Resonanzspitze 732…809 Hz (171 Cent), Höhe +8,8…+10,0 dB (`tools/bench/spread`)

## Unausgewertet

[TB-303-Archiv (hyperreal)](http://machines.hyperreal.org/manufacturers/Roland/TB-303/) ·
weitere Devil-Fish-Funktionen (Accent-Sweep-Regler, Gate-LED u. a.), nur wo das
Handbuch das Original beschreibt auch für den Serienstand relevant.
