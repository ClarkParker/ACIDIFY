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
| `param9` | Tempo | 40…300 BPM | 128 |
| `param10` | Run | 0/1 | 0 |
| `param11` | Pattern Length | 1…16 | 16 |
| `param12` | Root Note | MIDI 24…60 | 36 |
| `param13..28` | Step 1..16 Pitch | 0…24 st | siehe DSP |
| `param29..44` | Step 1..16 Flags | 0…7 | siehe DSP |

Flag-Bits:

| Bit | Wert | Bedeutung |
|---|---:|---|
| 0 | 1 | Gate |
| 1 | 2 | Accent |
| 2 | 4 | Slide zum nächsten aktiven Step |
