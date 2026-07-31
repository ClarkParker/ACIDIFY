# Third-Party Notices

ACIDIFY enthält eigenständige Cmajor-Ports permissiv lizenzierter
DSP-Algorithmen (Airwindows) sowie zitierte Messwerte. Es werden keine
vorkompilierten Fremdbibliotheken eingebunden.

## Open303 — Status seit 2.12.0: Messwertquelle, kein Code

**Im aktuellen Signalweg ist kein Open303-Code und keine
Open303-Kennlinie mehr enthalten.** Filterkern (topologiehergeleitete
ZDF-Diodenleiter), Koppelnetz, Cutoff-/Env-Mod-Abbildung (A-Taper +
Q9-Bias-Netz), Hüllkurvenzeiten, Slide (22 ms, CV-Domäne) und
VCA/OTA-Stufe sind aus den Roland-Serviceschaltplänen hergeleitet
(docs/SOUND_GAP_ANALYSIS.md, docs/HARDWARE_AUDIT.md).

Verbleibend sind **drei zitierte Werte eines echten TB-303**, die über
das Open303-Projekt publiziert wurden und im Quelltext einzeln als
solche markiert sind (Messwerte/Geräte-Fits sind Fakten bzw.
gerätegebundene Kalibrierungen, keine Schöpfung):

