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
