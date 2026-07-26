# MODs — eingebaut, Übergabe an Claude Design

**Stand 1.1.0: Fünf Mods sind im DSP eingebaut und gemessen.** Alle Defaults =
Serienstand (Smoke-Peak bit-identisch 0,34552 bei allen Mods aus). Jeder Mod hat
ein klares Enable; Amount-Regler wirken nur bei Enable = an, damit man
Einstellungen vorhalten und per Toggle A/B-vergleichen kann.

## Parameter für das Mod-Overlay

| Param | Name | Typ | Default | Wirkung | Wirkungsnachweis |
|---|---|---|---|---|---|
| `param51` | Overdrive | Toggle | **Aus** | DF Filter Overdrive (R62 220k→3,3k) | Crest 12,16 → 10,79 bei 66,6× |
| `param52` | Overdrive Amount | 0…1, Schritt 0,001 | 0,3 (= 3,5×) | Faktor = 66,6^v auf den Leiter-Drive | — |
| `param53` | Resonance Boost | Toggle | **Aus** | x0x R97 10k→8,2k ⇒ k×1,2195 | Selbstoszillation bei voller Resonanz: nachgewiesen |
| `param54` | Cutoff Range | Toggle | **Aus** | Maximum 2,5 kHz → 5 kHz (DF) | Schwerpunkt 2975 → 5074 Hz |
| `param55` | Env Mod ×3 | Toggle | **Aus** | Env-Mod-Spanne verdreifacht (DF) | — |
| `param56` | Slide Time | Toggle | **Aus** | DF-Slide-Poti in Reihe zum 100k-DAC | f nach Slide-Start 252 → 156 Hz |
| `param57` | Slide Time Amount | 0…1, Schritt 0,001 | 0 (= 22 ms) | τ = 22 + 110·v ms (bis 132 ms, 500k-Poti) | — |
| `param58` | Soft Attack | Toggle | **Aus** | DF Soft Attack am VCA-Steuerknoten (wirkt auf Hüllkurve UND Accent) | Attack-Energie 1,71 → 0,47 |
| `param59` | Soft Attack Amount | 0…1, Schritt 0,001 | 0,25 (= 1,4 ms) | τ = 0,5·60^v ms (0,5…30 ms, DF-Spanne) | — |

Anzeigeformate stehen schon in `ACIDIFYUI.js` (`ACIDIFY_GLOBALS`): Overdrive
als `x`-Faktor, Slide/Attack in ms. Die Einträge sind registriert und
preflight-konsistent; **das Overlay-Layout ist der Part von Claude Design** —
die Controls bauen sich automatisch, sobald DOM-Knoten mit
`data-param="param51"`… existieren (`_buildControls` überspringt Einträge ohne
Knoten).

Hinweis Preflight: 59 Parameter lösen die dokumentierte Warnung aus („Amorph
documents 50 as the supported limit. More is field-tested to work (a shipped
plugin runs 80+)"). Bewusst akzeptiert.

## Nicht eingebaut (Design-/Produktentscheidung nötig)

| Mod | Grund |
|---|---|
| **Gerätestreuung / Varianten** (±10 % Caps = 171 Cent, `tools/bench/spread`) | Würfel-Semantik ist Produktfrage: pro Instanz/Preset/Note? Ziehung speichern? DSP-seitig sind es vier Konstanten (`cap1…cap4`) |
| **Muffler/Bass** (DF: 32 Hz −5 dB → −1 dB) | Ausgangskopplung noch nicht als eigene Stufe modelliert |
| **VCF External In** (x0x) | braucht neuen Audio-Eingang im Graph |

## Quellen

Devil-Fish-Handbuch (Whittle) · x0x-VCF-Mods (ladyada) ·
[TB-303-Archiv (hyperreal)](http://machines.hyperreal.org/manufacturers/Roland/TB-303/) — Letzteres unausgewertet.
