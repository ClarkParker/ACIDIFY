# Stabiler Parametervertrag

Parameter werden nach Veröffentlichung nicht umnummeriert oder umgedeutet. Neue
Parameter werden ausschließlich angehängt.

| ID | Funktion | Bereich | Initial |
|---|---|---:|---:|
| `param1` | Tuning | −1…+1 st | 0 |
| `param2` | Cutoff | 0…1 | 0.45 |
| `param3` | Resonance | 0…1 | 0.72 |
| `param4` | Env Mod | 0…1 | 0.68 |
| `param5` | Decay | 0…1 | 0.45 |
| `param6` | Accent | 0…1 | 0.65 |
| `param7` | Waveform | 0 Saw / 1 Square | 0 |
| `param8` | Volume | −36…0 dB | −6 |
| `param9` | Tempo | 40…300 BPM, 0,01 BPM Auflösung | 128 |
| `param10` | Run | 0/1 | 0 |
| `param11` | Pattern Length | 1…16 | 16 |
| `param12` | Root Note | MIDI 24…60 | 36 |
| `param13..28` | Step 1..16 Pitch | 0…24 st | siehe DSP |
| `param29..44` | Step 1..16 Flags | 0…7 | siehe DSP |
| `param45` | Distortion Enable | 0/1 | 0 |
| `param46` | Distortion Type | 0…2 | 0 |
| `param47` | Distortion Drive | 0…1 | 0.35 |
| `param48` | Distortion Mix | 0…1 | 1 |
| `param49` | Clock Mode | 0 Internal / 1 DAW | 0 |
| `param50` | Swing | 0…100 % | 0 |
| `param51..59` | Circuit Mods | siehe `docs/MODS.md` | Serienstand |
| `param60` | Power | 0 Bypass / 1 On | 1 |
| `param61` | Arp Mode | 0 Off / 1…15 Figuren / 16 Phrase (siehe unten) | 0 |
| `param62` | Arp Octaves | 1…4 | 1 |
| `param63` | Arp Hold | 0/1 | 0 |
| `param64` | Arp Phrase | 0 Pattern / 1…90 Phrasen-Bank | 0 |

Flag-Bits:

| Bit | Wert | Bedeutung |
|---|---:|---|
| 0 | 1 | Gate |
| 1 | 2 | Accent |
| 2 | 4 | Slide zum nächsten aktiven Step |

Distortion-Typen:

| Wert | Modus | Bedeutung |
|---:|---|---|
| 0 | `PURE` | Airwindows PurestDrive, subtil und pegelabhängig |
| 1 | `MACKIE` | Airwindows Mackity, pre-VLZ-1202-Eingangspfad |
| 2 | `PHONO` | generische RIAA-Wiedergabekurve plus Eingangsübersteuerung |

`param45..param48` wurden in 0.5.0 ausschließlich angehängt. `param49` wurde in
0.6.0 ebenfalls append-only ergänzt; der Initialwert `Internal` bewahrt das
Verhalten älterer Presets. Seit 0.6.1 dienen `param9` und `param10` in
`DAW`-Stellung außerdem als sichere Fallbacks: `param9` bleibt wirksam, bis
Host-Tempo empfangen wird; `param10`, bis Host-Transport empfangen wird. Die
beiden Übernahmen sind unabhängig.

Seit 0.6.4 spiegelt die UI ein empfangenes DAW-Tempo bei aktivem Sync zusätzlich
in `param9`; der DSP hält denselben Wert intern fest. Beim Wechsel zurück auf
`Internal` bleibt deshalb das letzte Hosttempo erhalten. Die normale
UI-Schrittweite beträgt 0,1 BPM, mit `Shift` 0,01 BPM.

`param60` wurde in 2.3.0 append-only ergänzt (POWER-Taste im Brand-Panel der
Design-Vorlage): 0 blendet den Instrumentausgang mit der normalen
Parameterglättung auf Stille, 1 ist Serienstand — ältere Presets ohne den
Parameter bleiben unverändert hörbar.

`param61..63` wurden in 2.4.0 append-only ergänzt (Arpeggiator, dritter
Modus im CLASSIC/STUDIO/ARP-Schalter). Bei `Arp Mode > 0` liefert der Pool
der gehaltenen MIDI-Noten die Tonhöhen; die 16 Pattern-Steps bleiben
Taktgeber und liefern Gate, Accent und Slide (Rest-Steps pausieren den
Arp-Zeiger). Up-Down wiederholt die Endpunkte nicht; Random ist ein
Lehmer-LCG mit festem Seed (reproduzierbar, keine Direkt-Wiederholung bei
Poolgröße > 1). `Arp Octaves` erweitert den Pool um bis zu drei Oktavlagen
oberhalb. `Arp Hold` hält den Akkord nach dem Loslassen (Latch; neue Noten
nach vollständigem Loslassen beginnen einen neuen Akkord). Bei `Arp Mode = 0`
ist eingehendes MIDI am laufenden Sequencer wirkungslos — bit-identisch
belegt in `tools/dsp_arp_test.mjs`.