| Wert | Stelle | Status |
|---|---|---|
| Rechteck-Duty `46,88 %` + Halbpegel | VCO-Shaper | Anker des 2.13.0-Former-Modells (Form aus Schaltung + Scope hergeleitet; TM5 „WIDTH" ist Werksabgleich, die Duty bleibt Messwert) |
| Accent-VCA-Gewicht `4.0` | ampControl-Pfad | gerätekalibrierter Fit als Anker; die Steuerkette ist vollständig netzverfolgt (2.16.0), aber Sum-/Max-Lesart am Raster nicht eindeutig — die 2.14.0-„Herleitung" (6,0) wurde als überkonfident zurückgenommen |
| Accent-Amp-Release `50 ms` | VCA-Hüllkurve | Messwert-Anker; die Schaltungsherleitung liefert nur ein Intervall (1,55 ms … MEG-Fortlauf, siehe Quelltextkommentar) |

**Historie:** Frühe Stände (bis einschließlich der 0.7.x-Reihe, in der
Repo-Historie enthalten) adaptierten Abbildungen und Konstanten aus
Open303; dafür — und nur dafür — bleibt die folgende Lizenznotiz
erhalten. Referenzstand der damaligen Nutzung:

- Projekt: [RobinSchmidt/Open303](https://github.com/RobinSchmidt/Open303)
- Commit: `313bf0d9ade7c1dcb6b3a74f5ea1780a29d70074`
- Lizenzdatei: `License.txt`, Blob
  `aed797907b4806428d990bf643f7cd31f2fe43ad`
- Verwendete Referenzbereiche:

| Quelldatei | Blob-SHA |
|---|---|
| `Source/DSPCode/rosic_Open303.cpp` | `536b81c687a06b9081f8fec229b31ac5817fb31e` |
| `Source/DSPCode/rosic_Open303.h` | `4d3ce3ae50f830cf94d3dfb20729c1f0d365f321` |
| `Source/DSPCode/rosic_TeeBeeFilter.cpp` | `ad1602648b765b79975f211f6c44a5fa90876f8e` |
| `Source/DSPCode/rosic_TeeBeeFilter.h` | `9dcec99753a18981e9a13e73ea99da99cc659114` |
| `Source/DSPCode/rosic_MipMappedWaveTable.cpp` | `dcaeda6cea52f0b9d82fe3b5694266c4124c3e81` |
| `Source/DSPCode/rosic_BlendOscillator.h` | `ed8bc210a69a18ec325bf214e5da0ca9a319fc0e` |
| `Source/DSPCode/rosic_OnePoleFilter.cpp` | `27fc813897f37d62af5cdd669eda30122f670121` |
| `Source/DSPCode/rosic_BiquadFilter.cpp` | `8e39808cb8e1829626eaa5da386329129552d03a` |
| `Source/DSPCode/rosic_DecayEnvelope.cpp` | `842a0fd0044d4069db92ef0eca37c0484f1c697e` |
| `Source/DSPCode/rosic_DecayEnvelope.h` | `14d313c8eec385a579e7f136390993500f0da7ec` |
| `Source/DSPCode/rosic_AcidPattern.cpp` | `f21e3c4117291c24bb7179eb1a32b63c5cd8aa24` |
| `Source/DSPCode/rosic_AcidPattern.h` | `108185eece868771e843fdf1901ef9339903114e` |
| `Source/DSPCode/rosic_AcidSequencer.cpp` | `dfddda8995e769798a1a9d46a28d004a4a64509f` |
| `Source/DSPCode/rosic_AcidSequencer.h` | `654097d9fd396587b01ab26bf7b6e8d3eba99295` |

Die dort gelisteten Referenzbereiche betrafen den damaligen Stand;
die heutige Nutzung ist ausschließlich die Messwert-Tabelle oben.

### Open303 MIT License

Copyright (c) 2009 Robin Schmidt (www.rs-met.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

## Airwindows

- Geprüfter Bestand:
  [ClarkParker/airwindows](https://github.com/ClarkParker/airwindows)
- Branch: `masterCP`
- Commit: `51a71636fe38bc51cee54861689318ffb7d2e434`
- Funktionsübersicht: `Airwindopedia.txt`, Blob
  `affe5e8ae7c0efdfd8e5fb604b62ca32b8ad0805`
- Lizenz: `LICENSE`, Blob
  `e8feef9bdb417d8662f50cc43e6329c0bd071460`

| Port | Quelldatei | Blob-SHA |
|---|---|---|
| `PURE` | `plugins/LinuxVST/src/PurestDrive/PurestDriveProc.cpp` | `e49485280ffe86b226491308a56ebeb0b8736f95` |
| `MACKIE` | `plugins/LinuxVST/src/Mackity/MackityProc.cpp` | `1d148b30af43e2d564c71fc27fe0a418c8efd676` |

`PURE` übernimmt den pegel- und vorzeichenabhängigen Sinus-Blend von
PurestDrive. `MACKIE` übernimmt Mackitys beide Hochpassanteile, die zwei
19,16-kHz-Biquads und den begrenzten Quintic-Waveshaper. ACIDIFY fasst
Mackitys getrennte Input-Trim-/Output-Pad-Regler in einem Drive-Makro zusammen,
führt die Stufe 4× oversampled aus und lässt Plugin-Dither weg, da innerhalb
eines Float-DSP-Graphen nicht auf ein Integer-Ausgabeformat quantisiert wird.

### Airwindows MIT License

Copyright (c) 2018 Chris Johnson

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Diodenleiter-Referenzumsetzung (Faust)

Die ZDF-Herleitung der Diodenleiter folgt Pirkle (App Note 6, „Virtual
Analog Diode Ladder Filter") mit der Faust-Bibliotheksfunktion
`vaeffects.diodeLadder` von Eric Tarr als Referenzumsetzung
(Faust-Libraries, STK-4.3/MIT-artige Lizenz, lizenzkompatibel; im
Quelltext an der Funktion vermerkt). ACIDIFYs Umsetzung weicht belegt
ab: ungleiche Leiterkondensatoren 33/33/33/18 nF, Koppelnetz in der
Resonanzschleife, frequenzabhängige Dioden-Sättigung, Newton-Schleife.

## ACIDIFY PHONO

`PHONO` ist kein kopierter Fremdalgorithmus. Es modelliert die
recherchierte Standardkette eines Consumer-Phono-Eingangs der
80er/90er (2.15.0, Quellen: TI/National AN-346 „High-Performance
Audio Applications of the LM833"; ESP/Rod Elliott, Project 06;
JRC/TI-Datenblätter 4558/NE5532):

RCA-Eingang → 47-k-Abschluss + Koppel-C (für Line-Pegel wirkungslos)
→ EIN Verstärker (4558-Klasse) mit RIAA-Netzwerk in der Gegenkopplung
(30–40 dB bei 1 kHz, Bass +20 dB) → Sättigung an den Rails →
Ausgangskopplung → Wahlschalter/Tape-Out (flach; dort wurde
aufgenommen). Modelliert als: RIAA-Wiedergabeentzerrung (3180/318/
75 µs) VOR der Sättigung → asymmetrischer Rail-Clip (+1,0/−0,65,
Modellannahme einer einfachen Stufe) → Slew-Limit 1 V/µs
(4558-Datenblatt; am 48-k-Serienmaterial messbar inert, dokumentiert)
→ Koppel-C-Arbeitspunktverschiebung (Blocking, τ = 50 ms,
Modellannahme) → 25-Hz-Infraschallfilter 2. Ordnung. Der
HF-Unity-Gain-Zero der NFB-Stufe liegt oberhalb von 20 kHz und ist
bei 48 kHz Abtastrate außerhalb des Bandes (nicht modelliert,
begründet). Ohne ein festgelegtes und vermessenes Einzelgerät wird
ausdrücklich keine Übereinstimmung mit einem bestimmten Verstärker-
oder DJ-Mixer-Eingang behauptet.