In 2.5.0 wurde `param61` append-kompatibel von 4 auf 16 erweitert (die
Werte 0–4 behalten ihre Bedeutung, ältere Presets bleiben gültig) und
`param64` append-only ergänzt. Die 16 Figuren:

| Wert | Figur | Verhalten |
|---:|---|---|
| 1 | Up | aufwärts |
| 2 | Down | abwärts |
| 3 | Up-Down | Pendel, Endpunkte einfach (exklusiv) |
| 4 | Random | Lehmer-LCG, keine Direkt-Wiederholung bei Pool > 1 |
| 5 | Up-Down+ | Pendel, Endpunkte doppelt (inklusiv) |
| 6 | Down-Up | Gegenpendel, exklusiv |
| 7 | Down-Up+ | Gegenpendel, inklusiv |
| 8 | Played | in Anschlagsreihenfolge |
| 9 | Double | aufwärts, jede Note zweimal |
| 10 | Converge | außen nach innen (tief, hoch, zweittief, …) |
| 11 | Diverge | innen nach außen |
| 12 | Pinky | höchste Note als Pedal gegen aufsteigende Reihe |
| 13 | Thumb | tiefste Note als Pedal gegen aufsteigende Reihe |
| 14 | Rnd-Once | einmal gemischte Permutation, dann geloopt (Fisher-Yates) |
| 15 | Walk | Zufallsspaziergang ±1 mit Reflexion an den Rändern |
| 16 | Phrase | Phrasen-Modus, gesteuert über `param64` |

Im Phrase-Modus (`param61 = 16`) transponieren die gehaltenen Tasten eine
Phrase: `param64 = 0` spielt das eigene 16-Step-Pattern (Pitch, Gate,
Accent, Slide der Steps relativ zur Root), `param64 = 1…90` spielt die
kuratierte Bank aus `tools/gen_phrases.py` (8 Kategorien: Octave, Acid,
Synco, Slide, Accent, Zigzag, Rave, Electro; Phrasenlängen 8/16 Steps,
Tonumfang −12…+24 Halbtöne, Gate/Accent/Slide pro Step kodiert). Bei
mehreren gehaltenen Tasten wandert die Basisnote nach jedem
Phrasendurchlauf zur nächsten Poolnote. Die Bank liegt als generierte
Tabelle in DSP und UI (Marker `ARP-PHRASES-BEGIN/END`);
`python3 tools/gen_phrases.py --check` prüft die Synchronität, die
Referenzdaten stehen in `tools/data/arp_phrases.json`.

Seit 2.5.1 meldet das append-only Output-Event `arpNoteOut` bei aktivem
Arp an jedem Step-Start die tatsächlich gespielte MIDI-Note (−1 bei Rest,
leerem Pool oder Transport-Stopp). Die UI speist daraus die Live-Noten
in den Step-Zellen der Arp-Ansicht; Presets und der Parametervertrag
bleiben unberührt (Events sind keine dynamischen Parameter).

`param50` wurde in 0.7.0 append-only ergänzt. 0 % lässt jedes
16tel-Zweierpaar gerade; 100 % verschiebt das zweite 16tel auf die letzte
Achteltriolenposition und ergibt ein 2:1-Verhältnis. Die Paarlänge bleibt
konstant. Internal-Clock und DAW-PPQ verwenden dieselbe Berechnung; der
Initialwert 0 % erhält das bisherige Timing.

Der Dev-Kit-dokumentierte Eingang `input event float64 transportIn` ist
Amorph-Hostkontext, kein dynamischer Parameter und benötigt kein
UI-Gegenstück. Er transportiert den zyklischen 6-Slot-DAW-Stream für Play, BPM,
Taktart und PPQ. Die typisierten Eingänge `std::timeline::Tempo`,
`std::timeline::TransportState` und `std::timeline::Position` bleiben als
zusätzlicher Cmajor-Standardpfad erhalten. Auch sie sind keine dynamischen
Parameter. Damit sind alle 50 von Amorph garantierten dynamischen Parameter
belegt. Weitere persistente Funktionen benötigen deshalb einen späteren,
erweiterten Zustandsvertrag; vorhandene IDs werden dafür nicht umgedeutet oder
zusammengepackt.
