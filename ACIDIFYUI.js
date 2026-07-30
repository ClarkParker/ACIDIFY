// ACIDIFY — hardware-inspired modern 303-class Amorph instrument UI.
// WINDOW SIZE: 1180x580
//
// Single-file light-DOM Web Component. No imports, fonts, images or CDN assets.

const ACIDIFY_GLOBALS = [
  { id: "param1",  type: "dial",    label: "TUNING",       min: -1, max: 1,   step: 0.01, init: 0,    format: v => `${v >= 0 ? "+" : ""}${v.toFixed(2)}` },
  { id: "param2",  type: "dial",    label: "CUTOFF",       min: 0,  max: 1,   step: 0.001, init: 0.45, format: v => `${Math.round(v * 100)}` },
  { id: "param3",  type: "dial",    label: "RESONANCE",    min: 0,  max: 1,   step: 0.001, init: 0.72, format: v => `${Math.round(v * 100)}` },
  { id: "param4",  type: "dial",    label: "ENV MOD",      min: 0,  max: 1,   step: 0.001, init: 0.68, format: v => `${Math.round(v * 100)}` },
  { id: "param5",  type: "dial",    label: "DECAY",        min: 0,  max: 1,   step: 0.001, init: 0.45, format: v => `${Math.round(v * 100)}` },
  { id: "param6",  type: "dial",    label: "ACCENT",       min: 0,  max: 1,   step: 0.001, init: 0.65, format: v => `${Math.round(v * 100)}` },
  { id: "param7",  type: "toggle",  label: "WAVEFORM",     min: 0,  max: 1,   step: 1, init: 0 },
  { id: "param8",  type: "dial",    label: "VOLUME",       min: -36, max: 0,  step: 0.1, init: -6,    format: v => `${v.toFixed(1)} dB` },
  { id: "param9",  type: "dial",    label: "TEMPO",        min: 40, max: 300, step: 0.01, coarseStep: 0.1, init: 128, format: formatTempo },
  { id: "param10", type: "toggle",  label: "RUN",          min: 0,  max: 1,   step: 1, init: 0 },
  { id: "param11", type: "stepper", label: "LENGTH",       min: 1,  max: 16,  step: 1, init: 16,      format: v => `${Math.round(v)}` },
  { id: "param12", type: "stepper", label: "ROOT",         min: 24, max: 60,  step: 1, init: 36,      format: v => noteName(Math.round(v)) },
  { id: "param45", type: "toggle",  label: "DISTORTION",   min: 0,  max: 1,   step: 1, init: 0 },
  { id: "param46", type: "toggle",  label: "TYPE",         min: 0,  max: 2,   step: 1, init: 0 },
  { id: "param47", type: "dial",    label: "DRIVE",        min: 0,  max: 1,   step: 0.001, init: 0.35, format: v => `${Math.round(v * 100)}` },
  { id: "param48", type: "dial",    label: "MIX",          min: 0,  max: 1,   step: 0.001, init: 1,    format: v => `${Math.round(v * 100)}%` },
  { id: "param49", type: "toggle",  label: "CLOCK",        min: 0,  max: 1,   step: 1, init: 0 },
  { id: "param50", type: "stepper", label: "SWING",        min: 0,  max: 100, step: 1, init: 0,        format: v => `${Math.round(v)}%` },
  // MOD-Overlay (Layout folgt in Claude Design). Defaults = Serienstand,
  // Toggles schalten je Mod klar ein/aus, Amounts in 0,001er-Schritten.
  { id: "param51", type: "toggle",  label: "OD",           min: 0,  max: 1,   step: 1, init: 0 },
  { id: "param52", type: "dial",    label: "AMOUNT",       min: 0,  max: 1,   step: 0.001, init: 0.3,  format: v => `${(Math.pow(66.6, v)).toFixed(1)}x` },
  { id: "param53", type: "toggle",  label: "RESO BOOST",   min: 0,  max: 1,   step: 1, init: 0 },
  { id: "param54", type: "toggle",  label: "CUTOFF 5K",    min: 0,  max: 1,   step: 1, init: 0 },
  { id: "param55", type: "toggle",  label: "ENV X3",       min: 0,  max: 1,   step: 1, init: 0 },
  { id: "param56", type: "toggle",  label: "SLIDE MOD",    min: 0,  max: 1,   step: 1, init: 0 },
  { id: "param57", type: "dial",    label: "TIME",   min: 0,  max: 1,   step: 0.001, init: 0,    format: v => `${Math.round(22 + 110 * v)}ms` },
  { id: "param58", type: "toggle",  label: "SOFT ATK",     min: 0,  max: 1,   step: 1, init: 0 },
  { id: "param59", type: "dial",    label: "TIME",     min: 0,  max: 1,   step: 0.001, init: 0.25, format: v => `${(0.5 * Math.pow(60, v)).toFixed(1)}ms` },
  { id: "param60", type: "toggle",  label: "POWER",    min: 0,  max: 1,   step: 1, init: 1 },
  { id: "param61", type: "toggle",  label: "ARP MODE", min: 0,  max: 16,  step: 1, init: 0 },
  { id: "param64", type: "stepper", label: "PHRASE",   min: 0,  max: 90,  step: 1, init: 0, format: v => { const i = Math.round(v); return i <= 0 ? "PATTERN" : ARP_PHRASES[i - 1].name; } },
  { id: "param62", type: "stepper", label: "OCTAVES",  min: 1,  max: 4,   step: 1, init: 1, format: v => `${Math.round(v)}` },
  { id: "param63", type: "toggle",  label: "HOLD",     min: 0,  max: 1,   step: 1, init: 0 },
];

const STEP_PITCH_DEFAULTS = [0, 0, 7, 0, 12, 10, 7, 3, 0, 0, 12, 7, 10, 5, 3, 7];
const STEP_FLAG_DEFAULTS = [3, 5, 1, 1, 3, 5, 1, 1, 0, 1, 3, 5, 1, 1, 1, 5];
const STEP_PITCH_IDS = [
  "param13", "param14", "param15", "param16", "param17", "param18", "param19", "param20",
  "param21", "param22", "param23", "param24", "param25", "param26", "param27", "param28",
];
const STEP_FLAG_IDS = [
  "param29", "param30", "param31", "param32", "param33", "param34", "param35", "param36",
  "param37", "param38", "param39", "param40", "param41", "param42", "param43", "param44",
];
const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const DISTORTION_NAMES = ["PURE", "MACKIE", "PHONO"];
// ARP-PHRASES-BEGIN
// GENERIERT von tools/gen_phrases.py — nicht von Hand editieren.
// data je Step: (pitch+12) | gate<<6 | accent<<7 | slide<<8.
const ARP_PHRASES = [
  { name: "OCT 8TH", length: 16, data: [204, 88, 76, 88, 204, 88, 76, 88, 204, 88, 76, 88, 204, 88, 76, 88] },
  { name: "OCT PUMP", length: 16, data: [204, 76, 88, 76, 204, 76, 88, 76, 204, 76, 88, 76, 204, 76, 88, 76] },
  { name: "OCT UP2", length: 16, data: [204, 88, 100, 88, 76, 88, 100, 88, 204, 88, 100, 88, 76, 88, 100, 88] },
  { name: "OCT OFF", length: 16, data: [204, 12, 88, 12, 204, 12, 88, 12, 204, 12, 88, 12, 204, 12, 88, 88] },
  { name: "OCT ROLL", length: 16, data: [204, 76, 76, 88, 204, 76, 76, 88, 204, 76, 76, 88, 204, 88, 76, 88] },
  { name: "OCT SYNC", length: 16, data: [204, 12, 88, 76, 12, 88, 204, 12, 88, 76, 12, 88, 204, 12, 76, 88] },
  { name: "OCT DOWN", length: 16, data: [216, 76, 88, 76, 216, 76, 88, 76, 216, 76, 88, 76, 216, 76, 88, 76] },
  { name: "OCT SKIP", length: 16, data: [204, 88, 12, 88, 204, 88, 12, 88, 204, 88, 12, 88, 204, 88, 88, 88] },
  { name: "OCT 3UP", length: 16, data: [204, 76, 88, 76, 76, 88, 204, 76, 88, 76, 76, 88, 204, 88, 76, 88] },
  { name: "OCT HANG", length: 16, data: [204, 88, 88, 76, 76, 88, 88, 76, 204, 88, 88, 76, 76, 88, 344, 76] },
  { name: "OCT LIFT", length: 16, data: [204, 76, 76, 76, 88, 88, 88, 88, 204, 76, 76, 76, 88, 88, 100, 88] },
  { name: "OCT GAP", length: 16, data: [204, 12, 12, 88, 12, 12, 204, 12, 12, 88, 12, 12, 204, 12, 88, 100] },
  { name: "ACID UP", length: 16, data: [204, 79, 83, 86, 88, 86, 83, 79, 204, 79, 83, 86, 88, 91, 88, 86] },
  { name: "ACID DIP", length: 16, data: [204, 76, 86, 76, 76, 83, 76, 79, 204, 76, 86, 76, 76, 83, 335, 76] },
  { name: "ACID 5TH", length: 16, data: [204, 83, 76, 83, 204, 83, 76, 83, 204, 83, 76, 83, 204, 83, 88, 83] },
  { name: "ACID M3", length: 16, data: [204, 79, 76, 79, 204, 79, 76, 79, 204, 79, 76, 79, 204, 79, 91, 79] },
  { name: "ACID B7", length: 16, data: [204, 86, 76, 86, 204, 86, 76, 86, 204, 86, 76, 86, 204, 86, 98, 86] },
  { name: "ACID SNK", length: 16, data: [204, 12, 79, 12, 83, 12, 86, 12, 216, 12, 86, 12, 83, 12, 335, 76] },
  { name: "ACID RUN", length: 16, data: [76, 79, 81, 83, 86, 88, 91, 95, 228, 95, 91, 88, 86, 83, 337, 79] },
  { name: "ACID PIT", length: 16, data: [216, 86, 83, 79, 76, 79, 83, 86, 216, 86, 83, 79, 332, 76, 79, 83] },
  { name: "ACID SUS", length: 16, data: [204, 76, 79, 79, 81, 81, 83, 83, 214, 86, 83, 83, 81, 81, 335, 79] },
  { name: "ACID JMP", length: 16, data: [204, 88, 79, 91, 83, 95, 86, 98, 216, 76, 91, 79, 95, 83, 354, 86] },
  { name: "ACID LOW", length: 16, data: [204, 76, 76, 79, 76, 76, 76, 83, 204, 76, 76, 79, 76, 83, 335, 76] },
  { name: "ACID TRI", length: 16, data: [204, 79, 83, 76, 79, 83, 204, 79, 83, 76, 79, 83, 204, 79, 83, 88] },
  { name: "SNC ONE", length: 16, data: [204, 12, 12, 76, 12, 12, 76, 12, 204, 12, 12, 76, 12, 76, 12, 12] },
  { name: "SNC TWO", length: 16, data: [12, 204, 12, 76, 12, 204, 12, 76, 12, 204, 12, 76, 12, 204, 76, 12] },
  { name: "SNC HALF", length: 16, data: [204, 12, 76, 12, 12, 76, 12, 76, 12, 12, 204, 12, 76, 12, 12, 76] },
  { name: "SNC PUSH", length: 16, data: [204, 76, 12, 76, 76, 12, 76, 76, 12, 204, 76, 12, 76, 76, 12, 76] },
  { name: "SNC HOLE", length: 16, data: [204, 76, 76, 12, 76, 76, 76, 12, 204, 76, 76, 12, 76, 12, 76, 12] },
  { name: "SNC CLAV", length: 16, data: [204, 12, 76, 76, 12, 76, 12, 76, 204, 12, 76, 76, 12, 76, 76, 12] },
  { name: "SNC 3+3", length: 16, data: [204, 76, 76, 12, 12, 12, 204, 76, 76, 12, 12, 12, 204, 76, 76, 76] },
  { name: "SNC DUB", length: 16, data: [204, 12, 12, 76, 76, 12, 12, 76, 204, 12, 12, 76, 76, 12, 76, 76] },
  { name: "SNC LATE", length: 16, data: [12, 12, 204, 76, 12, 12, 204, 76, 12, 12, 204, 76, 12, 12, 204, 76] },
  { name: "SNC BUMP", length: 16, data: [204, 76, 12, 12, 204, 76, 12, 12, 204, 76, 12, 12, 204, 76, 76, 76] },
  { name: "SNC EDGE", length: 16, data: [204, 12, 76, 12, 76, 12, 204, 12, 76, 12, 76, 12, 204, 76, 12, 76] },
  { name: "SNC REST", length: 16, data: [204, 76, 76, 76, 12, 12, 12, 12, 204, 76, 76, 76, 12, 12, 204, 76] },
  { name: "SLD UP", length: 16, data: [460, 79, 335, 83, 339, 88, 88, 88, 460, 79, 335, 83, 339, 88, 344, 76] },
  { name: "SLD DOWN", length: 16, data: [472, 86, 342, 83, 339, 79, 79, 76, 472, 86, 342, 83, 339, 79, 335, 76] },
  { name: "SLD OCT", length: 16, data: [460, 88, 76, 76, 332, 88, 76, 76, 460, 88, 76, 76, 332, 88, 344, 76] },
  { name: "SLD CHRM", length: 16, data: [204, 76, 333, 76, 76, 76, 335, 76, 204, 76, 338, 83, 76, 76, 333, 76] },
  { name: "SLD WAVE", length: 16, data: [460, 83, 339, 76, 332, 83, 339, 76, 460, 86, 342, 76, 332, 86, 342, 76] },
  { name: "SLD CRPP", length: 16, data: [204, 332, 79, 76, 332, 81, 76, 76, 460, 83, 76, 76, 332, 88, 332, 76] },
  { name: "SLD FALL", length: 16, data: [484, 88, 88, 88, 344, 76, 76, 76, 484, 88, 88, 88, 344, 76, 76, 76] },
  { name: "SLD PAIR", length: 16, data: [204, 332, 79, 79, 211, 339, 86, 86, 216, 344, 86, 86, 211, 339, 79, 79] },
  { name: "SLD HOOK", length: 16, data: [204, 335, 76, 76, 339, 76, 76, 342, 204, 76, 344, 76, 76, 342, 339, 79] },
  { name: "SLD LONG", length: 16, data: [460, 335, 337, 339, 342, 344, 347, 95, 95, 91, 88, 86, 83, 81, 335, 76] },
  { name: "ACC 4FLR", length: 16, data: [204, 76, 76, 76, 204, 76, 76, 76, 204, 76, 76, 76, 204, 76, 76, 76] },
  { name: "ACC OFF", length: 16, data: [76, 204, 76, 76, 76, 204, 76, 76, 76, 204, 76, 76, 76, 204, 76, 76] },
  { name: "ACC 3ER", length: 16, data: [204, 76, 76, 204, 76, 76, 204, 76, 76, 204, 76, 76, 204, 76, 76, 204] },
  { name: "ACC PAIR", length: 16, data: [204, 204, 76, 76, 76, 76, 204, 204, 76, 76, 76, 76, 204, 204, 76, 76] },
  { name: "ACC EDGE", length: 16, data: [204, 76, 76, 76, 76, 76, 76, 204, 76, 76, 76, 76, 76, 76, 204, 204] },
  { name: "ACC GALP", length: 16, data: [204, 76, 76, 204, 76, 76, 204, 76, 76, 76, 204, 76, 76, 204, 76, 76] },
  { name: "ACC SNAP", length: 16, data: [76, 76, 204, 76, 76, 76, 204, 76, 76, 76, 204, 76, 76, 204, 76, 76] },
  { name: "ACC WALL", length: 16, data: [204, 204, 204, 76, 76, 76, 76, 76, 204, 204, 204, 76, 76, 76, 76, 76] },
  { name: "ACC HART", length: 16, data: [204, 76, 204, 76, 204, 76, 204, 76, 204, 76, 204, 76, 204, 76, 204, 76] },
  { name: "ACC ROLL", length: 16, data: [76, 76, 76, 76, 204, 204, 76, 76, 76, 76, 76, 76, 204, 204, 204, 204] },
  { name: "ZIG STEP", length: 16, data: [204, 83, 79, 86, 83, 88, 86, 91, 216, 91, 86, 88, 83, 86, 335, 83] },
  { name: "ZIG WIDE", length: 16, data: [204, 88, 79, 91, 83, 95, 79, 91, 204, 88, 79, 91, 83, 95, 342, 98] },
  { name: "ZIG BACK", length: 16, data: [204, 81, 79, 83, 81, 86, 83, 88, 214, 83, 88, 81, 83, 79, 337, 76] },
  { name: "ZIG DROP", length: 16, data: [216, 76, 86, 76, 83, 76, 81, 76, 216, 76, 86, 76, 83, 76, 335, 76] },
  { name: "ZIG CLMB", length: 16, data: [204, 79, 76, 81, 76, 83, 76, 86, 204, 88, 76, 91, 76, 95, 332, 100] },
  { name: "ZIG POGO", length: 16, data: [204, 100, 76, 95, 76, 91, 76, 88, 204, 100, 76, 95, 76, 91, 332, 88] },
  { name: "ZIG TRIO", length: 16, data: [204, 83, 88, 79, 86, 91, 81, 88, 223, 83, 88, 79, 86, 91, 337, 88] },
  { name: "ZIG DIVE", length: 16, data: [228, 95, 91, 88, 86, 83, 81, 79, 204, 79, 81, 83, 86, 88, 347, 95] },
  { name: "ZIG SAW", length: 16, data: [204, 81, 86, 91, 79, 83, 88, 95, 204, 81, 86, 91, 79, 83, 344, 100] },
  { name: "ZIG HOPS", length: 16, data: [204, 86, 76, 88, 76, 86, 76, 83, 204, 86, 76, 88, 76, 91, 332, 88] },
  { name: "ZIG FLIP", length: 16, data: [204, 88, 83, 95, 79, 91, 86, 98, 204, 88, 83, 95, 79, 91, 342, 100] },
  { name: "ZIG TIDE", length: 16, data: [76, 79, 83, 79, 88, 83, 79, 83, 219, 88, 83, 88, 79, 83, 344, 76] },
  { name: "RVE M3", length: 16, data: [204, 76, 79, 79, 204, 76, 79, 79, 204, 76, 79, 79, 204, 79, 76, 79] },
  { name: "RVE 4TH", length: 16, data: [204, 76, 81, 81, 204, 76, 81, 81, 204, 76, 81, 81, 204, 81, 76, 81] },
  { name: "RVE HOOV", length: 16, data: [204, 76, 76, 79, 81, 81, 81, 79, 204, 76, 76, 79, 81, 335, 76, 76] },
  { name: "RVE PEND", length: 16, data: [204, 81, 76, 79, 204, 81, 76, 79, 204, 81, 76, 79, 204, 83, 81, 79] },
  { name: "RVE STAB", length: 16, data: [204, 12, 76, 12, 207, 12, 79, 12, 209, 12, 81, 12, 207, 12, 76, 12] },
  { name: "RVE LIFT", length: 16, data: [204, 76, 79, 81, 211, 83, 81, 79, 204, 76, 79, 81, 211, 86, 339, 81] },
  { name: "RVE DARK", length: 16, data: [204, 76, 76, 76, 79, 79, 79, 79, 209, 81, 81, 81, 79, 79, 79, 79] },
  { name: "RVE SIRN", length: 16, data: [460, 81, 337, 76, 332, 81, 337, 76, 460, 81, 337, 76, 332, 81, 337, 76] },
  { name: "RVE PUSH", length: 16, data: [207, 79, 76, 76, 81, 81, 76, 76, 207, 79, 76, 76, 83, 339, 81, 79] },
  { name: "RVE ANTH", length: 16, data: [204, 79, 81, 79, 76, 79, 81, 83, 204, 79, 81, 79, 86, 83, 337, 79] },
  { name: "ELC FUNK", length: 16, data: [204, 12, 76, 88, 12, 76, 12, 88, 204, 12, 76, 88, 12, 88, 76, 12] },
  { name: "ELC BRKN", length: 16, data: [204, 76, 12, 88, 76, 12, 88, 12, 204, 76, 12, 88, 76, 88, 12, 88] },
  { name: "ELC ROBO", length: 16, data: [204, 88, 12, 76, 88, 12, 76, 88, 204, 88, 12, 76, 88, 12, 88, 12] },
  { name: "ELC WONK", length: 16, data: [204, 12, 88, 12, 12, 76, 88, 12, 204, 12, 88, 12, 76, 12, 88, 88] },
  { name: "ELC SNAP", length: 16, data: [204, 76, 88, 12, 76, 88, 12, 76, 216, 12, 76, 88, 76, 12, 88, 76] },
  { name: "ELC HALF", length: 16, data: [204, 12, 12, 12, 88, 12, 12, 12, 204, 12, 12, 88, 12, 12, 88, 12] },
  { name: "ELC TAPE", length: 16, data: [204, 88, 76, 12, 76, 88, 76, 12, 204, 88, 76, 12, 76, 344, 76, 12] },
  { name: "ELC GLDE", length: 16, data: [204, 12, 332, 88, 12, 76, 332, 88, 204, 12, 332, 88, 12, 344, 76, 12] },
  { name: "ELC DRAG", length: 16, data: [12, 204, 76, 12, 88, 76, 12, 76, 12, 204, 76, 12, 88, 76, 88, 12] },
  { name: "ELC NERV", length: 16, data: [204, 88, 88, 76, 12, 88, 76, 12, 204, 88, 88, 76, 12, 88, 12, 88] },
  { name: "ELC LOPE", length: 16, data: [204, 12, 76, 76, 88, 12, 76, 76, 204, 12, 76, 76, 88, 12, 88, 88] },
  { name: "ELC ENDE", length: 16, data: [204, 76, 88, 76, 76, 88, 76, 76, 216, 76, 76, 88, 76, 88, 216, 100] },
];
// ARP-PHRASES-END

const GENERATION_SCALES = [
  { id: "minor-pentatonic", label: "MIN PENTA", sub: "1 ♭3 4 5 ♭7", degrees: [0, 3, 5, 7, 10] },
  { id: "major-pentatonic", label: "MAJ PENTA", sub: "1 2 3 5 6", degrees: [0, 2, 4, 7, 9] },
  { id: "natural-minor", label: "NAT MINOR", sub: "AEOLIAN", degrees: [0, 2, 3, 5, 7, 8, 10] },
  { id: "harmonic-minor", label: "HARM MINOR", sub: "RAISED 7", degrees: [0, 2, 3, 5, 7, 8, 11] },
  { id: "dorian", label: "DORIAN", sub: "MINOR ♯6", degrees: [0, 2, 3, 5, 7, 9, 10] },
  { id: "phrygian", label: "PHRYGIAN", sub: "MINOR ♭2", degrees: [0, 1, 3, 5, 7, 8, 10] },
  { id: "major", label: "MAJOR", sub: "IONIAN", degrees: [0, 2, 4, 5, 7, 9, 11] },
  { id: "mixolydian", label: "MIXOLYDIAN", sub: "MAJOR ♭7", degrees: [0, 2, 4, 5, 7, 9, 10] },
  { id: "blues", label: "BLUES", sub: "WITH ♭5", degrees: [0, 3, 5, 6, 7, 10] },
  { id: "chromatic", label: "CHROMATIC", sub: "ALL 12", degrees: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] },
];
const TOOLTIP_STORAGE_KEY = "acidify.tooltips.enabled";
const THEME_STORAGE_KEY = "acidify.theme.dark";
// Tooltips erscheinen erst nach echtem Verweilen: der Timer startet bei jeder
// Zeigerbewegung neu, damit die Blase die GUI beim Ueberstreichen nicht verdeckt.
const TOOLTIP_HOVER_DELAY = 900;
const TOOLTIP_FOCUS_DELAY = 250;
const CONTROL_TOOLTIPS = {
  param1: "Fine-tunes the instrument by one semitone up or down. Drag or use the arrow keys; hold Shift for finer movement. Double-click to reset.",
  param2: "Sets the filter cutoff frequency. Higher values make the sound brighter. Hold Shift while dragging for finer movement.",
  param3: "Sets filter resonance around the cutoff frequency. Higher values increase the characteristic acid peak.",
  param4: "Controls how strongly the filter envelope moves the cutoff frequency.",
  param5: "Sets the filter-envelope decay time.",
  param6: "Sets the global intensity of accented steps and high-velocity MIDI notes.",
  param7: "Selects the oscillator waveform: sawtooth or the modelled 303-style square wave.",
  param8: "Sets the final output level in decibels.",
  param9: "Sets the internal clock tempo. Wheel or arrow keys change 0.1 BPM; hold Shift for 0.01 BPM. In DAW mode the knob follows the host tempo.",
  param10: "Starts or stops the internal pattern clock. In DAW mode this follows host transport when available.",
  param11: "Sets the active pattern length from 1 to 16 steps.",
  param12: "Sets the MIDI root note used by the 16-step pattern.",
  param45: "Turns the optional post-output distortion stage on or off.",
  param46: "Selects the distortion character: Pure, Mackie or Phono.",
  param47: "Sets the amount of drive applied by the selected distortion character.",
  param48: "Blends the distorted signal with the clean instrument output.",
  param49: "Selects the clock source. INT uses the internal tempo and RUN/STOP; DAW follows host tempo, transport and position.",
  param50: "Adds swing to each pair of sixteenth notes. 0% is straight; 100% reaches a 2:1 triplet feel.",
  param51: "Devil Fish filter overdrive on/off. Off is the stock 303 input level.",
  param52: "Overdrive amount, 1x to 66.6x the stock ladder drive (R62 220k down to 3.3k).",
  param53: "x0x resonance boost (R97 10k to 8.2k): enables self-oscillation at the top of the resonance range.",
  param54: "Extends the cutoff maximum from 2.5 kHz to 5 kHz (Devil Fish).",
  param55: "Triples the Env Mod range (Devil Fish).",
  param56: "Devil Fish slide-time control on/off. Off is the stock 22 ms slide.",
  param57: "Slide time, 22 ms (stock) to 132 ms (500k pot in series with the DAC resistance).",
  param58: "Devil Fish soft attack on/off. Off is the stock instant VCA start.",
  param59: "VCA attack time, 0.5 ms to 30 ms (Devil Fish range).",
};

function noteName(note) {
  const n = Math.max(0, Math.min(127, Math.round(Number(note) || 0)));
  return `${NOTE_NAMES[n % 12]}${Math.floor(n / 12) - 1}`;
}

function clamp(value, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function formatTempo(value) {
  const rounded = Math.round(clamp(value, 0, 999) * 100) / 100;
  const decimals = Number.isInteger(rounded) ? 0 : Number.isInteger(rounded * 10) ? 1 : 2;
  return `${rounded.toFixed(decimals)} BPM`;
}

class DialControl {
  constructor({ patchConnection, sendValue, node, config }) {
    this.pc = patchConnection;
    this.sendValue = sendValue;
    this.node = node;
    this.config = config;
    this.dial = node.querySelector(".dial");
    this.valueLabel = node.querySelector(".value-label");
    this.value = config.init;
    this.dragging = false;
    this.startY = 0;
    this.startValue = config.init;
    this.feedbackTimer = null;
    this.node.style.setProperty("--default-norm", (config.init - config.min) / (config.max - config.min || 1));
    this.isDisabled = () => this.dial.getAttribute("aria-disabled") === "true"
      || this.node.getAttribute("aria-disabled") === "true";

    this.onPointerDown = e => {
      if (this.isDisabled()) return;
      this.dragging = true;
      this.startY = e.clientY;
      this.startValue = this.value;
      this.showFeedback();
      this.dial.setPointerCapture(e.pointerId);
      this.pc.sendParameterGestureStart?.(this.config.id);
      e.preventDefault();
    };
    this.onPointerMove = e => {
      if (!this.dragging) return;
      const range = this.config.max - this.config.min;
      const sensitivity = e.shiftKey ? 0.0015 : 0.007;
      this.showFeedback();
      this.setValue(this.startValue + (this.startY - e.clientY) * range * sensitivity, true);
    };
    this.onPointerEnd = e => {
      if (!this.dragging) return;
      this.dragging = false;
      if (this.dial.hasPointerCapture?.(e.pointerId)) this.dial.releasePointerCapture(e.pointerId);
      this.pc.sendParameterGestureEnd?.(this.config.id);
    };
    this.onDoubleClick = () => {
      if (this.isDisabled()) return;
      this.pc.sendParameterGestureStart?.(this.config.id);
      this.showFeedback();
      this.setValue(this.config.init, true);
      this.pc.sendParameterGestureEnd?.(this.config.id);
    };
    this.onWheel = e => {
      e.preventDefault();
      if (this.isDisabled()) return;
      const range = this.config.max - this.config.min;
      const increment = e.shiftKey
        ? (this.config.fineStep || this.config.step || range / 500)
        : (this.config.coarseStep || Math.max(this.config.step || 0, range / 50));
      this.pc.sendParameterGestureStart?.(this.config.id);
      this.showFeedback();
      this.setValue(this.value + (e.deltaY < 0 ? increment : -increment), true);
      this.pc.sendParameterGestureEnd?.(this.config.id);
    };
    this.onKeyDown = e => {
      if (this.isDisabled()) return;
      const range = this.config.max - this.config.min;
      const increment = e.shiftKey
        ? (this.config.fineStep || this.config.step || range / 500)
        : (this.config.coarseStep || Math.max(this.config.step || 0, range / 50));
      let next = null;
      if (e.key === "ArrowUp" || e.key === "ArrowRight") next = this.value + increment;
      if (e.key === "ArrowDown" || e.key === "ArrowLeft") next = this.value - increment;
      if (e.key === "Home") next = this.config.min;
      if (e.key === "End") next = this.config.max;
      if (next === null) return;
      e.preventDefault();
      this.pc.sendParameterGestureStart?.(this.config.id);
      this.showFeedback();
      this.setValue(next, true);
      this.pc.sendParameterGestureEnd?.(this.config.id);
    };

    this.dial.addEventListener("pointerdown", this.onPointerDown);
    this.dial.addEventListener("pointermove", this.onPointerMove);
    this.dial.addEventListener("pointerup", this.onPointerEnd);
    this.dial.addEventListener("pointercancel", this.onPointerEnd);
    this.dial.addEventListener("dblclick", this.onDoubleClick);
    this.dial.addEventListener("wheel", this.onWheel, { passive: false });
    this.dial.addEventListener("keydown", this.onKeyDown);
    this.setValue(config.init, false);
  }

  showFeedback() {
    this.node.classList.add("value-visible");
    if (this.feedbackTimer) window.clearTimeout(this.feedbackTimer);
    this.feedbackTimer = window.setTimeout(() => {
      if (!this.dragging) this.node.classList.remove("value-visible");
    }, 900);
  }

  dispose() {
    if (this.feedbackTimer) window.clearTimeout(this.feedbackTimer);
    this.feedbackTimer = null;
  }

  setValue(raw, notify) {
    if (this.dragging && !notify) return;
    const { min, max, step } = this.config;
    let value = clamp(raw, min, max);
    if (step > 0) value = Number((Math.round(value / step) * step).toFixed(8));
    value = clamp(value, min, max);
    this.value = value;
    const norm = (value - min) / (max - min || 1);
    this.node.style.setProperty("--norm", norm);
    this.dial.setAttribute("aria-valuenow", `${value}`);
    const formatted = this.config.format(value);
    this.dial.setAttribute("aria-valuetext", formatted);
    this.valueLabel.textContent = formatted;
    if (notify) this.sendValue(this.config.id, value);
  }
}

class ToggleControl {
  constructor({ patchConnection, sendValue, node, config, onChange }) {
    this.pc = patchConnection;
    this.sendValue = sendValue;
    this.node = node;
    this.config = config;
    this.onChange = onChange;
    this.value = config.init;
    this.buttons = [...node.querySelectorAll("[data-value]")];
    this.onClick = e => {
      if (node.getAttribute("aria-disabled") === "true") return;
      const button = e.target.closest("[data-value]");
      if (!button) return;
      const value = node.classList.contains("run-switch")
        ? (this.value >= 0.5 ? 0 : 1)
        : Number(button.dataset.value);
      this.setValue(value, true);
    };
    node.addEventListener("click", this.onClick);
    if (this.buttons.length > 1) {
      this.onWheel = e => {
        if (node.getAttribute("aria-disabled") === "true") return;
        e.preventDefault();
        const values = this.buttons.map(button => Number(button.dataset.value)).sort((a, b) => a - b);
        const index = Math.max(0, values.indexOf(this.value));
        const next = values[clamp(index + (e.deltaY < 0 ? 1 : -1), 0, values.length - 1)];
        if (next !== this.value) this.setValue(next, true);
      };
      node.addEventListener("wheel", this.onWheel, { passive: false });
    }
    this.setValue(config.init, false);
  }

  setValue(raw, notify) {
    const value = clamp(Math.round(Number(raw) || 0), this.config.min, this.config.max);
    this.value = value;
    this.buttons.forEach(button => {
      const active = Number(button.dataset.value) === value;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", `${active}`);
    });
    this.node.classList.toggle("is-on", value >= 0.5);
    this.onChange?.(value);
    if (notify) this.sendValue(this.config.id, value);
  }
}

class StepperControl {
  constructor({ patchConnection, sendValue, node, config, onChange }) {
    this.pc = patchConnection;
    this.sendValue = sendValue;
    this.node = node;
    this.config = config;
    this.onChange = onChange;
    this.valueLabel = node.querySelector(".stepper-value");
    this.value = config.init;
    this.onClick = e => {
      const direction = Number(e.target.closest("button[data-step]")?.dataset.step || 0);
      if (direction) this.setValue(this.value + direction * config.step, true);
    };
    node.addEventListener("click", this.onClick);
    this.onWheel = e => {
      e.preventDefault();
      this.setValue(this.value + (e.deltaY < 0 ? 1 : -1) * config.step, true);
    };
    node.addEventListener("wheel", this.onWheel, { passive: false });
    this.setValue(config.init, false);
  }

  setValue(raw, notify) {
    const { min, max, step } = this.config;
    const value = clamp(Math.round((Number(raw) || min) / step) * step, min, max);
    this.value = value;
    this.valueLabel.textContent = this.config.format(value);
    if (notify) this.sendValue(this.config.id, value);
    this.onChange?.(value);
  }
}

class AcidifyPatchView extends HTMLElement {
  constructor(patchConnection) {
    super();
    this.pc = patchConnection;
    this._controls = new Map();
    this._values = new Map();
    this._selectedStep = 0;
    this._selectedSteps = new Set([0]);
    this._selectionAnchor = 0;
    this._playingStep = -1;
    this._studioMode = false;
    this._distortionOpen = false;
    this._modsOpen = false;
    this._pitchMenuOpen = false;
    this._pitchMenuTargets = [];
    this._pitchMenuReturnFocus = null;
    this._history = [];
    this._future = [];
    this._clipboard = null;
    this._generationScaleIndex = 0;
    this._scaleMenuOpen = false;
    this._arpView = false;
    this._lastArpMode = 0;
    this._phraseMenuOpen = false;
    this._arpLiveNotes = new Array(16).fill(-1);
    this._arpNoteListener = null;
    this._midiHeld = new Set();
    this._paintState = null;
    this._paramListener = null;
    this._stepListener = null;
    this._meterListener = null;
    this._tempoListener = null;
    this._transportListener = null;
    this._syncListener = null;
    this._resizeFn = null;
    this._resizeObserver = null;
    this._scaleTimer = null;
    this._meter = 0;
    this._effectiveTempo = 128;
    this._transportRunning = false;
    this._hostSyncFlags = 0;
    this._tooltipsEnabled = this._loadTooltipPreference();
    this._tooltipTimer = null;
    this._tooltipTarget = null;
    this._tooltipToggleClick = null;
    this._tooltipPointerOver = null;
    this._tooltipPointerMove = null;
    this._tooltipPointerOut = null;
    this._tooltipFocusIn = null;
    this._tooltipFocusOut = null;
    this._studioPointerEnd = null;
    this._studioKeyDown = null;
    this._distortionKeyDown = null;
    this._pitchMenuKeyDown = null;
    this._pitchMenuOutsidePointer = null;
    this._midiHandler = null;
    this._recentSends = [];
    this._mounted = false;
  }

  connectedCallback() {
    if (this._mounted) return;
    this._mounted = true;
    this._distortionOpen = false;
    this._modsOpen = false;
    this._pitchMenuOpen = false;
    this._pitchMenuTargets = [];
    this._pitchMenuReturnFocus = null;
    this.innerHTML = this.getHTML();
    this._controls.clear();
    this._values.clear();
    this._recentSends = [];
    this._buildControls();
    this._wireSteps();
    this._wireKeyboard();
    this._wireStudio();
    this._wirePitchMenu();
    this._wireDistortion();
    this._wireMods();
    this._wireModMirrors();
    this._wirePower();
    this._wirePhraseMenu();
    this.querySelector(".arp-capture")?.addEventListener("click", () => this._captureArpToPattern());
    this._wireDistMinis();
    this._renderScope();
    this._wireTooltips();
    this._renderStepStrip();
    this._renderStepEditor();
    this._renderStudio();

    this._paramListener = ({ endpointID, value }) => {
      if (this._consumeEcho(endpointID, value)) return;
      this._values.set(endpointID, Number(value));
      const control = this._controls.get(endpointID);
      if (control) control.setValue(value, false);
      if (endpointID === "param45" || endpointID === "param46"
          || endpointID === "param47" || endpointID === "param48") {
        this._renderDistortionState();
      }
      if (endpointID >= "param51" && endpointID <= "param59" && endpointID.length === 7) {
        this._renderModState();
      }
      if (endpointID === "param60") {
        this._renderPowerState();
      }
      if (endpointID === "param61") {
        const mode = Math.round(Number(typeof value === "object" ? value.value ?? 0 : value));
        if (mode > 0) {
          this._lastArpMode = mode;
          if (!this._arpView) this._setViewMode("arp", false);
        } else if (this._arpView) {
          this._setViewMode("classic", false);
        }
        this._renderArpState();
      }
      if (endpointID === "param62" || endpointID === "param63" || endpointID === "param64") {
        this._renderArpState();
      }
      if (endpointID >= "param2" && endpointID <= "param6" && endpointID.length === 6 || endpointID === "param9") {
        this._renderScope();
      }
      if (endpointID === "param9" || endpointID === "param10" || endpointID === "param49") {
        this._renderTransportState();
      }
      if (endpointID === "param12") {
        this._renderStepStrip();
        this._renderStepEditor();
        this._renderStudio();
        if (this._pitchMenuOpen) this._refreshPitchMenu();
      }
      if (this._isStepParam(endpointID)) {
        this._renderStepStrip();
        this._renderStepEditor();
        this._renderStudio();
        if (this._pitchMenuOpen) this._refreshPitchMenu();
      }
    };
    this.pc.addAllParameterListener(this._paramListener);
    this._controls.forEach((_, id) => this.pc.requestParameterValue(id));

    this._stepListener = value => {
      const n = typeof value === "object" ? Number(value.value ?? value.step ?? -1) : Number(value);
      this._playingStep = Number.isFinite(n) ? Math.round(n) : -1;
      this._renderStepStrip();
      this._renderStudio();
    };
    this.pc.addEndpointListener("currentStep", this._stepListener);

    this._arpNoteListener = value => {
      const n = typeof value === "object" ? Number(value.value ?? -1) : Number(value);
      const note = Number.isFinite(n) ? Math.round(n) : -1;
      if (this._playingStep >= 0 && this._playingStep < 16) {
        if (this._arpLiveNotes[this._playingStep] !== note) {
          this._arpLiveNotes[this._playingStep] = note;
          if (this._arpView) this._renderStepStrip();
        }
      } else if (note < 0 && this._arpLiveNotes.some(v => v >= 0)) {
        this._arpLiveNotes.fill(-1);
        if (this._arpView) this._renderStepStrip();
      }
    };
    this.pc.addEndpointListener("arpNoteOut", this._arpNoteListener);

    this._meterListener = value => {
      const n = typeof value === "object" ? Number(value.value ?? 0) : Number(value);
      this._meter = clamp(n, 0, 1);
      this.querySelector(".output-lamp")?.style.setProperty("--level", this._meter);
      this.querySelector(".vu-meter")?.style.setProperty("--level", this._meter);
    };
    this.pc.addEndpointListener("meterOut", this._meterListener);

    this._tempoListener = value => {
      const n = typeof value === "object" ? Number(value.value ?? value.bpm ?? 0) : Number(value);
      if (Number.isFinite(n) && n > 0) this._effectiveTempo = n;
      this._renderTransportState();
    };
    this.pc.addEndpointListener("effectiveTempo", this._tempoListener);

    this._transportListener = value => {
      const n = typeof value === "object" ? Number(value.value ?? value.running ?? 0) : Number(value);
      this._transportRunning = Number.isFinite(n) && n >= 0.5;
      this._renderTransportState();
    };
    this.pc.addEndpointListener("transportRunning", this._transportListener);

    this._syncListener = value => {
      const n = typeof value === "object" ? Number(value.value ?? value.flags ?? 0) : Number(value);
      this._hostSyncFlags = Number.isFinite(n) ? clamp(Math.round(n), 0, 7) : 0;
      this._renderTransportState();
    };
    this.pc.addEndpointListener("hostSyncStatus", this._syncListener);

    this._midiHandler = messages => {
      messages.forEach(({ s, d1, d2 }) => {
        const kind = s & 0xf0;
        if (kind === 0x90 && d2 > 0) {
          this._showMidiNote(d1, true);
          this._midiHeld.add(d1);
        } else if (kind === 0x80 || (kind === 0x90 && d2 === 0)) {
          this._showMidiNote(d1, false);
          this._midiHeld.delete(d1);
        } else if (kind === 0xb0 && (d1 === 120 || d1 === 123)) {
          this._midiHeld.clear();
        }
      });
      if (this._arpView) this._renderArpHeld();
    };
    window.__amorphProcessMidi = this._midiHandler;

    let parent = this.parentElement;
    while (parent && parent !== document.body) {
      parent.style.overflow = "hidden";
      parent.style.margin = "0";
      parent.style.padding = "0";
      parent = parent.parentElement;
    }

    this._resizeFn = () => this._doScale();
    window.addEventListener("resize", this._resizeFn);
    this._resizeObserver = typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(() => this._doScale())
      : null;
    this._resizeObserver?.observe(document.documentElement);
    this._scaleTimer = window.setInterval(() => this._doScale(), 250);
    this._doScale();
    this._renderTransportState();
  }

  disconnectedCallback() {
    if (!this._mounted) return;
    if (this._paramListener) this.pc.removeAllParameterListener(this._paramListener);
    if (this._stepListener) this.pc.removeEndpointListener("currentStep", this._stepListener);
    if (this._arpNoteListener) this.pc.removeEndpointListener("arpNoteOut", this._arpNoteListener);
    if (this._meterListener) this.pc.removeEndpointListener("meterOut", this._meterListener);
    if (this._tempoListener) this.pc.removeEndpointListener("effectiveTempo", this._tempoListener);
    if (this._transportListener) this.pc.removeEndpointListener("transportRunning", this._transportListener);
    if (this._syncListener) this.pc.removeEndpointListener("hostSyncStatus", this._syncListener);
    window.removeEventListener("resize", this._resizeFn);
    this._resizeObserver?.disconnect();
    if (this._scaleTimer) window.clearInterval(this._scaleTimer);
    if (this._toastTimer) window.clearTimeout(this._toastTimer);
    if (this._studioKeyDown) this.removeEventListener("keydown", this._studioKeyDown);
    if (this._distortionKeyDown) this.removeEventListener("keydown", this._distortionKeyDown);
    if (this._pitchMenuKeyDown) this.removeEventListener("keydown", this._pitchMenuKeyDown);
    if (this._pitchMenuOutsidePointer) this.removeEventListener("pointerdown", this._pitchMenuOutsidePointer, true);
    if (this._tooltipToggleClick) this.querySelector(".tooltip-toggle")?.removeEventListener("click", this._tooltipToggleClick);
    if (this._themeToggleClick) this.querySelector(".theme-toggle")?.removeEventListener("click", this._themeToggleClick);
    if (this._tooltipPointerOver) this.removeEventListener("pointerover", this._tooltipPointerOver);
    if (this._tooltipPointerMove) this.removeEventListener("pointermove", this._tooltipPointerMove);
    if (this._tooltipPointerOut) this.removeEventListener("pointerout", this._tooltipPointerOut);
    if (this._tooltipFocusIn) this.removeEventListener("focusin", this._tooltipFocusIn);
    if (this._tooltipFocusOut) this.removeEventListener("focusout", this._tooltipFocusOut);
    if (window.__amorphProcessMidi === this._midiHandler) delete window.__amorphProcessMidi;
    this._hideTooltip();
    this._controls.forEach(control => control.dispose?.());
    this._controls.clear();
    this._values.clear();
    this._recentSends = [];
    this._paramListener = null;
    this._stepListener = null;
    this._arpNoteListener = null;
    this._midiHeld.clear();
    this._meterListener = null;
    this._tempoListener = null;
    this._transportListener = null;
    this._syncListener = null;
    this._resizeFn = null;
    this._resizeObserver = null;
    this._scaleTimer = null;
    this._toastTimer = null;
    this._studioPointerEnd = null;
    this._studioKeyDown = null;
    this._distortionKeyDown = null;
    this._pitchMenuKeyDown = null;
    this._pitchMenuOutsidePointer = null;
    this._tooltipToggleClick = null;
    this._tooltipPointerOver = null;
    this._tooltipPointerMove = null;
    this._tooltipPointerOut = null;
    this._tooltipFocusIn = null;
    this._tooltipFocusOut = null;
    this._tooltipTarget = null;
    this._pitchMenuTargets = [];
    this._pitchMenuReturnFocus = null;
    this._midiHandler = null;
    this._mounted = false;
  }

  _loadTooltipPreference() {
    try {
      return window.localStorage.getItem(TOOLTIP_STORAGE_KEY) !== "false";
    } catch {
      return true;
    }
  }

  _loadThemePreference() {
    try {
      return window.localStorage.getItem(THEME_STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  }

  _setDarkMode(enabled, persist) {
    this._darkMode = Boolean(enabled);
    this.classList.toggle("theme-dark", this._darkMode);
    const toggle = this.querySelector(".theme-toggle");
    toggle?.setAttribute("aria-pressed", `${this._darkMode}`);
    toggle?.setAttribute("aria-label", `Dark panel ${this._darkMode ? "on" : "off"}; click to switch the metal finish`);
    toggle?.querySelector(".theme-led")?.classList.toggle("lit", this._darkMode);
    if (persist) {
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, `${this._darkMode}`);
      } catch {
        // Hosts ohne localStorage: Einstellung gilt nur fuer diese Instanz.
      }
    }
  }

  _wireTooltips() {
    Object.entries(CONTROL_TOOLTIPS).forEach(([id, text]) => {
      const node = this.querySelector(`.control[data-param="${id}"]`);
      if (node) node.dataset.tooltip = text;
    });
    this.querySelectorAll("[title]").forEach(node => {
      if (!node.dataset.tooltip) node.dataset.tooltip = node.getAttribute("title") || "";
      node.removeAttribute("title");
    });
    this.querySelectorAll("button[aria-label]").forEach(node => {
      if (!node.dataset.tooltip) node.dataset.tooltip = node.getAttribute("aria-label") || "";
    });

    const toggle = this.querySelector(".tooltip-toggle");
    this._tooltipToggleClick = () => this._setTooltipsEnabled(!this._tooltipsEnabled, true);
    toggle?.addEventListener("click", this._tooltipToggleClick);

    this._themeToggleClick = () => this._setDarkMode(!this._darkMode, true);
    this.querySelector(".theme-toggle")?.addEventListener("click", this._themeToggleClick);
    this._setDarkMode(this._loadThemePreference(), false);

    this._tooltipPointerOver = event => {
      const target = this._findTooltipTarget(event.target);
      if (!target || target === this._findTooltipTarget(event.relatedTarget)) return;
      this._scheduleTooltip(target, TOOLTIP_HOVER_DELAY);
    };
    this._tooltipPointerMove = event => {
      if (!this._tooltipTimer) return;
      const target = this._findTooltipTarget(event.target);
      if (target && target === this._tooltipTarget) this._scheduleTooltip(target, TOOLTIP_HOVER_DELAY);
    };
    this._tooltipPointerOut = event => {
      const target = this._findTooltipTarget(event.target);
      if (!target || target === this._findTooltipTarget(event.relatedTarget)) return;
      if (this._tooltipTarget === target) this._hideTooltip();
    };
    this._tooltipFocusIn = event => {
      const target = this._findTooltipTarget(event.target);
      if (target) this._scheduleTooltip(target, TOOLTIP_FOCUS_DELAY);
    };
    this._tooltipFocusOut = event => {
      const target = this._findTooltipTarget(event.target);
      if (!target || target === this._findTooltipTarget(event.relatedTarget)) return;
      if (this._tooltipTarget === target) this._hideTooltip();
    };
    this.addEventListener("pointerover", this._tooltipPointerOver);
    this.addEventListener("pointermove", this._tooltipPointerMove);
    this.addEventListener("pointerout", this._tooltipPointerOut);
    this.addEventListener("focusin", this._tooltipFocusIn);
    this.addEventListener("focusout", this._tooltipFocusOut);
    this._setTooltipsEnabled(this._tooltipsEnabled, false);
  }

  _findTooltipTarget(node) {
    if (!(node instanceof Element)) return null;
    const target = node.closest("[data-tooltip]");
    return target && this.contains(target) ? target : null;
  }

  _setTooltipsEnabled(enabled, persist) {
    this._tooltipsEnabled = Boolean(enabled);
    this.classList.toggle("tooltips-off", !this._tooltipsEnabled);
    const toggle = this.querySelector(".tooltip-toggle");
    toggle?.setAttribute("aria-pressed", `${this._tooltipsEnabled}`);
    toggle?.setAttribute("aria-label", `Tooltips ${this._tooltipsEnabled ? "on" : "off"}; click to turn them ${this._tooltipsEnabled ? "off" : "on"}`);
    const state = toggle?.querySelector(".tooltip-toggle-state");
    if (state) state.textContent = this._tooltipsEnabled ? "ON" : "OFF";
    toggle?.querySelector(".tips-led")?.classList.toggle("lit", this._tooltipsEnabled);
    if (!this._tooltipsEnabled) this._hideTooltip();
    if (persist) {
      try {
        window.localStorage.setItem(TOOLTIP_STORAGE_KEY, `${this._tooltipsEnabled}`);
      } catch {
        // Some embedded or file-based hosts intentionally disable local storage.
      }
    }
  }

  _scheduleTooltip(target, delay) {
    if (!this._tooltipsEnabled || !target?.dataset.tooltip) return;
    if (this._tooltipTimer) window.clearTimeout(this._tooltipTimer);
    this._tooltipTarget = target;
    this._tooltipTimer = window.setTimeout(() => {
      this._tooltipTimer = null;
      this._showTooltip(target);
    }, delay);
  }

  _showTooltip(target) {
    if (!this._tooltipsEnabled || !target?.isConnected || this._tooltipTarget !== target) return;
    const bubble = this.querySelector(".tooltip-bubble");
    const chassis = this.querySelector(".chassis");
    const text = target.dataset.tooltip?.trim();
    if (!bubble || !chassis || !text) return;
    bubble.textContent = text;
    bubble.hidden = false;

    const chassisBounds = chassis.getBoundingClientRect();
    const targetBounds = target.getBoundingClientRect();
    const scaleX = chassisBounds.width / 1180 || 1;
    const scaleY = chassisBounds.height / 580 || 1;
    const targetLeft = (targetBounds.left - chassisBounds.left) / scaleX;
    const targetTop = (targetBounds.top - chassisBounds.top) / scaleY;
    const targetWidth = targetBounds.width / scaleX;
    const targetHeight = targetBounds.height / scaleY;
    let left = targetLeft + targetWidth / 2 - bubble.offsetWidth / 2;
    let top = targetTop - bubble.offsetHeight - 10;
    if (top < 10) top = targetTop + targetHeight + 10;
    left = clamp(left, 10, 1180 - bubble.offsetWidth - 10);
    top = clamp(top, 10, 580 - bubble.offsetHeight - 10);
    bubble.style.left = `${left}px`;
    bubble.style.top = `${top}px`;
  }

  _hideTooltip() {
    if (this._tooltipTimer) window.clearTimeout(this._tooltipTimer);
    this._tooltipTimer = null;
    this._tooltipTarget = null;
    const bubble = this.querySelector(".tooltip-bubble");
    if (bubble) bubble.hidden = true;
  }

  _sendParameter(endpointID, rawValue) {
    const value = Number(rawValue);
    const now = performance.now();
    this._values.set(endpointID, value);
    if (endpointID === "param45" || endpointID === "param46"
        || endpointID === "param47" || endpointID === "param48") {
      this._renderDistortionState();
    }
    if (endpointID === "param9" || endpointID === "param10" || endpointID === "param49") {
      this._renderTransportState();
    }
    if (endpointID === "param61" || endpointID === "param62" || endpointID === "param63"
        || endpointID === "param64") {
      queueMicrotask(() => this._renderArpState());
    }
    this._recentSends = this._recentSends.filter(entry => now - entry.time < 1500);
    this._recentSends.push({ endpointID, value, time: now });
    if (this._recentSends.length > 64) this._recentSends.shift();
    this.pc.sendEventOrValue(endpointID, rawValue);
  }

  _consumeEcho(endpointID, rawValue) {
    const value = Number(rawValue);
    const now = performance.now();
    this._recentSends = this._recentSends.filter(entry => now - entry.time < 1500);
    const index = this._recentSends.findIndex(entry =>
      entry.endpointID === endpointID && Math.abs(entry.value - value) <= 1e-6
    );
    if (index < 0) return false;
    this._recentSends.splice(index, 1);
    return true;
  }

  _buildControls() {
    const sendValue = (endpointID, value) => {
      this._sendParameter(endpointID, value);
      if ((endpointID >= "param2" && endpointID <= "param6" && endpointID.length === 6) || endpointID === "param9") {
        queueMicrotask(() => this._renderScope());
      }
    };
    ACIDIFY_GLOBALS.forEach(config => {
      const node = this.querySelector(`.control[data-param="${config.id}"]`);
      if (!node) return;
      let control;
      if (config.type === "dial") {
        control = new DialControl({ patchConnection: this.pc, sendValue, node, config });
      } else if (config.type === "toggle") {
        control = new ToggleControl({
          patchConnection: this.pc,
          sendValue,
          node,
          config,
          onChange: value => {
            if (config.id === "param10" || config.id === "param49") {
              this._renderTransportState();
            }
            if (config.id === "param45" || config.id === "param46") {
              this._renderDistortionState();
            }
            if (config.id >= "param51" && config.id <= "param59" && config.id.length === 7) {
              queueMicrotask(() => this._renderModState());
            }
          },
        });
      } else {
        control = new StepperControl({
          patchConnection: this.pc,
          sendValue,
          node,
          config,
          onChange: () => {
            if (config.id === "param12") {
              this._renderStepStrip();
              this._renderStepEditor();
              this._renderStudio();
              if (this._pitchMenuOpen) this._refreshPitchMenu();
            }
          },
        });
      }
      this._values.set(config.id, config.init);
      this._controls.set(config.id, control);
    });

    for (let index = 0; index < 16; index += 1) {
      const pitchID = STEP_PITCH_IDS[index];
      const flagsID = STEP_FLAG_IDS[index];
      this._values.set(pitchID, STEP_PITCH_DEFAULTS[index]);
      this._values.set(flagsID, STEP_FLAG_DEFAULTS[index]);
      this._controls.set(pitchID, {
        setValue: (value, notify) => this._setStepValue(index, "pitch", value, notify),
      });
      this._controls.set(flagsID, {
        setValue: (value, notify) => this._setStepValue(index, "flags", value, notify),
      });
    }
  }

  _wireSteps() {
    this.querySelectorAll(".sequence-step").forEach(node => {
      node.addEventListener("click", event => {
        const index = Number(node.dataset.step);
        const pill = event.target instanceof Element ? event.target.closest(".step-pill") : null;
        if (pill) {
          const bit = pill.classList.contains("pill-a") ? 2 : 4;
          this._selectedStep = index;
          this._selectedSteps = new Set([index]);
          this._selectionAnchor = index;
          this._setStepValue(index, "flags", this._stepFlags(index) ^ bit, true);
          this._renderStepStrip();
          this._renderStepEditor();
          this._renderStudio();
          return;
        }
        if (this._studioMode) {
          this._selectStudioStep(index, event);
        } else {
          this._selectedStep = index;
          this._selectedSteps = new Set([index]);
          this._selectionAnchor = index;
        }
        this._renderStepStrip();
        this._renderStepEditor();
        this._renderStudio();
      });
      node.addEventListener("wheel", event => {
        event.preventDefault();
        const index = Number(node.dataset.step);
        const offset = event.deltaY < 0 ? 1 : -1;
        if (this._studioMode) {
          if (!this._selectedSteps.has(index)) {
            this._selectedStep = index;
            this._selectedSteps = new Set([index]);
            this._selectionAnchor = index;
          }
          this._transposeSelection(offset, "Step-strip pitch wheel");
        } else {
          this._selectedStep = index;
          this._selectedSteps = new Set([index]);
          this._selectionAnchor = index;
          this._setStepValue(index, "pitch", this._stepPitch(index) + offset, true);
        }
      }, { passive: false });
      node.addEventListener("contextmenu", event => {
        event.preventDefault();
        this._openPitchMenu(Number(node.dataset.step), event.clientX, event.clientY, node);
      });
      node.addEventListener("dblclick", event => {
        event.preventDefault();
        const index = Number(node.dataset.step);
        this._selectedStep = index;
        this._selectedSteps = new Set([index]);
        this._selectionAnchor = index;
        this._setStepValue(index, "flags", this._stepFlags(index) ^ 1, true);
        this._renderStepStrip();
        this._renderStepEditor();
        this._renderStudio();
      });
    });
  }

  _wireKeyboard() {
    this.querySelectorAll(".pitch-key").forEach(key => {
      key.addEventListener("click", () => {
        const semitone = Number(key.dataset.pitch);
        const current = this._stepPitch(this._selectedStep);
        const octave = current >= 12 ? 12 : 0;
        const next = clamp(octave + semitone, 0, 24);
        this._setStepValue(this._selectedStep, "pitch", next, true);
      });
    });
    this.querySelectorAll("[data-transpose]").forEach(button => {
      button.addEventListener("click", () => {
        const offset = Number(button.dataset.transpose);
        this._setStepValue(this._selectedStep, "pitch", this._stepPitch(this._selectedStep) + offset, true);
      });
    });
    this.querySelectorAll("[data-flag]").forEach(button => {
      button.addEventListener("click", () => {
        const bit = Number(button.dataset.flag);
        const flags = this._stepFlags(this._selectedStep);
        this._setStepValue(this._selectedStep, "flags", flags ^ bit, true);
      });
    });
    this.querySelector('[data-classic-action="clear-step"]')?.addEventListener("click", () => {
      const index = this._selectedStep;
      this._mutatePattern("Clear step", draft => {
        draft[index] = { pitch: 0, flags: 0 };
      });
    });
  }

  _wireStudio() {
    this.querySelector(".studio-toggle")?.addEventListener("click", event => {
      const segment = event.target instanceof Element
        ? event.target.closest(".classic-label, .studio-label, .arp-label")
        : null;
      const view = segment?.classList.contains("studio-label") ? "studio"
        : segment?.classList.contains("arp-label") ? "arp"
        : segment ? "classic"
        : this._studioMode || this._arpView ? "classic" : "studio";
      this._setViewMode(view);
    });

    this.querySelector(".studio-scale")?.addEventListener("click", () => {
      this._setScaleMenuOpen(!this._scaleMenuOpen);
    });
    this.querySelectorAll(".scale-menu [data-scale]").forEach(option => {
      option.addEventListener("click", () => {
        this._generationScaleIndex = Number(option.dataset.scale) % GENERATION_SCALES.length;
        this._setScaleMenuOpen(false);
        this._updateStudioToolbar();
        this._showStudioToast(`SCALE · ${this._generationScale().label}`);
      });
    });

    this.querySelectorAll("[data-studio-action]").forEach(button => {
      button.addEventListener("click", () => {
        if (button.dataset.studioAction === "choose-note") {
          const box = button.getBoundingClientRect();
          this._openPitchMenu(
            this._selectedStep,
            box.left + box.width / 2,
            box.top + box.height / 2,
            button
          );
        } else {
          this._runStudioAction(button.dataset.studioAction);
        }
      });
    });

    this.querySelectorAll(".studio-cell").forEach(cell => {
      const index = Number(cell.dataset.step);
      const kind = cell.dataset.kind;
      cell.addEventListener("pointerdown", event => {
        if (!this._studioMode) return;
        if (event.button !== 0) return;
        if (kind === "pitch") {
          this._selectStudioStep(index, event);
          this._renderStepStrip();
          this._renderStepEditor();
          this._renderStudio();
          return;
        }
        if (!this._selectedSteps.has(index)) {
          this._selectedStep = index;
          this._selectedSteps = new Set([index]);
          this._selectionAnchor = index;
        }
        const bit = kind === "gate" ? 1 : kind === "accent" ? 2 : 4;
        const targetOn = (this._stepFlags(index) & bit) === 0;
        this._paintState = {
          kind,
          bit,
          targetOn,
          before: this._stepSnapshot(),
          visited: new Set(),
        };
        this._paintStudioCell(index);
        event.preventDefault();
      });
      cell.addEventListener("pointerenter", () => {
        if (this._paintState?.kind === kind) this._paintStudioCell(index);
      });
      if (kind === "pitch") {
        cell.addEventListener("wheel", event => {
          if (!this._studioMode) return;
          event.preventDefault();
          if (!this._selectedSteps.has(index)) {
            this._selectedStep = index;
            this._selectedSteps = new Set([index]);
            this._selectionAnchor = index;
          }
          this._transposeSelection(event.deltaY < 0 ? 1 : -1, "Pitch wheel");
        }, { passive: false });
        cell.addEventListener("contextmenu", event => {
          event.preventDefault();
          this._openPitchMenu(index, event.clientX, event.clientY, cell);
        });
        cell.addEventListener("dblclick", event => {
          event.preventDefault();
          this._selectedStep = index;
          this._selectedSteps = new Set([index]);
          this._selectionAnchor = index;
          this._setStepValue(index, "flags", this._stepFlags(index) ^ 1, true);
          this._renderStepStrip();
          this._renderStepEditor();
          this._renderStudio();
        });
      }
    });

    this._studioPointerEnd = () => {
      if (!this._paintState) return;
      this._pushHistory(this._paintState.before, `Paint ${this._paintState.kind}`);
      this._paintState = null;
      this._renderStudio();
    };
    const matrix = this.querySelector(".studio-matrix");
    matrix?.addEventListener("pointerup", this._studioPointerEnd);
    matrix?.addEventListener("pointercancel", this._studioPointerEnd);
    matrix?.addEventListener("pointerleave", this._studioPointerEnd);

    this._studioKeyDown = event => {
      const command = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();
      if (this._distortionOpen && event.key === "Escape") return;
      if (this._pitchMenuOpen && event.key === "Escape") return;
      if (this._scaleMenuOpen && event.key === "Escape") {
        event.preventDefault();
        this._setScaleMenuOpen(false);
        return;
      }
      if (this._phraseMenuOpen && event.key === "Escape") {
        event.preventDefault();
        this._setPhraseMenuOpen(false);
        return;
      }
      if (!command && key === "m") {
        event.preventDefault();
        this._setViewMode(this._studioMode ? "classic" : "studio");
        return;
      }
      if (!this._studioMode) return;
      if (command && key === "z") {
        event.preventDefault();
        this._runStudioAction(event.shiftKey ? "redo" : "undo");
      } else if (command && key === "y") {
        event.preventDefault();
        this._runStudioAction("redo");
      } else if (command && key === "c") {
        event.preventDefault();
        this._runStudioAction("copy");
      } else if (command && key === "v") {
        event.preventDefault();
        this._runStudioAction("paste");
      } else if (event.key === "Escape") {
        event.preventDefault();
        this._setStudioMode(false);
      }
    };
    this.addEventListener("keydown", this._studioKeyDown);
  }

  _wirePitchMenu() {
    this.querySelector(".pitch-menu-close")?.addEventListener("click", () => {
      this._closePitchMenu();
    });
    this.querySelectorAll(".pitch-menu-choice").forEach(button => {
      button.addEventListener("click", () => {
        this._setPitchMenuChoice(Number(button.dataset.pitchValue));
      });
    });
    this._pitchMenuKeyDown = event => {
      if (!this._pitchMenuOpen || event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      this._closePitchMenu();
    };
    this._pitchMenuOutsidePointer = event => {
      if (!this._pitchMenuOpen || event.target.closest(".pitch-menu")) return;
      this._closePitchMenu(false);
    };
    this.addEventListener("keydown", this._pitchMenuKeyDown);
    this.addEventListener("pointerdown", this._pitchMenuOutsidePointer, true);
  }

  _octaveLabel(pitch) {
    return `OCT +${Math.floor(clamp(Math.round(pitch), 0, 24) / 12)}`;
  }

  _openPitchMenu(index, clientX, clientY, returnFocus) {
    const target = clamp(Math.round(index), 0, 15);
    if (this._studioMode && this._selectedSteps.has(target)) {
      this._selectedStep = target;
    } else {
      this._selectedStep = target;
      this._selectedSteps = new Set([target]);
      this._selectionAnchor = target;
    }
    this._pitchMenuTargets = this._studioMode ? this._selectedIndices() : [target];
    this._pitchMenuReturnFocus = returnFocus ?? null;
    this._pitchMenuOpen = true;
    this._renderStepStrip();
    this._renderStepEditor();
    this._renderStudio();

    const menu = this.querySelector(".pitch-menu");
    const chassis = this.querySelector(".chassis");
    if (!menu || !chassis) return;
    menu.hidden = false;
    menu.setAttribute("aria-hidden", "false");
    const bounds = chassis.getBoundingClientRect();
    const scaleX = bounds.width / 1180 || 1;
    const scaleY = bounds.height / 580 || 1;
    const localX = (Number(clientX) - bounds.left) / scaleX;
    const localY = (Number(clientY) - bounds.top) / scaleY;
    const menuWidth = 394;
    const menuHeight = 278;
    const left = clamp(localX - menuWidth / 2, 18, 1180 - menuWidth - 18);
    const preferredTop = localY + 12;
    const top = preferredTop + menuHeight <= 562
      ? preferredTop
      : clamp(localY - menuHeight - 12, 18, 562 - menuHeight);
    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
    this._refreshPitchMenu();
    queueMicrotask(() => {
      const initialFocus = menu.querySelector(".pitch-menu-choice.active")
        ?? menu.querySelector(".pitch-menu-choice");
      initialFocus?.focus();
    });
  }

  _refreshPitchMenu() {
    if (!this._pitchMenuOpen) return;
    const root = Math.round(this._values.get("param12") ?? 36);
    const targets = this._pitchMenuTargets.length ? this._pitchMenuTargets : [this._selectedStep];
    const pitches = targets.map(index => this._stepPitch(index));
    const commonPitch = pitches.every(pitch => pitch === pitches[0]) ? pitches[0] : -1;
    const title = this.querySelector(".pitch-menu-title");
    if (title) {
      title.textContent = targets.length === 1
        ? `STEP ${String(targets[0] + 1).padStart(2, "0")} · ${noteName(root + pitches[0]).replace("#", "♯")}`
        : `${targets.length} STEPS · ${commonPitch >= 0
          ? noteName(root + commonPitch).replace("#", "♯")
          : "MIXED NOTES"}`;
    }
    this.querySelectorAll(".pitch-menu-choice").forEach(button => {
      const pitch = Number(button.dataset.pitchValue);
      const absolute = noteName(root + pitch).replace("#", "♯");
      button.querySelector("strong").textContent = absolute;
      button.querySelector("small").textContent = this._octaveLabel(pitch);
      button.classList.toggle("active", pitch === commonPitch);
      button.setAttribute("aria-checked", `${pitch === commonPitch}`);
      button.setAttribute("aria-label", `Set ${targets.length === 1 ? `step ${targets[0] + 1}` : `${targets.length} selected steps`} to ${absolute}, ${this._octaveLabel(pitch)}`);
      button.dataset.tooltip = `Set ${targets.length === 1 ? `step ${targets[0] + 1}` : `${targets.length} selected steps`} to ${absolute} (${this._octaveLabel(pitch)}).`;
    });
  }

  _setPitchMenuChoice(rawPitch) {
    const pitch = clamp(Math.round(rawPitch), 0, 24);
    const targets = this._pitchMenuTargets.length
      ? [...this._pitchMenuTargets]
      : [this._selectedStep];
    this._mutatePattern("Choose note", draft => {
      targets.forEach(index => {
        draft[index].pitch = pitch;
        draft[index].flags |= 1;
      });
    });
    const root = Math.round(this._values.get("param12") ?? 36);
    this._showStudioToast(`${noteName(root + pitch).replace("#", "♯")} · ${this._octaveLabel(pitch)}`);
    this._closePitchMenu();
  }

  _closePitchMenu(restoreFocus = true) {
    if (!this._pitchMenuOpen) return;
    const focusTarget = this._pitchMenuReturnFocus;
    this._pitchMenuOpen = false;
    this._pitchMenuTargets = [];
    this._pitchMenuReturnFocus = null;
    const menu = this.querySelector(".pitch-menu");
    if (menu) {
      menu.hidden = true;
      menu.setAttribute("aria-hidden", "true");
    }
    if (restoreFocus) focusTarget?.focus?.();
  }

  _wireDistortion() {
    this.querySelector(".distortion-trigger")?.addEventListener("click", () => {
      this._setDistortionOpen(true);
    });
    this.querySelector(".distortion-close")?.addEventListener("click", () => {
      this._setDistortionOpen(false);
    });
    this.querySelector(".distortion-scrim")?.addEventListener("pointerdown", event => {
      if (event.target === event.currentTarget) this._setDistortionOpen(false);
    });
    this._distortionKeyDown = event => {
      if (!this._distortionOpen || event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      this._setDistortionOpen(false);
    };
    this.addEventListener("keydown", this._distortionKeyDown);
    this._renderDistortionState();
  }

  _wireMods() {
    this.querySelector(".mods-trigger")?.addEventListener("click", () => {
      this._setModsOpen(true);
    });
    this.querySelector(".mods-close")?.addEventListener("click", () => {
      this._setModsOpen(false);
    });
    this.querySelector(".mods-scrim")?.addEventListener("pointerdown", event => {
      if (event.target === event.currentTarget) this._setModsOpen(false);
    });
    this._modsKeyDown = event => {
      if (!this._modsOpen || event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      this._setModsOpen(false);
    };
    this.addEventListener("keydown", this._modsKeyDown);
    this._renderModState();
  }

  _setModsOpen(enabled) {
    this._modsOpen = Boolean(enabled);
    if (this._modsOpen) this._closePitchMenu(false);
    this.classList.toggle("mods-open", this._modsOpen);
    const trigger = this.querySelector(".mods-trigger");
    const scrim = this.querySelector(".mods-scrim");
    trigger?.setAttribute("aria-expanded", `${this._modsOpen}`);
    if (scrim) {
      scrim.hidden = !this._modsOpen;
      scrim.setAttribute("aria-hidden", `${!this._modsOpen}`);
    }
    if (this._modsOpen) {
      queueMicrotask(() => this.querySelector(".mods-close")?.focus());
    } else {
      trigger?.focus();
    }
  }

  _renderScope() {
    const v = id => Number(this._values.get(id) ?? ACIDIFY_GLOBALS.find(c => c.id === id)?.init ?? 0);
    const cutoff = v("param2"), reso = v("param3"), envmod = v("param4"), decay = v("param5"), accent = v("param6");
    const W = 238, H = 104;
    const fc = 30 * Math.pow(320, cutoff);
    const q = 0.55 + reso * 9;
    const points = [];
    for (let i = 0; i <= 60; i += 1) {
      const x = (i / 60) * W;
      const f = 20 * Math.pow(1000, i / 60);
      const r = f / fc;
      const mag = 1 / Math.sqrt(Math.pow(1 - r * r, 2) + Math.pow(r / q, 2));
      const db = clamp(20 * Math.log10(Math.max(1e-6, mag * mag)) / 2, -46, 22);
      const y = clamp(H * 0.62 - db * 1.7, 2, H - 2);
      points.push(`${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    const path = `M ${points.join(" L ")}`;
    const cutoffX = ((Math.log(clamp(fc, 20, 20000) / 20) / Math.log(1000)) * W).toFixed(1);
    const peak = H * 0.62 - envmod * 46;
    const len = 40 + decay * 150;
    const env = [`M 0 ${H - 6}`, `L 8 ${peak.toFixed(1)}`];
    for (let i = 1; i <= 16; i += 1) {
      const x = 8 + (len * i) / 16;
      const y = peak + (H - 6 - peak) * (1 - Math.exp(-3 * (i / 16)));
      env.push(`L ${Math.min(W, x).toFixed(1)} ${y.toFixed(1)}`);
    }
    env.push(`L ${W} ${H - 6}`);
    this.querySelector(".scope-curve")?.setAttribute("d", path);
    this.querySelector(".scope-fill")?.setAttribute("d", `${path} L ${W} ${H} L 0 ${H} Z`);
    this.querySelector(".scope-env")?.setAttribute("d", env.join(" "));
    const cursor = this.querySelector(".scope-cursor");
    if (cursor) { cursor.setAttribute("x1", cutoffX); cursor.setAttribute("x2", cutoffX); }
    const hz = this.querySelector(".scope-hz");
    if (hz) hz.textContent = `${Math.round(fc)} Hz`;
    const legend = { res: Math.round(reso * 100), env: Math.round(envmod * 100), dec: Math.round(decay * 100), acc: Math.round(accent * 100) };
    Object.entries(legend).forEach(([key, val]) => {
      const el = this.querySelector(`[data-scope="${key}"]`);
      if (el) el.textContent = String(val).padStart(2, "0");
    });
    const mirror = this.querySelector(".tempo-mirror");
    if (mirror) mirror.textContent = Number(v("param9")).toFixed(1);
  }

  _renderModState() {
    const modIds = ["param51", "param53", "param54", "param55", "param56", "param58"];
    const count = modIds.reduce((n, id) => n + (Number(this._values.get(id) ?? 0) >= 0.5 ? 1 : 0), 0);
    const trigger = this.querySelector(".mods-trigger");
    trigger?.classList.toggle("active", count > 0);
    trigger?.setAttribute("aria-label", count > 0
      ? `Circuit mods: ${count} of 6 active; open controls`
      : "Circuit mods stock; open controls");
    if (trigger) trigger.dataset.tooltip = count > 0
      ? `Circuit mods — ${count} of 6 active. The lamp stays lit while the circuit is modified.`
      : "Circuit mods — Devil Fish and x0x modifications. All off, so the instrument runs the stock 303 circuit.";
    const status = this.querySelector(".mods-status");
    if (status) {
      status.textContent = count > 0 ? `${count} OF 6 ACTIVE · MODIFIED CIRCUIT` : "ALL STOCK · FACTORY 303 CIRCUIT";
      status.classList.toggle("modified", count > 0);
    }
    const footerState = this.querySelector(".mods-footer-state");
    if (footerState) {
      footerState.textContent = count > 0 ? "AMOUNTS HELD WHILE OFF" : "DEFAULTS = STOCK";
      footerState.classList.toggle("modified", count > 0);
    }
    modIds.forEach(id => {
      const cell = this.querySelector(`.mod-cell[data-mod-enable="${id}"]`);
      if (!cell) return;
      const on = Number(this._values.get(id) ?? 0) >= 0.5;
      cell.classList.toggle("on", on);
      const state = cell.querySelector(".mod-state");
      if (state) state.textContent = on ? "ON" : "OFF";
    });
    this.querySelector(".mods-led")?.classList.toggle("lit", count > 0);
    this._renderModMirrors();
  }

  _renderModMirrors() {
    const pairs = [["param52", "param51"], ["param57", "param56"], ["param59", "param58"]];
    pairs.forEach(([amountId, enableId]) => {
      const mirror = this.querySelector(`.mod-slider[data-mirrors="${amountId}"]`);
      if (!mirror) return;
      const on = Number(this._values.get(enableId) ?? 0) >= 0.5;
      mirror.hidden = !on;
      if (!on) return;
      const cfg = ACIDIFY_GLOBALS.find(c => c.id === amountId);
      const value = Number(this._values.get(amountId) ?? cfg.init);
      const norm = (value - cfg.min) / (cfg.max - cfg.min || 1);
      const thumb = mirror.querySelector(".mod-slider-thumb");
      if (thumb) thumb.style.left = `${(4 + norm * 58).toFixed(1)}px`;
      const label = mirror.querySelector(".mod-slider-value");
      if (label) label.textContent = cfg.format ? cfg.format(value) : value.toFixed(2);
    });
  }

  _setScaleMenuOpen(open) {
    this._scaleMenuOpen = Boolean(open);
    const menu = this.querySelector(".scale-menu");
    const button = this.querySelector(".studio-scale");
    if (menu) {
      menu.hidden = !this._scaleMenuOpen;
      if (this._scaleMenuOpen) {
        menu.querySelectorAll("[data-scale]").forEach(option => {
          const active = Number(option.dataset.scale) === this._generationScaleIndex;
          option.classList.toggle("active", active);
          option.setAttribute("aria-checked", `${active}`);
        });
      }
    }
    button?.setAttribute("aria-expanded", `${this._scaleMenuOpen}`);
  }

  _wireDistMinis() {
    this.querySelectorAll(".dist-mini").forEach(mini => {
      const cfg = ACIDIFY_GLOBALS.find(c => c.id === mini.dataset.mini);
      const send = value => {
        const clamped = clamp(value, cfg.min, cfg.max);
        const owner = this._controls.get(cfg.id);
        if (owner) owner.setValue(clamped, true);
        else this._sendParameter(cfg.id, clamped);
        queueMicrotask(() => this._renderDistortionState());
      };
      const current = () => Number(this._values.get(cfg.id) ?? cfg.init);
      let drag = null;
      mini.addEventListener("pointerdown", event => {
        event.preventDefault();
        mini.setPointerCapture(event.pointerId);
        drag = { y: event.clientY, start: current() };
        this.pc.sendParameterGestureStart?.(cfg.id);
      });
      mini.addEventListener("pointermove", event => {
        if (!drag) return;
        const range = (cfg.max - cfg.min) || 1;
        const fine = event.shiftKey ? 0.25 : 1;
        send(drag.start + (drag.y - event.clientY) * (range / 160) * fine);
      });
      const end = event => {
        if (!drag) return;
        drag = null;
        if (mini.hasPointerCapture?.(event.pointerId)) mini.releasePointerCapture(event.pointerId);
        this.pc.sendParameterGestureEnd?.(cfg.id);
      };
      mini.addEventListener("pointerup", end);
      mini.addEventListener("pointercancel", end);
      mini.addEventListener("wheel", event => {
        event.preventDefault();
        const range = (cfg.max - cfg.min) || 1;
        send(current() + (event.deltaY < 0 ? 1 : -1) * range * 0.02);
      }, { passive: false });
      mini.addEventListener("dblclick", event => {
        event.preventDefault();
        send(cfg.init);
      });
      mini.addEventListener("keydown", event => {
        const range = (cfg.max - cfg.min) || 1;
        const step = range * (event.shiftKey ? 0.005 : 0.02);
        if (event.key === "ArrowUp" || event.key === "ArrowRight") { event.preventDefault(); send(current() + step); }
        else if (event.key === "ArrowDown" || event.key === "ArrowLeft") { event.preventDefault(); send(current() - step); }
      });
    });
  }

  _wirePhraseMenu() {
    const display = this.querySelector(".arp-phrase-display");
    display?.addEventListener("click", () => this._setPhraseMenuOpen(!this._phraseMenuOpen));
    display?.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        this._setPhraseMenuOpen(!this._phraseMenuOpen);
      }
    });
  }

  _wirePower() {
    this.querySelector(".power-cell")?.addEventListener("click", () => {
      const on = Number(this._values.get("param60") ?? 1) >= 0.5;
      this._sendParameter("param60", on ? 0 : 1);
      queueMicrotask(() => this._renderPowerState());
    });
  }

  _renderPowerState() {
    const cell = this.querySelector(".power-cell");
    if (!cell) return;
    const on = Number(this._values.get("param60") ?? 1) >= 0.5;
    cell.classList.toggle("bypassed", !on);
    cell.setAttribute("aria-pressed", `${on}`);
    cell.dataset.tooltip = on
      ? "Bypass the whole instrument (dry signal passes through)."
      : "Plugin is bypassed — click to bring the instrument back online.";
    const label = cell.querySelector(".power-label");
    if (label) label.textContent = on ? "POWER" : "BYPASS";
    cell.querySelector(".power-led")?.classList.toggle("lit", on);
  }

  _wireModMirrors() {
    this.querySelectorAll(".mod-slider").forEach(mirror => {
      const amountId = mirror.dataset.mirrors;
      const cfg = ACIDIFY_GLOBALS.find(c => c.id === amountId);
      const apply = norm => {
        const value = cfg.min + clamp(norm, 0, 1) * (cfg.max - cfg.min);
        const owner = this._controls.get(amountId);
        if (owner) owner.setValue(value, true);
        else this._sendParameter(amountId, value);
        queueMicrotask(() => this._renderModMirrors());
      };
      const track = mirror.querySelector(".mod-slider-track");
      if (!track) return;
      track.addEventListener("pointerdown", event => {
        event.preventDefault();
        track.setPointerCapture(event.pointerId);
        const box = track.getBoundingClientRect();
        const move = e => apply((e.clientX - box.left - 4) / 58);
        move(event);
        const up = () => {
          track.removeEventListener("pointermove", move);
          track.removeEventListener("pointerup", up);
        };
        track.addEventListener("pointermove", move);
        track.addEventListener("pointerup", up);
      });
      track.addEventListener("wheel", event => {
        event.preventDefault();
        const value = Number(this._values.get(amountId) ?? cfg.init);
        const norm = (value - cfg.min) / (cfg.max - cfg.min || 1);
        apply(norm + (event.deltaY > 0 ? -0.02 : 0.02));
      }, { passive: false });
      track.addEventListener("dblclick", event => {
        event.preventDefault();
        apply((cfg.init - cfg.min) / (cfg.max - cfg.min || 1));
      });
    });
  }

  _setDistortionOpen(enabled) {
    this._distortionOpen = Boolean(enabled);
    if (this._distortionOpen) this._closePitchMenu(false);
    this.classList.toggle("distortion-open", this._distortionOpen);
    const trigger = this.querySelector(".distortion-trigger");
    const scrim = this.querySelector(".distortion-scrim");
    trigger?.setAttribute("aria-expanded", `${this._distortionOpen}`);
    if (scrim) {
      scrim.hidden = !this._distortionOpen;
      scrim.setAttribute("aria-hidden", `${!this._distortionOpen}`);
    }
    if (this._distortionOpen) {
      queueMicrotask(() => this.querySelector(".distortion-close")?.focus());
    } else {
      trigger?.focus();
    }
  }

  _mirrorHostTempoToParameter() {
    const control = this._controls.get("param9");
    const config = ACIDIFY_GLOBALS.find(item => item.id === "param9");
    if (!control || !config || control.dragging) return null;
    control.setValue(clamp(this._effectiveTempo, config.min, config.max), false);
    const mirroredTempo = control.value;
    const storedTempo = Number(this._values.get("param9"));
    if (!Number.isFinite(storedTempo) || Math.abs(storedTempo - mirroredTempo) > 0.0001) {
      this._sendParameter("param9", mirroredTempo);
    }
    return mirroredTempo;
  }

  _renderTransportState() {
    const dawMode = Number(this._values.get("param49") ?? 0) >= 0.5;
    const manualRunning = Number(this._values.get("param10") ?? 0) >= 0.5;
    const hasTempo = (this._hostSyncFlags & 1) !== 0;
    const hasTransport = (this._hostSyncFlags & 2) !== 0;
    const hasPosition = (this._hostSyncFlags & 4) !== 0;
    const hostReady = hasTempo && hasTransport;
    const runHostControlled = dawMode && hasTransport;
    const tempoHostControlled = dawMode && hasTempo;
    const mirroredTempo = tempoHostControlled ? this._mirrorHostTempoToParameter() : null;
    const internalTempo = Number(mirroredTempo ?? this._values.get("param9") ?? 128);
    const effectiveTempo = Number(dawMode && hasTempo ? this._effectiveTempo : internalTempo);
    const running = runHostControlled ? this._transportRunning : manualRunning;

    this.querySelector(".run-lamp")?.classList.toggle("lit", running);
    const runSwitch = this.querySelector('.run-switch[data-param="param10"]');
    runSwitch?.classList.toggle("is-on", running);
    runSwitch?.classList.toggle("daw-controlled", runHostControlled);
    runSwitch?.setAttribute("aria-disabled", `${runHostControlled}`);
    if (runSwitch) runSwitch.dataset.tooltip = runHostControlled
      ? "Transport follows the DAW"
      : dawMode
        ? "No DAW transport received; RUN/STOP controls the internal fallback"
        : CONTROL_TOOLTIPS.param10;
    const runButton = runSwitch?.querySelector('[data-value="0"]');
    if (runButton) runButton.textContent = runHostControlled ? "DAW FOLLOW" : "RUN / STOP";

    const tempoBox = this.querySelector(".tempo-cell");
    tempoBox?.classList.toggle("daw-locked", tempoHostControlled);
    const tempoDial = tempoBox?.querySelector(".dial");
    tempoDial?.setAttribute("aria-disabled", `${tempoHostControlled}`);
    if (tempoDial) tempoDial.tabIndex = tempoHostControlled ? -1 : 0;
    if (tempoBox) tempoBox.dataset.tooltip = tempoHostControlled
      ? "Tempo follows the DAW and is mirrored to this knob. Switch to INT to keep the current BPM and make fine manual adjustments."
      : dawMode
        ? "No DAW tempo received; this sets the internal fallback BPM"
        : CONTROL_TOOLTIPS.param9;

    const readout = this.querySelector(".clock-readout");
    if (readout) {
      readout.textContent = !dawMode
        ? `INT · ${formatTempo(internalTempo)}`
        : hostReady
          ? `DAW · ${formatTempo(effectiveTempo)}`
          : hasTempo
            ? `DAW ${formatTempo(effectiveTempo)} · INT RUN`
            : hasTransport
              ? `INT ${formatTempo(internalTempo)} · DAW RUN`
              : "DAW · INT FALLBACK";
      readout.classList.toggle("locked", dawMode && hostReady);
      readout.classList.toggle("waiting", dawMode && !hostReady);
      readout.dataset.tooltip = dawMode
        ? (hostReady
          ? (hasPosition
            ? "DAW tempo, transport and timeline position locked"
            : "DAW tempo and transport locked; timeline position unavailable")
          : hasTempo
            ? "DAW tempo received; transport uses manual RUN/STOP fallback"
            : hasTransport
              ? "DAW transport received; tempo uses the internal BPM fallback"
              : "Host sent no Cmajor timeline events; internal BPM and RUN/STOP remain active")
        : "Internal clock";
    }
  }

  _renderDistortionState() {
    const enabled = Number(this._values.get("param45") ?? 0) >= 0.5;
    const typeIndex = clamp(Math.round(Number(this._values.get("param46") ?? 0)), 0, 2);
    const name = DISTORTION_NAMES[typeIndex];
    const trigger = this.querySelector(".distortion-trigger");
    trigger?.classList.toggle("active", enabled);
    trigger?.setAttribute("aria-label", `Distortion ${enabled ? `${name} enabled` : "disabled"}; open controls`);
    if (trigger) trigger.dataset.tooltip = enabled
      ? `${name} distortion is active. Click to open the distortion controls.`
      : "Distortion is bypassed. Click to open the distortion controls.";
    const status = this.querySelector(".distortion-status");
    if (status) status.textContent = enabled ? `${name} ACTIVE` : "TRUE BYPASS";
    this.querySelector(".distortion-led")?.classList.toggle("lit", enabled);
    this.querySelectorAll(".dist-mini").forEach(mini => {
      const cfg = ACIDIFY_GLOBALS.find(c => c.id === mini.dataset.mini);
      const value = Number(this._values.get(cfg.id) ?? cfg.init);
      const norm = (value - cfg.min) / (cfg.max - cfg.min || 1);
      mini.style.setProperty("--norm", norm.toFixed(4));
      mini.classList.toggle("stage-off", !enabled);
      mini.setAttribute("aria-valuemin", `${cfg.min}`);
      mini.setAttribute("aria-valuemax", `${cfg.max}`);
      mini.setAttribute("aria-valuenow", value.toFixed(3));
      mini.setAttribute("aria-valuetext", cfg.format ? cfg.format(value) : value.toFixed(2));
    });
    this.querySelector(".distortion-power-led")?.classList.toggle("lit", enabled);
    const powerLabel = this.querySelector(".distortion-power-label");
    if (powerLabel) powerLabel.textContent = enabled ? "ON" : "OFF";
  }

  _setViewMode(view, sendParams = true) {
    const currentMode = Math.round(Number(this._values.get("param61") ?? 0));
    if ((view === "arp") !== this._arpView) this._arpLiveNotes.fill(-1);
    this._arpView = view === "arp";
    this.classList.toggle("arp-mode", this._arpView);
    this._setStudioMode(view === "studio");
    const toggle = this.querySelector(".studio-toggle");
    toggle?.setAttribute("data-view", view);
    if (this._arpView) {
      const modeStatus = this.querySelector(".program-context");
      if (modeStatus) modeStatus.textContent = "ARPEGGIATOR";
      this.querySelector(".classic-editor")?.setAttribute("aria-hidden", "true");
      if (toggle) {
        toggle.setAttribute("aria-label", "Arpeggiator mode; pattern supplies gate, accent and slide");
        toggle.dataset.tooltip = "Arpeggiator: held MIDI notes supply the pitches, the 16-step pattern supplies rhythm, accent and slide.";
      }
    }
    this.querySelector(".arp-editor")?.setAttribute("aria-hidden", `${!this._arpView}`);
    if (sendParams) {
      if (this._arpView && currentMode === 0) {
        const restored = this._lastArpMode || 1;
        const owner = this._controls.get("param61");
        if (owner) owner.setValue(restored, true);
        else this._sendParameter("param61", restored);
      } else if (!this._arpView && currentMode > 0) {
        this._lastArpMode = currentMode;
        const owner = this._controls.get("param61");
        if (owner) owner.setValue(0, true);
        else this._sendParameter("param61", 0);
      }
    }
    this._renderArpState();
    this._renderStepStrip();
  }

  _captureArpToPattern() {
    const mode = Math.round(clamp(Number(this._values.get("param61") ?? 0), 0, 16));
    const phrase = Math.round(clamp(Number(this._values.get("param64") ?? 0), 0, 90));
    if (mode === 16 && phrase > 0) {
      // Bank-Phrase exakt uebernehmen: 8er-Phrasen auf 16 Steps kacheln,
      // negative Offsets oktavweise auf die Root normalisieren.
      const bank = ARP_PHRASES[phrase - 1];
      const rels = bank.data.filter(p => (p >> 6) & 1).map(p => (p & 63) - 12);
      const offset = Math.ceil(Math.max(0, -Math.min(0, ...rels)) / 12) * 12;
      this._mutatePattern(`Capture ${bank.name}`, draft => {
        for (let index = 0; index < 16; index += 1) {
          const packed = bank.data[index % bank.length];
          const gate = (packed >> 6) & 1;
          draft[index].flags = gate | (((packed >> 7) & 1) << 1) | (((packed >> 8) & 1) << 2);
          draft[index].pitch = gate ? clamp((packed & 63) - 12 + offset, 0, 24) : 0;
        }
      });
      this._showStudioToast(`${bank.name} → PATTERN`);
      return;
    }
    // Figur einfrieren: die zuletzt an jedem Step gespielte Note wird zum
    // Pattern-Pitch, Steps ohne gespielte Note werden zum Rest.
    if (!this._arpLiveNotes.some(note => note >= 0)) {
      this._showStudioToast("CAPTURE: NOCH NICHTS GESPIELT");
      return;
    }
    const root = Math.round(this._values.get("param12") ?? 36);
    const rels = this._arpLiveNotes.filter(note => note >= 0).map(note => note - root);
    const offset = Math.ceil(Math.max(0, -Math.min(0, ...rels)) / 12) * 12;
    this._mutatePattern("Capture arp", draft => {
      for (let index = 0; index < 16; index += 1) {
        const note = this._arpLiveNotes[index];
        if (note >= 0) {
          draft[index].pitch = clamp(note - root + offset, 0, 24);
          draft[index].flags |= 1;
        } else {
          draft[index].flags &= ~1;
        }
      }
    });
    this._showStudioToast("ARP → PATTERN");
  }

  _renderArpHeld() {
    const hint = this.querySelector(".arp-hint");
    if (!hint) return;
    const held = [...this._midiHeld].sort((a, b) => a - b);
    hint.textContent = held.length
      ? `KEYS  ${held.map(note => noteName(note).replace("#", "♯")).join(" · ")}`
      : "PATTERN GIBT GATE · ACCENT · SLIDE";
  }

  _renderArpState() {
    const names = ["OFF", "UP", "DOWN", "UP-DN", "RND", "UP-DN+", "DN-UP", "DN-UP+",
      "PLAYED", "DOUBLE", "CONV", "DIV", "PINKY", "THUMB", "RND-1", "WALK", "PHRASE"];
    const mode = Math.round(clamp(Number(this._values.get("param61") ?? 0), 0, 16));
    const phrase = Math.round(clamp(Number(this._values.get("param64") ?? 0), 0, 90));
    const readout = this.querySelector(".arp-readout");
    if (readout) readout.textContent = mode === 16
      ? (phrase <= 0 ? "PATTERN" : ARP_PHRASES[phrase - 1].name)
      : names[mode];
    this.querySelectorAll(".arp-direction [data-value]").forEach(button => {
      button.classList.toggle("active", Number(button.dataset.value) === mode && mode > 0);
    });
    const hold = Number(this._values.get("param63") ?? 0) >= 0.5;
    const holdLabel = this.querySelector(".arp-hold-label");
    if (holdLabel) holdLabel.textContent = hold ? "ON" : "OFF";
    this.querySelector(".arp-hold")?.classList.toggle("is-on", hold);
    this.querySelector(".arp-phrase-row")?.classList.toggle("phrase-idle", mode !== 16);
    this.classList.toggle("phrase-active", this._arpView && mode === 16 && phrase > 0);
    this._renderArpHeld();
    if (this._phraseMenuOpen) this._refreshPhraseMenu();
  }

  _setPhraseMenuOpen(open) {
    this._phraseMenuOpen = Boolean(open);
    const menu = this.querySelector(".phrase-menu");
    const display = this.querySelector(".arp-phrase-display");
    if (menu) {
      menu.hidden = !this._phraseMenuOpen;
      if (this._phraseMenuOpen) this._refreshPhraseMenu();
    }
    display?.setAttribute("aria-expanded", `${this._phraseMenuOpen}`);
  }

  _refreshPhraseMenu() {
    const menu = this.querySelector(".phrase-menu");
    if (!menu) return;
    if (!menu.childElementCount) {
      const entries = ['<button type="button" role="menuitemradio" data-phrase="0"><span>00 PATTERN</span><small>OWN</small></button>']
        .concat(ARP_PHRASES.map((phrase, index) =>
          `<button type="button" role="menuitemradio" data-phrase="${index + 1}"><span>${String(index + 1).padStart(2, "0")} ${phrase.name}</span><small>${phrase.length}</small></button>`));
      menu.innerHTML = entries.join("");
      menu.querySelectorAll("[data-phrase]").forEach(option => {
        option.addEventListener("click", () => {
          const value = Number(option.dataset.phrase);
          const owner = this._controls.get("param64");
          if (owner) owner.setValue(value, true);
          else this._sendParameter("param64", value);
          this._setPhraseMenuOpen(false);
          queueMicrotask(() => this._renderArpState());
        });
      });
    }
    const current = Math.round(clamp(Number(this._values.get("param64") ?? 0), 0, 90));
    menu.querySelectorAll("[data-phrase]").forEach(option => {
      const active = Number(option.dataset.phrase) === current;
      option.classList.toggle("active", active);
      option.setAttribute("aria-checked", `${active}`);
    });
  }

  _setStudioMode(enabled) {
    if (this._pitchMenuOpen) this._closePitchMenu(false);
    if (this._scaleMenuOpen) this._setScaleMenuOpen(false);
    this._studioMode = Boolean(enabled);
    this.classList.toggle("studio-mode", this._studioMode);
    const toggle = this.querySelector(".studio-toggle");
    toggle?.setAttribute("aria-pressed", `${this._studioMode}`);
    toggle?.setAttribute("aria-label", this._studioMode ? "Return to Classic mode" : "Open Studio edit mode");
    if (toggle) toggle.dataset.tooltip = this._studioMode
      ? "Return to the Classic step-programming view. Keyboard shortcut: M."
      : "Open the Studio matrix for multi-step editing. Keyboard shortcut: M.";
    const modeStatus = this.querySelector(".program-context");
    if (modeStatus) modeStatus.textContent = this._studioMode ? "STUDIO MATRIX" : "CLASSIC PROGRAMMING";
    this.querySelector(".classic-editor")?.setAttribute("aria-hidden", `${this._studioMode}`);
    this.querySelector(".studio-editor")?.setAttribute("aria-hidden", `${!this._studioMode}`);
    if (!this._studioMode) {
      this._selectedSteps = new Set([this._selectedStep]);
      this._paintState = null;
    }
    this._renderStepStrip();
    this._renderStepEditor();
    this._renderStudio();
  }

  _selectStudioStep(index, event = {}) {
    if (event.shiftKey) {
      const start = Math.min(this._selectionAnchor, index);
      const end = Math.max(this._selectionAnchor, index);
      this._selectedSteps = new Set(Array.from({ length: end - start + 1 }, (_, offset) => start + offset));
    } else if (event.ctrlKey || event.metaKey) {
      const next = new Set(this._selectedSteps);
      if (next.has(index) && next.size > 1) next.delete(index);
      else next.add(index);
      this._selectedSteps = next;
      this._selectionAnchor = index;
    } else {
      this._selectedSteps = new Set([index]);
      this._selectionAnchor = index;
    }
    this._selectedStep = index;
  }

  _selectedIndices() {
    return [...this._selectedSteps].sort((a, b) => a - b);
  }

  _stepSnapshot() {
    return Array.from({ length: 16 }, (_, index) => ({
      pitch: this._stepPitch(index),
      flags: this._stepFlags(index),
    }));
  }

  _snapshotMatches(a, b) {
    return a.every((step, index) => step.pitch === b[index].pitch && step.flags === b[index].flags);
  }

  _applySnapshot(snapshot, notify = true) {
    snapshot.forEach((step, index) => {
      const pitchID = STEP_PITCH_IDS[index];
      const flagsID = STEP_FLAG_IDS[index];
      const pitch = clamp(Math.round(step.pitch), 0, 24);
      const flags = clamp(Math.round(step.flags), 0, 7);
      if (pitch !== this._stepPitch(index)) {
        this._values.set(pitchID, pitch);
        if (notify) this._sendParameter(pitchID, pitch);
      }
      if (flags !== this._stepFlags(index)) {
        this._values.set(flagsID, flags);
        if (notify) this._sendParameter(flagsID, flags);
      }
    });
    this._renderStepStrip();
    this._renderStepEditor();
    this._renderStudio();
  }

  _pushHistory(before, label) {
    const after = this._stepSnapshot();
    if (this._snapshotMatches(before, after)) return;
    this._history.push({ before, after, label });
    if (this._history.length > 64) this._history.shift();
    this._future = [];
    this._updateStudioToolbar();
  }

  _mutatePattern(label, mutate) {
    const before = this._stepSnapshot();
    const draft = before.map(step => ({ ...step }));
    mutate(draft);
    this._applySnapshot(draft, true);
    this._pushHistory(before, label);
  }

  _paintStudioCell(index) {
    const state = this._paintState;
    if (!state || state.visited.has(index)) return;
    state.visited.add(index);
    const flags = this._stepFlags(index);
    const next = state.targetOn ? (flags | state.bit) : (flags & ~state.bit);
    this._setStepValue(index, "flags", next, true, false);
  }

  _transposeSelection(offset, label = "Transpose") {
    const selected = this._selectedIndices();
    this._mutatePattern(label, draft => {
      selected.forEach(index => {
        draft[index].pitch = clamp(draft[index].pitch + offset, 0, 24);
      });
    });
  }

  _generationScale() {
    return GENERATION_SCALES[this._generationScaleIndex] || GENERATION_SCALES[0];
  }

  _scalePitches() {
    const pitches = [];
    const degrees = this._generationScale().degrees;
    for (let octave = 0; octave < 2; octave += 1) {
      degrees.forEach(degree => pitches.push(octave * 12 + degree));
    }
    pitches.push(24);
    return [...new Set(pitches)].filter(pitch => pitch >= 0 && pitch <= 24).sort((a, b) => a - b);
  }

  _nearestScalePitch(rawPitch) {
    const pitch = clamp(Math.round(rawPitch), 0, 24);
    return this._scalePitches().reduce((nearest, candidate) =>
      Math.abs(candidate - pitch) < Math.abs(nearest - pitch) ? candidate : nearest
    );
  }

  _adjacentScalePitch(rawPitch, direction) {
    const scale = this._scalePitches();
    const nearest = this._nearestScalePitch(rawPitch);
    const index = scale.indexOf(nearest);
    return scale[clamp(index + (direction < 0 ? -1 : 1), 0, scale.length - 1)];
  }

  _generatedScalePitch() {
    const scale = this._scalePitches();
    // Bias generation toward the lower octave while retaining the full range.
    const shaped = Math.pow(Math.random(), 1.35);
    return scale[Math.min(scale.length - 1, Math.floor(shaped * scale.length))];
  }

  _runStudioAction(action) {
    const selected = this._selectedIndices();
    if (action === "scale") {
      this._generationScaleIndex = (this._generationScaleIndex + 1) % GENERATION_SCALES.length;
      this._updateStudioToolbar();
      this._showStudioToast(`SCALE · ${this._generationScale().label}`);
      return;
    }
    if (action === "undo") {
      const entry = this._history.pop();
      if (entry) {
        this._future.push(entry);
        this._applySnapshot(entry.before, true);
        this._showStudioToast(`UNDO · ${entry.label}`);
      }
    } else if (action === "redo") {
      const entry = this._future.pop();
      if (entry) {
        this._history.push(entry);
        this._applySnapshot(entry.after, true);
        this._showStudioToast(`REDO · ${entry.label}`);
      }
    } else if (action === "copy") {
      this._clipboard = selected.map(index => ({
        pitch: this._stepPitch(index),
        flags: this._stepFlags(index),
      }));
      this._showStudioToast(`COPIED ${selected.length} STEP${selected.length === 1 ? "" : "S"}`);
    } else if (action === "paste" && this._clipboard?.length) {
      this._mutatePattern("Paste", draft => {
        if (selected.length === 1) {
          this._clipboard.forEach((step, offset) => {
            const index = selected[0] + offset;
            if (index < 16) draft[index] = { ...step };
          });
        } else {
          selected.forEach((index, offset) => {
            draft[index] = { ...this._clipboard[offset % this._clipboard.length] };
          });
        }
      });
      this._showStudioToast("PASTED");
    } else if (action === "select-all") {
      this._selectedSteps = new Set(Array.from({ length: 16 }, (_, index) => index));
      this._showStudioToast("ALL STEPS SELECTED");
    } else if (action === "transpose-down") {
      this._transposeSelection(-12, "Octave down");
    } else if (action === "transpose-up") {
      this._transposeSelection(12, "Octave up");
    } else if (action === "rotate-left" || action === "rotate-right") {
      const targets = selected.length > 1 ? selected : Array.from({ length: 16 }, (_, index) => index);
      const direction = action === "rotate-left" ? -1 : 1;
      this._mutatePattern(direction < 0 ? "Rotate left" : "Rotate right", draft => {
        const source = targets.map(index => ({ ...draft[index] }));
        targets.forEach((index, position) => {
          const sourcePosition = (position - direction + targets.length) % targets.length;
          draft[index] = source[sourcePosition];
        });
      });
    } else if (action === "reverse") {
      const targets = selected.length > 1 ? selected : Array.from({ length: 16 }, (_, index) => index);
      this._mutatePattern("Reverse", draft => {
        const source = targets.map(index => ({ ...draft[index] })).reverse();
        targets.forEach((index, position) => {
          draft[index] = source[position];
        });
      });
      this._showStudioToast("ORDER REVERSED");
    } else if (action === "pitch-mirror") {
      const targets = selected.length > 1 ? selected : Array.from({ length: 16 }, (_, index) => index);
      this._mutatePattern("Pitch mirror", draft => {
        const pitches = targets.map(index => draft[index].pitch);
        const low = Math.min(...pitches);
        const high = Math.max(...pitches);
        targets.forEach(index => {
          draft[index].pitch = low + high - draft[index].pitch;
        });
      });
      this._showStudioToast("PITCH CONTOUR MIRRORED");
    } else if (action === "generate") {
      this._mutatePattern(`Generate ${this._generationScale().label}`, draft => {
        selected.forEach(index => {
          const gate = Math.random() < .84;
          const accent = gate && Math.random() < .28;
          const slide = gate && Math.random() < .2;
          draft[index].pitch = this._generatedScalePitch();
          draft[index].flags = (gate ? 1 : 0) | (accent ? 2 : 0) | (slide ? 4 : 0);
        });
        if (selected.every(index => (draft[index].flags & 1) === 0))
          draft[selected[0]].flags |= 1;
      });
      this._showStudioToast(`GENERATED · ${this._generationScale().label}`);
    } else if (action === "mutate") {
      this._mutatePattern(`Mutate ${this._generationScale().label}`, draft => {
        let changed = false;
        selected.forEach(index => {
          const before = { ...draft[index] };
          if (Math.random() < .35) {
            const direction = Math.random() < .5 ? -1 : 1;
            draft[index].pitch = this._adjacentScalePitch(draft[index].pitch, direction);
          }
          if (Math.random() < .1) draft[index].flags ^= 1;
          if ((draft[index].flags & 1) !== 0) {
            if (Math.random() < .18) draft[index].flags ^= 2;
            if (Math.random() < .12) draft[index].flags ^= 4;
          } else {
            draft[index].flags &= 1;
          }
          if (before.pitch !== draft[index].pitch || before.flags !== draft[index].flags)
            changed = true;
        });
        if (!changed) {
          const index = selected[0];
          const direction = draft[index].pitch >= 12 ? -1 : 1;
          let next = this._adjacentScalePitch(draft[index].pitch, direction);
          if (next === draft[index].pitch)
            next = this._adjacentScalePitch(draft[index].pitch, -direction);
          draft[index].pitch = next;
        }
      });
      this._showStudioToast(`MUTATED · ${this._generationScale().label}`);
    } else if (action === "rest") {
      this._mutatePattern("Toggle rest", draft => {
        const makeGate = selected.every(index => (draft[index].flags & 1) === 0);
        selected.forEach(index => {
          draft[index].flags = makeGate ? (draft[index].flags | 1) : (draft[index].flags & ~1);
        });
      });
    }
    this._renderStepStrip();
    this._renderStepEditor();
    this._renderStudio();
  }

  _showStudioToast(message) {
    const toast = this.querySelector(".studio-toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("visible");
    window.clearTimeout(this._toastTimer);
    this._toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 1050);
  }

  _updateStudioToolbar() {
    const selected = this._selectedIndices();
    const scale = this._generationScale();
    const scaleButton = this.querySelector(".studio-scale");
    const scaleValue = scaleButton?.querySelector("strong");
    if (scaleValue) scaleValue.textContent = scale.label;
    if (scaleButton) {
      scaleButton.setAttribute("aria-label", `Generation scale ${scale.label}; click for next scale`);
      scaleButton.dataset.tooltip = `Generate and Mutate currently use the root-relative ${scale.label} scale. Click to choose the next scale.`;
    }
    const selection = this.querySelector(".studio-selection");
    if (selection) {
      const root = Math.round(this._values.get("param12") ?? 36);
      const pitches = selected.map(index => this._stepPitch(index));
      const octaves = pitches.map(pitch => Math.floor(pitch / 12));
      const commonOctave = octaves.every(octave => octave === octaves[0]) ? octaves[0] : -1;
      selection.textContent = selected.length === 1
        ? `STEP ${String(selected[0] + 1).padStart(2, "0")} · ${noteName(root + pitches[0]).replace("#", "♯")} · OCT +${octaves[0]}`
        : `${selected.length} STEPS · ${commonOctave >= 0 ? `OCT +${commonOctave}` : "MIXED OCT"}`;
    }
    const undo = this.querySelector('[data-studio-action="undo"]');
    const redo = this.querySelector('[data-studio-action="redo"]');
    const paste = this.querySelector('[data-studio-action="paste"]');
    if (undo) undo.disabled = this._history.length === 0;
    if (redo) redo.disabled = this._future.length === 0;
    if (paste) paste.disabled = !this._clipboard?.length;
  }

  _isStepParam(id) {
    const n = Number(String(id).replace("param", ""));
    return n >= 13 && n <= 44;
  }

  _stepPitch(index) {
    return clamp(Math.round(this._values.get(STEP_PITCH_IDS[index]) ?? STEP_PITCH_DEFAULTS[index]), 0, 24);
  }

  _stepFlags(index) {
    return clamp(Math.round(this._values.get(STEP_FLAG_IDS[index]) ?? STEP_FLAG_DEFAULTS[index]), 0, 7);
  }

  _setStepValue(index, kind, raw, notify, record = notify) {
    const before = record ? this._stepSnapshot() : null;
    const isPitch = kind === "pitch";
    const id = isPitch ? STEP_PITCH_IDS[index] : STEP_FLAG_IDS[index];
    const value = clamp(Math.round(Number(raw) || 0), 0, isPitch ? 24 : 7);
    this._values.set(id, value);
    if (notify) this._sendParameter(id, value);
    this._renderStepStrip();
    this._renderStepEditor();
    this._renderStudio();
    if (this._pitchMenuOpen) this._refreshPitchMenu();
    if (before) this._pushHistory(before, isPitch ? "Edit pitch" : "Edit timing");
  }

  _renderStepStrip() {
    const patternLength = Math.max(1, Math.round(this._values.get("param11") ?? 16));
    const arpLive = this._arpView && Math.round(this._values.get("param61") ?? 0) > 0;
    this.querySelectorAll(".sequence-step").forEach((node, index) => {
      const flags = this._stepFlags(index);
      node.classList.toggle("selected", index === this._selectedStep);
      node.classList.toggle("multi-selected", this._studioMode && this._selectedSteps.has(index));
      node.classList.toggle("playing", index === this._playingStep);
      node.classList.toggle("beyond", index >= patternLength);
      node.classList.toggle("rest", (flags & 1) === 0);
      node.classList.toggle("accented", (flags & 2) !== 0);
      node.classList.toggle("sliding", (flags & 4) !== 0);
      const root = Math.round(this._values.get("param12") ?? 36);
      const pitch = this._stepPitch(index);
      const absoluteNote = noteName(root + pitch).replace("#", "♯");
      const states = [
        (flags & 1) !== 0 ? "Gate" : "Rest",
        (flags & 2) !== 0 ? "Accent" : "",
        (flags & 4) !== 0 ? "Slide" : "",
      ].filter(Boolean).join(", ");
      if (arpLive) {
        // Im Arp-Modus stammen die Tonhoehen aus den gehaltenen MIDI-Tasten;
        // die Zellen zeigen live die zuletzt an diesem Step gespielte Note.
        const liveNote = this._arpLiveNotes[index];
        const liveName = liveNote >= 0 ? noteName(liveNote).replace("#", "♯") : "";
        node.classList.toggle("arp-live", liveNote >= 0);
        node.querySelector(".step-note").textContent = liveNote >= 0 ? liveName : "···";
        const liveOctave = Math.floor((liveNote - root) / 12);
        node.querySelector(".step-octave").textContent = liveNote >= 0
          ? (liveOctave >= 0 ? `+${liveOctave}` : `${liveOctave}`) : "";
        node.setAttribute("aria-label", `Step ${index + 1}, ${states}; arpeggio plays ${liveNote >= 0 ? liveName : "the held MIDI notes"} here — the pattern supplies gate, accent and slide`);
        node.dataset.tooltip = `Step ${index + 1}: ${states}. The arpeggio note comes live from the held MIDI keys${liveNote >= 0 ? ` (last: ${liveName})` : ""}; the pattern step only supplies gate, accent and slide.`;
        return;
      }
      node.classList.remove("arp-live");
      node.querySelector(".step-note").textContent = (flags & 1) !== 0 ? absoluteNote : "REST";
      node.querySelector(".step-octave").textContent = `+${Math.floor(pitch / 12)}`;
      node.setAttribute("aria-label", `Step ${index + 1}, ${absoluteNote}, ${this._octaveLabel(pitch)}, ${states}; click to edit, double-click toggles gate, wheel changes semitone, right-click chooses a note`);
      node.dataset.tooltip = `Step ${index + 1}: ${absoluteNote}, ${this._octaveLabel(pitch)}, ${states}. Double-click toggles gate and rest; wheel changes one semitone; right-click opens direct note selection.`;
    });
    const caption = this.querySelector(".selection-caption");
    if (caption) {
      const root = Math.round(this._values.get("param12") ?? 36);
      const pitch = this._stepPitch(this._selectedStep);
      caption.textContent = `STEP ${String(this._selectedStep + 1).padStart(2, "0")} · ${noteName(root + pitch).replace("#", "♯")} · ${this._octaveLabel(pitch).toUpperCase()}`;
    }
    const position = this.querySelector(".step-position");
    if (position) {
      const length = Math.max(1, Math.round(this._values.get("param11") ?? 16));
      position.textContent = this._playingStep >= 0
        ? `${String(this._playingStep + 1).padStart(2, "0")} / ${length}`
        : `-- / ${length}`;
    }
    this._renderBassline();
  }

  _renderBassline() {
    const path = this.querySelector(".bassline-path");
    const slidePath = this.querySelector(".bassline-slide-path");
    const nodes = [...this.querySelectorAll(".bassline-node")];
    if (!path || !slidePath || nodes.length !== 16) return;

    const root = Math.round(this._values.get("param12") ?? 36);
    const points = Array.from({ length: 16 }, (_, index) => {
      const pitch = this._stepPitch(index);
      return {
        index,
        pitch,
        flags: this._stepFlags(index),
        x: 35 + index * (199 / 15),
        y: 24 - pitch * (18 / 24),
      };
    });
    path.setAttribute("d", points.map((point, index) =>
      `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`
    ).join(" "));
    slidePath.setAttribute("d", points.slice(0, -1)
      .filter(point => (point.flags & 4) !== 0)
      .map(point => {
        const next = points[point.index + 1];
        return `M ${point.x.toFixed(2)} ${point.y.toFixed(2)} L ${next.x.toFixed(2)} ${next.y.toFixed(2)}`;
      }).join(" "));

    nodes.forEach((node, index) => {
      const point = points[index];
      const absoluteNote = noteName(root + point.pitch).replace("#", "♯");
      node.setAttribute("cx", point.x.toFixed(2));
      node.setAttribute("cy", point.y.toFixed(2));
      node.dataset.pitch = `${point.pitch}`;
      node.classList.toggle("rest", (point.flags & 1) === 0);
      node.classList.toggle("accented", (point.flags & 2) !== 0);
      node.classList.toggle("sliding", (point.flags & 4) !== 0);
      node.classList.toggle("selected", this._selectedSteps.has(index));
      node.classList.toggle("playing", index === this._playingStep);
      node.setAttribute("aria-label", `Step ${index + 1}, ${absoluteNote}`);
    });

    const visual = this.querySelector(".bassline-visual");
    if (visual) {
      visual.dataset.tooltip = "Live pitch contour for all 16 steps. Red nodes are accented, amber links are slides, dim nodes are rests, and the bright ring follows playback.";
    }
  }

  _renderStepEditor() {
    const pitch = this._stepPitch(this._selectedStep);
    const flags = this._stepFlags(this._selectedStep);
    const root = Math.round(this._values.get("param12") ?? 36);
    const absoluteNote = root + pitch;
    const display = this.querySelector(".edit-readout");
    if (display) display.textContent = `${String(this._selectedStep + 1).padStart(2, "0")}  ${noteName(absoluteNote)}`;
    this.querySelectorAll(".pitch-key").forEach(key => {
      key.classList.toggle("active", Number(key.dataset.pitch) === pitch % 12);
    });
    this.querySelectorAll("[data-flag]").forEach(button => {
      const active = (flags & Number(button.dataset.flag)) !== 0;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", `${active}`);
    });
    const octave = this.querySelector(".octave-indicator");
    if (octave) octave.textContent = `${this._octaveLabel(pitch)} · ${pitch} SEMITONES FROM ROOT`;
  }

  _renderStudio() {
    this.querySelectorAll(".studio-ruler-group span").forEach((span, index) => {
      span.classList.toggle("playing", index === this._playingStep);
    });
    this.querySelectorAll(".studio-cell").forEach(cell => {
      const index = Number(cell.dataset.step);
      const kind = cell.dataset.kind;
      const flags = this._stepFlags(index);
      const active = kind === "pitch"
        ? this._selectedSteps.has(index)
        : (flags & (kind === "gate" ? 1 : kind === "accent" ? 2 : 4)) !== 0;
      cell.classList.toggle("active", active);
      cell.classList.toggle("selected", this._selectedSteps.has(index));
      cell.classList.toggle("playing", index === this._playingStep);
      cell.setAttribute("aria-pressed", `${active}`);
      if (kind === "pitch") {
        const root = Math.round(this._values.get("param12") ?? 36);
        const patternLength = Math.max(1, Math.round(this._values.get("param11") ?? 16));
        const pitch = this._stepPitch(index);
        const gate = (flags & 1) !== 0;
        const absoluteNote = noteName(root + pitch).replace("#", "♯");
        cell.classList.toggle("rest", !gate);
        cell.classList.toggle("beyond", index >= patternLength);
        const note = cell.querySelector(".step-note");
        if (note) note.textContent = gate ? absoluteNote : "REST";
        cell.setAttribute("aria-label", `Step ${index + 1} note ${absoluteNote}, ${this._octaveLabel(pitch)}; double-click toggles gate, wheel changes semitone, right-click chooses a note`);
        cell.dataset.tooltip = `Step ${index + 1}: ${absoluteNote}, ${this._octaveLabel(pitch)}. Double-click toggles gate and rest; wheel changes one semitone; right-click opens direct note selection.`;
      } else {
        const label = kind === "gate" ? "Gate" : kind === "accent" ? "Accent" : "Slide";
        const state = active ? "on" : "off";
        cell.setAttribute("aria-label", `Step ${index + 1} ${label}, ${state}`);
        cell.dataset.tooltip = `${label} is ${state} for step ${index + 1}. Click or drag across the lane to change it.`;
      }
    });
    this._renderStudioContour();
    this._updateStudioToolbar();
  }

  _renderStudioContour() {
    const svgs = [...this.querySelectorAll(".studio-contour-svg")];
    if (svgs.length !== 4) return;
    const GC = 40;
    const yFor = pitch => 66 - 8 - (Math.min(24, Math.max(0, pitch)) / 24) * (66 - 16);
    svgs.forEach((svg, group) => {
      const notes = [];
      const slides = [];
      let prev = null;
      for (let i = 0; i < 4; i += 1) {
        const index = group * 4 + i;
        const flags = this._stepFlags(index);
        if ((flags & 1) === 0) { prev = null; continue; }
        const y = yFor(this._stepPitch(index));
        const x0 = i * GC + 3;
        const x1 = (i + 1) * GC - 3;
        if (prev && prev.slide) slides.push(`M ${prev.x.toFixed(2)} ${prev.y.toFixed(2)} L ${x0.toFixed(2)} ${y.toFixed(2)}`);
        notes.push(`M ${x0.toFixed(2)} ${y.toFixed(2)} L ${x1.toFixed(2)} ${y.toFixed(2)}`);
        prev = { x: x1, y, slide: (flags & 4) !== 0 };
      }
      svg.querySelector(".contour-path").setAttribute("d", notes.join(" "));
      svg.querySelector(".contour-slide").setAttribute("d", slides.join(" "));
      const playhead = svg.querySelector(".contour-playhead");
      const inGroup = this._playingStep >= group * 4 && this._playingStep < group * 4 + 4;
      const x = inGroup ? ((this._playingStep - group * 4) + 0.5) * GC : 0;
      playhead.setAttribute("x1", `${x}`);
      playhead.setAttribute("x2", `${x}`);
      playhead.style.opacity = inGroup ? "1" : "0";
    });
  }

  _showMidiNote(note, active) {
    const key = this.querySelector(`.pitch-key[data-pitch="${((note % 12) + 12) % 12}"]`);
    key?.classList.toggle("midi", active);
  }

  _doScale() {
    const chassis = this.querySelector(".chassis");
    if (!chassis) return;
    const width = window.innerWidth || 1180;
    const height = window.innerHeight || 580;
    const style = this.style;
    style.width = `${width}px`;
    style.height = `${height}px`;
    let effectiveScale = this.getBoundingClientRect().width / width;
    if (!Number.isFinite(effectiveScale) || effectiveScale < 0.3 || effectiveScale > 3) effectiveScale = 1;
    style.width = `${width / effectiveScale}px`;
    style.height = `${height / effectiveScale}px`;
    let zoom = Math.min(width / 1180, height / 580) / effectiveScale;
    zoom = Math.round(clamp(zoom, 0.4, 2.5) * 20) / 20;
    chassis.style.zoom = zoom;
    chassis.style.transform = "";
  }

  getHTML() {
    const dial = (id, opts = {}) => {
      const c = ACIDIFY_GLOBALS.find(item => item.id === id);
      const slot = opts.modSlot ? `
          <div class="mod-slot" data-mod-slot="${opts.modSlot}">
            <div class="mod-slider" data-mirrors="${opts.modSlot}" hidden>
              <div class="mod-slider-track" role="slider" tabindex="0" aria-label="Mod amount"><i class="mod-slider-rail"></i><i class="mod-slider-thumb"></i></div>
              <span class="mod-slider-value"></span>
            </div>
          </div>` : (opts.plainSlot ? `
          <div class="mod-slot"></div>` : "");
      return `
        <div class="control knob-control silver-knob${opts.size ? ` ${opts.size}` : ""}" data-param="${c.id}" data-endpoint-id="${c.id}" data-min="${c.min}" data-max="${c.max}" data-step="${c.step}" data-init="${c.init}" data-control="dial">
          <div class="control-label">${c.label}</div>
          <div class="chrome-wrap">
            <div class="tick-ring"></div>
            <div class="dial" role="slider" tabindex="0" aria-label="${c.label}" aria-valuemin="${c.min}" aria-valuemax="${c.max}">
              <div class="dial-cap"></div>
              <div class="pointer-wrap"><i class="dial-pointer"></i></div>
            </div>
          </div>
          <div class="led-box"><span class="value-label">--</span></div>${slot}
        </div>`;
    };
    const steps = Array.from({ length: 4 }, (_, group) => `
      <div class="step-group" role="group" aria-label="Steps ${group * 4 + 1} to ${group * 4 + 4}">
        ${Array.from({ length: 4 }, (_, position) => {
          const index = group * 4 + position;
          return `
            <button class="sequence-step" data-step="${index}" aria-label="Step ${index + 1}"
              aria-haspopup="dialog">
              <span class="step-head"><span class="step-index">${String(index + 1).padStart(2, "0")}</span>
                <span class="step-pills"><i class="step-pill pill-a">A</i><i class="step-pill pill-s">S</i></span></span>
              <span class="step-octave" hidden>+0</span><span class="step-led" hidden></span>
              <span class="step-sel"></span>
              <span class="step-well"></span>
              <span class="step-cap"><i class="cap-rocker"></i><i class="cap-nub"><i class="cap-led"></i></i><i class="cap-foot"></i></span>
              <span class="step-playbar"></span>
              <span class="step-note-field"><span class="step-note">--</span></span>
            </button>`;
        }).join("")}
      </div>`).join("");
    const pitchKeys = NOTE_NAMES.map((name, index) => `
      <button class="pitch-key ${name.includes("#") ? "black-key" : "white-key"}" data-pitch="${index}"
        aria-label="Set selected step to ${name}" title="Set selected step to ${name}">
        <span>${name.replace("#", "♯")}</span>
      </button>`).join("");
    const studioLanes = [
      { kind: "accent", label: "ACCENT" },
      { kind: "slide", label: "SLIDE" },
    ].map(lane => `
      <div class="studio-lane" data-lane="${lane.kind}">
        <span class="studio-lane-label">${lane.label}</span>
        <div class="studio-lane-cells">
          ${Array.from({ length: 4 }, (_, group) => `
            <div class="studio-cell-group" role="group" aria-label="${lane.label} steps ${group * 4 + 1} to ${group * 4 + 4}">
              ${Array.from({ length: 4 }, (_, position) => {
                const index = group * 4 + position;
                return `<button class="studio-cell" data-kind="${lane.kind}" data-step="${index}"
                  ${lane.kind === "pitch" ? 'aria-haspopup="dialog"' : ""}
                  aria-label="Step ${index + 1} ${lane.label}" aria-pressed="false"></button>`;
              }).join("")}
            </div>`).join("")}
        </div>
      </div>`).join("");
    const studioContour = Array.from({ length: 4 }, () => `
      <svg class="studio-contour-svg" viewBox="0 0 160 66" preserveAspectRatio="none" aria-hidden="true">
        <path class="contour-slide"></path><path class="contour-path"></path>
        <line class="contour-playhead" x1="0" y1="0" x2="0" y2="66"></line>
      </svg>`).join("");
    const studioPitchGate = Array.from({ length: 4 }, (_, group) => `
      <div class="studio-cell-group" role="group" aria-label="Pitch and gate steps ${group * 4 + 1} to ${group * 4 + 4}">
        ${Array.from({ length: 4 }, (_, position) => {
          const index = group * 4 + position;
          return `<button class="studio-cell studio-step" data-kind="pitch" data-step="${index}" aria-haspopup="dialog"
              aria-label="Step ${index + 1} note" aria-pressed="false">
            <span class="step-lamp"></span>
            <span class="step-sel"></span>
            <span class="step-well"></span>
            <span class="step-cap"><i class="cap-rocker"></i><i class="cap-nub"><i class="cap-led"></i></i><i class="cap-foot"></i></span>
            <span class="step-playbar"></span>
            <span class="step-note-field"><span class="step-note">--</span></span>
          </button>`;
        }).join("")}
      </div>`).join("");
    const studioRuler = Array.from({ length: 4 }, (_, group) => `
      <div class="studio-cell-group studio-ruler-group" aria-hidden="true">
        ${Array.from({ length: 4 }, (_, position) => {
          const index = group * 4 + position;
          return `<span>${String(index + 1).padStart(2, "0")}</span>`;
        }).join("")}
      </div>`).join("");
    const pitchChoices = Array.from({ length: 25 }, (_, pitch) => `
      <button class="pitch-menu-choice" type="button" role="radio" data-pitch-value="${pitch}"
        aria-checked="false">
        <strong>--</strong><small>OCT +${Math.floor(pitch / 12)}</small>
      </button>`).join("");
    const basslineNodes = Array.from({ length: 16 }, (_, index) =>
      `<circle class="bassline-node" data-step="${index}" cx="${35 + index * (199 / 15)}" cy="24" r="2"></circle>`
    ).join("");

    return `
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body, html { overflow: hidden; margin: 0; padding: 0; background: transparent; }
  ::-webkit-scrollbar { width: 0 !important; height: 0 !important; display: none !important; }
  * { scrollbar-width: none; }
  acidify-patch-view {
    display: flex; align-items: center; justify-content: center;
    width: 100%; height: 100%; min-width: 0; min-height: 0; overflow: hidden;
    background: transparent; color: #171713; font-family: "Arial Narrow", "Helvetica Neue", Arial, sans-serif;
    user-select: none; -webkit-user-select: none;
  }
  acidify-patch-view button { font: inherit; color: inherit; border: 0; outline: 0; }
  acidify-patch-view .chassis {
    position: relative; flex: 0 0 auto; width: 1180px; height: 580px; overflow: hidden;
    border-radius: 33px 33px 27px 27px;
    background:
      radial-gradient(ellipse at 50% -18%, rgba(255,255,255,.9) 0 12%, transparent 54%),
      linear-gradient(90deg, rgba(255,255,255,.4) 0, transparent 2.4%, transparent 97%, rgba(40,38,31,.33) 100%),
      repeating-linear-gradient(7deg, rgba(255,255,255,.025) 0 1px, rgba(57,54,45,.025) 1px 3px),
      linear-gradient(180deg, #e5e1d2 0%, #d1ccbb 48%, #b5ae9c 84%, #969082 100%);
    border: 1px solid #777268;
    box-shadow:
      0 30px 46px rgba(0,0,0,.46),
      0 7px 12px rgba(0,0,0,.32),
      inset 0 3px 1px rgba(255,255,255,.82),
      inset 0 -8px 12px rgba(61,56,44,.34),
      inset 4px 0 5px rgba(255,255,255,.22),
      inset -4px 0 6px rgba(60,56,48,.16);
  }
  acidify-patch-view .chassis::before {
    content: ""; position: absolute; z-index: 0; pointer-events: none;
    left: 14px; right: 14px; top: 11px; bottom: 16px; border-radius: 24px 24px 18px 18px;
    border: 1px solid rgba(73,70,62,.42);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.74), 0 1px 0 rgba(255,255,255,.35);
  }
  acidify-patch-view .chassis::after {
    content: ""; position: absolute; z-index: 0; pointer-events: none;
    left: 45px; right: 45px; bottom: 5px; height: 10px; border-radius: 0 0 40% 40%;
    background: linear-gradient(180deg, rgba(72,68,57,.04), rgba(47,43,36,.28));
    filter: blur(.3px);
  }
  acidify-patch-view .panel {
    position: absolute; z-index: 1; left: 28px; top: 23px; width: 1120px; height: 522px;
    border: 1px solid #77776f; border-radius: 9px;
    background:
      radial-gradient(ellipse at 34% -12%, rgba(255,255,255,.38), transparent 47%),
      repeating-linear-gradient(90deg, rgba(255,255,255,.035) 0 1px, rgba(49,50,48,.025) 1px 2px, transparent 2px 5px),
      linear-gradient(164deg, #dddeda 0%, #cacbc7 45%, #b7b8b4 100%);
    box-shadow:
      inset 0 1px 0 #f8f8f3,
      inset 0 -2px 4px rgba(0,0,0,.25),
      inset 1px 0 1px rgba(255,255,255,.48),
      0 3px 4px rgba(0,0,0,.34);
  }
  acidify-patch-view .panel::before {
    content: ""; position: absolute; inset: 1px; z-index: 0; pointer-events: none; border-radius: 8px;
    opacity: .17; mix-blend-mode: multiply;
    background:
      radial-gradient(circle at 16% 26%, rgba(36,34,30,.16) 0 .45px, transparent .8px),
      radial-gradient(circle at 77% 64%, rgba(255,255,255,.32) 0 .45px, transparent .85px);
    background-size: 13px 17px, 17px 13px;
  }
  acidify-patch-view .panel > * { z-index: 1; }
  acidify-patch-view .panel > section,
  acidify-patch-view .panel > .footer-mark { z-index: 2; }
  acidify-patch-view .panel::after {
    content: ""; position: absolute; left: 4px; right: 4px; bottom: 2px; height: 6px;
    border-radius: 0 0 7px 7px;
    background: linear-gradient(180deg, transparent, rgba(57,57,53,.17));
    pointer-events: none;
  }
  acidify-patch-view .top-strip {
    --fib-1: 8px;
    --fib-2: 13px;
    --fib-3: 21px;
    position: absolute; left: 24px; right: 24px; top: 22px; height: 214px;
    border-bottom: 2px solid #24241f;
    box-shadow: 0 1px 0 rgba(255,255,255,.44);
  }
  acidify-patch-view .branding {
    position: absolute; left: 16px; top: 8px; width: 228px; height: 58px;
  }
  acidify-patch-view .brand {
    font-family: Impact, "Arial Black", sans-serif; font-size: 29px; line-height: 30px;
    letter-spacing: 1px; color: #1c1c19; text-shadow: 0 .4px rgba(255,255,255,.28);
  }
  acidify-patch-view .brand .acid { color: #a9201a; }
  acidify-patch-view .model {
    margin-top: -1px; font-size: 11px; font-weight: 900; letter-spacing: 2.8px;
    text-shadow: 0 .4px rgba(255,255,255,.26);
  }
  acidify-patch-view .computer { color: #55554e; font-size: 8px; letter-spacing: 2.4px; margin-top: 3px; }
  acidify-patch-view .transport-bank,
  acidify-patch-view .tone-bank,
  acidify-patch-view .volume-bank {
    border: 1px solid rgba(58,58,53,.72); border-radius: 6px;
    background:
      linear-gradient(135deg, rgba(255,255,255,.13), transparent 42%),
      linear-gradient(180deg, rgba(112,112,105,.025), rgba(255,255,255,.045));
    box-shadow:
      inset 0 1px rgba(255,255,255,.52),
      inset 1px 0 rgba(255,255,255,.2),
      0 1px rgba(255,255,255,.3);
  }
  acidify-patch-view .transport-bank {
    position: absolute; left: 0; top: 75px; width: 260px; height: 116px;
    display: grid; grid-template-columns: 104px 1fr; gap: 13px;
    padding: 18px 10px 8px;
  }
  acidify-patch-view .bank-title {
    position: absolute; left: 12px; top: 5px;
    color: #55554e; font-size: 6.5px; line-height: 8px; font-weight: 900; letter-spacing: 1.35px;
    text-shadow: 0 .5px rgba(255,255,255,.48);
  }
  acidify-patch-view .tempo-box, acidify-patch-view .mode-box {
    position: relative; min-width: 0; padding-top: 1px;
  }
  acidify-patch-view .mini-title {
    text-align: center; font-size: 8px; font-weight: 900; letter-spacing: 1.2px;
  }
  acidify-patch-view .transport-bank .knob-control {
    zoom: .68; width: 104px; height: 118px; margin: 2px auto 0;
  }
  acidify-patch-view .transport-bank .control-label { margin-top: 10px; }
  acidify-patch-view .mode-box {
    display: flex; flex-direction: column; align-items: center; gap: 7px;
    border-left: 1px solid rgba(68,68,63,.45);
    box-shadow: inset 1px 0 rgba(255,255,255,.38);
  }
  acidify-patch-view .run-lamp, acidify-patch-view .output-lamp {
    position: relative; width: 14px; height: 14px; border-radius: 50%; border: 1px solid #4f1a15;
    background:
      radial-gradient(circle at 34% 25%, rgba(255,255,255,.38) 0 5%, transparent 8%),
      radial-gradient(circle at 45% 42%, #7f241c, #4a1511 48%, #210906 78%);
    box-shadow:
      0 1px 0 rgba(255,255,255,.62),
      0 0 0 2px rgba(72,72,67,.26),
      inset 0 -2px 3px #170403,
      inset 1px 1px 2px rgba(255,255,255,.2);
  }
  acidify-patch-view .run-lamp.lit {
    background:
      radial-gradient(circle at 34% 27%, #fffbd5 0 7%, transparent 11%),
      radial-gradient(circle, #ff8c68 0, #fb3823 34%, #9c0f08 74%);
    box-shadow:
      0 0 5px rgba(255,51,31,.8),
      0 0 11px rgba(255,42,25,.44),
      0 1px 0 rgba(255,255,255,.55),
      0 0 0 2px rgba(72,72,67,.26),
      inset 0 0 2px #fff;
  }
  acidify-patch-view .run-switch {
    width: 104px; height: 38px; padding: 5px; border-radius: 5px; cursor: pointer;
    perspective: 100px;
    background:
      linear-gradient(180deg, #171714, #33332e 14%, #1c1c19 100%);
    border: 1px solid #10100e;
    box-shadow:
      inset 0 3px 5px #050504,
      inset 0 -1px rgba(255,255,255,.14),
      0 1px 0 rgba(255,255,255,.66);
  }
  acidify-patch-view .run-switch button {
    position: relative; width: 100%; height: 100%; border-radius: 2px; cursor: pointer;
    background:
      linear-gradient(100deg, rgba(255,255,255,.13), transparent 30% 72%, rgba(0,0,0,.25)),
      linear-gradient(180deg, #6a6961 0%, #4b4a44 43%, #292925 100%);
    border: 1px solid #1d1d1a; color: #e8e7dd;
    font-size: 8px; font-weight: 900; letter-spacing: .8px;
    text-shadow: 0 1px #151512;
    box-shadow: 0 3px 2px rgba(0,0,0,.7), inset 0 1px 0 rgba(255,255,255,.25);
    transform-origin: center bottom;
  }
  acidify-patch-view .run-switch.is-on button {
    transform: translateY(2px) rotateX(-4deg);
    background:
      linear-gradient(100deg, rgba(255,255,255,.07), transparent 70%, rgba(0,0,0,.25)),
      linear-gradient(#3d3934, #1c1b18);
    color: #ffb3a9;
    box-shadow: 0 1px 1px #050504, inset 0 2px 4px rgba(0,0,0,.45);
  }
  acidify-patch-view .waveform {
    position: relative; width: 82px; height: 145px;
  }
  acidify-patch-view .wave-title {
    position: absolute; left: 0; right: 0; top: 88px;
    text-align: center; font-size: 8.5px; font-weight: 900; letter-spacing: .7px;
    text-shadow: 0 .5px rgba(255,255,255,.38);
  }
  acidify-patch-view .wave-buttons {
    position: absolute; left: 0; right: 0; top: 22px;
    display: flex; justify-content: center; gap: 7px;
  }
  acidify-patch-view .wave-buttons button {
    position: relative; width: 31px; height: 31px; padding: 5px 4px; cursor: pointer; border-radius: 3px;
    background:
      linear-gradient(105deg, rgba(255,255,255,.16), transparent 35% 75%, rgba(0,0,0,.25)),
      linear-gradient(#67665f, #353530 62%, #252521);
    border: 1px solid #171714;
    box-shadow:
      0 3px 2px rgba(0,0,0,.52),
      inset 0 1px rgba(255,255,255,.25),
      0 0 0 2px rgba(78,78,72,.12);
    color: #e0dfd5;
  }
  acidify-patch-view .wave-buttons svg {
    display: block; width: 100%; height: 100%; overflow: visible;
    fill: none; stroke: currentColor; stroke-width: 2.2; stroke-linecap: square; stroke-linejoin: miter;
    filter: drop-shadow(0 1px #151512);
  }
  acidify-patch-view .wave-buttons button.active {
    transform: translateY(2px); color: #ff4c3c;
    background:
      linear-gradient(105deg, rgba(255,255,255,.06), transparent 70%, rgba(0,0,0,.28)),
      linear-gradient(#383530, #1b1a17);
    box-shadow: 0 1px 1px rgba(0,0,0,.6), inset 0 2px 5px #0b0b09, 0 0 0 2px rgba(78,78,72,.1);
  }
  acidify-patch-view .tone-bank {
    position: absolute; left: 273px; top: 11px; width: 648px; height: 180px;
    padding: 0 12px;
  }
  acidify-patch-view .tone-controls {
    position: absolute; left: 10px; right: 10px; top: 35px; bottom: 0;
    display: grid; grid-template-columns: 82px repeat(6, minmax(0, 1fr));
    align-items: start; justify-items: center;
  }
  acidify-patch-view .tone-bank .knob-control { width: 90px; }
  acidify-patch-view .tone-bank .dial { width: 72px; height: 72px; }
  acidify-patch-view .tone-bank .dial::before,
  acidify-patch-view .tone-bank .dial-cap { inset: 7px; }
  acidify-patch-view .tone-bank .tick-ring { top: -9px; width: 90px; height: 90px; }
  acidify-patch-view .tone-bank .tick-ring::after {
    left: 43px; transform-origin: 2px 44px;
  }
  acidify-patch-view .volume-bank {
    position: absolute; right: 0; top: 11px; width: 136px; height: 180px;
    display: flex; flex-direction: column; align-items: center;
    padding-top: 35px;
  }
  acidify-patch-view .master-head {
    position: absolute; left: 12px; right: 10px; top: 5px; height: 12px;
    display: flex; align-items: center; justify-content: space-between;
    color: #50504a; font-size: 6.5px; line-height: 8px; font-weight: 900; letter-spacing: 1.25px;
    text-shadow: 0 .5px rgba(255,255,255,.45);
  }
  acidify-patch-view .master-output {
    display: flex; align-items: center; gap: 4px; color: #62625b;
    font-size: 5.5px; letter-spacing: .7px;
  }
  acidify-patch-view .master-output .output-lamp {
    width: 9px; height: 9px;
  }
  acidify-patch-view .volume-bank .knob-control { width: 94px; }
  acidify-patch-view .control { position: relative; }
  acidify-patch-view .knob-control {
    --norm: .5; width: 102px; height: 145px; display: flex; flex-direction: column;
    align-items: center; justify-content: flex-start;
  }
  acidify-patch-view .dial {
    position: relative; width: 75px; height: 75px; border-radius: 50%; cursor: ns-resize; touch-action: none;
    background:
      radial-gradient(circle, transparent 0 61%, rgba(255,255,255,.13) 62%, transparent 65%),
      repeating-conic-gradient(from 1deg, #171714 0 5deg, #3b3a35 5deg 8deg, #10100e 8deg 13deg);
    border: 1px solid #0b0b09;
    box-shadow:
      0 7px 7px rgba(0,0,0,.5),
      0 2px 2px rgba(0,0,0,.58),
      inset 0 2px 2px rgba(255,255,255,.2),
      inset 0 -4px 4px #080807;
  }
  acidify-patch-view .dial::before {
    content: ""; position: absolute; inset: 7px; border-radius: 50%; z-index: 0;
    background:
      radial-gradient(circle at 34% 25%, rgba(255,255,255,.31) 0 2%, rgba(255,255,255,.09) 14%, transparent 34%),
      radial-gradient(circle at 50% 47%, #393833 0, #252521 57%, #11110f 82%, #060605 100%);
    border: 1px solid #080807;
    box-shadow:
      inset 0 2px 3px rgba(255,255,255,.16),
      inset -3px -6px 8px rgba(0,0,0,.66),
      0 1px 1px rgba(255,255,255,.08);
  }
  acidify-patch-view .dial::after {
    content: ""; position: absolute; inset: 12px; border-radius: 50%; z-index: 1; pointer-events: none;
    border-top: 1px solid rgba(255,255,255,.1);
    box-shadow: inset 3px 4px 7px rgba(255,255,255,.025);
  }
  acidify-patch-view .dial-cap {
    position: absolute; inset: 7px; z-index: 2; border-radius: 50%;
    transform: rotate(calc(-135deg + var(--norm) * 270deg));
  }
  acidify-patch-view .dial-pointer {
    position: absolute; left: 50%; top: 4px; width: 3px; height: 20px; margin-left: -1.5px;
    border-radius: 2px; background: linear-gradient(90deg, #aaa99f, #f4f1df 46%, #d0cec0);
    box-shadow: 0 0 1px #fff, 1px 1px 1px #000;
  }
  acidify-patch-view .tick-ring {
    position: absolute; top: -9px; width: 94px; height: 94px; border-radius: 50%;
    background: repeating-conic-gradient(from 222deg, #262620 0 1.2deg, transparent 1.2deg 13.5deg);
    -webkit-mask: radial-gradient(circle, transparent 69%, #000 70% 75%, transparent 76%);
            mask: radial-gradient(circle, transparent 69%, #000 70% 75%, transparent 76%);
    clip-path: polygon(0 0, 100% 0, 100% 82%, 50% 50%, 0 82%);
    filter: drop-shadow(0 1px rgba(255,255,255,.24));
  }
  acidify-patch-view .tick-ring::after {
    content: ""; position: absolute; left: 45px; top: 1px; width: 4px; height: 5px;
    border-radius: 3px; background: #a51d17; box-shadow: 0 1px rgba(255,255,255,.25);
    transform-origin: 2px 46px;
    transform: rotate(calc(-135deg + var(--default-norm) * 270deg));
    opacity: .55;
  }
  acidify-patch-view .dial:focus-visible {
    outline: 2px solid rgba(169,32,26,.72); outline-offset: 5px;
  }
  acidify-patch-view .control-label {
    margin-top: 13px; font-size: 8.5px; font-weight: 900; letter-spacing: .7px; white-space: nowrap;
    text-shadow: 0 .5px rgba(255,255,255,.38);
  }
  acidify-patch-view .value-label {
    margin-top: 4px; min-width: 50px; text-align: center; font: 8px "Courier New", monospace;
    color: #681712; opacity: .86; letter-spacing: .25px;
  }
  acidify-patch-view.studio-mode .value-label {
    position: absolute; z-index: 20; left: 50%; top: -27px; margin: 0; padding: 5px 8px;
    width: max-content; min-width: 54px; border: 1px solid #080907; border-radius: 4px;
    color: #ff7768; background: linear-gradient(#282a27, #121311);
    box-shadow: 0 6px 12px rgba(0,0,0,.38), inset 0 1px rgba(255,255,255,.08);
    text-shadow: 0 0 4px rgba(255,55,37,.45);
    opacity: 0; pointer-events: none;
    transform: translate(-50%, 4px); transition: opacity 120ms ease, transform 120ms ease;
  }
  acidify-patch-view.studio-mode .value-visible .value-label,
  acidify-patch-view.studio-mode .knob-control:focus-within .value-label {
    opacity: 1; transform: translate(-50%, 0);
  }
  acidify-patch-view .program-strip {
    position: absolute; left: 24px; right: 24px; top: 254px; height: 242px;
  }
  acidify-patch-view .program-header {
    height: 42px; display: flex; align-items: center; justify-content: space-between;
    border-bottom: 1px solid #53534d; font-size: 8px; font-weight: 900; letter-spacing: 1.2px;
    box-shadow: 0 1px rgba(255,255,255,.44);
  }
  acidify-patch-view .program-title {
    display: grid; grid-template-columns: auto auto; align-items: baseline; column-gap: 8px;
    font-size: 11px; letter-spacing: 2.2px; white-space: nowrap;
  }
  acidify-patch-view .program-title b { color: #a51d17; }
  acidify-patch-view .program-context {
    grid-column: 1 / -1; margin-top: 3px;
    color: #66665f; font-size: 5.5px; line-height: 6px; letter-spacing: 1.45px;
  }
  acidify-patch-view .bassline-visual {
    position: relative; flex: 1 1 190px; min-width: 170px; max-width: 250px; height: 30px;
    margin: 0 10px; overflow: hidden; border: 1px solid #171714; border-radius: 5px;
    background:
      linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px),
      linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px),
      linear-gradient(#292a26, #151613);
    background-size: 13px 100%, 100% 6px, 100% 100%;
    box-shadow: inset 0 2px 5px rgba(0,0,0,.62), 0 1px rgba(255,255,255,.5);
  }
  acidify-patch-view .bassline-visual > span {
    position: absolute; z-index: 2; left: 5px; top: 4px;
    color: #76776f; font-size: 4.5px; font-weight: 900; letter-spacing: .65px;
  }
  acidify-patch-view .bassline-visual svg { position: absolute; inset: 0; width: 100%; height: 100%; }
  acidify-patch-view .bassline-path,
  acidify-patch-view .bassline-slide-path {
    fill: none; stroke-linecap: round; stroke-linejoin: round;
  }
  acidify-patch-view .bassline-path { stroke: #8c8d84; stroke-width: 1; opacity: .72; }
  acidify-patch-view .bassline-slide-path {
    stroke: #efb34e; stroke-width: 1.8; opacity: .92;
    filter: drop-shadow(0 0 1.5px rgba(239,179,78,.45));
  }
  acidify-patch-view .bassline-node {
    fill: #deddd3; stroke: #171714; stroke-width: .8;
    transition: fill 90ms ease, stroke 90ms ease, opacity 90ms ease;
  }
  acidify-patch-view .bassline-node.rest { opacity: .28; fill: #66675f; }
  acidify-patch-view .bassline-node.accented { fill: #e2493a; }
  acidify-patch-view .bassline-node.sliding { stroke: #f0b34d; stroke-width: 1.2; }
  acidify-patch-view .bassline-node.selected { stroke: #fff8ec; stroke-width: 1.45; }
  acidify-patch-view .bassline-node.playing {
    fill: #ffefe8; stroke: #ff4937; stroke-width: 2;
    filter: drop-shadow(0 0 2.5px rgba(255,60,42,.85));
  }
  acidify-patch-view .utility {
    flex: 0 0 auto; display: flex; align-items: center; gap: 13px; height: 100%;
  }
  acidify-patch-view .studio-toggle {
    position: relative; width: 140px; height: 29px; padding: 0 7px; cursor: pointer; border-radius: 5px;
    display: flex; align-items: center; justify-content: space-between; overflow: hidden;
    color: #5e5e58;
    background:
      linear-gradient(180deg, rgba(255,255,255,.2), transparent 34%),
      linear-gradient(#aaa9a1, #d5d4cb 48%, #9b9a92);
    border: 1px solid #66665f;
    box-shadow:
      inset 0 1px #f3f2eb,
      inset 0 -1px rgba(43,43,39,.18),
      0 1px rgba(255,255,255,.42),
      0 2px 2px rgba(0,0,0,.2);
    font-size: 7px; font-weight: 900; letter-spacing: .8px;
  }
  acidify-patch-view .studio-toggle i {
    position: absolute; z-index: 0; left: 4px; top: 4px; width: 65px; height: 21px; border-radius: 3px;
    background:
      linear-gradient(105deg, rgba(255,255,255,.17), transparent 35% 78%, rgba(0,0,0,.25)),
      linear-gradient(#5a5953, #2c2c28);
    border: 1px solid #20201d;
    box-shadow:
      0 2px 2px rgba(0,0,0,.38),
      inset 0 1px rgba(255,255,255,.18),
      inset 0 -1px rgba(0,0,0,.35);
    transition: transform 140ms cubic-bezier(.2,.8,.2,1), background 140ms ease;
  }
  acidify-patch-view .studio-toggle span { position: relative; z-index: 1; width: 59px; text-align: center; }
  acidify-patch-view .studio-toggle .classic-label { color: #f2f0e7; text-shadow: 0 1px #171714; }
  acidify-patch-view .studio-toggle[aria-pressed="true"] i {
    transform: translateX(66px);
    background:
      linear-gradient(105deg, rgba(255,255,255,.16), transparent 38% 78%, rgba(63,0,0,.18)),
      linear-gradient(#b63329, #72150f);
    box-shadow:
      0 2px 2px rgba(0,0,0,.4),
      inset 0 1px rgba(255,255,255,.18),
      0 0 8px rgba(180,34,24,.22);
  }
  acidify-patch-view .studio-toggle[aria-pressed="true"] .classic-label {
    color: #5e5e58; text-shadow: none;
  }
  acidify-patch-view .studio-toggle[aria-pressed="true"] .studio-label {
    color: #fff1e9; text-shadow: 0 1px #5b0c08;
  }
  acidify-patch-view .studio-toggle:focus-visible,
  acidify-patch-view .studio-scale:focus-visible,
  acidify-patch-view .stepper button:focus-visible,
  acidify-patch-view .sequence-step:focus-visible,
  acidify-patch-view .function-button:focus-visible,
  acidify-patch-view .studio-actions button:focus-visible,
  acidify-patch-view .studio-cell:focus-visible,
  acidify-patch-view .pitch-key:focus-visible,
  acidify-patch-view .wave-buttons button:focus-visible,
  acidify-patch-view .run-switch button:focus-visible {
    outline: 2px solid rgba(169,32,26,.82); outline-offset: 2px;
  }
  acidify-patch-view .stepper {
    display: grid; grid-template-columns: 24px 64px 24px; height: 27px; align-items: center;
    background: #262622; border: 1px solid #121210; border-radius: 4px; overflow: hidden;
    box-shadow: inset 0 2px 4px rgba(0,0,0,.62), 0 1px 0 rgba(255,255,255,.55);
  }
  acidify-patch-view .stepper button {
    height: 100%; cursor: pointer; color: #e5e4da;
    background:
      linear-gradient(100deg, rgba(255,255,255,.13), transparent 45%, rgba(0,0,0,.18)),
      linear-gradient(#64635c, #383833);
    font-weight: 900; text-shadow: 0 1px #111;
    box-shadow: inset 0 1px rgba(255,255,255,.2), 0 1px 1px rgba(0,0,0,.5);
  }
  acidify-patch-view .stepper button:active {
    transform: translateY(1px); background: linear-gradient(#353530, #4c4b45);
    box-shadow: inset 0 2px 3px rgba(0,0,0,.45);
  }
  acidify-patch-view .stepper-value {
    height: 100%; display: grid; place-items: center; color: #ff6756;
    background:
      linear-gradient(180deg, rgba(255,255,255,.035), transparent 32%),
      #17120f;
    font: 11px "Courier New", monospace; border-inline: 1px solid #080807;
    letter-spacing: 1px; text-shadow: 0 0 4px rgba(255,57,37,.58);
    box-shadow: inset 0 2px 4px rgba(0,0,0,.58);
  }
  acidify-patch-view .stepper-label { font-size: 7px; text-align: center; margin-top: 2px; }
  acidify-patch-view .output-lamp {
    --level: 0; filter: brightness(calc(.42 + var(--level) * 2.4));
    background:
      radial-gradient(circle at 34% 26%, #ffe5cf 0 5%, transparent 9%),
      radial-gradient(circle, #ff8e70, #e42b1d 35%, #65100c 75%);
    box-shadow:
      0 0 calc(var(--level) * 10px) #ff2b19,
      0 1px rgba(255,255,255,.5),
      0 0 0 2px rgba(72,72,67,.22),
      inset 0 -2px 3px #310705;
  }
  acidify-patch-view .step-row {
    display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 13px;
    height: 68px; padding: 8px 0 6px;
  }
  acidify-patch-view .step-group {
    position: relative; min-width: 0; display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 4px;
  }
  acidify-patch-view .step-group:not(:last-child)::after {
    content: ""; position: absolute; right: -7px; top: 4px; bottom: 2px; width: 1px;
    background: rgba(70,70,65,.44);
    box-shadow: 1px 0 rgba(255,255,255,.48);
    pointer-events: none;
  }
  acidify-patch-view .sequence-step {
    position: relative; height: 54px; cursor: pointer; border-radius: 4px;
    background:
      linear-gradient(105deg, rgba(255,255,255,.42) 0, transparent 20% 77%, rgba(67,66,60,.18) 100%),
      linear-gradient(180deg, #ebeae1 0%, #d3d2c8 46%, #b2b1a8 82%, #96968f 100%);
    border: 1px solid #777770;
    box-shadow:
      0 4px 2px rgba(0,0,0,.34),
      0 1px 1px rgba(0,0,0,.26),
      inset 0 1px #fff,
      inset 1px 0 rgba(255,255,255,.38),
      inset -1px 0 rgba(51,51,48,.14);
  }
  acidify-patch-view .sequence-step:active, acidify-patch-view .sequence-step.selected {
    transform: translateY(3px);
    background:
      linear-gradient(105deg, rgba(255,255,255,.25), transparent 75%, rgba(57,56,51,.14)),
      linear-gradient(#aaa9a0, #d4d3ca 36%, #c4c3ba);
    box-shadow: 0 1px 1px rgba(0,0,0,.3), inset 0 3px 5px rgba(0,0,0,.28);
  }
  acidify-patch-view .sequence-step.multi-selected {
    outline: 2px solid rgba(165,29,23,.68); outline-offset: -3px;
  }
  acidify-patch-view .sequence-step.multi-selected:not(.selected) {
    transform: translateY(1px);
  }
  acidify-patch-view .step-led {
    position: absolute; top: 5px; left: 50%; width: 10px; height: 10px; margin-left: -5px; border-radius: 50%;
    background:
      radial-gradient(circle at 34% 27%, rgba(255,255,255,.22) 0 5%, transparent 9%),
      radial-gradient(circle, #651b15, #3c0e0b 60%, #1e0705 100%);
    border: 1px solid #2b0806;
    box-shadow: 0 1px rgba(255,255,255,.43), inset 0 -2px 2px #170302, 0 0 0 1px rgba(76,76,70,.18);
  }
  acidify-patch-view .sequence-step.playing .step-led {
    background:
      radial-gradient(circle at 34% 26%, #fffbdc 0 8%, transparent 12%),
      radial-gradient(circle, #ff9a79, #ff3a25 34%, #a20f08 72%);
    box-shadow: 0 0 5px #ff2918, 0 0 10px rgba(255,41,24,.52), inset 0 0 2px #fff;
  }
  acidify-patch-view .sequence-step.accented::before {
    content: "A"; position: absolute; left: 3px; top: 17px; z-index: 2;
    width: 18px; height: 18px; display: grid; place-items: center;
    border: 1px solid #6d100b; border-radius: 4px;
    color: #fff8f2; background: linear-gradient(180deg, #e75243, #981b14);
    font-size: 12px; line-height: 1; font-weight: 950;
    text-shadow: 0 1px #5b0b07;
    box-shadow: 0 0 0 1px rgba(255,255,255,.3), 0 1px 3px rgba(60,4,2,.42);
  }
  acidify-patch-view .sequence-step.sliding::after {
    content: "↗"; position: absolute; right: 3px; top: 17px; z-index: 2;
    width: 18px; height: 18px; display: grid; place-items: center;
    border: 1px solid #70520b; border-radius: 4px;
    color: #261800; background: linear-gradient(180deg, #ffe17a, #d89d22);
    font-size: 15px; line-height: 1; font-weight: 950;
    text-shadow: 0 1px rgba(255,255,255,.5);
    box-shadow: 0 0 0 1px rgba(255,255,255,.34), 0 1px 3px rgba(51,36,0,.38);
  }
  acidify-patch-view .sequence-step.rest { opacity: .55; }
  acidify-patch-view .step-index { display: block; margin-top: 20px; font-size: 8px; font-weight: 900; }
  acidify-patch-view .step-note { display: block; margin-top: 1px; font-size: 9px; color: #5f1713; font-weight: 900; }
  acidify-patch-view .editor {
    height: 102px; display: grid; grid-template-columns: 144px minmax(0, 1fr) 280px; gap: 13px;
    border-top: 1px solid rgba(255,255,255,.62); padding-top: 8px;
    box-shadow: inset 0 1px rgba(61,61,57,.18);
  }
  acidify-patch-view .studio-editor { display: none; }
  acidify-patch-view.studio-mode .classic-editor { display: none; }
  acidify-patch-view.studio-mode .studio-editor {
    position: relative; height: 122px; padding-top: 8px;
    display: grid; grid-template-columns: 404px 1fr; gap: 13px;
    border-top: 1px solid rgba(255,255,255,.62);
    box-shadow: inset 0 1px rgba(61,61,57,.18);
    animation: studio-enter 140ms ease-out both;
  }
  @keyframes studio-enter {
    from { opacity: 0; transform: translateY(3px); }
    to { opacity: 1; transform: translateY(0); }
  }
  acidify-patch-view .studio-tools {
    position: relative; min-width: 0; height: 108px; padding: 7px;
    border: 1px solid rgba(74,74,68,.72); border-radius: 5px;
    background:
      linear-gradient(135deg, rgba(255,255,255,.13), transparent 46%),
      linear-gradient(180deg, rgba(116,116,108,.025), rgba(255,255,255,.04));
    box-shadow:
      inset 0 1px rgba(255,255,255,.52),
      inset 1px 0 rgba(255,255,255,.2),
      0 1px rgba(255,255,255,.28);
  }
  acidify-patch-view .studio-tool-head {
    height: 18px; display: flex; align-items: flex-start; justify-content: space-between;
    font-size: 6px; letter-spacing: 1px; color: #65655e;
  }
  acidify-patch-view .studio-selection { color: #9b2019; font-size: 8px; letter-spacing: 1.25px; }
  acidify-patch-view .studio-scale {
    height: 16px; min-width: 105px; padding: 0 6px; cursor: pointer;
    display: flex; align-items: center; justify-content: space-between; gap: 7px;
    border: 1px solid #1a1a17; border-radius: 3px;
    color: #b9b8af; background: linear-gradient(#55544e, #292925);
    box-shadow: inset 0 1px rgba(255,255,255,.16), 0 1px rgba(255,255,255,.32);
    font-size: 5px; font-weight: 900; letter-spacing: .55px;
  }
  acidify-patch-view .studio-scale strong { color: #ff9a89; font-size: 5.5px; letter-spacing: .45px; }
  acidify-patch-view .studio-scale:active { transform: translateY(1px); }
  acidify-patch-view .studio-actions {
    display: grid; grid-template-columns: repeat(8, 1fr); gap: 5px; align-content: start;
  }
  acidify-patch-view .studio-actions button {
    height: 34px; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center;
    border-radius: 4px; color: #e9e8df; background:
      linear-gradient(105deg, rgba(255,255,255,.12), transparent 32% 78%, rgba(0,0,0,.28)),
      linear-gradient(#52524c, #292925);
    border: 1px solid #191916;
    box-shadow: 0 2px 2px rgba(0,0,0,.32), inset 0 1px rgba(255,255,255,.18);
    font: 10px "Arial Narrow", Arial, sans-serif; line-height: 10px;
  }
  acidify-patch-view .studio-actions button small {
    margin-top: 3px; color: #aaa9a1; font-size: 5.5px; font-weight: 900; letter-spacing: .45px;
  }
  acidify-patch-view .studio-actions button:hover:not(:disabled) { color: #ff8a78; }
  acidify-patch-view .studio-actions button:active:not(:disabled) {
    transform: translateY(1px); background: linear-gradient(#292925, #41413c);
    box-shadow: inset 0 2px 4px rgba(0,0,0,.46);
  }
  acidify-patch-view .studio-actions button:disabled { opacity: .28; cursor: default; }
  acidify-patch-view .studio-toast {
    position: absolute; z-index: 10; left: 7px; bottom: 4px; padding: 4px 7px; border-radius: 3px;
    color: #ff8070; background: rgba(20,18,16,.94); font: 7px "Courier New", monospace; letter-spacing: .7px;
    opacity: 0; transform: translateY(3px); pointer-events: none; transition: 120ms ease;
  }
  acidify-patch-view .studio-toast.visible { opacity: 1; transform: translateY(0); }
  acidify-patch-view .studio-matrix {
    position: relative; min-width: 0; height: 108px; padding: 5px 8px 12px; border-radius: 6px;
    background:
      linear-gradient(110deg, rgba(255,255,255,.035), transparent 27% 75%, rgba(0,0,0,.22)),
      linear-gradient(#242520, #151613);
    border: 1px solid #090a08;
    box-shadow: inset 0 2px 7px rgba(0,0,0,.58), 0 1px rgba(255,255,255,.52);
  }
  acidify-patch-view .studio-ruler {
    height: 12px; display: grid; grid-template-columns: 43px 1fr; gap: 6px; align-items: center;
  }
  acidify-patch-view .studio-lane {
    height: 19px; display: grid; grid-template-columns: 43px 1fr; gap: 6px; align-items: center;
  }
  acidify-patch-view .studio-lane-label {
    color: #85867d; text-align: right; font-size: 5.5px; font-weight: 900; letter-spacing: .55px;
  }
  acidify-patch-view .studio-lane-cells {
    min-width: 0; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px;
  }
  acidify-patch-view .studio-cell-group {
    min-width: 0; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 3px;
  }
  acidify-patch-view .studio-ruler-group span {
    color: #575851; text-align: center; font: 5px "Courier New", monospace;
  }
  acidify-patch-view .studio-ruler-group:not(:last-child) {
    position: relative;
  }
  acidify-patch-view .studio-ruler-group:not(:last-child)::after {
    content: ""; position: absolute; right: -5px; top: 1px; bottom: -77px; width: 1px;
    background: rgba(125,126,116,.2); pointer-events: none;
  }
  acidify-patch-view .studio-cell {
    position: relative; height: 15px; min-width: 0; cursor: crosshair; border-radius: 3px;
    color: #6d6e67; background: linear-gradient(#30312d, #22231f);
    border: 1px solid #11120f;
    box-shadow: inset 0 1px rgba(255,255,255,.055);
    font: 7px "Courier New", monospace;
    transition: color 100ms ease, background 100ms ease, box-shadow 100ms ease;
  }
  acidify-patch-view .studio-cell.selected {
    border-color: #77302a;
  }
  acidify-patch-view .studio-cell[data-kind="pitch"].active {
    color: #ff8b79; background: linear-gradient(#44312c, #2c1d19);
  }
  acidify-patch-view .studio-lane[data-lane="gate"] .studio-cell.active {
    background: linear-gradient(#b9b8ae, #6f7069); border-color: #c7c6bc;
    box-shadow: 0 0 4px rgba(221,218,199,.17), inset 0 1px rgba(255,255,255,.35);
  }
  acidify-patch-view .studio-lane[data-lane="accent"] .studio-cell.active {
    background: linear-gradient(#ed5b49, #971c13); border-color: #ff7666;
    box-shadow: 0 0 5px rgba(255,54,35,.38), inset 0 1px rgba(255,255,255,.3);
  }
  acidify-patch-view .studio-lane[data-lane="slide"] .studio-cell.active {
    background: linear-gradient(#d09252, #71431e); border-color: #dba05c;
    box-shadow: 0 0 4px rgba(220,145,74,.24), inset 0 1px rgba(255,255,255,.24);
  }
  acidify-patch-view .studio-cell.playing::after {
    content: ""; position: absolute; inset: -2px; border: 1px solid #ff5c49; border-radius: 4px;
    box-shadow: 0 0 5px rgba(255,55,37,.45); pointer-events: none;
  }
  acidify-patch-view .studio-hint {
    position: absolute; right: 8px; bottom: 3px; color: #55564f;
    font-size: 5px; font-weight: 900; letter-spacing: .75px;
  }
  acidify-patch-view .edit-status {
    min-width: 0; height: 108px; padding: 10px 11px;
    display: flex; flex-direction: column; justify-content: center;
    border: 1px solid rgba(74,74,68,.72); border-radius: 5px;
    background:
      linear-gradient(135deg, rgba(255,255,255,.13), transparent 46%),
      linear-gradient(180deg, rgba(116,116,108,.025), rgba(255,255,255,.04));
    box-shadow:
      inset 0 1px rgba(255,255,255,.52),
      inset 1px 0 rgba(255,255,255,.2),
      0 1px rgba(255,255,255,.28);
  }
  acidify-patch-view .edit-caption { font-size: 7px; font-weight: 900; letter-spacing: 1px; }
  acidify-patch-view .edit-readout {
    margin-top: 7px; height: 34px; display: grid; place-items: center; border-radius: 3px;
    background:
      linear-gradient(180deg, rgba(255,255,255,.045), transparent 26%),
      repeating-linear-gradient(90deg, transparent 0 3px, rgba(0,0,0,.05) 3px 4px),
      #1c100d;
    border: 1px solid #0a0706; color: #ff513b;
    box-shadow: inset 0 3px 5px rgba(0,0,0,.68), 0 1px rgba(255,255,255,.52);
    font: 17px "Courier New", monospace; letter-spacing: 2px;
    text-shadow: 0 0 4px #e32418, 0 0 8px rgba(227,36,24,.38);
  }
  acidify-patch-view .octave-indicator { margin-top: 7px; font-size: 7px; color: #555; }
  acidify-patch-view .octave-indicator::after { content: "NORMAL"; font-weight: 900; }
  acidify-patch-view .octave-indicator.high::after { content: "UP"; color: #a51d17; }
  acidify-patch-view .keyboard {
    position: relative; min-width: 0; height: auto; padding: 6px;
    border: 1px solid rgba(74,74,68,.72); border-radius: 5px;
    background:
      linear-gradient(135deg, rgba(255,255,255,.13), transparent 46%),
      linear-gradient(180deg, rgba(73,73,68,.05), rgba(255,255,255,.055));
    box-shadow:
      inset 0 1px rgba(255,255,255,.52),
      inset 1px 0 rgba(255,255,255,.2),
      0 1px rgba(255,255,255,.28);
  }
  acidify-patch-view .keyboard-keys {
    position: relative; width: 100%; height: 100%;
  }
  acidify-patch-view .pitch-key {
    position: absolute; top: 0; bottom: 0; width: 14.285714%; cursor: pointer;
    border-radius: 3px 3px 5px 5px;
    border: 1px solid #73736d;
    background:
      linear-gradient(100deg, rgba(119,117,107,.2), transparent 15% 77%, rgba(75,74,69,.22)),
      linear-gradient(180deg, #f2f0e7 0%, #e2e0d6 55%, #c0beb4 84%, #9f9e96 100%);
    box-shadow:
      0 5px 2px rgba(0,0,0,.37),
      0 1px 1px rgba(0,0,0,.24),
      inset 0 1px #fff,
      inset 1px 0 rgba(255,255,255,.45),
      inset -1px 0 rgba(67,66,61,.18);
    font-size: 8px; font-weight: 900;
  }
  acidify-patch-view .pitch-key[data-pitch="0"] { left: 0; }
  acidify-patch-view .pitch-key[data-pitch="2"] { left: 14.285714%; }
  acidify-patch-view .pitch-key[data-pitch="4"] { left: 28.571428%; }
  acidify-patch-view .pitch-key[data-pitch="5"] { left: 42.857142%; }
  acidify-patch-view .pitch-key[data-pitch="7"] { left: 57.142856%; }
  acidify-patch-view .pitch-key[data-pitch="9"] { left: 71.42857%; }
  acidify-patch-view .pitch-key[data-pitch="11"] { left: 85.714284%; }
  acidify-patch-view .pitch-key.black-key {
    z-index: 2; bottom: auto; width: 9.2%; height: 63%; color: #e9e7dc;
    background:
      linear-gradient(100deg, rgba(255,255,255,.09), transparent 24% 74%, rgba(0,0,0,.4)),
      linear-gradient(180deg, #393934 0%, #272723 57%, #11110f 84%, #070706 100%);
    border-color: #050505;
    box-shadow:
      0 5px 2px rgba(0,0,0,.56),
      inset 0 1px rgba(255,255,255,.14),
      inset 1px 0 rgba(255,255,255,.06);
  }
  acidify-patch-view .pitch-key[data-pitch="1"] { left: 9.685714%; }
  acidify-patch-view .pitch-key[data-pitch="3"] { left: 23.971428%; }
  acidify-patch-view .pitch-key[data-pitch="6"] { left: 52.542856%; }
  acidify-patch-view .pitch-key[data-pitch="8"] { left: 66.82857%; }
  acidify-patch-view .pitch-key[data-pitch="10"] { left: 81.114284%; }
  acidify-patch-view .pitch-key.active, acidify-patch-view .pitch-key.midi {
    transform: translateY(4px); color: #b42018;
    box-shadow: 0 1px 1px rgba(0,0,0,.28), inset 0 3px 5px rgba(0,0,0,.36);
  }
  acidify-patch-view .pitch-key.midi {
    background:
      linear-gradient(100deg, rgba(255,255,255,.3), transparent 78%, rgba(92,30,21,.18)),
      linear-gradient(#ffd3c8, #d97865);
  }
  acidify-patch-view .pitch-key span { position: absolute; bottom: 7px; left: 0; right: 0; }
  acidify-patch-view .time-controls {
    height: 108px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;
    align-content: center; padding: 8px;
    border: 1px solid rgba(74,74,68,.72); border-radius: 5px;
    background:
      linear-gradient(135deg, rgba(255,255,255,.13), transparent 46%),
      linear-gradient(180deg, rgba(116,116,108,.025), rgba(255,255,255,.04));
    box-shadow:
      inset 0 1px rgba(255,255,255,.52),
      inset 1px 0 rgba(255,255,255,.2),
      0 1px rgba(255,255,255,.28);
  }
  acidify-patch-view .function-button {
    height: 40px; cursor: pointer; border-radius: 4px;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    font-size: 7px; font-weight: 900; letter-spacing: .4px;
    background:
      linear-gradient(105deg, rgba(255,255,255,.38), transparent 22% 78%, rgba(68,67,62,.16)),
      linear-gradient(180deg, #e5e3da 0%, #cbc9c0 55%, #a5a49c 100%);
    border: 1px solid #74736c;
    box-shadow:
      0 4px 2px rgba(0,0,0,.35),
      inset 0 1px #fff,
      inset 1px 0 rgba(255,255,255,.35),
      inset -1px 0 rgba(64,63,58,.12);
    text-shadow: 0 .5px rgba(255,255,255,.42);
  }
  acidify-patch-view .function-button strong {
    color: #252521; font-size: 7px; line-height: 8px; letter-spacing: .55px;
  }
  acidify-patch-view .function-button small {
    margin-top: 3px; color: #6a6962; font-size: 5px; line-height: 6px; font-weight: 900; letter-spacing: .45px;
  }
  acidify-patch-view .function-button:active, acidify-patch-view .function-button.active {
    transform: translateY(3px); color: #a51d17;
    background:
      linear-gradient(105deg, rgba(255,255,255,.18), transparent 76%, rgba(67,66,61,.13)),
      linear-gradient(#aaa89f, #d4d2c8 44%, #c1bfb6);
    box-shadow: 0 1px 1px rgba(0,0,0,.25), inset 0 3px 5px rgba(0,0,0,.28);
  }
  acidify-patch-view .function-button.active strong { color: #a51d17; }
  acidify-patch-view .footer-mark {
    position: absolute; right: 37px; bottom: 5px; font-size: 6px; font-weight: 900; letter-spacing: 1.15px; color: #57574f;
    text-shadow: 0 .5px rgba(255,255,255,.34);
  }

  /* 0.4 geometry baseline.
     The interaction model stays untouched. The reconciled hardware surface
     below supersedes this release's unapproved graphite palette. */
  acidify-patch-view {
    --surface-0: #0b0d11;
    --surface-1: #11151a;
    --surface-2: #171c23;
    --surface-3: #202630;
    --surface-4: #2a323e;
    --line: #343e4c;
    --line-soft: rgba(143, 160, 181, .14);
    --ink: #f2f5f7;
    --muted: #8995a4;
    --faint: #5d6876;
    --acid: #ff4e3e;
    --acid-hot: #ff7568;
    --amber: #ffb454;
    color: var(--ink);
    font-family: Inter, "Avenir Next", "Segoe UI", Helvetica, Arial, sans-serif;
  }
  acidify-patch-view .chassis {
    border-radius: 24px;
    border: 1px solid #343b46;
    background:
      radial-gradient(ellipse at 50% -18%, rgba(100, 115, 135, .26), transparent 55%),
      linear-gradient(145deg, #262c35 0%, #13171d 42%, #090b0e 100%);
    box-shadow:
      0 32px 64px rgba(0, 0, 0, .55),
      0 8px 18px rgba(0, 0, 0, .46),
      inset 0 1px 0 rgba(255, 255, 255, .12),
      inset 0 -4px 8px rgba(0, 0, 0, .48);
  }
  acidify-patch-view .chassis::before {
    left: 9px; right: 9px; top: 9px; bottom: 10px;
    border-radius: 17px;
    border: 1px solid rgba(158, 174, 194, .12);
    box-shadow: inset 0 1px rgba(255, 255, 255, .045);
  }
  acidify-patch-view .chassis::after {
    left: 56px; right: 56px; bottom: 3px; height: 6px;
    background: linear-gradient(180deg, transparent, rgba(0, 0, 0, .48));
  }
  acidify-patch-view .panel {
    left: 18px; top: 18px; width: 1144px; height: 544px;
    border: 1px solid #303844; border-radius: 16px;
    background:
      radial-gradient(circle at 84% 2%, rgba(255, 78, 62, .055), transparent 25%),
      linear-gradient(155deg, rgba(255, 255, 255, .025), transparent 34%),
      linear-gradient(180deg, #191e25 0%, #11151a 100%);
    box-shadow:
      inset 0 1px rgba(255, 255, 255, .06),
      inset 0 -1px rgba(0, 0, 0, .7),
      0 5px 12px rgba(0, 0, 0, .48);
  }
  acidify-patch-view .panel::before {
    inset: 0; border-radius: 15px; opacity: .32; mix-blend-mode: normal;
    background:
      linear-gradient(90deg, rgba(255, 255, 255, .018) 1px, transparent 1px),
      linear-gradient(rgba(255, 255, 255, .012) 1px, transparent 1px);
    background-size: 16px 16px;
    -webkit-mask: linear-gradient(180deg, #000, transparent 75%);
            mask: linear-gradient(180deg, #000, transparent 75%);
  }
  acidify-patch-view .panel::after {
    left: 18px; right: 18px; top: 0; bottom: auto; height: 2px;
    border-radius: 0 0 2px 2px;
    background: linear-gradient(90deg, transparent, var(--acid) 22% 48%, rgba(255, 180, 84, .72) 64%, transparent);
    opacity: .7;
  }
  acidify-patch-view .top-strip {
    left: 22px; right: 22px; top: 20px; height: 198px;
    border: 0; box-shadow: none;
  }
  acidify-patch-view .transport-bank,
  acidify-patch-view .tone-bank,
  acidify-patch-view .volume-bank {
    top: 0; height: 198px; border-radius: 11px;
    border: 1px solid var(--line);
    background:
      linear-gradient(145deg, rgba(255, 255, 255, .035), transparent 36%),
      linear-gradient(180deg, #202630, #171c23);
    box-shadow:
      inset 0 1px rgba(255, 255, 255, .045),
      0 10px 22px rgba(0, 0, 0, .17);
  }
  acidify-patch-view .transport-bank {
    left: 0; width: 260px;
    grid-template-columns: 104px 1fr; gap: 13px;
    padding: 82px 12px 12px;
    overflow: hidden;
  }
  acidify-patch-view .branding {
    z-index: 4; left: 16px; top: 13px; width: 228px; height: 52px;
  }
  acidify-patch-view .brand {
    color: var(--ink); font-family: Inter, "Avenir Next", "Segoe UI", sans-serif;
    font-size: 29px; line-height: 29px; font-weight: 800; letter-spacing: -.7px;
    text-shadow: none;
  }
  acidify-patch-view .brand .acid { color: var(--acid); }
  acidify-patch-view .model {
    margin-top: 2px; color: #c2cad4; font-size: 8px; letter-spacing: 1.45px; text-shadow: none;
  }
  acidify-patch-view .computer {
    margin-top: 3px; color: var(--faint); font-size: 6px; font-weight: 700; letter-spacing: 1.9px;
  }
  acidify-patch-view .bank-title {
    left: 13px; top: 11px; color: var(--muted); font-size: 6px; letter-spacing: 1.5px; text-shadow: none;
  }
  acidify-patch-view .transport-bank .bank-title { top: 73px; }
  acidify-patch-view .mini-title {
    color: #cdd4dc; font-size: 7px; letter-spacing: 1.05px;
  }
  acidify-patch-view .transport-bank .knob-control {
    zoom: .64; width: 104px; height: 118px; margin-top: 3px;
  }
  acidify-patch-view .transport-bank .control-label { margin-top: 9px; }
  acidify-patch-view .mode-box {
    gap: 8px; border-left-color: var(--line-soft); box-shadow: none;
  }
  acidify-patch-view .run-switch {
    width: 108px; height: 39px; padding: 4px; border-radius: 7px;
    background: #0c0f13; border-color: #050608;
    box-shadow: inset 0 2px 6px rgba(0, 0, 0, .82), 0 1px rgba(255, 255, 255, .055);
  }
  acidify-patch-view .run-switch button {
    border-radius: 4px; color: #e6ebef;
    background: linear-gradient(180deg, #3b4653, #252c35);
    border-color: #485464; box-shadow: 0 2px 3px rgba(0, 0, 0, .55), inset 0 1px rgba(255, 255, 255, .09);
    text-shadow: none;
  }
  acidify-patch-view .run-switch.is-on button {
    color: #fff4f1; border-color: #b3392f;
    background: linear-gradient(180deg, #db4a3d, #8f251d);
    box-shadow: 0 0 14px rgba(255, 78, 62, .22), inset 0 1px rgba(255, 255, 255, .14);
  }
  acidify-patch-view .run-lamp,
  acidify-patch-view .output-lamp {
    border-color: #3d1411;
    background: radial-gradient(circle at 40% 35%, #823027, #32100d 62%, #120504);
    box-shadow: 0 0 0 2px rgba(255, 255, 255, .04), inset 0 -1px 2px #080202;
  }
  acidify-patch-view .run-lamp.lit {
    background: radial-gradient(circle at 36% 31%, #fff5d9 0 7%, #ff7568 14%, #ff3e31 45%, #8b130d 78%);
    box-shadow: 0 0 5px var(--acid), 0 0 14px rgba(255, 78, 62, .42), 0 0 0 2px rgba(255, 255, 255, .05);
  }

  acidify-patch-view .tone-bank { left: 273px; width: 676px; padding: 0 12px; }
  acidify-patch-view .tone-controls {
    left: 10px; right: 10px; top: 39px; bottom: 0;
    grid-template-columns: 82px repeat(6, minmax(0, 1fr));
  }
  acidify-patch-view .tone-bank .knob-control,
  acidify-patch-view .volume-bank .knob-control { width: 90px; height: 150px; }
  acidify-patch-view .tone-bank .dial,
  acidify-patch-view .volume-bank .dial { width: 70px; height: 70px; }
  acidify-patch-view .tone-bank .dial::before,
  acidify-patch-view .tone-bank .dial-cap,
  acidify-patch-view .volume-bank .dial::before,
  acidify-patch-view .volume-bank .dial-cap { inset: 7px; }
  acidify-patch-view .tone-bank .tick-ring,
  acidify-patch-view .volume-bank .tick-ring { top: -9px; width: 88px; height: 88px; }
  acidify-patch-view .tone-bank .tick-ring::after,
  acidify-patch-view .volume-bank .tick-ring::after { left: 42px; transform-origin: 2px 43px; }
  acidify-patch-view .waveform { width: 82px; height: 150px; }
  acidify-patch-view .wave-buttons { top: 19px; gap: 8px; }
  acidify-patch-view .wave-buttons button {
    width: 33px; height: 33px; border-radius: 7px; color: #95a1af;
    background: linear-gradient(180deg, #303845, #202630);
    border-color: #414b59;
    box-shadow: 0 3px 5px rgba(0, 0, 0, .4), inset 0 1px rgba(255, 255, 255, .055);
  }
  acidify-patch-view .wave-buttons button.active {
    transform: none; color: var(--acid-hot); border-color: #a33a31;
    background: linear-gradient(180deg, #402823, #251916);
    box-shadow: 0 0 13px rgba(255, 78, 62, .16), inset 0 1px rgba(255, 255, 255, .045);
  }
  acidify-patch-view .wave-title {
    top: 84px; color: #dce1e6; font-size: 7px; letter-spacing: .8px; text-shadow: none;
  }
  acidify-patch-view .volume-bank {
    right: 0; width: 136px; padding-top: 39px;
  }
  acidify-patch-view .master-head {
    left: 13px; right: 12px; top: 10px; color: var(--muted);
    font-size: 6px; letter-spacing: 1.4px; text-shadow: none;
  }
  acidify-patch-view .master-output { color: var(--faint); }
  acidify-patch-view .master-output .output-lamp { width: 9px; height: 9px; }

  acidify-patch-view .dial {
    background:
      radial-gradient(circle, transparent 0 61%, rgba(255, 255, 255, .055) 62%, transparent 66%),
      repeating-conic-gradient(from 1deg, #090b0e 0 5deg, #252b33 5deg 8deg, #0b0d10 8deg 13deg);
    border-color: #050609;
    box-shadow:
      0 8px 14px rgba(0, 0, 0, .5),
      0 2px 3px rgba(0, 0, 0, .7),
      inset 0 2px 2px rgba(255, 255, 255, .08),
      inset 0 -4px 5px #050607;
  }
  acidify-patch-view .dial::before {
    background:
      radial-gradient(circle at 34% 24%, rgba(255, 255, 255, .18) 0 2%, rgba(255, 255, 255, .045) 16%, transparent 36%),
      radial-gradient(circle at 50% 48%, #353d47 0%, #1d2229 58%, #0b0d10 84%);
    border-color: #07090b;
    box-shadow: inset 0 2px 2px rgba(255, 255, 255, .07), inset -3px -6px 9px rgba(0, 0, 0, .72);
  }
  acidify-patch-view .dial::after { border-top-color: rgba(255, 255, 255, .065); }
  acidify-patch-view .dial-pointer {
    top: 4px; width: 3px; height: 20px;
    background: linear-gradient(90deg, #e94a3d, #ff9a8f 48%, #cf2f25);
    box-shadow: 0 0 5px rgba(255, 78, 62, .32);
  }
  acidify-patch-view .tick-ring {
    background: repeating-conic-gradient(from 222deg, #687484 0 1.2deg, transparent 1.2deg 13.5deg);
    opacity: .66; filter: none;
  }
  acidify-patch-view .tick-ring::after {
    background: var(--acid); box-shadow: 0 0 4px rgba(255, 78, 62, .35); opacity: .45;
  }
  acidify-patch-view .dial:focus-visible { outline-color: rgba(255, 78, 62, .88); }
  acidify-patch-view .control-label {
    margin-top: 12px; color: #d7dde3; font-size: 7px; letter-spacing: .65px; text-shadow: none;
  }
  acidify-patch-view .value-label {
    margin-top: 4px; color: var(--acid-hot); opacity: .9; font: 7px ui-monospace, SFMono-Regular, Menlo, monospace;
  }

  acidify-patch-view .program-strip {
    left: 22px; right: 22px; top: 237px; height: 283px; padding: 0 13px 13px;
    border: 1px solid var(--line); border-radius: 12px;
    background:
      linear-gradient(145deg, rgba(255, 255, 255, .025), transparent 42%),
      linear-gradient(180deg, #171c22, #12161b);
    box-shadow: inset 0 1px rgba(255, 255, 255, .035), 0 10px 24px rgba(0, 0, 0, .18);
  }
  acidify-patch-view .program-header {
    height: 48px; border-bottom-color: var(--line-soft); box-shadow: none;
  }
  acidify-patch-view .program-title {
    font-size: 11px; color: #dce2e7; letter-spacing: 1.9px; column-gap: 9px;
  }
  acidify-patch-view .program-title b { color: var(--acid-hot); }
  acidify-patch-view .program-context {
    color: var(--faint); font-size: 5.5px; letter-spacing: 1.55px;
  }
  acidify-patch-view .utility { gap: 13px; }
  acidify-patch-view .studio-toggle {
    width: 156px; height: 32px; padding: 0 8px; border-radius: 8px;
    color: var(--muted); background: #0f1318; border-color: #343d49;
    box-shadow: inset 0 2px 5px rgba(0, 0, 0, .46), 0 1px rgba(255, 255, 255, .035);
    font-size: 6.5px; letter-spacing: .9px;
  }
  acidify-patch-view .studio-toggle i {
    left: 4px; top: 4px; width: 72px; height: 24px; border-radius: 5px;
    background: linear-gradient(180deg, #3c4653, #252c35);
    border-color: #485363;
    box-shadow: 0 2px 4px rgba(0, 0, 0, .45), inset 0 1px rgba(255, 255, 255, .08);
  }
  acidify-patch-view .studio-toggle span { width: 66px; }
  acidify-patch-view .studio-toggle .classic-label { color: #f2f5f7; text-shadow: none; }
  acidify-patch-view .studio-toggle[aria-pressed="true"] i {
    transform: translateX(72px);
    background: linear-gradient(180deg, #e15145, #9b2921);
    border-color: #ef6558;
    box-shadow: 0 0 15px rgba(255, 78, 62, .2), inset 0 1px rgba(255, 255, 255, .13);
  }
  acidify-patch-view .studio-toggle[aria-pressed="true"] .classic-label { color: var(--faint); }
  acidify-patch-view .studio-toggle[aria-pressed="true"] .studio-label { color: #fff; text-shadow: none; }
  acidify-patch-view .studio-toggle:focus-visible,
  acidify-patch-view .stepper button:focus-visible,
  acidify-patch-view .sequence-step:focus-visible,
  acidify-patch-view .function-button:focus-visible,
  acidify-patch-view .studio-actions button:focus-visible,
  acidify-patch-view .studio-cell:focus-visible,
  acidify-patch-view .pitch-key:focus-visible,
  acidify-patch-view .wave-buttons button:focus-visible,
  acidify-patch-view .run-switch button:focus-visible {
    outline-color: var(--acid-hot);
  }
  acidify-patch-view .stepper {
    grid-template-columns: 25px 62px 25px; height: 30px; border-radius: 7px;
    background: #0d1115; border-color: #303945;
    box-shadow: inset 0 2px 5px rgba(0, 0, 0, .58);
  }
  acidify-patch-view .stepper button {
    color: #cbd2d9; background: linear-gradient(180deg, #343d48, #222831);
    box-shadow: none; text-shadow: none;
  }
  acidify-patch-view .stepper button:active { background: #181d23; }
  acidify-patch-view .stepper-value {
    color: var(--acid-hot); background: #0b0e12; border-inline-color: #2c343e;
    font: 10px ui-monospace, SFMono-Regular, Menlo, monospace;
    text-shadow: 0 0 7px rgba(255, 78, 62, .4);
  }
  acidify-patch-view .stepper-label { margin-top: 3px; color: var(--muted); font-size: 6px; letter-spacing: 1px; }
  acidify-patch-view .output-lamp {
    filter: brightness(calc(.35 + var(--level) * 2.7));
    background: radial-gradient(circle at 36% 30%, #fff3d8 0 5%, #ff6b5e 15%, #eb3529 43%, #5b0c08 78%);
    box-shadow: 0 0 calc(var(--level) * 11px) var(--acid), 0 0 0 2px rgba(255, 255, 255, .035);
  }

  acidify-patch-view .step-row {
    height: 70px; padding: 8px 0;
    grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 13px;
  }
  acidify-patch-view .step-group { gap: 5px; }
  acidify-patch-view .step-group:not(:last-child)::after { display: none; }
  acidify-patch-view .sequence-step {
    height: 54px; border-radius: 7px; color: #cdd4dc;
    background:
      linear-gradient(145deg, rgba(255, 255, 255, .045), transparent 42%),
      linear-gradient(180deg, #2a323d, #20262e);
    border-color: #3a4552;
    box-shadow: 0 4px 8px rgba(0, 0, 0, .28), inset 0 1px rgba(255, 255, 255, .045);
  }
  acidify-patch-view .sequence-step:hover {
    border-color: #566474; background: linear-gradient(180deg, #303946, #242b34);
  }
  acidify-patch-view .sequence-step:active,
  acidify-patch-view .sequence-step.selected {
    transform: translateY(1px); color: #fff;
    background: linear-gradient(180deg, #402824, #251916);
    border-color: #d34a3e;
    box-shadow: 0 0 0 1px rgba(255, 78, 62, .14), 0 0 14px rgba(255, 78, 62, .11), inset 0 1px rgba(255, 255, 255, .045);
  }
  acidify-patch-view .sequence-step.multi-selected {
    outline: 1px solid var(--acid-hot); outline-offset: -3px;
  }
  acidify-patch-view .step-led {
    top: 6px; width: 8px; height: 8px; margin-left: -4px;
    border-color: #35100d;
    background: radial-gradient(circle, #6c211b, #260a07 67%, #100302);
    box-shadow: 0 0 0 2px rgba(255, 255, 255, .025);
  }
  acidify-patch-view .sequence-step.playing .step-led {
    background: radial-gradient(circle at 34% 28%, #fff7dc 0 8%, #ff796b 16%, #ff3e31 48%, #8c120c 76%);
    box-shadow: 0 0 6px var(--acid), 0 0 13px rgba(255, 78, 62, .4);
  }
  acidify-patch-view .sequence-step.accented::before {
    color: #fff8f2; background: linear-gradient(180deg, #ff6858, #b9231a);
    border-color: #7b1711; box-shadow: 0 0 0 1px rgba(255,255,255,.08), 0 0 9px rgba(255,78,62,.34);
  }
  acidify-patch-view .sequence-step.sliding::after {
    color: #221500; background: linear-gradient(180deg, #ffd96b, #bf821a);
    border-color: #75500d; box-shadow: 0 0 0 1px rgba(255,255,255,.08), 0 0 8px rgba(226,166,48,.27);
  }
  acidify-patch-view .step-note { color: var(--acid-hot); }
  acidify-patch-view .sequence-step.rest { opacity: .42; }

  acidify-patch-view .editor,
  acidify-patch-view.studio-mode .studio-editor {
    height: 96px; padding-top: 6px; gap: 8px;
    border-top: 1px solid var(--line-soft); box-shadow: none;
  }
  acidify-patch-view .editor { grid-template-columns: 160px minmax(0, 1fr) 288px; }
  acidify-patch-view.studio-mode .studio-editor { grid-template-columns: 404px 1fr; }
  acidify-patch-view .edit-status,
  acidify-patch-view .keyboard,
  acidify-patch-view .time-controls,
  acidify-patch-view .studio-tools {
    height: 88px; border-radius: 9px; border: 1px solid var(--line);
    background:
      linear-gradient(145deg, rgba(255, 255, 255, .025), transparent 45%),
      linear-gradient(180deg, #202630, #191e25);
    box-shadow: inset 0 1px rgba(255, 255, 255, .035), 0 5px 10px rgba(0, 0, 0, .16);
  }
  acidify-patch-view .edit-status { padding: 10px 12px; }
  acidify-patch-view .edit-caption { color: var(--muted); font-size: 6px; letter-spacing: 1.2px; }
  acidify-patch-view .edit-readout {
    margin-top: 7px; height: 38px; border-radius: 6px;
    color: var(--acid-hot); background: #0b0e12; border-color: #2a1715;
    box-shadow: inset 0 3px 8px rgba(0, 0, 0, .72), 0 1px rgba(255, 255, 255, .025);
    font: 16px ui-monospace, SFMono-Regular, Menlo, monospace;
    text-shadow: 0 0 8px rgba(255, 78, 62, .45);
  }
  acidify-patch-view .octave-indicator { color: var(--faint); }
  acidify-patch-view .octave-indicator.high::after { color: var(--acid-hot); }
  acidify-patch-view .keyboard { padding: 9px; }
  acidify-patch-view .pitch-key {
    border-color: #6f7882; border-radius: 3px 3px 6px 6px;
    color: #20252b;
    background: linear-gradient(180deg, #f4f5f4, #d9dddf 68%, #aeb5ba 100%);
    box-shadow: 0 4px 3px rgba(0, 0, 0, .4), inset 0 1px #fff, inset -1px 0 rgba(0, 0, 0, .08);
  }
  acidify-patch-view .pitch-key.black-key {
    color: #d7dde2; border-color: #050608;
    background: linear-gradient(180deg, #343b44, #171b20 62%, #07090b 100%);
    box-shadow: 0 5px 4px rgba(0, 0, 0, .54), inset 0 1px rgba(255, 255, 255, .08);
  }
  acidify-patch-view .pitch-key.active,
  acidify-patch-view .pitch-key.midi {
    color: #9f241c; box-shadow: 0 1px 1px rgba(0, 0, 0, .4), inset 0 4px 6px rgba(0, 0, 0, .25);
  }
  acidify-patch-view .pitch-key.midi { background: linear-gradient(#ffc1b8, #e96759); }
  acidify-patch-view .time-controls { padding: 9px; gap: 8px; }
  acidify-patch-view .function-button {
    height: 41px; border-radius: 7px;
    color: #dbe1e6; background: linear-gradient(180deg, #313a46, #242a33);
    border-color: #414c5a;
    box-shadow: 0 3px 5px rgba(0, 0, 0, .33), inset 0 1px rgba(255, 255, 255, .045);
    text-shadow: none;
  }
  acidify-patch-view .function-button strong { color: #edf1f4; }
  acidify-patch-view .function-button small { color: var(--muted); }
  acidify-patch-view .function-button:active,
  acidify-patch-view .function-button.active {
    transform: translateY(1px); color: var(--acid-hot);
    background: linear-gradient(180deg, #432a25, #271a17); border-color: #bd4035;
    box-shadow: 0 0 11px rgba(255, 78, 62, .1), inset 0 1px rgba(255, 255, 255, .04);
  }
  acidify-patch-view .function-button.active strong { color: var(--acid-hot); }

  acidify-patch-view .studio-tools { padding: 8px; }
  acidify-patch-view .studio-tool-head { color: var(--muted); }
  acidify-patch-view .studio-selection { color: var(--acid-hot); }
  acidify-patch-view .studio-actions { gap: 5px; }
  acidify-patch-view .studio-actions button {
    height: 35px; border-radius: 7px; color: #e5eaee;
    background: linear-gradient(180deg, #303945, #222831);
    border-color: #404b59;
    box-shadow: 0 3px 5px rgba(0, 0, 0, .3), inset 0 1px rgba(255, 255, 255, .045);
  }
  acidify-patch-view .studio-actions button small { color: var(--muted); }
  acidify-patch-view .studio-actions button:hover:not(:disabled) { color: var(--acid-hot); border-color: #8f3932; }
  acidify-patch-view .studio-actions button:active:not(:disabled) {
    transform: translateY(1px); background: #1b2027; box-shadow: inset 0 2px 5px rgba(0, 0, 0, .45);
  }
  acidify-patch-view .studio-toast {
    color: var(--acid-hot); background: rgba(8, 10, 13, .94); border: 1px solid #313944;
  }
  acidify-patch-view .studio-matrix {
    height: 88px; padding: 6px 9px 10px; border-radius: 9px;
    background:
      linear-gradient(90deg, rgba(255, 255, 255, .018) 1px, transparent 1px),
      linear-gradient(rgba(255, 255, 255, .012) 1px, transparent 1px),
      #0c1014;
    background-size: 12px 12px;
    border-color: #2d3540;
    box-shadow: inset 0 3px 10px rgba(0, 0, 0, .62), 0 1px rgba(255, 255, 255, .025);
  }
  acidify-patch-view .studio-ruler { height: 13px; }
  acidify-patch-view .studio-lane { height: 20px; }
  acidify-patch-view .studio-lane-label { color: var(--muted); }
  acidify-patch-view .studio-ruler-group span { color: #586473; }
  acidify-patch-view .studio-ruler-group:not(:last-child)::after { background: rgba(126, 145, 166, .14); }
  acidify-patch-view .studio-cell {
    height: 16px; border-radius: 4px; color: #6f7b89;
    background: linear-gradient(180deg, #202730, #171c22);
    border-color: #2c3540;
  }
  acidify-patch-view .studio-cell.selected { border-color: #a13b32; }
  acidify-patch-view .studio-cell[data-kind="pitch"].active {
    color: var(--acid-hot); background: linear-gradient(180deg, #3d2723, #241815);
  }
  acidify-patch-view .studio-lane[data-lane="gate"] .studio-cell.active {
    background: linear-gradient(180deg, #dce2e5, #8d99a3); border-color: #e8edef;
    box-shadow: 0 0 7px rgba(219, 228, 234, .16);
  }
  acidify-patch-view .studio-lane[data-lane="accent"] .studio-cell.active {
    background: linear-gradient(180deg, #ff695b, #b92d23); border-color: #ff8277;
    box-shadow: 0 0 8px rgba(255, 78, 62, .34);
  }
  acidify-patch-view .studio-lane[data-lane="slide"] .studio-cell.active {
    background: linear-gradient(180deg, #ffc06f, #9c5c22); border-color: #ffd096;
    box-shadow: 0 0 7px rgba(255, 180, 84, .25);
  }
  acidify-patch-view .studio-cell.playing::after {
    border-color: var(--acid-hot); box-shadow: 0 0 7px rgba(255, 78, 62, .5);
  }
  acidify-patch-view .studio-hint { color: #4f5b68; }
  acidify-patch-view.studio-mode .value-label {
    color: var(--acid-hot); background: linear-gradient(#252c35, #11151a);
    border-color: #050608; box-shadow: 0 8px 18px rgba(0, 0, 0, .5);
  }
  acidify-patch-view .footer-mark {
    right: 28px; bottom: 7px; color: #4f5a67; font-size: 5.5px; letter-spacing: 1.35px; text-shadow: none;
  }

  /* Textured silver hardware surface.
     Keeps the established ACIDIFY geometry while matching the cool metallic
     material of the hardware references. */
  acidify-patch-view {
    --metal-edge: #f7f8f7;
    --metal-high: #d8dad9;
    --metal-mid: #bec0bf;
    --metal-low: #a4a7a6;
    --metal-dark: #747877;
    --metal-grain: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.62' numOctaves='2' seed='29' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.52'/%3E%3C/svg%3E");
    --metal-brush: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='96'%3E%3Cfilter id='b'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.014 .58' numOctaves='2' seed='17' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23b)' opacity='.1'/%3E%3C/svg%3E");
    --line: #666a69;
    --line-soft: rgba(50, 53, 52, .22);
    --ink: #202221;
    --muted: #515453;
    --faint: #676a69;
    --acid: #b52921;
    --acid-hot: #d33a2f;
    --amber: #bb712d;
    color: var(--ink);
    font-family: "Arial Narrow", "Helvetica Neue", Arial, sans-serif;
  }
  acidify-patch-view .chassis {
    border: 1px solid #565a59;
    border-radius: 33px 33px 27px 27px;
    background:
      var(--metal-grain),
      var(--metal-brush),
      radial-gradient(ellipse at 48% -24%, rgba(255,255,255,.72) 0 7%, transparent 48%),
      linear-gradient(104deg, rgba(255,255,255,.46) 0%, rgba(255,255,255,.08) 9%, rgba(67,70,69,.08) 24%, rgba(255,255,255,.29) 43%, rgba(66,69,68,.12) 61%, rgba(255,255,255,.23) 78%, rgba(45,48,47,.28) 100%),
      linear-gradient(180deg, #e1e3e2 0%, #c9cbca 31%, #b2b5b4 73%, #8d9190 100%);
    background-blend-mode: overlay, soft-light, screen, normal, normal;
    background-size: 96px 96px, 160px 96px, auto, auto, auto;
    box-shadow:
      0 30px 46px rgba(0,0,0,.46),
      0 7px 12px rgba(0,0,0,.32),
      inset 0 3px 1px rgba(255,255,255,.92),
      inset 0 -10px 14px rgba(38,41,40,.42),
      inset 5px 0 6px rgba(255,255,255,.28),
      inset -5px 0 7px rgba(35,38,37,.25);
  }
  acidify-patch-view .chassis::before {
    left: 9px; right: 9px; top: 9px; bottom: 10px;
    border-radius: 24px 24px 18px 18px;
    border-color: rgba(42,45,44,.72);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,.88),
      inset 0 -1px 0 rgba(24,27,26,.26),
      0 1px 0 rgba(255,255,255,.42);
  }
  acidify-patch-view .chassis::after {
    background: linear-gradient(180deg, rgba(58,64,62,.025), rgba(36,42,40,.34));
  }
  acidify-patch-view .panel {
    border-color: #686b6a;
    background:
      var(--metal-grain),
      var(--metal-brush),
      radial-gradient(ellipse at 34% -14%, rgba(255,255,255,.5), transparent 48%),
      linear-gradient(101deg, rgba(255,255,255,.24) 0%, rgba(255,255,255,.04) 17%, rgba(48,51,50,.1) 35%, rgba(255,255,255,.18) 56%, rgba(46,49,48,.12) 78%, rgba(255,255,255,.13) 92%, rgba(43,46,45,.15) 100%),
      linear-gradient(180deg, #cacccb 0%, #b5b8b7 48%, #999d9b 100%);
    background-blend-mode: overlay, soft-light, screen, normal, normal;
    background-size: 96px 96px, 160px 96px, auto, auto, auto;
    box-shadow:
      inset 0 1px 0 #f8f9f8,
      inset 0 -3px 5px rgba(35,38,37,.3),
      inset 1px 0 1px rgba(255,255,255,.5),
      inset -1px 0 1px rgba(45,48,47,.16),
      0 3px 4px rgba(0,0,0,.4);
  }
  acidify-patch-view .panel::before {
    opacity: .42;
    mix-blend-mode: soft-light;
    background:
      linear-gradient(96deg, rgba(255,255,255,.18) 0%, transparent 12%, rgba(33,36,35,.08) 27%, transparent 39%, rgba(255,255,255,.24) 55%, transparent 70%, rgba(38,41,40,.09) 83%, rgba(255,255,255,.14) 100%);
    background-size: auto;
    -webkit-mask: none;
            mask: none;
  }
  acidify-patch-view .panel::after {
    left: 24px; right: 24px; top: 0; height: 2px;
    background: linear-gradient(90deg, transparent, rgba(181, 41, 33, .76) 25% 48%, rgba(183, 113, 45, .54) 65%, transparent);
    opacity: .52;
  }
  acidify-patch-view .transport-bank,
  acidify-patch-view .tone-bank,
  acidify-patch-view .volume-bank {
    border-color: rgba(55,58,57,.74);
    background:
      var(--metal-grain),
      linear-gradient(112deg, rgba(255,255,255,.24), transparent 31%, rgba(41,44,43,.1) 58%, rgba(255,255,255,.11) 83%, rgba(39,42,41,.12)),
      linear-gradient(180deg, #c4c6c5, #a8aba9);
    background-blend-mode: overlay, normal, normal;
    background-size: 96px 96px, auto, auto;
    box-shadow:
      inset 0 1px rgba(255,255,255,.76),
      inset 1px 0 rgba(255,255,255,.3),
      inset 0 -1px rgba(30,33,32,.25),
      0 5px 12px rgba(25,28,27,.2);
  }
  acidify-patch-view .brand {
    color: #1c1c19;
    font-family: Impact, "Arial Black", sans-serif;
    font-size: 29px;
    line-height: 29px;
    font-weight: 900;
    letter-spacing: .6px;
  }
  acidify-patch-view .brand .acid { color: #aa211b; }
  acidify-patch-view .model { color: #22292b; font-size: 8px; letter-spacing: 1.65px; }
  acidify-patch-view .computer { color: #566063; }
  acidify-patch-view .bank-title,
  acidify-patch-view .master-head {
    color: #4b5558;
    text-shadow: 0 .5px rgba(255,255,255,.52);
  }
  acidify-patch-view .mini-title { color: #252d2f; }
  acidify-patch-view .mode-box {
    gap: 3px;
    border-left-color: rgba(68,68,63,.45);
    box-shadow: inset 1px 0 rgba(255,255,255,.42);
  }
  acidify-patch-view .clock-mode {
    display: grid; grid-template-columns: 1fr 1fr; width: 108px; height: 19px;
    padding: 2px; border: 1px solid #2a2a26; border-radius: 4px;
    background: linear-gradient(#2b2b27, #151512);
    box-shadow: inset 0 1px 2px #090908, 0 1px rgba(255,255,255,.52);
  }
  acidify-patch-view .clock-mode button {
    min-width: 0; cursor: pointer; border-radius: 2px;
    color: #aaa99f; background: transparent;
    font-size: 6px; line-height: 13px; font-weight: 900; letter-spacing: .75px;
  }
  acidify-patch-view .clock-mode button.active {
    color: #fff2ee;
    background: linear-gradient(#b72b22, #6e1712);
    box-shadow: inset 0 1px rgba(255,255,255,.18), 0 0 6px rgba(174,32,25,.24);
  }
  acidify-patch-view .clock-mode button:focus-visible {
    outline: 2px solid rgba(169,32,26,.72); outline-offset: 2px;
  }
  acidify-patch-view .clock-readout {
    height: 9px; color: #575850; font: 700 6px/9px "Courier New", monospace;
    letter-spacing: .25px; white-space: nowrap;
  }
  acidify-patch-view .clock-readout.locked { color: #8d1d17; }
  acidify-patch-view .clock-readout.waiting { color: #776d51; }
  acidify-patch-view .mode-box > .run-switch { height: 35px; }
  acidify-patch-view .run-switch.daw-controlled,
  acidify-patch-view .tempo-cell.daw-locked .knob-control {
    cursor: default;
  }
  acidify-patch-view .run-switch.daw-controlled button { cursor: default; }
  acidify-patch-view .tempo-cell.daw-locked .dial {
    pointer-events: none; opacity: .52; filter: saturate(.35);
  }
  acidify-patch-view .tempo-cell.daw-locked .value-label { color: #77776f; }
  acidify-patch-view .master-output { color: #666861; }

  acidify-patch-view .run-switch {
    background: linear-gradient(180deg, #171714, #33332e 14%, #1c1c19 100%);
    border-color: #10100e;
    box-shadow: inset 0 3px 5px #050504, inset 0 -1px rgba(255,255,255,.14), 0 1px 0 rgba(255,255,255,.66);
  }
  acidify-patch-view .run-switch button {
    color: #e6eaeb;
    background:
      linear-gradient(100deg, rgba(255,255,255,.13), transparent 30% 72%, rgba(0,0,0,.25)),
      linear-gradient(180deg, #697174 0%, #484f52 43%, #272d2f 100%);
    border-color: #1a2022;
    box-shadow: 0 3px 2px rgba(0,0,0,.7), inset 0 1px 0 rgba(255,255,255,.25);
  }
  acidify-patch-view .run-switch.is-on button {
    color: #ffb3a9;
    border-color: #641811;
    background: linear-gradient(#49332d, #211916);
    box-shadow: 0 1px 1px #050504, inset 0 2px 4px rgba(0,0,0,.45), 0 0 10px rgba(181,41,33,.18);
  }
  acidify-patch-view .run-lamp,
  acidify-patch-view .output-lamp {
    border-color: #4f1a15;
    background:
      radial-gradient(circle at 34% 25%, rgba(255,255,255,.38) 0 5%, transparent 8%),
      radial-gradient(circle at 45% 42%, #7f241c, #4a1511 48%, #210906 78%);
  }

  acidify-patch-view .wave-buttons button {
    color: #e0e5e6;
    background:
      linear-gradient(105deg, rgba(255,255,255,.16), transparent 35% 75%, rgba(0,0,0,.25)),
      linear-gradient(#687174, #353d40 62%, #22282a);
    border-color: #151b1d;
    box-shadow: 0 3px 2px rgba(0,0,0,.52), inset 0 1px rgba(255,255,255,.25), 0 0 0 2px rgba(78,78,72,.12);
  }
  acidify-patch-view .wave-buttons button.active {
    color: #ff5545;
    border-color: #5f1812;
    background: linear-gradient(#383530, #1b1a17);
    box-shadow: 0 1px 1px rgba(0,0,0,.6), inset 0 2px 5px #0b0b09, 0 0 8px rgba(181,41,33,.18);
  }
  acidify-patch-view .wave-title { color: #252d2f; font-size: 8px; }
  acidify-patch-view .dial {
    border-color: #11110f;
    background:
      radial-gradient(circle, transparent 0 62%, rgba(255,255,255,.09) 63%, transparent 67%),
      repeating-conic-gradient(from 1deg, #0c0c0a 0 5deg, #3a3934 5deg 8deg, #11110f 8deg 13deg);
    box-shadow:
      0 8px 9px rgba(0,0,0,.38),
      0 2px 2px rgba(0,0,0,.6),
      inset 0 2px 2px rgba(255,255,255,.12),
      inset 0 -4px 4px #050504;
  }
  acidify-patch-view .dial::before {
    border-color: #11110f;
    background:
      radial-gradient(circle at 34% 24%, rgba(255,255,255,.28) 0 2%, rgba(255,255,255,.07) 16%, transparent 36%),
      radial-gradient(circle at 50% 48%, #56564f 0%, #272723 58%, #0b0b09 84%);
    box-shadow: inset 0 2px 2px rgba(255,255,255,.1), inset -3px -6px 9px rgba(0,0,0,.64);
  }
  acidify-patch-view .dial::after { border-top-color: rgba(255,255,255,.09); }
  acidify-patch-view .dial-pointer {
    background: linear-gradient(90deg, #b9c0c2, #f4f7f8 48%, #929b9e);
    box-shadow: 0 1px 1px #050504;
  }
  acidify-patch-view .tick-ring {
    background: repeating-conic-gradient(from 222deg, #34342f 0 1.3deg, transparent 1.3deg 13.5deg);
    opacity: .82;
  }
  acidify-patch-view .tick-ring::after { background: #a7211a; box-shadow: 0 0 3px rgba(167,33,26,.22); }
  acidify-patch-view .control-label {
    color: #252d2f;
    font-size: 8px;
    letter-spacing: .72px;
    text-shadow: 0 .5px rgba(255,255,255,.46);
  }
  acidify-patch-view .value-label {
    color: #741812;
    font-size: 7.5px;
    font-family: "Courier New", monospace;
  }

  acidify-patch-view .program-strip {
    border-color: rgba(60,67,65,.7);
    background:
      var(--metal-grain),
      linear-gradient(108deg, rgba(255,255,255,.24), transparent 29%, rgba(42,45,44,.1) 56%, rgba(255,255,255,.11) 82%, rgba(39,42,41,.12)),
      linear-gradient(180deg, #bfc2c0, #a4a7a5);
    background-blend-mode: overlay, normal, normal;
    background-size: 96px 96px, auto, auto;
    box-shadow: inset 0 1px rgba(255,255,255,.72), inset 0 -1px rgba(31,34,33,.27), 0 8px 16px rgba(28,31,30,.17);
  }
  acidify-patch-view .program-header {
    border-bottom-color: rgba(75,75,69,.58);
    box-shadow: 0 1px rgba(255,255,255,.5);
  }
  acidify-patch-view .program-title { color: #252d2f; }
  acidify-patch-view .program-title b { color: #a51d17; }
  acidify-patch-view .program-context { color: #505a5d; }
  acidify-patch-view .studio-toggle {
    color: #505a5d;
    background:
      linear-gradient(104deg, rgba(255,255,255,.32), transparent 34% 75%, rgba(49,52,51,.16)),
      linear-gradient(180deg, #d0d4d2, #b6bcb8 58%, #9da4a1);
    border-color: #666d6a;
    box-shadow: inset 0 1px #e9edee, inset 0 -1px rgba(30,39,42,.25), 0 1px rgba(255,255,255,.34), 0 2px 2px rgba(0,0,0,.24);
  }
  acidify-patch-view .studio-toggle i {
    background:
      linear-gradient(105deg, rgba(255,255,255,.17), transparent 35% 78%, rgba(0,0,0,.25)),
      linear-gradient(#5a5953, #2c2c28);
    border-color: #20201d;
  }
  acidify-patch-view .studio-toggle .classic-label { color: #edf1f2; text-shadow: 0 1px #171d1f; }
  acidify-patch-view .studio-toggle[aria-pressed="true"] i {
    background:
      linear-gradient(105deg, rgba(255,255,255,.16), transparent 38% 78%, rgba(63,0,0,.18)),
      linear-gradient(#b63329, #72150f);
    border-color: #68130e;
  }
  acidify-patch-view .studio-toggle[aria-pressed="true"] .classic-label { color: #505a5d; }
  acidify-patch-view .studio-toggle[aria-pressed="true"] .studio-label { color: #fff1e9; text-shadow: 0 1px #5b0c08; }
  acidify-patch-view .stepper {
    background: #262622;
    border-color: #121210;
    box-shadow: inset 0 2px 4px rgba(0,0,0,.62), 0 1px 0 rgba(255,255,255,.55);
  }
  acidify-patch-view .stepper button {
    color: #e4e9ea;
    background: linear-gradient(#626b6e, #343c3f);
  }
  acidify-patch-view .stepper-value {
    color: #ff6756;
    background: #17120f;
    border-inline-color: #080807;
    text-shadow: 0 0 4px rgba(255,57,37,.58);
  }
  acidify-patch-view .stepper-label { color: #364043; }

  acidify-patch-view .step-group:not(:last-child)::after { display: block; }
  acidify-patch-view .sequence-step {
    color: #222a2c;
    background:
      linear-gradient(105deg, rgba(255,255,255,.36) 0, transparent 20% 76%, rgba(51,59,57,.17) 100%),
      linear-gradient(180deg, #dadddb 0%, #c1c6c3 46%, #a7aeaa 82%, #8f9793 100%);
    border-color: #6b726f;
    box-shadow: 0 4px 2px rgba(0,0,0,.38), 0 1px 1px rgba(0,0,0,.28), inset 0 1px #edf1f2;
  }
  acidify-patch-view .sequence-step:hover {
    border-color: #59615e;
    background: linear-gradient(180deg, #e2e4e2, #b9bfbb 78%, #99a19d);
  }
  acidify-patch-view .sequence-step:active,
  acidify-patch-view .sequence-step.selected {
    color: #1d2426;
    background: linear-gradient(#899396, #b9c0c2 36%, #a0a9ac);
    border-color: #a92720;
    box-shadow: 0 1px 1px rgba(0,0,0,.3), inset 0 3px 5px rgba(0,0,0,.28);
  }
  acidify-patch-view .sequence-step.multi-selected { outline-color: rgba(165,29,23,.72); }
  acidify-patch-view .step-led {
    border-color: #2b0806;
    background: radial-gradient(circle at 34% 27%, rgba(255,255,255,.22) 0 5%, transparent 9%), radial-gradient(circle, #651b15, #3c0e0b 60%, #1e0705);
  }
  acidify-patch-view .step-note { color: #8b1b15; }
  acidify-patch-view .sequence-step.accented::before {
    color: #fff8f2; background: linear-gradient(180deg, #d94336, #8b1711);
    border-color: #6d100b; box-shadow: 0 0 0 1px rgba(255,255,255,.3), 0 1px 3px rgba(60,4,2,.42);
  }
  acidify-patch-view .sequence-step.sliding::after {
    color: #261800; background: linear-gradient(180deg, #ffe17a, #d89d22);
    border-color: #70520b; box-shadow: 0 0 0 1px rgba(255,255,255,.34), 0 1px 3px rgba(51,36,0,.38);
  }
  acidify-patch-view .step-octave {
    position: absolute; right: 4px; top: 4px;
    color: #4f595c; font: 6px "Courier New", monospace; font-weight: 900;
  }

  acidify-patch-view .editor,
  acidify-patch-view.studio-mode .studio-editor {
    border-top-color: rgba(255,255,255,.6);
    box-shadow: inset 0 1px rgba(61,61,57,.18);
  }
  acidify-patch-view .edit-status,
  acidify-patch-view .keyboard,
  acidify-patch-view .time-controls,
  acidify-patch-view .studio-tools {
    border-color: rgba(60,67,65,.7);
    background:
      var(--metal-grain),
      linear-gradient(111deg, rgba(255,255,255,.22), transparent 34%, rgba(41,44,43,.1) 61%, rgba(255,255,255,.1)),
      linear-gradient(180deg, #bfc2c1, #a6aaa8);
    background-blend-mode: overlay, normal, normal;
    background-size: 96px 96px, auto, auto;
    box-shadow: inset 0 1px rgba(255,255,255,.7), inset 1px 0 rgba(255,255,255,.24), inset 0 -1px rgba(30,33,32,.23);
  }
  acidify-patch-view .edit-caption { color: #4b5558; }
  acidify-patch-view .edit-readout {
    color: #ff513b;
    background: repeating-linear-gradient(90deg, transparent 0 3px, rgba(0,0,0,.05) 3px 4px), #1c100d;
    border-color: #0a0706;
    text-shadow: 0 0 4px #e32418, 0 0 8px rgba(227,36,24,.38);
  }
  acidify-patch-view .octave-indicator {
    color: #4b5558; min-height: 9px;
    font-family: "Courier New", monospace; font-weight: 900; letter-spacing: .3px;
  }
  acidify-patch-view .octave-indicator::after { content: none; }
  acidify-patch-view .pitch-key {
    color: #222a2c;
    border-color: #626c6f;
    background:
      linear-gradient(100deg, rgba(92,102,105,.2), transparent 15% 77%, rgba(45,55,58,.24)),
      linear-gradient(180deg, #e7ebec 0%, #d3d8da 55%, #b3bbbd 84%, #909a9d 100%);
  }
  acidify-patch-view .pitch-key.black-key {
    color: #e7ebec;
    border-color: #050505;
    background:
      linear-gradient(100deg, rgba(255,255,255,.09), transparent 24% 74%, rgba(0,0,0,.4)),
      linear-gradient(180deg, #393934 0%, #272723 57%, #11110f 84%, #070706 100%);
  }
  acidify-patch-view .pitch-key.active,
  acidify-patch-view .pitch-key.midi { color: #b42018; }
  acidify-patch-view .function-button {
    color: #222a2c;
    background:
      linear-gradient(105deg, rgba(255,255,255,.34), transparent 22% 78%, rgba(52,60,58,.16)),
      linear-gradient(180deg, #d6dad7 0%, #bbc1bd 55%, #9da5a1 100%);
    border-color: #69706d;
    box-shadow: 0 4px 2px rgba(0,0,0,.38), inset 0 1px #edf1f2;
  }
  acidify-patch-view .function-button strong { color: #222a2c; }
  acidify-patch-view .function-button small { color: #525c5f; }
  acidify-patch-view .function-button:active,
  acidify-patch-view .function-button.active {
    color: #a51d17;
    background: linear-gradient(#879194, #b7bec0 44%, #9ba4a7);
    border-color: #a42a22;
    box-shadow: 0 1px 1px rgba(0,0,0,.25), inset 0 3px 5px rgba(0,0,0,.28);
  }
  acidify-patch-view .function-button.active strong { color: #a51d17; }

  acidify-patch-view .studio-tool-head { color: #525c5f; }
  acidify-patch-view .studio-selection { color: #9b2019; }
  acidify-patch-view .studio-actions button {
    color: #e4e9ea;
    background:
      linear-gradient(105deg, rgba(255,255,255,.12), transparent 32% 78%, rgba(0,0,0,.28)),
      linear-gradient(#535c5f, #282f31);
    border-color: #171d1f;
    box-shadow: 0 2px 2px rgba(0,0,0,.32), inset 0 1px rgba(255,255,255,.18);
  }
  acidify-patch-view .studio-actions button small { color: #a9b0b2; }
  acidify-patch-view .studio-matrix {
    background:
      linear-gradient(110deg, rgba(255,255,255,.035), transparent 27% 75%, rgba(0,0,0,.22)),
      linear-gradient(#242520, #151613);
    border-color: #090a08;
    box-shadow: inset 0 2px 7px rgba(0,0,0,.58), 0 1px rgba(255,255,255,.52);
  }
  acidify-patch-view .studio-lane-label { color: #85867d; }
  acidify-patch-view .studio-ruler-group span { color: #575851; }
  acidify-patch-view .studio-ruler-group:not(:last-child)::after { background: rgba(125,126,116,.2); }
  acidify-patch-view .studio-cell {
    color: #6d6e67;
    background: linear-gradient(#30312d, #22231f);
    border-color: #11120f;
  }
  acidify-patch-view .studio-cell.selected { border-color: #77302a; }
  acidify-patch-view .studio-cell[data-kind="pitch"].active {
    color: #ff8b79;
    background: linear-gradient(#44312c, #2c1d19);
  }
  acidify-patch-view .studio-lane[data-lane="gate"] .studio-cell.active {
    background: linear-gradient(#d4d3c9, #85867e);
    border-color: #e0dfd5;
  }
  acidify-patch-view .studio-lane[data-lane="accent"] .studio-cell.active {
    background: linear-gradient(#ed5b49, #971c13);
    border-color: #ff7666;
  }
  acidify-patch-view .studio-lane[data-lane="slide"] .studio-cell.active {
    background: linear-gradient(#d09252, #71431e);
    border-color: #dba05c;
  }
  acidify-patch-view .studio-hint { color: #4c5659; }
  acidify-patch-view.studio-mode .value-label {
    color: #ff7768;
    background: linear-gradient(#282a27, #121311);
    border-color: #080907;
  }
  acidify-patch-view .footer-mark {
    color: #4a5457;
    text-shadow: 0 .5px rgba(255,255,255,.38);
  }
  acidify-patch-view .tooltip-toggle {
    position: absolute; z-index: 8; left: 37px; bottom: 3px;
    width: 76px; height: 16px; padding: 1px 4px; border-radius: 4px; cursor: pointer;
    display: grid; grid-template-columns: 12px 1fr 22px; align-items: center; gap: 2px;
    color: #414b4e; background: linear-gradient(#c4cacb, #929b9e);
    border: 1px solid #586266;
    box-shadow: inset 0 1px rgba(255,255,255,.66), 0 1px rgba(255,255,255,.24);
    font-size: 6px; line-height: 11px; font-weight: 900; letter-spacing: .75px;
  }
  acidify-patch-view .tooltip-toggle > i {
    width: 10px; height: 10px; border-radius: 50%; font-style: normal;
    display: grid; place-items: center; color: #eef2f3; background: #4d575a;
    font-size: 7px; line-height: 10px; letter-spacing: 0;
  }
  acidify-patch-view .tooltip-toggle-state {
    height: 11px; border-radius: 2px; color: #fff2ed; background: linear-gradient(#b92e24, #74150f);
    box-shadow: inset 0 1px rgba(255,255,255,.15); text-align: center;
  }
  acidify-patch-view .tooltip-toggle[aria-pressed="false"] .tooltip-toggle-state {
    color: #a9aaa4; background: linear-gradient(#4b4c47, #292a27);
  }
  acidify-patch-view .tooltip-toggle:focus-visible {
    outline: 2px solid rgba(169,32,26,.82); outline-offset: 2px;
  }
  acidify-patch-view .tooltip-bubble[hidden] { display: none; }
  acidify-patch-view .tooltip-bubble {
    position: absolute; z-index: 140; width: max-content; max-width: 260px;
    padding: 8px 10px; border-radius: 5px; pointer-events: none;
    color: #f1efe5; background: rgba(27, 28, 25, .96);
    border: 1px solid rgba(228, 225, 211, .28);
    box-shadow: 0 8px 18px rgba(0,0,0,.38), inset 0 1px rgba(255,255,255,.06);
    font: 700 9px/1.35 "Helvetica Neue", Arial, sans-serif;
    letter-spacing: .12px; text-align: left; white-space: normal;
  }
  acidify-patch-view .pitch-menu[hidden] { display: none; }
  acidify-patch-view .pitch-menu {
    position: absolute; z-index: 95; width: 394px; height: 278px; overflow: hidden;
    color: #242724; border: 1px solid #565d5b; border-radius: 8px;
    background:
      var(--metal-grain),
      radial-gradient(ellipse at 36% -10%, rgba(255,255,255,.38), transparent 50%),
      linear-gradient(155deg, #d0d4d1, #a4aba7);
    background-blend-mode: overlay, screen, normal;
    background-size: 96px 96px, auto, auto;
    box-shadow:
      0 16px 30px rgba(35,32,25,.46),
      0 5px 10px rgba(35,32,25,.35),
      inset 0 1px #edf1f2,
      inset 0 -2px 4px rgba(0,0,0,.2);
    animation: pitch-menu-enter 110ms ease-out both;
  }
  @keyframes pitch-menu-enter {
    from { opacity: 0; transform: translateY(-3px); }
    to { opacity: 1; transform: translateY(0); }
  }
  acidify-patch-view .pitch-menu-head {
    height: 42px; padding: 7px 8px 5px 11px;
    display: flex; align-items: center; justify-content: space-between;
    border-bottom: 1px solid rgba(69,69,64,.55);
    box-shadow: 0 1px rgba(255,255,255,.55);
  }
  acidify-patch-view .pitch-menu-head > div {
    min-width: 0; display: flex; flex-direction: column; gap: 2px;
  }
  acidify-patch-view .pitch-menu-title {
    overflow: hidden; color: #9f1e18; font-size: 10px; letter-spacing: 1.2px;
    text-overflow: ellipsis; white-space: nowrap;
  }
  acidify-patch-view .pitch-menu-head span {
    color: #505a5d; font-size: 5.5px; font-weight: 900; letter-spacing: .85px;
  }
  acidify-patch-view .pitch-menu-close {
    flex: 0 0 auto; width: 23px; height: 21px; border-radius: 3px; cursor: pointer;
    color: #e4e9ea; font: 18px/17px Arial, sans-serif;
    background: linear-gradient(#555e61, #282f31);
    border: 1px solid #171d1f;
    box-shadow: inset 0 1px rgba(255,255,255,.18), 0 1px rgba(255,255,255,.42);
  }
  acidify-patch-view .pitch-menu-grid {
    height: 211px; padding: 7px 8px;
    display: grid; grid-template-columns: repeat(5, 1fr); grid-template-rows: repeat(5, 1fr); gap: 4px;
  }
  acidify-patch-view .pitch-menu-choice {
    min-width: 0; cursor: pointer; border-radius: 4px;
    display: flex; align-items: center; justify-content: center; gap: 5px;
    color: #e4e9ea;
    background:
      linear-gradient(105deg, rgba(255,255,255,.13), transparent 34% 77%, rgba(0,0,0,.25)),
      linear-gradient(#576063, #282f31);
    border: 1px solid #171d1f;
    box-shadow: 0 2px 2px rgba(0,0,0,.3), inset 0 1px rgba(255,255,255,.18);
  }
  acidify-patch-view .pitch-menu-choice strong {
    font: 10px "Courier New", monospace; letter-spacing: .3px;
  }
  acidify-patch-view .pitch-menu-choice small {
    color: #a9b0b2; font: 5px "Courier New", monospace; font-weight: 900;
  }
  acidify-patch-view .pitch-menu-choice:hover,
  acidify-patch-view .pitch-menu-choice:focus-visible {
    color: #ff9a87; border-color: #8f3932;
  }
  acidify-patch-view .pitch-menu-choice:focus-visible,
  acidify-patch-view .pitch-menu-close:focus-visible {
    outline: 2px solid rgba(169,32,26,.78); outline-offset: 1px;
  }
  acidify-patch-view .pitch-menu-choice.active {
    color: #fff0e9; border-color: #75160f;
    background: linear-gradient(#ae3026, #67140f);
    box-shadow: inset 0 2px 4px rgba(52,5,2,.4), 0 0 5px rgba(181,41,33,.24);
  }
  acidify-patch-view .pitch-menu-choice.active small { color: #ffc0b5; }
  acidify-patch-view .pitch-menu-foot {
    height: 25px; padding: 5px 9px 0; border-top: 1px solid rgba(69,69,64,.35);
    color: #505a5d; font-size: 5px; font-weight: 900; letter-spacing: .85px;
    text-align: right;
  }
  acidify-patch-view .distortion-trigger, acidify-patch-view .mods-trigger {
    display: inline-flex; align-items: center; justify-content: center; gap: 3px;
    width: 40px; height: 15px; padding: 0 4px; border-radius: 3px; cursor: pointer;
    color: #424c4f; font-size: 5.5px; line-height: 1; font-weight: 900; letter-spacing: .65px;
    background: linear-gradient(#c8ced0, #919a9d);
    border: 1px solid #5d676a;
    box-shadow: inset 0 1px rgba(255,255,255,.75), 0 1px rgba(255,255,255,.38);
  }
  acidify-patch-view .distortion-trigger:hover, acidify-patch-view .mods-trigger:hover { color: #272823; }
  acidify-patch-view .distortion-trigger:active, acidify-patch-view .mods-trigger:active, acidify-patch-view .mods-trigger.active,
  acidify-patch-view .distortion-trigger.active {
    transform: translateY(1px);
    color: #fff0e8; border-color: #751911;
    background: linear-gradient(#a72a21, #64130e);
    box-shadow: inset 0 2px 3px rgba(41,3,1,.52), 0 0 6px rgba(181,41,33,.22);
  }
  acidify-patch-view .distortion-trigger:focus-visible, acidify-patch-view .mods-trigger:focus-visible,
  acidify-patch-view .distortion-close:focus-visible, acidify-patch-view .mods-close:focus-visible,
  acidify-patch-view .distortion-types button:focus-visible,
  acidify-patch-view .distortion-power button:focus-visible {
    outline: 2px solid rgba(169,32,26,.72); outline-offset: 2px;
  }
  acidify-patch-view .distortion-led, acidify-patch-view .mods-led {
    display: block; width: 5px; height: 5px; border-radius: 50%;
    background: #48140f; border: 0;
    box-shadow: inset 0 1px 1px rgba(255,255,255,.18);
  }
  acidify-patch-view .distortion-led.lit {
    background: #ff503d;
    box-shadow: 0 0 6px rgba(255,50,32,.9), inset 0 0 1px #fff;
  }
  acidify-patch-view .distortion-scrim[hidden] { display: none; }
  acidify-patch-view .distortion-scrim {
    position: absolute; z-index: 80; inset: 0; border-radius: 15px;
    background: rgba(25,24,20,.2);
  }
  acidify-patch-view .distortion-overlay, acidify-patch-view .mods-overlay {
    position: absolute; right: 22px; top: 20px; width: 514px; height: 198px;
    overflow: hidden; border: 1px solid #595f5e; border-radius: 8px;
    color: #242724;
    background:
      var(--metal-grain),
      radial-gradient(ellipse at 36% -10%, rgba(255,255,255,.38), transparent 50%),
      linear-gradient(155deg, #d0d4d1, #a4aba7);
    background-blend-mode: overlay, screen, normal;
    background-size: 96px 96px, auto, auto;
    box-shadow:
      0 14px 28px rgba(35,32,25,.42),
      0 4px 9px rgba(35,32,25,.34),
      inset 0 1px #edf1f2,
      inset 0 -2px 4px rgba(0,0,0,.2);
    animation: distortion-enter 130ms ease-out both;
  }
  @keyframes distortion-enter {
    from { opacity: 0; transform: translateY(-5px); }
    to { opacity: 1; transform: translateY(0); }
  }
  acidify-patch-view .distortion-overlay-head, acidify-patch-view .mods-overlay-head {
    height: 35px; padding: 7px 9px 5px 12px;
    display: flex; align-items: center; justify-content: space-between;
    border-bottom: 1px solid rgba(69,69,64,.55);
    box-shadow: 0 1px rgba(255,255,255,.55);
  }
  acidify-patch-view .distortion-overlay-head > div, acidify-patch-view .mods-overlay-head > div {
    display: flex; align-items: baseline; gap: 11px;
  }
  acidify-patch-view .distortion-overlay-head strong, acidify-patch-view .mods-overlay-head strong {
    color: #9f1e18; font-size: 10px; letter-spacing: 1.8px;
  }
  acidify-patch-view .distortion-status {
    color: #505a5d; font: 7px "Courier New", monospace; letter-spacing: .75px;
  }
  acidify-patch-view .distortion-close, acidify-patch-view .mods-close {
    width: 23px; height: 21px; border-radius: 3px; cursor: pointer;
    color: #e4e9ea; font: 18px/17px Arial, sans-serif;
    background: linear-gradient(#555e61, #282f31);
    border: 1px solid #171d1f;
    box-shadow: inset 0 1px rgba(255,255,255,.18), 0 1px rgba(255,255,255,.42);
  }
  acidify-patch-view .distortion-overlay-body {
    height: 137px; padding: 9px 10px 6px;
    display: grid; grid-template-columns: 76px 190px 96px 96px; gap: 8px;
    align-items: stretch;
  }
  acidify-patch-view .distortion-power-cell,
  acidify-patch-view .distortion-type-cell,
  acidify-patch-view .distortion-knob-cell {
    position: relative; min-width: 0; border: 1px solid rgba(49,59,62,.58); border-radius: 5px;
    background:
      var(--metal-grain),
      linear-gradient(135deg, rgba(255,255,255,.2), rgba(61,68,66,.06));
    background-blend-mode: overlay, normal;
    background-size: 96px 96px, auto;
    box-shadow: inset 0 1px rgba(255,255,255,.45);
  }
  acidify-patch-view .distortion-cell-label {
    display: block; margin-top: 7px; text-align: center;
    color: #4b5558; font-size: 6px; font-weight: 900; letter-spacing: 1.15px;
  }
  acidify-patch-view .distortion-power-cell {
    display: flex; flex-direction: column; align-items: center;
  }
  acidify-patch-view .distortion-power-cell > small {
    margin-top: 8px; color: #535d60; font-size: 5px; font-weight: 900; letter-spacing: .55px;
  }
  acidify-patch-view .distortion-power.run-switch {
    width: 54px; height: 42px; margin-top: 11px; padding: 4px;
  }
  acidify-patch-view .distortion-power.run-switch button {
    display: flex; align-items: center; justify-content: center; gap: 5px;
    font-size: 7px; letter-spacing: .8px;
  }
  acidify-patch-view .distortion-power button i {
    width: 7px; height: 7px; border-radius: 50%; background: #48140f;
    box-shadow: inset 0 1px rgba(255,255,255,.18);
  }
  acidify-patch-view .distortion-power.is-on button i {
    background: #ff503d; box-shadow: 0 0 5px rgba(255,50,32,.9), inset 0 0 1px #fff;
  }
  acidify-patch-view .distortion-type-cell { padding: 0 7px; }
  acidify-patch-view .distortion-types {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px;
    margin-top: 13px;
  }
  acidify-patch-view .distortion-types button {
    height: 59px; border-radius: 4px; cursor: pointer;
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 7px;
    color: #e2e7e8; font-size: 7px; font-weight: 900; letter-spacing: .6px;
    background: linear-gradient(105deg, rgba(255,255,255,.13), transparent 34% 77%, rgba(0,0,0,.25)),
                linear-gradient(#576063, #282f31);
    border: 1px solid #171d1f;
    box-shadow: 0 3px 2px rgba(0,0,0,.33), inset 0 1px rgba(255,255,255,.2);
  }
  acidify-patch-view .distortion-types button small {
    color: #a9b0b2; font-size: 5px; letter-spacing: .8px;
  }
  acidify-patch-view .distortion-types button.active {
    transform: translateY(2px); color: #fff0e9; border-color: #75160f;
    background: linear-gradient(#ae3026, #67140f);
    box-shadow: 0 1px 1px rgba(0,0,0,.52), inset 0 2px 4px rgba(52,5,2,.4);
  }
  acidify-patch-view .distortion-types button.active small { color: #ffc0b5; }
  acidify-patch-view .distortion-knob-cell {
    display: flex; align-items: flex-start; justify-content: center; padding-top: 13px;
  }
  acidify-patch-view .distortion-overlay .knob-control { width: 82px; height: 112px; }
  acidify-patch-view .distortion-overlay .dial { width: 61px; height: 61px; }
  acidify-patch-view .distortion-overlay .dial::before,
  acidify-patch-view .distortion-overlay .dial-cap { inset: 6px; }
  acidify-patch-view .distortion-overlay .dial-pointer { top: 3px; height: 16px; }
  acidify-patch-view .distortion-overlay .tick-ring {
    top: -8px; width: 78px; height: 78px;
  }
  acidify-patch-view .distortion-overlay .tick-ring::after {
    left: 37px; transform-origin: 2px 38px;
  }
  acidify-patch-view .distortion-overlay .control-label {
    margin-top: 10px; font-size: 7px; letter-spacing: .8px;
  }
  acidify-patch-view .distortion-overlay .value-label {
    margin-top: 2px; font-size: 7px;
  }
  acidify-patch-view .mods-overlay { width: 560px; max-width: 96%; }
  acidify-patch-view .mods-scrim {
    position: absolute; inset: 0; z-index: 90; border-radius: 15px;
    display: grid; place-items: center;
    background: rgba(12, 14, 15, 0.55);
  }
  acidify-patch-view .mods-scrim[hidden] { display: none; }

  /* ---------- Studio-Modus im Silver-Layout ---------- */
  acidify-patch-view.studio-mode .silver-knob .value-label {
    position: static; opacity: 1; transform: none; pointer-events: none;
    padding: 0; min-width: 0; width: auto; border: 0; background: none; box-shadow: none;
    color: #ff6756; font: 12px/1 'Courier New',monospace; letter-spacing: .5px; text-shadow: 0 0 5px rgba(255,57,37,.5);
  }
  acidify-patch-view.studio-mode .master-cell .silver-knob .value-label { color: #6c1710; font: 8px/1 'Courier New',monospace; text-shadow: none; }
  acidify-patch-view.studio-mode .sequence-step { height: 54px; }
  acidify-patch-view.studio-mode .step-well { top: 15px; height: 20px; }
  acidify-patch-view.studio-mode .step-cap { top: 16px; height: 17px; }
  acidify-patch-view.studio-mode .cap-rocker { height: 12px; }
  acidify-patch-view.studio-mode .cap-nub { top: 4px; height: 9px; }
  acidify-patch-view.studio-mode .step-playbar { top: 36px; }
  acidify-patch-view.studio-mode .step-sel { bottom: 16px; }
  acidify-patch-view.studio-mode .editor,
  acidify-patch-view.studio-mode .studio-editor { height: 118px; }
  acidify-patch-view.studio-mode .edit-status,
  acidify-patch-view.studio-mode .keyboard,
  acidify-patch-view.studio-mode .time-controls,
  acidify-patch-view.studio-mode .studio-tools,
  acidify-patch-view.studio-mode .studio-matrix { height: 110px; }
  acidify-patch-view .studio-actions button { height: 24px; font-size: 9px; line-height: 9px; }
  acidify-patch-view.studio-mode .studio-matrix { padding: 4px 8px 6px; }
  acidify-patch-view.studio-mode .studio-ruler { height: 10px; }
  acidify-patch-view.studio-mode .studio-lane { height: 17px; }
  acidify-patch-view.studio-mode .studio-cell { height: 12px; }
  acidify-patch-view .studio-actions button small { font-size: 5.5px; }


  /* ================= SILVER SERIES (Design-Port) ================= */
  acidify-patch-view .chassis {
    border-radius: 7px; border: 0;
    background-image:
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.72' numOctaves='2' seed='11' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.4'/%3E%3C/svg%3E"),
      repeating-linear-gradient(93deg, rgba(255,255,255,.05) 0 1px, rgba(0,0,0,.02) 1px 2px, transparent 2px 5px),
      linear-gradient(180deg,#dfe1e0 0%,#c8cac9 40%,#aeb1b0 78%,#8f9392 100%);
    background-blend-mode: overlay, overlay, normal;
    background-size: 96px 96px, auto, auto;
    box-shadow: 0 26px 44px rgba(0,0,0,.5), inset 0 2px 0 rgba(255,255,255,.85), inset 0 -6px 10px rgba(38,41,40,.35);
  }
  acidify-patch-view .chassis::before, acidify-patch-view .chassis::after { content: none; }
  acidify-patch-view .panel {
    position: static; left: auto; top: auto; width: 100%; height: 100%;
    display: flex; flex-direction: column; gap: 8px; box-sizing: border-box; padding: 8px;
    border: 0; border-radius: 0; background: none; box-shadow: none;
  }
  acidify-patch-view .panel::before, acidify-patch-view .panel::after { content: none; }
  acidify-patch-view .footer-mark { display: none; }
  acidify-patch-view .top-strip.deck-a { position: static; left: auto; right: auto; top: auto; flex: 0 0 auto; border-bottom: 1px solid #6f7573; }
  acidify-patch-view .deck-b { position: static; flex: 0 0 auto; }
  acidify-patch-view .panel > .program-strip { position: static; left: auto; right: auto; top: auto; height: auto; flex: 1; min-height: 0; margin-top: 0; }
  acidify-patch-view .deck-a .branding { position: static; left: auto; top: auto; height: auto; }
  acidify-patch-view .deck-a .tone-bank, acidify-patch-view .deck-a .volume-bank { position: static; left: auto; right: auto; top: auto; bottom: auto; width: auto; height: auto; }
  acidify-patch-view .deck-a .volume-bank { width: auto; }
  acidify-patch-view .deck-a .waveform { position: static; width: auto; height: auto; left: auto; top: auto; }
  acidify-patch-view .deck-a .master-head { position: static; width: auto; height: auto; }
  acidify-patch-view .deck-a .master-head span { position: static; }
  acidify-patch-view .deck-a .tone-controls { position: static; left: auto; right: auto; top: auto; bottom: auto;
    grid-template-columns: repeat(6, minmax(0, 1fr)); align-items: start; justify-items: center; }
  acidify-patch-view .deck-a .osc-cell .wave-buttons { position: static; left: auto; right: auto; top: auto; }
  acidify-patch-view .silver-knob.knob-control { width: auto; height: auto; }
  acidify-patch-view .deck-a .tone-bank .knob-control { width: auto; }
  acidify-patch-view .deck-a .tone-bank .dial { width: auto; height: auto; }
  acidify-patch-view .deck-a .tone-bank .dial::before { content: none; }
  acidify-patch-view .deck-a .tone-bank .dial-cap { inset: 9px; }
  acidify-patch-view .deck-a .tone-bank .tick-ring { top: auto; width: auto; height: auto; }
  acidify-patch-view .deck-a .volume-bank { position: static; right: auto; top: auto; height: auto; padding-top: 12px; flex-direction: row; }
  acidify-patch-view .silver-knob .dial::before, acidify-patch-view .silver-knob .dial::after { content: none; }
  acidify-patch-view .master-cell .knob-control { width: auto; height: auto; }


  acidify-patch-view .top-strip.deck-a {
    display: flex; grid-template-columns: none; gap: 0; padding: 0; height: 170px;
    border: 1px solid #6f7573; border-radius: 3px; overflow: hidden;
    background-image: repeating-linear-gradient(93deg, rgba(255,255,255,.05) 0 1px, rgba(0,0,0,.022) 1px 2px, transparent 2px 5px),
      linear-gradient(180deg,#f0f2f1 0%,#dfe1e0 44%,#c7cac9 100%);
    box-shadow: inset 0 1px 0 #fff, inset 0 -2px 3px rgba(30,34,33,.2);
  }
  acidify-patch-view .deck-a > * { box-sizing: border-box; border-right: 1px solid rgba(45,50,49,.5); box-shadow: 1px 0 0 rgba(255,255,255,.6); }
  acidify-patch-view .deck-a > *:last-child { border-right: 0; box-shadow: none; }
  acidify-patch-view .brand-cell { width: 206px; flex: 0 0 auto; padding: 15px 16px; display: flex; flex-direction: column; justify-content: space-between; background: none; border-bottom: 0; }
  acidify-patch-view .deck-a .brand { font: 900 34px/34px Impact,'Arial Black',sans-serif; letter-spacing: .4px; color: #8d9391;
    text-shadow: 0 -1px 0 rgba(14,18,17,.85), 0 1px 0 rgba(255,255,255,.98), 0 2px 2px rgba(255,255,255,.45), 0 -2px 3px rgba(14,18,17,.35); }
  acidify-patch-view .deck-a .brand .acid { color: #8e1f16; text-shadow: 0 -1px 0 rgba(38,4,2,.95), 0 1px 0 rgba(255,255,255,.95), 0 -2px 4px rgba(96,14,8,.55), 0 0 9px rgba(196,32,20,.28); }
  acidify-patch-view .brand-rule { margin-top: 8px; height: 2px; border-radius: 1px;
    background: linear-gradient(90deg, rgba(30,35,34,.55) 0 62%, rgba(142,31,22,.75) 62% 100%);
    box-shadow: 0 1px 0 rgba(255,255,255,.85), inset 0 1px 1px rgba(0,0,0,.5); }
  acidify-patch-view .deck-a .model { margin-top: 8px; font: 900 8px/11px 'Arial Narrow',Arial,sans-serif; letter-spacing: .85px; color: #2b3536; white-space: nowrap; text-shadow: 0 -.5px 0 rgba(20,24,23,.5), 0 1px 0 rgba(255,255,255,.9); }
  acidify-patch-view .deck-a .computer { margin-top: 3px; font: 900 6.5px/10px 'Arial Narrow',Arial,sans-serif; letter-spacing: .8px; color: #798382; white-space: nowrap; text-shadow: 0 1px 0 rgba(255,255,255,.75); }
  acidify-patch-view .tips-power-row { box-sizing: border-box; height: 34px; padding: 0 8px; display: flex; align-items: center; justify-content: space-between;
    border-radius: 2px; border: 1px solid #8b918f; background: linear-gradient(180deg,#b6bab8,#c9cdcb);
    box-shadow: inset 0 2px 4px rgba(48,54,52,.4), inset 0 -1px 0 rgba(255,255,255,.6), 0 1px 0 rgba(255,255,255,.7); }
  acidify-patch-view .deck-a .tooltip-toggle { position: static; display: flex; align-items: center; gap: 5px; height: 18px; padding: 0 6px; cursor: pointer;
    border-radius: 2px; border: 1px solid #1a1e1f; width: auto; font: 900 7.5px/1 'Arial Narrow',Arial,sans-serif; letter-spacing: 1.1px; color: #1d2426;
    background: linear-gradient(102deg,#fdfefe 0 18%,#dfe4e4 34%,#aeb6b8 52%,#eaeeee 68%,#c3cacb 86%,#8f9799 100%);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.95), inset 0 -2px 3px rgba(52,60,62,.3), 0 3px 3px rgba(0,0,0,.45); }
  acidify-patch-view .deck-a .tooltip-toggle[aria-pressed="true"] {
    background: linear-gradient(102deg,#c6cccd 0 18%,#aeb5b7 34%,#8a9295 52%,#bcc3c4 68%,#99a1a3 86%,#727b7d 100%);
    box-shadow: inset 0 2px 5px rgba(30,36,38,.55), 0 1px 1px rgba(0,0,0,.5); }
  acidify-patch-view .deck-a .tooltip-toggle .tooltip-toggle-state { padding: 2px 4px; border-radius: 1px; font: 900 7px/1 'Arial Narrow',Arial,sans-serif; letter-spacing: .8px;
    color: #fff2ed; background: linear-gradient(#b92e24,#74150f); }
  acidify-patch-view .deck-a .tooltip-toggle[aria-pressed="false"] .tooltip-toggle-state { color: #a9aaa4; background: linear-gradient(#4b4c47,#292a27); }
  acidify-patch-view .deck-a .theme-toggle { position: static; display: flex; align-items: center; gap: 5px; height: 18px; padding: 0 6px; cursor: pointer;
    border-radius: 2px; border: 1px solid #1a1e1f; width: auto; font: 900 7.5px/1 'Arial Narrow',Arial,sans-serif; letter-spacing: 1.1px; color: #1d2426;
    background: linear-gradient(102deg,#fdfefe 0 18%,#dfe4e4 34%,#aeb6b8 52%,#eaeeee 68%,#c3cacb 86%,#8f9799 100%);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.95), inset 0 -2px 3px rgba(52,60,62,.3), 0 3px 3px rgba(0,0,0,.45); }
  acidify-patch-view .deck-a .theme-toggle[aria-pressed="true"] {
    background: linear-gradient(102deg,#3c4041 0 18%,#33373a 34%,#26292b 52%,#33373a 68%,#2b2f31 86%,#1e2123 100%);
    box-shadow: inset 0 2px 5px rgba(0,0,0,.6), 0 1px 1px rgba(0,0,0,.5); color: #c8cdcb; }
  acidify-patch-view .deck-a .theme-toggle[aria-pressed="true"] span { color: #ff8a76; text-shadow: 0 0 5px rgba(255,60,40,.4); }
  acidify-patch-view .power-cell { display: flex; align-items: center; gap: 6px; padding: 0; border: 0; background: transparent; cursor: pointer; }
  acidify-patch-view .power-label { color: #6d7776; font: 900 7px/1 'Arial Narrow',Arial,sans-serif; letter-spacing: 1.1px; text-shadow: 0 1px 0 rgba(255,255,255,.7); }
  acidify-patch-view .power-cell.bypassed .power-label { color: #8e1f16; }
  acidify-patch-view .power-ring { display: grid; place-items: center; width: 22px; height: 22px; border-radius: 50%; border: 1px solid rgba(45,50,49,.5);
    background: radial-gradient(circle at 34% 26%, #f2f4f4, #b9bfbd 62%, #98a09e); box-shadow: inset 0 1px 0 rgba(255,255,255,.9), inset 0 -2px 3px rgba(48,54,52,.35), 0 1px 0 rgba(255,255,255,.65); }
  acidify-patch-view .power-led { width: 8px; height: 8px; border-radius: 50%;
    background: radial-gradient(circle at 35% 30%, #55201a, #2c0b07 70%, #1a0503); box-shadow: inset 0 1px 1px rgba(255,255,255,.16); }
  acidify-patch-view .power-led.lit {
    background: radial-gradient(circle at 35% 30%, #ff6a54, #9d1c11 68%, #5a0d06); box-shadow: inset 0 1px 1px rgba(255,255,255,.45), 0 0 8px rgba(220,42,26,.6); }
  acidify-patch-view .brand-legal { margin-top: 7px; display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
  acidify-patch-view .brand-legal span { font: 900 6.5px/1 'Arial Narrow',Arial,sans-serif; letter-spacing: 1.2px; color: #5d6767; white-space: nowrap; text-shadow: 0 1px 0 rgba(255,255,255,.8); }
  acidify-patch-view .brand-legal .brand-version { color: #8b9494; text-shadow: 0 1px 0 rgba(255,255,255,.7); }

  acidify-patch-view .cell-title { width: 100%; height: 15px; display: grid; place-items: center; border-bottom: 1px solid rgba(45,50,49,.45);
    color: #26302f; font: 900 8px/1 'Arial Narrow',Arial,sans-serif; letter-spacing: 1.7px; text-shadow: 0 1px 0 rgba(255,255,255,.85); }

  acidify-patch-view .osc-cell { width: 172px; flex: 0 0 auto; padding: 12px 13px; display: flex; flex-direction: column; }
  acidify-patch-view .osc-cell .waveform { flex: 1; min-height: 0; display: flex; align-items: center; justify-content: center; }
  acidify-patch-view .osc-cell .wave-buttons { display: flex; gap: 14px; background: none; border: 0; box-shadow: none; padding: 0; }
  acidify-patch-view .wave-choice { display: flex; flex-direction: column; align-items: center; gap: 5px; }
  acidify-patch-view .osc-cell .wave-buttons button { width: 62px; height: 58px; padding: 5px; border-radius: 3px; cursor: pointer;
    border: 1px solid #1a1e1f; color: #4d5658;
    background: linear-gradient(102deg,#fdfefe 0 18%,#dfe4e4 34%,#aeb6b8 52%,#eaeeee 68%,#c3cacb 86%,#8f9799 100%);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.95), inset 0 -2px 3px rgba(52,60,62,.3), 0 3px 3px rgba(0,0,0,.45); }
  acidify-patch-view .osc-cell .wave-buttons button.active { color: #ff5545;
    background: linear-gradient(102deg,#c6cccd 0 18%,#aeb5b7 34%,#8a9295 52%,#bcc3c4 68%,#99a1a3 86%,#727b7d 100%);
    box-shadow: inset 0 2px 5px rgba(30,36,38,.55), 0 1px 1px rgba(0,0,0,.5); }
  acidify-patch-view .osc-cell .wave-buttons svg { display: block; width: 100%; height: 100%; overflow: visible; fill: none; stroke: currentColor; stroke-width: 2.4; stroke-linecap: butt; filter: none; }
  acidify-patch-view .wave-name { color: #67716f; font: 900 8px/1 'Arial Narrow',Arial,sans-serif; letter-spacing: 1.3px; text-shadow: 0 1px 0 rgba(255,255,255,.75); }
  acidify-patch-view .wave-choice:has(button.active) .wave-name { color: #8e1f16; }

  acidify-patch-view .deck-a .tone-bank { flex: 1; padding: 14px 15px 0 16px; background: none; border: 0; box-shadow: none; }
  acidify-patch-view .deck-a .tone-controls { display: grid; grid-template-columns: repeat(6,1fr); gap: 0; padding: 0; justify-items: stretch; align-items: start; }

  acidify-patch-view .silver-knob { --norm: var(--default-norm, .5); width: auto; height: auto; display: flex; flex-direction: column; align-items: center; background: none; border: 0; box-shadow: none; padding: 0; }
  acidify-patch-view .silver-knob .control-label { position: static; margin: 0; font: 900 9px/1 'Arial Narrow',Arial,sans-serif; letter-spacing: 1.15px; color: #1c2224; text-shadow: none; }
  acidify-patch-view .silver-knob:has(.mod-slider:not([hidden])) .control-label { color: #9b2019; }
  acidify-patch-view .deck-a .tone-bank .silver-knob .control-label { width: 100%; text-align: center; }
  acidify-patch-view .deck-a .tone-bank .silver-knob .chrome-wrap, acidify-patch-view .deck-a .tone-bank .silver-knob .led-box { margin-right: 1px; }
  acidify-patch-view .silver-knob .chrome-wrap { position: relative; margin-top: 9px; width: 68px; height: 68px; }
  acidify-patch-view .silver-knob .tick-ring { position: absolute; inset: -5px; border-radius: 50%; transform: none; border: 0; filter: none;
    background: repeating-conic-gradient(from 218deg, #3f4645 0 1.2deg, transparent 1.2deg 11.5deg);
    -webkit-mask: radial-gradient(circle, transparent 86%, #000 87% 97%, transparent 98%);
    mask: radial-gradient(circle, transparent 86%, #000 87% 97%, transparent 98%);
    clip-path: polygon(0 0,100% 0,100% 86%,50% 50%,0 86%); }
  acidify-patch-view .silver-knob .tick-ring::after { display: none; }
  acidify-patch-view .silver-knob .dial { position: absolute; inset: 0; width: auto; height: auto; border-radius: 50%; cursor: ns-resize; touch-action: none;
    border: 1px solid #565e60;
    background: linear-gradient(180deg, rgba(255,255,255,.55) 0%, rgba(255,255,255,0) 20%, rgba(26,32,34,.15) 56%, rgba(26,32,34,.38) 100%),
      repeating-conic-gradient(from .5deg, #798285 0 1.7deg, #c4cbcd 1.7deg 2.5deg, #6d7679 2.5deg 4.2deg);
    box-shadow: 0 7px 9px rgba(0,0,0,.3), 0 2px 2px rgba(0,0,0,.4), inset 0 2px 2px rgba(255,255,255,.9), inset 0 -6px 8px rgba(40,47,49,.55); }
  acidify-patch-view .silver-knob .dial-cap { position: absolute; inset: 9px; border-radius: 50%; border: 1px solid #6d7578; transform: none;
    background: radial-gradient(ellipse at 50% 118%, rgba(255,255,255,.5) 0 16%, rgba(255,255,255,0) 54%),
      radial-gradient(ellipse 132% 114% at 34% 15%, #ffffff 0 5%, #f1f4f4 17%, #cdd3d4 39%, #a8b0b2 65%, #8c9598 88%, #a3abad 100%);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.95), inset 0 -1px 0 rgba(255,255,255,.5), inset -5px -7px 12px rgba(96,106,109,.26), inset 4px 5px 10px rgba(255,255,255,.3); }
  acidify-patch-view .silver-knob .pointer-wrap { position: absolute; inset: 9px; border-radius: 50%; pointer-events: none; z-index: 5;
    transform: rotate(calc(-135deg + var(--norm) * 270deg)); }
  acidify-patch-view .silver-knob .dial-pointer { position: absolute; left: 50%; top: 5px; width: 3px; height: 20px; margin-left: -1.5px; border-radius: 2px;
    transform: none; background: linear-gradient(90deg,#141819 0,#343a3c 45%,#0f1314 100%); box-shadow: 1px 0 0 rgba(255,255,255,.55); }
  acidify-patch-view .led-box { margin-top: 10px; width: 68px; height: 22px; display: grid; place-items: center; border-radius: 2px; border: 1px solid #0a0706;
    background: linear-gradient(180deg,#241512,#130b09); box-shadow: inset 0 2px 4px rgba(0,0,0,.72); }
  acidify-patch-view .led-box .value-label, acidify-patch-view .led-box .stepper-value { position: static; color: #ff6756; font: 12px/1 'Courier New',monospace; letter-spacing: .5px;
    text-shadow: 0 0 5px rgba(255,57,37,.5); width: auto; margin: 0; min-width: 0; opacity: 1;
    height: auto; display: inline; background: none; border: 0; box-shadow: none; }
  acidify-patch-view .mod-slider { position: absolute; inset: 0; }
  acidify-patch-view .mod-slider-track { position: absolute; inset: 0; cursor: ew-resize; touch-action: none; }
  acidify-patch-view .mod-slider-rail { position: absolute; left: 4px; right: 4px; top: 6px; height: 2px; border-radius: 1px;
    background: linear-gradient(90deg, rgba(142,31,22,.75), rgba(255,90,66,.5)); }
  acidify-patch-view .mod-slider-thumb { position: absolute; top: 1px; left: 4px; width: 9px; height: 11px; margin-left: -4.5px; border-radius: 2px;
    border: 1px solid #4a5153; background: linear-gradient(180deg,#f4f6f6 0 30%,#c9cfd0 55%,#98a1a3 100%);
    box-shadow: 0 1px 2px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.9); }
  acidify-patch-view .mod-slider-value { position: absolute; left: 50%; top: 14px; margin-left: -24px; width: 50px; height: 15px; z-index: 6;
    display: grid; place-items: center; border-radius: 2px; border: 1px solid #0a0706; background: linear-gradient(180deg,#241512,#130b09);
    box-shadow: 0 3px 6px rgba(0,0,0,.45); color: #ff6756; font: 10px/1 'Courier New',monospace; }
  acidify-patch-view .mod-slot { position: relative; margin-top: 7px; width: 66px; height: 13px; border-radius: 7px;
    background: linear-gradient(180deg, rgba(52,58,57,.3), rgba(210,214,212,.16));
    box-shadow: inset 0 2px 3px rgba(40,46,45,.5), inset 0 -1px 0 rgba(255,255,255,.55), 0 1px 0 rgba(255,255,255,.6); }

  acidify-patch-view .deck-a .volume-bank { width: auto; flex: 0 0 auto; padding: 12px 13px; display: flex; gap: 10px; align-items: stretch; background: none; border: 0; }
  acidify-patch-view .master-cell .cell-title, acidify-patch-view .output-cell .cell-title { place-items: start center; padding-top: 2px; }
  acidify-patch-view .master-cell .cell-title { width: 96px; height: 16px; }
  acidify-patch-view .output-cell .cell-title { width: 99px; height: 16px; }
  acidify-patch-view .osc-cell .cell-title { height: 16px; }
  acidify-patch-view .master-cell .tick-ring { display: none; }
  acidify-patch-view .master-cell .silver-knob .dial { box-shadow: 0 7px 9px rgba(0,0,0,.3), inset 0 2px 2px rgba(255,255,255,.9), inset 0 -6px 8px rgba(40,47,49,.55); }
  acidify-patch-view .master-cell .silver-knob .dial-cap { box-shadow: inset 0 1px 0 rgba(255,255,255,.95), inset -5px -7px 12px rgba(96,106,109,.26); }
  acidify-patch-view .master-cell .silver-knob .dial-cap, acidify-patch-view .master-cell .silver-knob .pointer-wrap { inset: 8px; }
  acidify-patch-view .master-cell .silver-knob .dial-pointer { width: 3px; height: 21px; top: 5px; margin-left: -1.5px; }
  acidify-patch-view .master-cell { display: flex; flex-direction: column; align-items: center; }
  acidify-patch-view .master-cell .silver-knob .chrome-wrap { width: 72px; height: 72px; margin-top: 11px; }
  acidify-patch-view .master-cell .silver-knob .control-label { display: none; }
  acidify-patch-view .master-cell .silver-knob .led-box { order: 4; margin-top: 5px; width: auto; height: auto; border: 0; background: none; box-shadow: none; }
  acidify-patch-view .master-cell .silver-knob .led-box .value-label { color: #6c1710; font: 8px/1 'Courier New',monospace; letter-spacing: normal; text-shadow: none; }
  acidify-patch-view .output-cell { flex: 0 0 auto; display: flex; flex-direction: column; align-items: center; padding-top: 0; }
  acidify-patch-view .master-minis { display: flex; align-items: flex-start; justify-content: flex-end; gap: 9px;
    margin-top: auto; margin-left: auto; margin-right: 1px; padding-bottom: 1px; }
  acidify-patch-view .dist-mini { display: flex; flex-direction: column; align-items: center; gap: 1px; cursor: ns-resize; touch-action: none; }
  acidify-patch-view .dist-mini-dial { position: relative; width: 24px; height: 24px; border-radius: 50%; border: 1px solid #565e60;
    background: linear-gradient(180deg, rgba(255,255,255,.55) 0%, rgba(255,255,255,0) 22%, rgba(26,32,34,.18) 58%, rgba(26,32,34,.4) 100%),
      radial-gradient(ellipse 130% 112% at 34% 16%, #ffffff 0 6%, #f1f4f4 18%, #cdd3d4 40%, #a8b0b2 66%, #8c9598 88%, #a3abad 100%);
    box-shadow: 0 2px 3px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.9), inset 0 -3px 4px rgba(40,47,49,.45); }
  acidify-patch-view .dist-mini-pointer { position: absolute; left: 50%; top: 2px; width: 2px; height: 9px; margin-left: -1px; border-radius: 1px;
    background: #1d2426; transform-origin: 1px 10px; transform: rotate(calc((var(--norm, .5) - .5) * 270deg)); }
  acidify-patch-view .dist-mini-label { color: #5d6768; font: 900 5px/6px 'Arial Narrow',Arial,sans-serif; letter-spacing: .8px; text-shadow: 0 1px 0 rgba(255,255,255,.7); }
  acidify-patch-view .dist-mini.stage-off { opacity: .45; }
  acidify-patch-view .dist-mini:focus-visible { outline: 1px solid #a51d17; outline-offset: 2px; border-radius: 3px; }
  acidify-patch-view .vu-meter { position: relative; margin-top: 9px; width: 46px; height: 88px; border-radius: 3px; overflow: hidden; border: 1px solid #0b0d0c;
    background: linear-gradient(180deg,#1a1c19,#0d0f0d); box-shadow: inset 0 3px 7px rgba(0,0,0,.8), 0 1px 0 rgba(255,255,255,.6); --level: 0; }
  acidify-patch-view .vu-scale { position: absolute; bottom: 4px; top: 4px; width: 14px; border-radius: 1px;
    background: repeating-linear-gradient(0deg, rgba(255,255,255,.055) 0 2px, transparent 2px 4px); }
  acidify-patch-view .vu-scale.l { left: 6px; } acidify-patch-view .vu-scale.r { right: 6px; }
  acidify-patch-view .vu-bar { position: absolute; bottom: 4px; width: 14px; height: calc(var(--level, 0) * 80px); border-radius: 1px;
    background: linear-gradient(0deg,#3fa05a,#a8c33c 58%,#e4a52c 80%,#e1382a 100%); box-shadow: 0 0 7px rgba(255,110,60,.4); transition: height 60ms linear; }
  acidify-patch-view .vu-bar.l { left: 6px; } acidify-patch-view .vu-bar.r { right: 6px; }
  acidify-patch-view .trigger-row { margin-top: 8px; display: flex; gap: 5px; padding: 0; background: none; border: 0; }
  acidify-patch-view .deck-a .distortion-trigger, acidify-patch-view .deck-a .mods-trigger { width: 47px; height: 22px; transform: none; display: flex; align-items: center; justify-content: center; gap: 4px;
    border-radius: 2px; cursor: pointer; border: 1px solid #1a1e1f; color: #1d2426; font: 900 7px/1 'Arial Narrow',Arial,sans-serif; letter-spacing: .7px;
    background: linear-gradient(102deg,#fdfefe 0 18%,#dfe4e4 34%,#aeb6b8 52%,#eaeeee 68%,#c3cacb 86%,#8f9799 100%);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.9), 0 2px 2px rgba(0,0,0,.4); }

  acidify-patch-view .deck-b { display: flex; margin-top: 0; height: 106px; border: 1px solid #6f7573; border-radius: 3px; overflow: hidden;
    background-image: repeating-linear-gradient(93deg, rgba(255,255,255,.05) 0 1px, rgba(0,0,0,.022) 1px 2px, transparent 2px 5px),
      linear-gradient(180deg,#eef0ef 0%,#dcdedd 46%,#c5c8c7 100%);
    box-shadow: inset 0 1px 0 #fff, inset 0 -2px 3px rgba(30,34,33,.2); }
  acidify-patch-view .deckb-cell { box-sizing: border-box; padding: 9px 11px; display: flex; flex-direction: column; align-items: center;
    border-right: 1px solid rgba(45,50,49,.5); box-shadow: 1px 0 0 rgba(255,255,255,.6); }
  acidify-patch-view .deckb-cell:last-child { border-right: 0; box-shadow: none; }
  acidify-patch-view .tempo-cell { width: 191px; flex: 0 0 auto; }
  acidify-patch-view .tempo-row { margin-top: 9px; width: 100%; display: flex; align-items: center; gap: 11px; }
  acidify-patch-view .silver-knob.compact .chrome-wrap { width: 56px; height: 56px; margin-top: 0; }
  acidify-patch-view .silver-knob.compact .control-label { display: none; }
  acidify-patch-view .silver-knob.compact .tick-ring { display: none; }
  acidify-patch-view .silver-knob.compact .led-box { display: none; }
  acidify-patch-view .silver-knob.compact .dial { box-shadow: 0 5px 7px rgba(0,0,0,.3), inset 0 2px 2px rgba(255,255,255,.85), inset 0 -5px 6px rgba(40,47,49,.5); }
  acidify-patch-view .silver-knob.compact .dial-cap { background: radial-gradient(ellipse at 50% 118%, rgba(255,255,255,.45) 0 16%, rgba(255,255,255,0) 54%), radial-gradient(ellipse 132% 114% at 34% 15%, #ffffff 0 5%, #f1f4f4 17%, #cdd3d4 39%, #a8b0b2 65%, #8c9598 88%, #a3abad 100%);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.9), inset -4px -5px 9px rgba(96,106,109,.26); }
  acidify-patch-view .silver-knob.compact .dial-cap, acidify-patch-view .silver-knob.compact .pointer-wrap { inset: 8px; }
  acidify-patch-view .silver-knob.compact .dial-pointer { top: 5px; width: 3px; height: 12px; margin-left: -1.5px; box-shadow: none; }
  acidify-patch-view .tempo-side { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 5px; }
  acidify-patch-view .tempo-led { margin-top: 0; width: 100%; height: 30px;
    background: repeating-linear-gradient(90deg, transparent 0 3px, rgba(0,0,0,.09) 3px 4px), linear-gradient(180deg,#251614,#130b09);
    box-shadow: inset 0 3px 6px rgba(0,0,0,.75), 0 1px 0 rgba(255,255,255,.62); }
  acidify-patch-view .tempo-led .value-label-mirror { color: #ff6756; font: 20px/22px 'Courier New',monospace; white-space: nowrap; text-shadow: 0 0 8px rgba(255,57,37,.5); }
  acidify-patch-view .tempo-scale { display: flex; align-items: center; justify-content: space-between; color: #4d5658; font: 900 6.5px/1 'Arial Narrow',Arial,sans-serif; letter-spacing: 1.1px; text-shadow: 0 1px 0 rgba(255,255,255,.7); }
  acidify-patch-view .tempo-scale i { flex: 1; margin: 0 5px; height: 1px; background: linear-gradient(90deg, rgba(45,50,49,.35), rgba(255,255,255,.5)); }

  acidify-patch-view .clock-cell { width: 143px; flex: 0 0 auto; }
  acidify-patch-view .clock-cell .cell-title { width: 100px; }
  acidify-patch-view .deck-b .clock-mode { margin-top: 8px; display: flex; gap: 8px; background: none; border: 0; box-shadow: none; padding: 0; width: auto; height: auto; }
  acidify-patch-view .clock-choice { display: flex; flex-direction: column; align-items: center; gap: 6px; }
  acidify-patch-view .clock-lamp { width: 7px; height: 7px; border-radius: 50%;
    background: radial-gradient(circle at 35% 28%, rgba(255,255,255,.14) 0 12%, #46201c 55%, #24100e 100%); box-shadow: inset 0 -1px 1px rgba(0,0,0,.7); }
  acidify-patch-view .clock-mode:not(.is-on) .clock-lamp.int, acidify-patch-view .clock-mode.is-on .clock-lamp.daw {
    background: radial-gradient(circle at 35% 28%, #ffe3d4 0 14%, #ff5540 46%, #8e120b 100%); box-shadow: 0 0 7px rgba(255,72,48,.9), inset 0 0 2px rgba(255,255,255,.6); }
  acidify-patch-view .deck-b .clock-mode button { width: 44px; height: 34px; border-radius: 3px; cursor: pointer; border: 1px solid #1a1e1f; color: #1d2426;
    font: 900 8px/1 'Arial Narrow',Arial,sans-serif; letter-spacing: 1px;
    background: linear-gradient(102deg,#fdfefe 0 18%,#dfe4e4 34%,#aeb6b8 52%,#eaeeee 68%,#c3cacb 86%,#8f9799 100%);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.95), inset 0 -2px 3px rgba(52,60,62,.3), 0 3px 3px rgba(0,0,0,.45); }
  acidify-patch-view .deck-b .clock-mode button.active { color: #1d2426;
    background: linear-gradient(102deg,#c6cccd 0 18%,#aeb5b7 34%,#8a9295 52%,#bcc3c4 68%,#99a1a3 86%,#727b7d 100%);
    box-shadow: inset 0 2px 5px rgba(30,36,38,.55), 0 1px 1px rgba(0,0,0,.5); }

  acidify-patch-view .transport-cell { width: 183px; flex: 0 0 auto; }
  acidify-patch-view .transport-cell .cell-title { width: 140px; }
  acidify-patch-view .deck-b .run-lamp { position: static; margin-top: 7px; width: 11px; height: 11px; border-radius: 50%; border: 1px solid #4f1a15;
    box-shadow: 0 1px 0 rgba(255,255,255,.62), inset 0 -2px 3px #170403; }
  acidify-patch-view .deck-b .run-lamp.lit { box-shadow: 0 0 6px rgba(255,51,31,.85), 0 0 13px rgba(255,42,25,.5), inset 0 0 2px #fff; }
  acidify-patch-view .deck-b .run-switch { margin-top: 6px; background: none; border: 0; box-shadow: none; padding: 0; width: auto; height: auto; perspective: none; border-radius: 0; }
  acidify-patch-view .deck-b .run-switch button { width: 140px; height: 36px; border-radius: 3px; cursor: pointer; border: 1px solid #1a1e1f; color: #1d2426; text-shadow: none;
    font: 900 10px/1 'Arial Narrow',Arial,sans-serif; letter-spacing: 1.5px;
    background: linear-gradient(102deg,#fdfefe 0 18%,#dfe4e4 34%,#aeb6b8 52%,#eaeeee 68%,#c3cacb 86%,#8f9799 100%);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.95), inset 0 -2px 3px rgba(52,60,62,.3), 0 3px 3px rgba(0,0,0,.45); }
  acidify-patch-view .deck-b .run-switch.is-on button { transform: none; color: #8c1a12; border-color: #8c2c23;
    background: linear-gradient(102deg,#c6cccd 0 18%,#aeb5b7 34%,#8a9295 52%,#bcc3c4 68%,#99a1a3 86%,#727b7d 100%); box-shadow: inset 0 2px 5px rgba(30,36,38,.55), 0 1px 1px rgba(0,0,0,.5), 0 0 14px rgba(181,41,33,.3); }

  acidify-patch-view .stepper-cell { width: 315px; flex: 0 0 auto; flex-direction: row; gap: 8px; justify-content: center; align-items: stretch; }
  acidify-patch-view .stepper-block { display: flex; flex-direction: column; align-items: center; }
  acidify-patch-view .stepper-block .cell-title { width: 86px; height: 15px; }
  acidify-patch-view .silver-stepper { display: flex; flex-direction: column; align-items: center; background: none; border: 0; box-shadow: none; padding: 0; }
  acidify-patch-view .silver-stepper .led-box { margin-top: 6px; width: 88px; height: 24px;
    background: repeating-linear-gradient(90deg, transparent 0 3px, rgba(0,0,0,.09) 3px 4px), linear-gradient(180deg,#251614,#130b09);
    box-shadow: inset 0 3px 6px rgba(0,0,0,.75), 0 1px 0 rgba(255,255,255,.62); }
  acidify-patch-view .silver-stepper .stepper-value { color: #ff6756; font: 12px/1 'Courier New',monospace; letter-spacing: 1px; text-shadow: 0 0 6px rgba(255,57,37,.55); }
  acidify-patch-view .stepper-buttons { margin-top: 7px; display: flex; gap: 6px; }
  acidify-patch-view .stepper-buttons button { width: 40px; height: 24px; border-radius: 3px; cursor: pointer; border: 1px solid #1a1e1f; color: #1d2426;
    font: 900 13px/1 Arial,sans-serif;
    background: linear-gradient(102deg,#fdfefe 0 18%,#dfe4e4 34%,#aeb6b8 52%,#eaeeee 68%,#c3cacb 86%,#8f9799 100%);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.9), 0 2px 2px rgba(0,0,0,.4); }

  acidify-patch-view .scope-cell { flex: 1; min-width: 0; align-items: stretch; }
  acidify-patch-view .scope-head { display: flex; align-items: center; justify-content: space-between; }
  acidify-patch-view .scope-head .cell-title { width: 132px; height: 15px; }
  acidify-patch-view .scope-hz { font: 7px/1 'Courier New',monospace; color: #6c1710; }
  acidify-patch-view .scope-row { margin-top: 7px; flex: 1; min-height: 0; display: flex; gap: 7px; }
  acidify-patch-view .scope-screen { position: relative; flex: 1; min-width: 0; border-radius: 2px; overflow: hidden; border: 1px solid #0a0b09;
    background: linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px), linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px), linear-gradient(#22231e,#121310);
    background-size: 22px 100%, 100% 16px, 100% 100%;
    box-shadow: inset 0 3px 8px rgba(0,0,0,.7), 0 1px 0 rgba(255,255,255,.6); }
  acidify-patch-view .scope-svg { position: absolute; inset: 0; width: 100%; height: 100%; }
  acidify-patch-view .scope-env { fill: none; stroke: #c48a34; stroke-width: 1.2; opacity: .6; stroke-dasharray: 3 3; }
  acidify-patch-view .scope-fill { fill: rgba(211,58,47,.13); stroke: none; }
  acidify-patch-view .scope-curve { fill: none; stroke: #ff5140; stroke-width: 1.8; stroke-linejoin: round; }
  acidify-patch-view .scope-cursor { stroke: rgba(255,236,220,.22); stroke-width: 1; stroke-dasharray: 2 3; }
  acidify-patch-view .scope-tag { position: absolute; color: #6e6f66; font: 900 5px/1 'Arial Narrow',Arial,sans-serif; letter-spacing: .8px; }
  acidify-patch-view .scope-tag.tl { left: 6px; top: 5px; } acidify-patch-view .scope-tag.bl { left: 6px; bottom: 4px; } acidify-patch-view .scope-tag.br { right: 6px; bottom: 4px; }
  acidify-patch-view .scope-legend { width: 66px; flex: 0 0 auto; display: grid; grid-template-rows: repeat(4,1fr); gap: 4px; }
  acidify-patch-view .scope-legend > div { display: flex; align-items: center; justify-content: space-between; padding: 0 5px; border-radius: 2px; border: 1px solid #0a0706;
    background: linear-gradient(180deg,#241512,#130b09); box-shadow: inset 0 2px 4px rgba(0,0,0,.7); }
  acidify-patch-view .scope-legend span { color: #8d9698; font: 900 5px/1 'Arial Narrow',Arial,sans-serif; letter-spacing: .9px; }
  acidify-patch-view .scope-legend b { color: #ff6756; font: 8px/1 'Courier New',monospace; text-shadow: 0 0 5px rgba(255,57,37,.5); }

  acidify-patch-view .program-header { height: 25px; flex: 0 0 auto; margin: 0 -8px; padding: 0 12px; display: flex; align-items: center; justify-content: space-between;
    border-bottom: 1px solid rgba(45,50,49,.45); box-shadow: 0 1px 0 rgba(255,255,255,.6); font-size: inherit; font-weight: normal; letter-spacing: normal; }
  acidify-patch-view .program-title { display: flex; flex-wrap: nowrap; align-items: baseline; gap: 10px; white-space: nowrap; flex: 0 0 auto; }
  acidify-patch-view .program-title b { color: #a51d17; font: 900 11px/1 'Arial Narrow',Arial,sans-serif; letter-spacing: 2.2px; white-space: nowrap; text-shadow: 0 1px 0 rgba(255,255,255,.7); }
  acidify-patch-view .program-title > span:not(.program-legend) { color: #26302f; font: 900 11px/1 'Arial Narrow',Arial,sans-serif; letter-spacing: 2.2px; white-space: nowrap; text-shadow: 0 1px 0 rgba(255,255,255,.8); }
  acidify-patch-view .program-context { color: #5d6768; font: 900 7.5px/1 'Arial Narrow',Arial,sans-serif; letter-spacing: 1.5px; white-space: nowrap; }
  acidify-patch-view .utility { flex: 1; min-width: 0; display: flex; align-items: center; justify-content: flex-end; gap: 12px; }
  acidify-patch-view .studio-toggle { display: flex; width: auto; height: auto; padding: 0; border: 1px solid #3d4446; border-radius: 2px; overflow: hidden;
    background: #2b302f; box-shadow: none; cursor: pointer; }
  acidify-patch-view .studio-toggle i { display: none; }
  acidify-patch-view .studio-toggle span { position: static; z-index: auto; width: 44px; height: 15px; display: grid; place-items: center; cursor: pointer;
    font: 900 6.5px/1 'Arial Narrow',Arial,sans-serif; letter-spacing: 1.1px; text-shadow: none; background: #2b302f; color: #9aa3a5; }
  acidify-patch-view .studio-toggle[data-view="classic"] .classic-label { background: linear-gradient(180deg,#eef1f1,#c3cacb); color: #15191a; }
  acidify-patch-view .studio-toggle[data-view="studio"] .studio-label { background: linear-gradient(180deg,#c9382c,#7d1610); color: #fff1ee; }
  acidify-patch-view .studio-toggle[data-view="arp"] .arp-label { background: linear-gradient(180deg,#ffc46f,#8a5312); color: #2a1a02; }
  acidify-patch-view .program-legend { display: inline-flex; align-items: center; gap: 5px; margin-left: 0; padding-left: 12px; border-left: 1px solid rgba(58,66,64,.28); }
  acidify-patch-view .program-legend i { width: 16px; height: 12px; display: grid; place-items: center; border-radius: 2px; font: 900 8px/1 'Arial Narrow',Arial,sans-serif; font-style: normal; }
  acidify-patch-view .program-legend .legend-a { color: #fff2ee; border: 1px solid #5d1611; background: linear-gradient(180deg,#ff7361,#a3201a); box-shadow: 0 0 6px rgba(255,72,48,.5); }
  acidify-patch-view .program-legend .legend-s { color: #2a1a02; border: 1px solid #5b3908; background: linear-gradient(180deg,#ffc776,#8d5410); box-shadow: 0 0 6px rgba(255,168,60,.45); }
  acidify-patch-view .program-legend .legend-play { width: 12px; height: 8px; border-radius: 4px; border: 0;
    background: radial-gradient(ellipse at 50% 28%, #fff4ec 0 22%, #ff8a63 46%, #ff3a1c 78%, #b81c0c 100%); box-shadow: 0 0 8px rgba(255,86,52,.7); }
  acidify-patch-view .program-legend em { font: 900 7px/1 'Arial Narrow',Arial,sans-serif; font-style: normal; letter-spacing: 1.2px; color: #3d4749; }
  acidify-patch-view .program-legend em:not(:last-child) { margin-right: 6px; }
  acidify-patch-view .selection-caption { color: #4f5a5b; font: 900 7.5px/1 'Arial Narrow',Arial,sans-serif; letter-spacing: 1.3px; white-space: nowrap; }
  acidify-patch-view .step-position { min-width: 70px; height: 15px; text-align: center; padding: 0 6px; display: inline-flex; align-items: center; justify-content: center; border-radius: 2px; border: 1px solid #0a0706;
    background: linear-gradient(180deg,#241512,#130b09); color: #ff6756; font: 9px/1 'Courier New',monospace; letter-spacing: 1px;
    box-shadow: inset 0 2px 4px rgba(0,0,0,.7); }

  /* ---------- Deck C: Silver Step-Wippen ---------- */
  acidify-patch-view .program-strip { border: 1px solid #6f7573; border-radius: 3px; overflow: hidden; padding: 0 8px 8px;
    display: flex; flex-direction: column;
    background-image: repeating-linear-gradient(93deg, rgba(255,255,255,.05) 0 1px, rgba(0,0,0,.022) 1px 2px, transparent 2px 5px),
      linear-gradient(180deg,#eef0ef 0%,#dcdedd 46%,#c5c8c7 100%);
    box-shadow: inset 0 1px 0 #fff; }
  acidify-patch-view .step-row { display: grid; grid-template-columns: repeat(4,1fr); column-gap: 15px; box-sizing: border-box;
    height: 108px; flex: 0 0 auto; align-items: start; margin-top: 8px;
    padding: 8px 9px; border-radius: 2px; border: 1px solid #6f7573; background: linear-gradient(180deg,#bcc0be,#a9adab);
    box-shadow: inset 0 3px 7px rgba(48,54,52,.45), inset 0 -1px 0 rgba(255,255,255,.55), 0 1px 0 rgba(255,255,255,.6); }
  acidify-patch-view .step-group { display: grid; grid-template-columns: repeat(4,1fr); column-gap: 5px; background: none; border: 0; box-shadow: none; padding: 0; }
  acidify-patch-view .sequence-step { position: relative; height: 90px; padding: 0; border: 0; background: transparent; cursor: pointer;
    border-radius: 0; box-shadow: none; width: auto; display: block; opacity: 1; }
  acidify-patch-view .sequence-step:active, acidify-patch-view .sequence-step.selected { transform: none; background: transparent; box-shadow: none; }
  acidify-patch-view .sequence-step.accented::before, acidify-patch-view .sequence-step.sliding::after { content: none; }
  acidify-patch-view .step-head { position: absolute; left: 0; right: 0; top: 0; height: 14px; display: flex; align-items: center; justify-content: space-between; padding: 0 1px; }
  acidify-patch-view .sequence-step .step-index { position: static; margin: 0; font: 700 9px/10px 'Courier New',monospace; color: #5c6668; background: none; border: 0; width: auto; height: auto; }
  acidify-patch-view .step-group .sequence-step:first-child .step-index { font: 900 10px/11px 'Courier New',monospace; color: #232c2e; }
  acidify-patch-view .sequence-step.beyond .step-index { color: #7b8482; }
  acidify-patch-view .sequence-step.playing .step-index { color: #b8241a; }
  acidify-patch-view .step-pills { display: flex; align-items: center; gap: 3px; }
  acidify-patch-view .step-pill { width: 17px; height: 13px; display: grid; place-items: center; border-radius: 2px; cursor: pointer; font: 900 8px/1 'Arial Narrow',Arial,sans-serif; font-style: normal;
    border: 1px solid #4f5759; color: #b6bebf; background: linear-gradient(180deg,#868e90,#6a7274); box-shadow: inset 0 1px 2px rgba(0,0,0,.42); }
  acidify-patch-view .sequence-step.accented .pill-a { color: #fff2ee; border-color: #5d1611; background: linear-gradient(180deg,#ff7361,#a3201a); box-shadow: 0 0 7px rgba(255,72,48,.65), inset 0 1px 0 rgba(255,255,255,.4); }
  acidify-patch-view .sequence-step.sliding .pill-s { color: #2a1a02; border-color: #5b3908; background: linear-gradient(180deg,#ffc776,#8d5410); box-shadow: 0 0 7px rgba(255,168,60,.6), inset 0 1px 0 rgba(255,255,255,.45); }
  acidify-patch-view .step-sel { position: absolute; left: -2px; right: -2px; top: 14px; bottom: 24px; border-radius: 3px; border: 1px solid transparent; }
  acidify-patch-view .sequence-step.selected .step-sel { border-color: #e9eeee; background: transparent;
    box-shadow: inset 0 0 0 1px rgba(46,54,52,.6), 0 0 0 1px rgba(255,255,255,.55), 0 1px 4px rgba(30,36,34,.3); }
  acidify-patch-view .sequence-step.multi-selected .step-sel { border-color: #e9eeee; }
  acidify-patch-view .step-well { position: absolute; left: 0; right: 0; top: 16px; height: 46px; border-radius: 2px;
    background: linear-gradient(180deg,#4e5659,#20272a); box-shadow: inset 0 2px 3px rgba(0,0,0,.65); }
  acidify-patch-view .step-cap { position: absolute; left: 0; right: 0; top: 16px; height: 44px; border-radius: 2px; border: 1px solid #5f676a;
    background: linear-gradient(180deg,#8e9698,#6f7779);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.95), inset -3px -5px 8px rgba(96,106,109,.25), inset 3px 4px 7px rgba(255,255,255,.3), 0 2px 3px rgba(0,0,0,.5); }
  acidify-patch-view .sequence-step.selected .step-cap { top: 18px;
    box-shadow: inset 0 3px 6px rgba(38,45,47,.5), 0 1px 0 rgba(255,255,255,.5); }
  acidify-patch-view .sequence-step.playing .step-cap { box-shadow: inset 0 1px 0 rgba(255,255,255,.95), inset -3px -5px 8px rgba(96,106,109,.22), 0 2px 3px rgba(0,0,0,.5), 0 0 14px rgba(255,70,45,.4); }
  acidify-patch-view .sequence-step.beyond .step-cap { border-color: #4e5658; }
  acidify-patch-view .cap-rocker { position: absolute; left: 1px; right: 1px; top: 1px; height: 34px; border-radius: 2px;
    background: linear-gradient(96deg,#fdfefe 0 18%,#dfe4e4 34%,#aeb6b8 52%,#eaeeee 68%,#c3cacb 86%,#8f9799 100%);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.95); }
  acidify-patch-view .step-group .sequence-step:nth-child(2) .cap-rocker { background: linear-gradient(100deg,#fdfefe 0 18%,#dfe4e4 34%,#aeb6b8 52%,#eaeeee 68%,#c3cacb 86%,#8f9799 100%); }
  acidify-patch-view .step-group .sequence-step:nth-child(3) .cap-rocker { background: linear-gradient(104deg,#fdfefe 0 18%,#dfe4e4 34%,#aeb6b8 52%,#eaeeee 68%,#c3cacb 86%,#8f9799 100%); }
  acidify-patch-view .step-group .sequence-step:nth-child(4) .cap-rocker { background: linear-gradient(108deg,#fdfefe 0 18%,#dfe4e4 34%,#aeb6b8 52%,#eaeeee 68%,#c3cacb 86%,#8f9799 100%); }
  acidify-patch-view .step-group .sequence-step.selected .cap-rocker { background: linear-gradient(96deg,#c6cccd 0 18%,#aeb5b7 34%,#8a9295 52%,#bcc3c4 68%,#99a1a3 86%,#727b7d 100%); }
  acidify-patch-view .step-group .sequence-step.selected:nth-child(2) .cap-rocker { background: linear-gradient(100deg,#c6cccd 0 18%,#aeb5b7 34%,#8a9295 52%,#bcc3c4 68%,#99a1a3 86%,#727b7d 100%); }
  acidify-patch-view .step-group .sequence-step.selected:nth-child(3) .cap-rocker { background: linear-gradient(104deg,#c6cccd 0 18%,#aeb5b7 34%,#8a9295 52%,#bcc3c4 68%,#99a1a3 86%,#727b7d 100%); }
  acidify-patch-view .step-group .sequence-step.selected:nth-child(4) .cap-rocker { background: linear-gradient(108deg,#c6cccd 0 18%,#aeb5b7 34%,#8a9295 52%,#bcc3c4 68%,#99a1a3 86%,#727b7d 100%); }
  acidify-patch-view .cap-nub { position: absolute; left: 26%; right: 26%; top: 11px; height: 12px; border-radius: 6px;
    background: linear-gradient(180deg,#79817f,#aab1b0); box-shadow: inset 0 2px 3px rgba(30,36,35,.7), 0 1px 0 rgba(255,255,255,.9); }
  acidify-patch-view .cap-led { position: absolute; inset: 2px; border-radius: 4px;
    background: radial-gradient(ellipse at 50% 30%, #7a3228 0 18%, #52201a 58%, #2e1310 100%); box-shadow: inset 0 1px 2px rgba(0,0,0,.62); }
  acidify-patch-view .sequence-step.rest { opacity: 1; }
  acidify-patch-view .sequence-step.rest .cap-led { background: linear-gradient(180deg,#3b3f3e,#565c5b); box-shadow: inset 0 1px 2px rgba(0,0,0,.6); }
  acidify-patch-view .sequence-step.selected:not(.rest) .cap-led {
    background: radial-gradient(ellipse at 50% 28%, #ffb59f 0 20%, #e8492c 58%, #7d1a0d 100%); box-shadow: 0 0 7px rgba(255,80,45,.55), inset 0 1px 0 rgba(255,255,255,.4); }
  acidify-patch-view .sequence-step.playing .cap-led {
    background: radial-gradient(ellipse at 50% 28%, #fff4ec 0 22%, #ff8a63 46%, #ff3a1c 78%, #b81c0c 100%);
    box-shadow: 0 0 12px rgba(255,86,52,.95), 0 0 22px rgba(255,86,52,.5), inset 0 1px 0 rgba(255,255,255,.75); }
  acidify-patch-view .cap-foot { position: absolute; left: 1px; right: 1px; bottom: 0; height: 6px; border-radius: 0 0 2px 2px; background: linear-gradient(180deg,#7d8587,#5d6567); }
  acidify-patch-view .step-playbar { position: absolute; left: 4px; right: 4px; top: 63px; height: 3px; border-radius: 1px;
    background: rgba(70,78,76,.22); box-shadow: inset 0 1px 0 rgba(255,255,255,.4); }
  acidify-patch-view .sequence-step.playing .step-playbar { background: linear-gradient(90deg, rgba(255,74,51,0), #ff4a33 25% 75%, rgba(255,74,51,0)); box-shadow: 0 0 8px rgba(255,74,51,.75); }
  acidify-patch-view .step-note-field { position: absolute; left: 0; right: 0; bottom: 0; height: 24px; display: grid; place-items: center; border-radius: 2px;
    border: 1px solid #0d0807; background: linear-gradient(180deg,#2b1a17,#150c0a); box-shadow: inset 0 2px 4px rgba(0,0,0,.8), 0 1px 0 rgba(255,255,255,.6); }
  acidify-patch-view .sequence-step.playing .step-note-field { background: linear-gradient(180deg,#3d1713,#1d0d0b); }
  acidify-patch-view .sequence-step .step-note { position: static; font: 900 14px/15px 'Courier New',monospace; letter-spacing: .6px; color: #ff6756; text-shadow: 0 0 6px rgba(255,57,37,.5); background: none; width: auto; }
  acidify-patch-view .sequence-step.rest .step-note { color: #8d4c42; text-shadow: none; }
  acidify-patch-view .sequence-step.playing .step-note { color: #ff9a88; text-shadow: 0 0 9px rgba(255,80,55,.85); }

  /* ---------- Deck C: Editor, Keyboard, Funktionsmatrix ---------- */
  acidify-patch-view .keyboard { display: flex; flex-direction: column; }
  acidify-patch-view .keyboard-head { display: flex; gap: 6px; align-items: center; height: 13px; flex: 0 0 auto; }
  acidify-patch-view .keyboard-title { width: 88px; height: 13px; display: grid; place-items: center; border-bottom: 1px solid rgba(45,50,49,.4);
    color: #26302f; text-shadow: 0 1px 0 rgba(255,255,255,.8); font: 900 7.5px/1 'Arial Narrow',Arial,sans-serif; letter-spacing: 1.3px; }
  acidify-patch-view .keyboard-hint { flex: 1; text-align: right; color: #4f5a5b; font: 900 7px/1 'Arial Narrow',Arial,sans-serif; letter-spacing: 1.1px; }
  acidify-patch-view .keyboard-keys { flex: 1; min-height: 0; height: auto; margin-top: 6px; }
  acidify-patch-view .pitch-key { border-radius: 0 0 2px 2px; border: 1px solid #5f6a6c; font: 900 7px/1 'Arial Narrow',Arial,sans-serif; color: #2a3234;
    background: linear-gradient(180deg,#f4f6f6 0%,#dfe3e4 56%,#b7bfc1 86%,#95a0a2 100%);
    box-shadow: 0 3px 2px rgba(0,0,0,.45), inset 0 1px 0 #fff; }
  acidify-patch-view .pitch-key.black-key { height: 62%; border-color: #050607; color: #c9d0d1;
    background: linear-gradient(180deg,#3b423f,#0a0c0b);
    box-shadow: 0 3px 3px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.12); }
  acidify-patch-view .pitch-key.active, acidify-patch-view .pitch-key.midi { transform: none; color: #2a3234;
    box-shadow: 0 3px 2px rgba(0,0,0,.45), inset 0 1px 0 #fff; }
  acidify-patch-view .pitch-key.black-key.active { color: #c9d0d1; background: linear-gradient(180deg,#5a3a34,#20100d);
    box-shadow: 0 3px 3px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.12); }
  acidify-patch-view .pitch-key span { position: absolute; left: 0; right: 0; bottom: 4px; text-align: center; font: 900 7px/1 'Arial Narrow',Arial,sans-serif; }
  acidify-patch-view .pitch-key::after { content: ""; position: absolute; left: 50%; top: 4px; margin-left: -4.5px; width: 9px; height: 9px; border-radius: 50%;
    background: radial-gradient(circle at 35% 28%, rgba(255,255,255,.14) 0 12%, #46201c 55%, #24100e 100%); box-shadow: inset 0 -1px 1px rgba(0,0,0,.7); }
  acidify-patch-view .pitch-key.black-key::after { top: 4px; width: 9px; height: 9px; }
  acidify-patch-view .pitch-key.active::after {
    background: radial-gradient(circle at 35% 28%, #ffe3d4 0 14%, #ff5540 46%, #8e120b 100%); box-shadow: 0 0 7px rgba(255,72,48,.8); }
  acidify-patch-view .pitch-key.active { background: linear-gradient(180deg,#f6dad3,#c9a29a 70%,#a67c74); }

  acidify-patch-view .editor.classic-editor { display: flex; gap: 8px; flex: 1; min-height: 0; height: auto; margin-top: 8px; border-top: 0; padding-top: 0; box-shadow: none; }
  acidify-patch-view .edit-status { box-sizing: border-box; width: 196px; height: auto; min-width: 0; justify-content: flex-start; padding: 6px 8px 8px; display: flex; flex-direction: column; border-radius: 2px;
    border: 1px solid #7c827f; background: linear-gradient(180deg,#bcc0be,#a9adab);
    box-shadow: inset 0 3px 7px rgba(48,54,52,.45), inset 0 -1px 0 rgba(255,255,255,.55), 0 1px 0 rgba(255,255,255,.6); }
  acidify-patch-view .edit-caption { width: 100%; height: 13px; flex: 0 0 auto; display: grid; place-items: center; border-bottom: 1px solid rgba(45,50,49,.4);
    color: #26302f; text-shadow: 0 1px 0 rgba(255,255,255,.8); font: 900 7.5px/1 'Arial Narrow',Arial,sans-serif; letter-spacing: 1.3px; }
  acidify-patch-view .edit-readout { margin-top: 8px; flex: 1; min-height: 22px; display: grid; place-items: center; border-radius: 2px; border: 1px solid #0a0706;
    background: repeating-linear-gradient(90deg, transparent 0 3px, rgba(0,0,0,.09) 3px 4px), linear-gradient(180deg,#251614,#130b09);
    box-shadow: inset 0 3px 6px rgba(0,0,0,.78); color: #ff513b; font: 24px/1 'Courier New',monospace; letter-spacing: 2px; white-space: nowrap;
    text-shadow: 0 0 5px #e32418, 0 0 10px rgba(227,36,24,.4); }
  acidify-patch-view .octave-indicator { margin-top: 7px; color: #4b5558; font: 900 8px/11px 'Courier New',monospace; letter-spacing: .4px; }
  acidify-patch-view .keyboard { box-sizing: border-box; flex: 1; height: auto; padding: 6px 8px 8px; border-radius: 2px; border: 1px solid #7c827f;
    background: linear-gradient(180deg,#bcc0be,#a9adab); box-shadow: inset 0 3px 7px rgba(48,54,52,.45), inset 0 -1px 0 rgba(255,255,255,.55), 0 1px 0 rgba(255,255,255,.6); }
  acidify-patch-view .time-controls { box-sizing: border-box; width: 300px; height: auto; padding: 6px 8px 8px; display: grid;
    grid-template-columns: repeat(3,1fr); grid-template-rows: repeat(2,1fr); gap: 6px; border-radius: 2px; border: 1px solid #7c827f;
    background: linear-gradient(180deg,#bcc0be,#a9adab); box-shadow: inset 0 3px 7px rgba(48,54,52,.45), inset 0 -1px 0 rgba(255,255,255,.55), 0 1px 0 rgba(255,255,255,.6); }
  acidify-patch-view .function-button { position: relative; height: auto; min-height: 36px; display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 2px; border-radius: 2px; cursor: pointer; border: 1px solid #1a1e1f; color: #1d2426;
    background: linear-gradient(102deg,#fdfefe 0 18%,#dfe4e4 34%,#aeb6b8 52%,#eaeeee 68%,#c3cacb 86%,#8f9799 100%);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.95), inset 0 -2px 3px rgba(52,60,62,.3), 0 3px 3px rgba(0,0,0,.45); }
  acidify-patch-view .function-button:active, acidify-patch-view .function-button.active { transform: none; border-color: #1a1e1f;
    background: linear-gradient(102deg,#c6cccd 0 18%,#aeb5b7 34%,#8a9295 52%,#bcc3c4 68%,#99a1a3 86%,#727b7d 100%);
    box-shadow: inset 0 2px 5px rgba(30,36,38,.55), 0 1px 1px rgba(0,0,0,.5); }
  acidify-patch-view .function-button::before { content: ""; position: absolute; left: 5px; top: 5px; width: 5px; height: 5px; border-radius: 50%;
    background: radial-gradient(circle at 35% 28%, rgba(255,255,255,.14) 0 12%, #46201c 55%, #24100e 100%); box-shadow: inset 0 -1px 1px rgba(0,0,0,.7); }
  acidify-patch-view .function-button.active::before { background: radial-gradient(circle at 35% 28%, #ffe3d4 0 14%, #ff5540 46%, #8e120b 100%); box-shadow: 0 0 7px rgba(255,72,48,.9), inset 0 0 2px rgba(255,255,255,.6); }
  acidify-patch-view .function-button strong { color: #1d2426; font: 900 9px/1 'Arial Narrow',Arial,sans-serif; letter-spacing: 1.1px; text-shadow: 0 1px 0 rgba(255,255,255,.6); }
  acidify-patch-view .function-button.active strong { color: #8c1a12; }
  acidify-patch-view .function-button small { margin-top: 0; color: #5b6466; font: 900 6.5px/1 'Arial Narrow',Arial,sans-serif; letter-spacing: .6px; }
  acidify-patch-view .function-button.active small { color: #5b6466; }

  /* ---------- Arp-Editor (dritter Modus) ---------- */
  acidify-patch-view .arp-editor { display: none; }
  acidify-patch-view.arp-mode .classic-editor { display: none; }
  acidify-patch-view.arp-mode .arp-editor { display: flex; gap: 8px; flex: 1; min-height: 0; margin-top: 8px; }
  acidify-patch-view .arp-readout { margin-top: 8px; flex: 1; min-height: 22px; display: grid; place-items: center; border-radius: 2px; border: 1px solid #0a0706;
    background: repeating-linear-gradient(90deg, transparent 0 3px, rgba(0,0,0,.09) 3px 4px), linear-gradient(180deg,#251614,#130b09);
    box-shadow: inset 0 3px 6px rgba(0,0,0,.78); color: #ff513b; font: 24px/1 'Courier New',monospace; letter-spacing: 2px; white-space: nowrap;
    text-shadow: 0 0 5px #e32418, 0 0 10px rgba(227,36,24,.4); }
  acidify-patch-view .arp-status .octave-indicator { white-space: nowrap; overflow: hidden; }
  acidify-patch-view .arp-capture { margin-top: 5px; height: 26px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px;
    border-radius: 2px; cursor: pointer; border: 1px solid #1a1e1f; transform: none; text-shadow: none; width: 100%; padding: 0;
    background: linear-gradient(102deg,#fdfefe 0 18%,#dfe4e4 34%,#aeb6b8 52%,#eaeeee 68%,#c3cacb 86%,#8f9799 100%);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.95), inset 0 -2px 3px rgba(52,60,62,.3), 0 2px 2px rgba(0,0,0,.4); }
  acidify-patch-view .arp-capture strong { margin: 0; color: #1d2426; font: 900 8px/1 'Arial Narrow',Arial,sans-serif; letter-spacing: 1px; text-shadow: 0 1px 0 rgba(255,255,255,.6); }
  acidify-patch-view .arp-capture small { margin: 0; color: #5b6466; font: 900 5px/1 'Arial Narrow',Arial,sans-serif; letter-spacing: .5px; }
  acidify-patch-view .arp-capture:active { background: linear-gradient(102deg,#c6cccd 0 18%,#aeb5b7 34%,#8a9295 52%,#bcc3c4 68%,#99a1a3 86%,#727b7d 100%);
    box-shadow: inset 0 2px 5px rgba(30,36,38,.55), 0 1px 1px rgba(0,0,0,.5); }
  acidify-patch-view .arp-direction-cell { box-sizing: border-box; flex: 1; min-width: 0; display: flex; flex-direction: column; padding: 6px 8px 8px; border-radius: 2px;
    border: 1px solid #7c827f; background: linear-gradient(180deg,#bcc0be,#a9adab);
    box-shadow: inset 0 3px 7px rgba(48,54,52,.45), inset 0 -1px 0 rgba(255,255,255,.55), 0 1px 0 rgba(255,255,255,.6); }
  acidify-patch-view .arp-direction { flex: 1; min-height: 0; margin-top: 8px; display: grid; grid-template-columns: repeat(8,1fr); grid-auto-rows: 1fr; gap: 4px;
    padding: 0; background: none; border: 0; box-shadow: none; width: auto; height: auto; }
  acidify-patch-view .arp-direction button { position: relative; height: auto; min-height: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 2px; border-radius: 2px; cursor: pointer; border: 1px solid #1a1e1f; color: #1d2426; transform: none; text-shadow: none;
    background: linear-gradient(102deg,#fdfefe 0 18%,#dfe4e4 34%,#aeb6b8 52%,#eaeeee 68%,#c3cacb 86%,#8f9799 100%);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.95), inset 0 -2px 3px rgba(52,60,62,.3), 0 3px 3px rgba(0,0,0,.45); }
  acidify-patch-view .arp-direction button::before { content: ""; position: absolute; left: 3px; top: 3px; width: 4px; height: 4px; border-radius: 50%;
    background: radial-gradient(circle at 35% 28%, rgba(255,255,255,.14) 0 12%, #46201c 55%, #24100e 100%); box-shadow: inset 0 -1px 1px rgba(0,0,0,.7); }
  acidify-patch-view .arp-direction button.active { transform: none; border-color: #1a1e1f;
    background: linear-gradient(102deg,#c6cccd 0 18%,#aeb5b7 34%,#8a9295 52%,#bcc3c4 68%,#99a1a3 86%,#727b7d 100%);
    box-shadow: inset 0 2px 5px rgba(30,36,38,.55), 0 1px 1px rgba(0,0,0,.5); }
  acidify-patch-view .arp-direction button.active::before { background: radial-gradient(circle at 35% 28%, #ffe3d4 0 14%, #ff5540 46%, #8e120b 100%);
    box-shadow: 0 0 7px rgba(255,72,48,.9), inset 0 0 2px rgba(255,255,255,.6); }
  acidify-patch-view .arp-direction button strong { margin: 0; color: #1d2426; font: 900 7.5px/1 'Arial Narrow',Arial,sans-serif; letter-spacing: .7px; text-shadow: 0 1px 0 rgba(255,255,255,.6); }
  acidify-patch-view .arp-direction button.active strong { color: #8c1a12; }
  acidify-patch-view .arp-direction button small { margin: 0; color: #5b6466; font: 900 5px/1 'Arial Narrow',Arial,sans-serif; letter-spacing: .4px; }
  acidify-patch-view .arp-tools-cell { box-sizing: border-box; width: 300px; flex: 0 0 auto; display: flex; flex-direction: column; gap: 4px; padding: 6px 8px 8px; border-radius: 2px;
    border: 1px solid #7c827f; background: linear-gradient(180deg,#bcc0be,#a9adab);
    box-shadow: inset 0 3px 7px rgba(48,54,52,.45), inset 0 -1px 0 rgba(255,255,255,.55), 0 1px 0 rgba(255,255,255,.6); }
  acidify-patch-view .arp-tools-row { display: flex; gap: 8px; flex: 0 0 auto; }
  acidify-patch-view .arp-tool-block { flex: 1; min-width: 0; display: flex; flex-direction: column; align-items: center; }
  acidify-patch-view .arp-tool-block .edit-caption { flex: 0 0 auto; }
  acidify-patch-view .arp-tool-block .silver-stepper { margin-top: 4px; width: auto; height: 24px; padding: 0; background: none; border: 0; box-shadow: none;
    display: flex; flex-direction: row; align-items: center; gap: 6px; }
  acidify-patch-view .arp-tool-block .silver-stepper .led-box { margin-top: 0; width: 40px; }
  acidify-patch-view .arp-tool-block .silver-stepper .stepper-buttons,
  acidify-patch-view .arp-phrase .stepper-buttons { margin-top: 0; }
  acidify-patch-view .arp-phrase-row { position: relative; flex: 1; min-height: 0; display: flex; flex-direction: column; align-items: center; }
  acidify-patch-view .arp-phrase-row.phrase-idle { opacity: .45; }
  acidify-patch-view .arp-phrase { margin-top: 3px; width: 100%; height: 24px; padding: 0; background: none; border: 0; box-shadow: none;
    display: flex; flex-direction: row; align-items: center; justify-content: center; gap: 6px; }
  acidify-patch-view .arp-phrase .led-box { margin-top: 0; width: 150px; height: 24px; cursor: pointer; }
  acidify-patch-view .phrase-menu { position: absolute; z-index: 72; left: 0; right: 0; bottom: 30px; max-height: 170px; overflow: auto; padding: 3px;
    border-radius: 3px; border: 1px solid #0a0b09; background: linear-gradient(#252824,#15170f);
    box-shadow: 0 12px 22px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.08); }
  acidify-patch-view .phrase-menu button { width: 100%; height: 15px; padding: 0 6px; display: flex; align-items: center; justify-content: space-between;
    cursor: pointer; border: 0; border-radius: 2px; background: transparent; color: #c2c8c4; font: 900 6.5px/1 'Arial Narrow',Arial,sans-serif; letter-spacing: .8px;
    transform: none; box-shadow: none; text-shadow: none; }
  acidify-patch-view .phrase-menu button:hover { background: #3a3f39; }
  acidify-patch-view .phrase-menu button.active { background: #8f1d16; color: #ffe3de; }
  acidify-patch-view .phrase-menu button small { color: #7d8681; font: 900 5.5px/1 'Arial Narrow',Arial,sans-serif; letter-spacing: .5px; }
  acidify-patch-view .phrase-menu button.active small { color: #f0b0a6; }
  acidify-patch-view.phrase-active .step-row { opacity: .45; }
  acidify-patch-view.arp-mode .sequence-step .step-note { color: #ffb86c; text-shadow: 0 0 6px rgba(255,150,40,.5); }
  acidify-patch-view.arp-mode .sequence-step:not(.arp-live) .step-note { color: #7a4a2a; text-shadow: none; }
  acidify-patch-view .arp-hold { margin-top: 4px; width: auto; height: auto; padding: 0; background: none; border: 0; box-shadow: none; perspective: none; transform: none; }
  acidify-patch-view .arp-hold button, acidify-patch-view .arp-hold.is-on button { width: 92px; height: 30px; margin: 0; position: static; display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 3px; cursor: pointer; border-radius: 2px; border: 1px solid #1a1e1f; transform: none; text-shadow: none;
    background: linear-gradient(102deg,#fdfefe 0 18%,#dfe4e4 34%,#aeb6b8 52%,#eaeeee 68%,#c3cacb 86%,#8f9799 100%);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.95), inset 0 -2px 3px rgba(52,60,62,.3), 0 3px 3px rgba(0,0,0,.45); }
  acidify-patch-view .arp-hold.is-on button { border-color: #8c2c23;
    background: linear-gradient(102deg,#c6cccd 0 18%,#aeb5b7 34%,#8a9295 52%,#bcc3c4 68%,#99a1a3 86%,#727b7d 100%);
    box-shadow: inset 0 2px 5px rgba(30,36,38,.55), 0 0 12px rgba(181,41,33,.3); }
  acidify-patch-view .arp-hold-label { color: #1d2426; font: 900 10px/1 'Arial Narrow',Arial,sans-serif; letter-spacing: 1.4px; text-shadow: 0 1px 0 rgba(255,255,255,.6); }
  acidify-patch-view .arp-hold.is-on .arp-hold-label { color: #8c1a12; }
  acidify-patch-view .arp-hold button small { margin: 0; color: #5b6466; font: 900 6.5px/7px 'Arial Narrow',Arial,sans-serif; letter-spacing: .7px; }


  /* ---------- Distortion-Overlay (Template-Layout) ---------- */
  acidify-patch-view .distortion-scrim { position: absolute; z-index: 90; inset: 0; border-radius: 7px; background: rgba(28,32,31,.34); }
  acidify-patch-view .distortion-overlay { position: absolute; right: 8px; top: 8px; width: 588px; height: 180px; box-sizing: border-box;
    border-radius: 3px; overflow: hidden; border: 1px solid #6f7573; color: #15191a; transform: none; animation: none;
    background-image: repeating-linear-gradient(93deg, rgba(255,255,255,.05) 0 1px, rgba(0,0,0,.022) 1px 2px, transparent 2px 5px),
      linear-gradient(180deg,#f0f2f1 0%,#dfe1e0 44%,#c7cac9 100%);
    background-blend-mode: normal; background-size: auto;
    box-shadow: 0 22px 40px rgba(0,0,0,.5), inset 0 1px 0 #fff; }
  acidify-patch-view .distortion-overlay-head { height: 26px; box-sizing: border-box; padding: 0 12px; display: flex; align-items: center; justify-content: space-between;
    border-bottom: 1px solid rgba(45,50,49,.45); box-shadow: 0 1px 0 rgba(255,255,255,.6); background: none; }
  acidify-patch-view .distortion-overlay-head > div { display: flex; align-items: baseline; gap: 10px; }
  acidify-patch-view .distortion-overlay-head strong { color: #a51d17; font: 900 11px/1 'Arial Narrow',Arial,sans-serif; letter-spacing: 2.2px; white-space: nowrap; text-shadow: 0 1px 0 rgba(255,255,255,.7); }
  acidify-patch-view .distortion-status { color: #5d6768; font: 900 7.5px/1 'Arial Narrow',Arial,sans-serif; letter-spacing: 1.4px; white-space: nowrap; background: none; border: 0; padding: 0; }
  acidify-patch-view .distortion-close { width: 26px; height: 18px; display: grid; place-items: center; cursor: pointer; border-radius: 2px; border: 1px solid #1a1e1f;
    color: #1d2426; font: 900 13px/1 Arial,sans-serif;
    background: linear-gradient(102deg,#fdfefe 0 18%,#dfe4e4 34%,#aeb6b8 52%,#eaeeee 68%,#c3cacb 86%,#8f9799 100%);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.9), 0 2px 2px rgba(0,0,0,.4); }
  acidify-patch-view .distortion-overlay-body { height: 130px; box-sizing: border-box; padding: 9px 12px; display: grid;
    grid-template-columns: 104px 226px 1fr 1fr; gap: 12px; }
  acidify-patch-view .distortion-power-cell { display: flex; flex-direction: column; align-items: center; padding: 0;
    border-right: 1px solid rgba(45,50,49,.4); box-shadow: 1px 0 0 rgba(255,255,255,.6); background: none; border-radius: 0; border-top: 0; border-left: 0; border-bottom: 0; }
  acidify-patch-view .distortion-cell-label { width: 88px; display: grid; place-items: center; border-bottom: 1px solid rgba(45,50,49,.45);
    color: #26302f; font: 900 8px/14px 'Arial Narrow',Arial,sans-serif; letter-spacing: 1.7px; text-shadow: 0 1px 0 rgba(255,255,255,.85); height: auto; background: none; margin: 0; padding: 0; }
  acidify-patch-view .distortion-power-led { margin-top: 10px; width: 13px; height: 13px; border-radius: 50%; border: 1px solid #4f1a15;
    background: #48140f; box-shadow: 0 1px 0 rgba(255,255,255,.62), inset 0 -2px 3px #170403; }
  acidify-patch-view .distortion-power-led.lit { background: #ff503d; box-shadow: 0 0 6px rgba(255,50,32,.9), inset 0 0 1px #fff; }
  acidify-patch-view .distortion-power.run-switch { margin: 9px 0 0; background: none; border: 0; box-shadow: none; padding: 0; width: 80px; height: 58px; position: static; display: block; transform: none; perspective: none; }
  acidify-patch-view .distortion-power.run-switch button, acidify-patch-view .distortion-power.run-switch.is-on button { width: 80px; height: 58px; margin: 0; position: static; left: auto; top: auto; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px;
    cursor: pointer; border-radius: 2px; border: 1px solid #1a1e1f; transform: none; text-shadow: none;
    background: linear-gradient(102deg,#fdfefe 0 18%,#dfe4e4 34%,#aeb6b8 52%,#eaeeee 68%,#c3cacb 86%,#8f9799 100%);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.95), inset 0 -2px 3px rgba(52,60,62,.3), 0 3px 3px rgba(0,0,0,.45); }
  acidify-patch-view .distortion-power.run-switch.is-on button { border-color: #8c2c23;
    background: linear-gradient(102deg,#c6cccd 0 18%,#aeb5b7 34%,#8a9295 52%,#bcc3c4 68%,#99a1a3 86%,#727b7d 100%);
    box-shadow: inset 0 2px 5px rgba(30,36,38,.55), 0 0 12px rgba(181,41,33,.3); }
  acidify-patch-view .distortion-power-label { color: #1d2426; font: 900 10px/1 'Arial Narrow',Arial,sans-serif; letter-spacing: 1.4px; text-shadow: 0 1px 0 rgba(255,255,255,.6); }
  acidify-patch-view .distortion-power.is-on .distortion-power-label { color: #8c1a12; }
  acidify-patch-view .distortion-power button small { margin: 0; color: #5b6466; font: 900 6.5px/7px 'Arial Narrow',Arial,sans-serif; letter-spacing: .7px; }
  acidify-patch-view .distortion-type-cell { display: flex; flex-direction: column; align-items: center; padding: 0;
    border-right: 1px solid rgba(45,50,49,.4); box-shadow: 1px 0 0 rgba(255,255,255,.6); background: none; border-radius: 0; border-top: 0; border-left: 0; border-bottom: 0; }
  acidify-patch-view .distortion-type-cell .distortion-cell-label { width: 150px; }
  acidify-patch-view .distortion-types { margin-top: 10px; display: grid; grid-template-columns: repeat(3,1fr); gap: 6px; width: 206px;
    background: none; border: 0; box-shadow: none; padding: 0; height: auto; }
  acidify-patch-view .distortion-types button { position: relative; height: 80px; width: auto; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px;
    cursor: pointer; border-radius: 2px; border: 1px solid #1a1e1f; color: #1d2426; transform: none; text-shadow: none; font: 900 9px/1 'Arial Narrow',Arial,sans-serif; letter-spacing: 1.1px;
    background: linear-gradient(102deg,#fdfefe 0 18%,#dfe4e4 34%,#aeb6b8 52%,#eaeeee 68%,#c3cacb 86%,#8f9799 100%);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.95), inset 0 -2px 3px rgba(52,60,62,.3), 0 3px 3px rgba(0,0,0,.45); }
  acidify-patch-view .distortion-types button::before { content: ""; position: absolute; left: 50%; top: 6px; margin-left: -3px; width: 6px; height: 6px; border-radius: 50%;
    background: radial-gradient(circle at 35% 28%, rgba(255,255,255,.14) 0 12%, #46201c 55%, #24100e 100%); box-shadow: inset 0 -1px 1px rgba(0,0,0,.7); }
  acidify-patch-view .distortion-types button.active { transform: none; border-color: #8c2c23; color: #8c1a12;
    background: linear-gradient(102deg,#c6cccd 0 18%,#aeb5b7 34%,#8a9295 52%,#bcc3c4 68%,#99a1a3 86%,#727b7d 100%);
    box-shadow: inset 0 2px 5px rgba(30,36,38,.55), 0 0 12px rgba(181,41,33,.3); }
  acidify-patch-view .distortion-types button.active::before {
    background: radial-gradient(circle at 35% 28%, #ffe3d4 0 14%, #ff5540 46%, #8e120b 100%); box-shadow: 0 0 7px rgba(255,72,48,.9), inset 0 0 2px rgba(255,255,255,.6); }
  acidify-patch-view .distortion-types button strong { margin-top: 8px; font: inherit; color: inherit; text-shadow: 0 1px 0 rgba(255,255,255,.6); }
  acidify-patch-view .distortion-types button small { color: #5b6466; font: 900 6.5px/1 'Arial Narrow',Arial,sans-serif; letter-spacing: .7px; }
  acidify-patch-view .distortion-types button.active small { color: #5b6466; }
  acidify-patch-view .distortion-knob-cell { display: flex; flex-direction: column; align-items: center; padding: 0; background: none; border: 0; box-shadow: none; }
  acidify-patch-view .distortion-knob-cell .silver-knob { margin-top: 0; padding-top: 0; }
  acidify-patch-view .distortion-type-cell + .distortion-knob-cell .silver-knob { margin-left: 6px; }
  acidify-patch-view .distortion-knob-cell + .distortion-knob-cell .silver-knob { margin-right: 6px; }
  acidify-patch-view .distortion-knob-cell .silver-knob .control-label { width: 74px; display: grid; place-items: center; border-bottom: 1px solid rgba(45,50,49,.45);
    color: #26302f; font: 900 8px/14px 'Arial Narrow',Arial,sans-serif; letter-spacing: 1.7px; text-shadow: 0 1px 0 rgba(255,255,255,.85); }
  acidify-patch-view .distortion-knob-cell .silver-knob .chrome-wrap { width: 60px; height: 60px; margin-top: 9px; }
  acidify-patch-view .distortion-knob-cell .silver-knob .tick-ring { display: none; }
  acidify-patch-view .distortion-knob-cell .silver-knob .dial-cap, acidify-patch-view .distortion-knob-cell .silver-knob .pointer-wrap { inset: 9px; }
  acidify-patch-view .distortion-knob-cell .silver-knob .dial-pointer { top: 5px; width: 3px; height: 14px; margin-left: -1.5px; }
  acidify-patch-view .distortion-knob-cell .led-box { margin-top: 8px; width: 60px; height: 21px; }
  acidify-patch-view .distortion-knob-cell .led-box .value-label { font: 11px/1 'Courier New',monospace; }
  acidify-patch-view .distortion-overlay footer { height: 22px; box-sizing: border-box; padding: 0 12px; display: flex; align-items: center; justify-content: flex-end;
    border-top: 1px solid rgba(45,50,49,.35); color: #5d6768; font: 900 7px/1 'Arial Narrow',Arial,sans-serif; letter-spacing: 1.2px; background: none; }

  /* ---------- Mods-Overlay: 3x2-Zellenraster (Template-Layout) ---------- */
  acidify-patch-view .mods-scrim { position: absolute; z-index: 92; inset: 0; border-radius: 7px; background: rgba(28,32,31,.4); }
  acidify-patch-view .mods-overlay { position: absolute; right: 8px; top: 8px; width: 788px; height: 300px; box-sizing: border-box;
    border-radius: 3px; overflow: hidden; border: 1px solid #6f7573; color: #15191a; transform: none; animation: none;
    background-image: repeating-linear-gradient(93deg, rgba(255,255,255,.05) 0 1px, rgba(0,0,0,.022) 1px 2px, transparent 2px 5px),
      linear-gradient(180deg,#f0f2f1 0%,#dfe1e0 44%,#c7cac9 100%);
    background-blend-mode: normal; background-size: auto;
    box-shadow: 0 22px 40px rgba(0,0,0,.5), inset 0 1px 0 #fff; }
  acidify-patch-view .mods-overlay-head { height: 26px; box-sizing: border-box; padding: 0 12px; display: flex; align-items: center; justify-content: space-between;
    border-bottom: 1px solid rgba(45,50,49,.45); box-shadow: 0 1px 0 rgba(255,255,255,.7); background: none; }
  acidify-patch-view .mods-overlay-head > div { display: flex; align-items: baseline; gap: 10px; }
  acidify-patch-view .mods-overlay-head strong { color: #a51d17; font: 900 11px/1 'Arial Narrow',Arial,sans-serif; letter-spacing: 2.2px; white-space: nowrap; text-shadow: 0 1px 0 rgba(255,255,255,.7); }
  acidify-patch-view .mods-status { color: #5d6768; font: 900 8px/1 'Arial Narrow',Arial,sans-serif; letter-spacing: 1.4px; white-space: nowrap; background: none; border: 0; padding: 0; }
  acidify-patch-view .mods-status.modified { color: #8e1f16; }
  acidify-patch-view .mods-close { width: 26px; height: 18px; display: grid; place-items: center; cursor: pointer; border-radius: 2px; border: 1px solid #1a1e1f;
    color: #1d2426; font: 900 9px/1 'Arial Narrow',Arial,sans-serif;
    background: linear-gradient(102deg,#fdfefe 0 18%,#dfe4e4 34%,#aeb6b8 52%,#eaeeee 68%,#c3cacb 86%,#8f9799 100%);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.9), 0 2px 2px rgba(0,0,0,.4); }
  acidify-patch-view .mods-overlay-body { height: 252px; box-sizing: border-box; padding: 12px; display: grid;
    grid-template-columns: repeat(3,1fr); grid-template-rows: repeat(2,1fr); gap: 8px; }
  acidify-patch-view .mod-row.mod-cell { box-sizing: border-box; padding: 7px 8px; display: flex; flex-direction: column; border-radius: 2px;
    grid-template-columns: none; align-items: stretch; gap: 0;
    border: 1px solid rgba(45,50,49,.42);
    background: linear-gradient(180deg, rgba(228,231,229,.42), rgba(190,196,193,.4));
    box-shadow: inset 0 1px 0 rgba(255,255,255,.8), inset 0 -2px 6px rgba(70,78,76,.16), 0 1px 0 rgba(255,255,255,.5); }
  acidify-patch-view .mod-row.mod-cell.on { border-color: #7d5750;
    background: linear-gradient(180deg, rgba(232,214,210,.5), rgba(198,182,178,.42));
    box-shadow: inset 0 1px 0 rgba(255,255,255,.85), inset 0 -2px 6px rgba(120,58,48,.24), 0 1px 0 rgba(255,255,255,.5); }
  acidify-patch-view .mod-cell-head { height: 14px; display: flex; align-items: center; justify-content: space-between; }
  acidify-patch-view .mod-cell-head strong { color: #26302f; font: 900 9.5px/1 'Arial Narrow',Arial,sans-serif; letter-spacing: 1.6px; white-space: nowrap; text-shadow: 0 1px 0 rgba(255,255,255,.85); }
  acidify-patch-view .mod-cell.on .mod-cell-head strong { color: #8e1f16; }
  acidify-patch-view .mod-cell-led { width: 11px; height: 11px; border-radius: 50%; border: 1px solid #4f1a15;
    background: linear-gradient(180deg,#6c6360,#3e3836); box-shadow: inset 0 1px 1px rgba(255,255,255,.3); }
  acidify-patch-view .mod-cell.on .mod-cell-led {
    background: radial-gradient(circle at 38% 32%, #ffd9d1 0 14%, #ff5335 34%, #b81b0d 74%, #6d0f06 100%);
    box-shadow: 0 0 7px rgba(255,64,38,.85), inset 0 1px 1px rgba(255,255,255,.55); }
  acidify-patch-view .mod-cell-controls { margin-top: 5px; flex: 1; min-height: 0; display: flex; align-items: center; gap: 9px; }
  acidify-patch-view .mod-cell .mod-switch { flex: 0 0 auto; background: none; border: 0; box-shadow: none; padding: 0; width: auto; height: auto; margin: 0; }
  acidify-patch-view .mod-cell .mod-switch button { width: 66px; height: 56px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px;
    cursor: pointer; border-radius: 2px; border: 1px solid #5d6668; transform: none; text-shadow: none;
    background: linear-gradient(105deg, rgba(255,255,255,.34), transparent 22% 78%, rgba(52,60,58,.16)), linear-gradient(180deg,#d6dad7 0%,#bbc1bd 55%,#9da5a1 100%);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.9), 0 2px 3px rgba(0,0,0,.34); }
  acidify-patch-view .mod-cell .mod-switch.is-on button { border-color: #4c130e;
    background: linear-gradient(#ae3026,#67140f);
    box-shadow: inset 0 2px 3px rgba(0,0,0,.4), inset 0 -1px 0 rgba(255,255,255,.22); }
  acidify-patch-view .mod-cell .mod-state { color: #2b3536; font: 900 12px/1 'Arial Narrow',Arial,sans-serif; letter-spacing: 1.5px; text-shadow: 0 1px 0 rgba(255,255,255,.35); }
  acidify-patch-view .mod-cell .mod-switch.is-on .mod-state { color: #fff1ec; }
  acidify-patch-view .mod-cell .mod-switch button small { color: #5b6466; font: 900 7px/1 'Arial Narrow',Arial,sans-serif; letter-spacing: .8px; }
  acidify-patch-view .mod-cell .mod-switch.is-on button small { color: #e8b7ae; }
  acidify-patch-view .mod-knob { flex: 1; min-width: 0; }
  acidify-patch-view .mod-knob .silver-knob { display: grid; grid-template-columns: 46px minmax(0,1fr); grid-template-rows: auto auto; column-gap: 8px; row-gap: 5px;
    align-items: center; justify-items: center; width: 100%; }
  acidify-patch-view .mod-knob .silver-knob .chrome-wrap { grid-row: 1 / span 2; grid-column: 1; width: 46px; height: 46px; margin: 0; }
  acidify-patch-view .mod-knob .silver-knob .control-label { grid-column: 2; grid-row: 1; align-self: end; margin: 0; white-space: nowrap;
    color: #26302f; font: 900 8.5px/1 'Arial Narrow',Arial,sans-serif; letter-spacing: 1.3px; text-shadow: 0 1px 0 rgba(255,255,255,.85); }
  acidify-patch-view .mod-knob .silver-knob .led-box { grid-column: 2; grid-row: 2; align-self: start; width: calc(100% + 2px); height: 24px; margin: 0; }
  acidify-patch-view .mod-knob .silver-knob .led-box .value-label { font: 12px/1 'Courier New',monospace; color: #7d3a31; text-shadow: 0 0 5px rgba(255,57,37,.45); }
  acidify-patch-view .mod-cell.on .mod-knob .led-box .value-label { color: #ff6756; }
  acidify-patch-view .mod-knob .silver-knob .tick-ring { display: block; position: absolute; inset: -4px; width: 54px; height: 54px; border-radius: 50%; filter: none; border: 0;
    background: repeating-conic-gradient(from 218deg, #3f4645 0 1.2deg, transparent 1.2deg 11.5deg);
    -webkit-mask: radial-gradient(circle, transparent 0 68%, #000 68% 100%); mask: radial-gradient(circle, transparent 0 68%, #000 68% 100%); }
  acidify-patch-view .mod-knob .silver-knob .dial-cap, acidify-patch-view .mod-knob .silver-knob .pointer-wrap { inset: 7px; }
  acidify-patch-view .mod-knob .silver-knob .dial-pointer { top: 3px; width: 3px; height: 11px; margin-left: -1.5px; }
  acidify-patch-view .mod-fixed { flex: 1; min-width: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px; }
  acidify-patch-view .mod-fixed-label { white-space: nowrap; color: #26302f; font: 900 8.5px/1 'Arial Narrow',Arial,sans-serif; letter-spacing: 1.3px; text-shadow: 0 1px 0 rgba(255,255,255,.85); }
  acidify-patch-view .mod-fixed-box { width: calc(100% + 2px); height: 34px; display: grid; place-items: center; border-radius: 2px; border: 1px solid #0a0706;
    background: linear-gradient(180deg,#241512,#130b09); box-shadow: inset 0 2px 4px rgba(0,0,0,.72); }
  acidify-patch-view .mod-fixed-box span { white-space: nowrap; color: #7d3a31; font: 16px/1 'Courier New',monospace; text-shadow: 0 0 5px rgba(255,57,37,.45); }
  acidify-patch-view .mod-cell.on .mod-fixed-box span { color: #ff6756; }
  acidify-patch-view .mod-cell-desc { margin-top: 5px; height: 12px; color: #5d6768; font: 900 8px/12px 'Arial Narrow',Arial,sans-serif; letter-spacing: .75px; white-space: nowrap; overflow: hidden; }
  acidify-patch-view .mods-overlay footer { height: 22px; box-sizing: border-box; padding: 0 12px; display: flex; align-items: center; justify-content: space-between;
    border-top: 1px solid rgba(45,50,49,.35); box-shadow: 0 -1px 0 rgba(255,255,255,.6);
    color: #5d6768; font: 900 7.5px/1 'Arial Narrow',Arial,sans-serif; letter-spacing: 1.1px; background: none; }
  acidify-patch-view .mods-footer-state.modified { color: #8e1f16; }

  /* ---------- Studio-Matrix (Template-Layout) ---------- */
  acidify-patch-view.studio-mode .step-row { display: none; }
  acidify-patch-view.studio-mode .editor.classic-editor { display: none; }
  acidify-patch-view.studio-mode .studio-editor { display: flex; gap: 8px; flex: 1; min-height: 0; height: auto; margin-top: 8px;
    grid-template-columns: none; border-top: 0; padding-top: 0; box-shadow: none; background: none; border: 0; overflow: visible; align-items: stretch; }
  acidify-patch-view .studio-matrix { flex: 1; min-width: 0; box-sizing: border-box; padding: 6px 8px 8px; border-radius: 2px;
    border: 1px solid #0a0b09; background: linear-gradient(#1c1e1a,#0f100e); box-shadow: inset 0 3px 9px rgba(0,0,0,.72); display: flex; flex-direction: column; overflow: visible; height: auto; }
  acidify-patch-view .studio-ruler { display: grid; grid-template-columns: 52px 1fr; gap: 8px; align-items: center; height: 11px; margin: 0; padding: 0; border: 0; background: none; }
  acidify-patch-view .studio-ruler .studio-lane-cells { display: grid; grid-template-columns: repeat(4,1fr); column-gap: 12px; }
  acidify-patch-view .studio-ruler-group { display: grid; grid-template-columns: repeat(4,1fr); column-gap: 3px; background: none; border: 0; padding: 0; }
  acidify-patch-view .studio-ruler-group span { text-align: center; font: 900 8px/1 'Courier New',monospace; color: #8e9791; background: none; border: 0; }
  acidify-patch-view .studio-ruler-group span:first-child { color: #cfd6d0; }
  acidify-patch-view .studio-ruler-group span.playing { color: #ff8a76; }
  acidify-patch-view .studio-lane { display: grid; grid-template-columns: 52px 1fr; gap: 8px; align-items: center; margin-top: 5px; padding: 0; border: 0; background: none; height: auto; }
  acidify-patch-view .studio-lane[data-lane="slide"] { margin-top: 4px; }
  acidify-patch-view .studio-lane-label { text-align: right; color: #c9cfca; font: 900 7.5px/1 'Arial Narrow',Arial,sans-serif; letter-spacing: 1.1px; width: auto; background: none; }
  acidify-patch-view .studio-lane .studio-lane-cells { display: grid; grid-template-columns: repeat(4,1fr); column-gap: 12px; }
  acidify-patch-view .studio-cell-group { display: grid; grid-template-columns: repeat(4,1fr); column-gap: 3px; background: none; border: 0; box-shadow: none; padding: 0; }
  acidify-patch-view .studio-cell:not(.studio-step) { height: 15px; width: auto; border-radius: 2px; cursor: pointer; font-size: 0; color: transparent;
    background: linear-gradient(180deg,#3a403c,#262b28); border: 1px solid #171b19; box-shadow: inset 0 1px 0 rgba(255,255,255,.06); }
  acidify-patch-view .studio-cell:not(.studio-step).playing { border-color: #7d5a52; }
  acidify-patch-view .studio-cell[data-kind="accent"].active, acidify-patch-view .studio-lane[data-lane="accent"] .studio-cell.active { background: linear-gradient(180deg,#ff6a58,#a4211a); border-color: #ff8878;
    box-shadow: 0 0 7px rgba(255,72,48,.4), inset 0 1px 0 rgba(255,255,255,.35); }
  acidify-patch-view .studio-cell[data-kind="slide"].active, acidify-patch-view .studio-lane[data-lane="slide"] .studio-cell.active { background: linear-gradient(180deg,#ffc46f,#8a5312); border-color: #ffd191;
    box-shadow: 0 0 7px rgba(255,168,60,.32), inset 0 1px 0 rgba(255,255,255,.3); }
  acidify-patch-view .studio-contour { margin-top: 6px; }
  acidify-patch-view .studio-contour-groups { height: 68px; border-top: 1px solid rgba(255,255,255,.05); border-bottom: 1px solid rgba(255,255,255,.05); }
  acidify-patch-view .studio-contour-svg { width: 100%; height: 100%; display: block; }
  acidify-patch-view .contour-slide { fill: none; stroke: #d8862c; stroke-width: 2; opacity: .85; }
  acidify-patch-view .contour-path { fill: none; stroke: #ff4a33; stroke-width: 2.4; stroke-linecap: round; }
  acidify-patch-view .contour-playhead { stroke: rgba(255,120,95,.6); stroke-width: 2; opacity: 0; }
  acidify-patch-view .studio-pitchgate { margin-top: 6px; align-items: start; }
  acidify-patch-view .studio-pitchgate .studio-lane-label { padding-top: 24px; }
  acidify-patch-view .studio-lane .studio-cell.studio-step { position: relative; height: 76px; width: auto; padding: 0; border: 0; background: transparent; cursor: pointer;
    border-radius: 0; box-shadow: none; display: block; font-size: 0; opacity: 1; }
  acidify-patch-view .studio-step .step-lamp { position: absolute; left: 50%; top: 0; margin-left: -3px; width: 6px; height: 6px; border-radius: 50%;
    background: radial-gradient(circle at 35% 28%, rgba(255,255,255,.14) 0 12%, #46201c 55%, #24100e 100%); box-shadow: inset 0 -1px 1px rgba(0,0,0,.7); }
  acidify-patch-view .studio-step.playing .step-lamp {
    background: radial-gradient(circle at 35% 28%, #ffe3d4 0 14%, #ff5540 46%, #8e120b 100%); box-shadow: 0 0 7px rgba(255,72,48,.9), inset 0 0 2px rgba(255,255,255,.6); }
  acidify-patch-view .studio-step.playing .cap-led {
    background: radial-gradient(ellipse at 50% 28%, #fff4ec 0 22%, #ff8a63 46%, #ff3a1c 78%, #b81c0c 100%);
    box-shadow: 0 0 12px rgba(255,86,52,.95), 0 0 22px rgba(255,86,52,.5), inset 0 1px 0 rgba(255,255,255,.75); }
  acidify-patch-view .studio-step.playing .step-cap { box-shadow: inset 0 1px 0 rgba(255,255,255,.95), inset -3px -5px 8px rgba(96,106,109,.22), 0 2px 3px rgba(0,0,0,.5), 0 0 14px rgba(255,70,45,.4); }
  acidify-patch-view .studio-step.playing .step-playbar { background: linear-gradient(90deg, rgba(255,74,51,0), #ff4a33 25% 75%, rgba(255,74,51,0)); box-shadow: 0 0 8px rgba(255,74,51,.75); }
  acidify-patch-view .studio-step.playing .step-note { color: #ff9a88; text-shadow: 0 0 9px rgba(255,80,55,.85); }
  acidify-patch-view .studio-step.playing .step-note-field { background: linear-gradient(180deg,#3d1713,#1d0d0b); }
  acidify-patch-view .studio-step .step-sel { top: 7px; bottom: 18px; }
  acidify-patch-view .studio-step.selected .step-sel { border-color: #e9eeee;
    box-shadow: inset 0 0 0 1px rgba(46,54,52,.6), 0 0 0 1px rgba(255,255,255,.55), 0 1px 4px rgba(30,36,34,.3); }
  acidify-patch-view .studio-step .step-well { top: 9px; height: 45px; }
  acidify-patch-view .studio-step .step-cap { top: 9px; height: 43px; }
  acidify-patch-view .studio-step.selected .step-cap { top: 11px; }
  acidify-patch-view .studio-step .cap-rocker { height: 33px; }
  acidify-patch-view .studio-step .cap-nub { top: 11px; height: 11px; }
  acidify-patch-view .studio-step .step-playbar { left: 3px; right: 3px; top: 55px; }
  acidify-patch-view .studio-step .step-note-field { height: 18px; border: 1px solid rgba(255,255,255,.06);
    background: linear-gradient(180deg,#1e211d,#0e100d); box-shadow: inset 0 1px 2px rgba(0,0,0,.6); }
  acidify-patch-view .studio-step .step-note { font: 900 11px/1 'Courier New',monospace; letter-spacing: .4px; color: #ff6756; text-shadow: 0 0 6px rgba(255,57,37,.5); }
  acidify-patch-view .studio-cell-group .studio-step.selected .cap-rocker { background: linear-gradient(96deg,#c6cccd 0 18%,#aeb5b7 34%,#8a9295 52%,#bcc3c4 68%,#99a1a3 86%,#727b7d 100%); }
  acidify-patch-view .studio-cell-group .studio-step.selected:nth-child(2) .cap-rocker { background: linear-gradient(100deg,#c6cccd 0 18%,#aeb5b7 34%,#8a9295 52%,#bcc3c4 68%,#99a1a3 86%,#727b7d 100%); }
  acidify-patch-view .studio-cell-group .studio-step.selected:nth-child(3) .cap-rocker { background: linear-gradient(104deg,#c6cccd 0 18%,#aeb5b7 34%,#8a9295 52%,#bcc3c4 68%,#99a1a3 86%,#727b7d 100%); }
  acidify-patch-view .studio-cell-group .studio-step.selected:nth-child(4) .cap-rocker { background: linear-gradient(108deg,#c6cccd 0 18%,#aeb5b7 34%,#8a9295 52%,#bcc3c4 68%,#99a1a3 86%,#727b7d 100%); }
  acidify-patch-view .studio-cell-group .studio-step.selected .step-cap { box-shadow: inset 0 3px 6px rgba(38,45,47,.5), 0 1px 0 rgba(255,255,255,.5); }
  acidify-patch-view .studio-tools { width: 314px; flex: 0 0 auto; box-sizing: border-box; padding: 6px 8px 8px; border-radius: 2px;
    border: 1px solid #0a0b09; background: linear-gradient(#1c1e1a,#0f100e); box-shadow: inset 0 3px 9px rgba(0,0,0,.72); display: flex; flex-direction: column; position: relative; height: auto; overflow: visible; }
  acidify-patch-view .studio-tool-head { position: relative; display: flex; gap: 6px; align-items: center; height: 12px; padding: 0; border: 0; background: none; }
  acidify-patch-view .studio-badge { width: 88px; height: 12px; display: grid; place-items: center; border-radius: 2px; background: #8f1d16; color: #ffe3de;
    font: 900 6px/1 'Arial Narrow',Arial,sans-serif; letter-spacing: 1.3px; }
  acidify-patch-view .studio-scale { flex: 1; height: 12px; display: flex; align-items: center; justify-content: flex-start; gap: 0; padding: 0 6px; cursor: pointer; box-shadow: none;
    border-radius: 2px; border: 0; background: #2b302f; color: #9aa3a5; font: 900 6px/1 'Arial Narrow',Arial,sans-serif; letter-spacing: 1px; transform: none; }
  acidify-patch-view .studio-scale strong { margin-left: auto; margin-right: 2px; color: #ff9a89; font: 900 6px/1 'Arial Narrow',Arial,sans-serif; letter-spacing: .8px; }
  acidify-patch-view .studio-scale:active { transform: none; }
  acidify-patch-view .scale-menu { position: absolute; z-index: 70; left: 94px; right: 0; top: 15px; max-height: 196px; overflow: auto; padding: 3px;
    border-radius: 3px; border: 1px solid #0a0b09; background: linear-gradient(#252824,#15170f);
    box-shadow: 0 12px 22px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.08); }
  acidify-patch-view .scale-menu button { width: 100%; height: 17px; padding: 0 6px; display: flex; align-items: center; justify-content: space-between;
    cursor: pointer; border: 0; border-radius: 2px; background: transparent; color: #c2c8c4; font: 900 6.5px/1 'Arial Narrow',Arial,sans-serif; letter-spacing: 1px;
    transform: none; box-shadow: none; text-shadow: none; }
  acidify-patch-view .scale-menu button:hover { background: #3a3f39; }
  acidify-patch-view .scale-menu button.active { background: #8f1d16; color: #ffe3de; }
  acidify-patch-view .scale-menu button small { color: #7d8681; font: 900 5.5px/1 'Arial Narrow',Arial,sans-serif; letter-spacing: .6px; }
  acidify-patch-view .scale-menu button.active small { color: #f0b0a6; }
  acidify-patch-view .studio-groups { margin-top: 7px; flex: 1; min-height: 0; display: flex; flex-direction: column; gap: 6px; }
  acidify-patch-view .studio-group { flex: 1; min-height: 0; display: flex; flex-direction: column; gap: 3px; }
  acidify-patch-view .studio-group-label { display: flex; align-items: center; gap: 6px; color: #93a0a2; font: 900 7px/1 'Arial Narrow',Arial,sans-serif; letter-spacing: 1.4px; white-space: nowrap; }
  acidify-patch-view .studio-group-label i { flex: 1; height: 1px; background: rgba(255,255,255,.11); }
  acidify-patch-view .studio-actions { flex: 1; min-height: 0; display: grid; grid-template-columns: repeat(4,1fr); grid-template-rows: none; grid-auto-rows: 1fr; gap: 5px; padding: 0; margin: 0; }
  acidify-patch-view .studio-actions button { height: 100%; min-height: 0; width: auto; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px;
    cursor: pointer; border-radius: 2px; border: 1px solid #1a1e1f; color: #1d2426;
    background: linear-gradient(102deg,#fdfefe 0 18%,#dfe4e4 34%,#aeb6b8 52%,#eaeeee 68%,#c3cacb 86%,#8f9799 100%);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.9), 0 2px 2px rgba(0,0,0,.42);
    font: 11px/11px 'Arial Narrow',Arial,sans-serif; text-shadow: none; transform: none; }
  acidify-patch-view .studio-actions button small { margin-top: 0; color: #3f4a4c; font: 900 6.5px/7px 'Arial Narrow',Arial,sans-serif; letter-spacing: .5px; }
  acidify-patch-view .studio-actions button b { display: block; height: 11px; font: 11px/11px 'Arial Narrow',Arial,sans-serif; font-weight: normal; }
  acidify-patch-view .studio-actions button[disabled] { opacity: 1; cursor: default; }
  acidify-patch-view.studio-mode .studio-matrix { height: auto; min-height: 0; }
  acidify-patch-view .studio-matrix .studio-lane, acidify-patch-view .studio-matrix .studio-ruler { height: auto; min-height: 0; }
  acidify-patch-view .studio-matrix .studio-ruler { height: 11px; margin-top: 2px; }
  acidify-patch-view .studio-matrix .studio-contour-groups { height: 68px; }
  acidify-patch-view .studio-matrix .studio-lane .studio-cell.studio-step { height: 76px; }
  acidify-patch-view.studio-mode .studio-tools { height: auto; min-height: 0; }
  acidify-patch-view .studio-hint { margin-top: 6px; text-align: right; color: #8d9698; font: 900 7px/1 'Arial Narrow',Arial,sans-serif; letter-spacing: .9px;
    position: static; background: none; border: 0; padding: 0; }
  acidify-patch-view .studio-toast { position: absolute; z-index: 10; left: 8px; bottom: 24px; padding: 4px 7px; border-radius: 3px;
    color: #ff8070; background: rgba(20,18,16,.94); font: 7px 'Courier New',monospace; letter-spacing: .7px;
    opacity: 0; transform: translateY(3px); pointer-events: none; transition: 120ms ease; }
  acidify-patch-view .studio-toast.visible { opacity: 1; transform: translateY(0); }

  @media (max-width: 700px), (max-height: 360px) {
    acidify-patch-view .model { font-size: 10px; letter-spacing: 1.35px; }
    acidify-patch-view .computer { font-size: 8px; letter-spacing: 1.45px; }
    acidify-patch-view .bank-title,
    acidify-patch-view .master-head { font-size: 8px; }
    acidify-patch-view .mini-title { font-size: 9px; }
    acidify-patch-view .clock-mode button { font-size: 8px; }
    acidify-patch-view .clock-readout { font-size: 7px; }
    acidify-patch-view .wave-title,
    acidify-patch-view .control-label { font-size: 10px; letter-spacing: .55px; }
    acidify-patch-view .value-label { font-size: 9px; }
    acidify-patch-view .program-title { font-size: 13px; }
    acidify-patch-view .program-context { font-size: 7px; }
    acidify-patch-view .studio-toggle { font-size: 8px; }
    acidify-patch-view .stepper-label { font-size: 8px; }
    acidify-patch-view .step-index,
    acidify-patch-view .step-note { font-size: 10px; }
    acidify-patch-view .edit-caption { font-size: 8px; }
    acidify-patch-view .octave-indicator { font-size: 8px; }
    acidify-patch-view .function-button strong { font-size: 9px; }
    acidify-patch-view .function-button small { font-size: 6.5px; }
    acidify-patch-view .studio-tool-head { font-size: 7px; }
    acidify-patch-view .studio-selection { font-size: 9px; }
    acidify-patch-view .studio-actions button { font-size: 11px; }
    acidify-patch-view .studio-actions button small { font-size: 6.5px; }
    acidify-patch-view .studio-lane-label { font-size: 7px; }
    acidify-patch-view .studio-ruler-group span { font-size: 6px; }
    acidify-patch-view .studio-cell { font-size: 8px; }
    acidify-patch-view .studio-hint { font-size: 6px; }
    acidify-patch-view .distortion-trigger, acidify-patch-view .mods-trigger { font-size: 6.5px; }
    acidify-patch-view .distortion-overlay-head strong, acidify-patch-view .mods-overlay-head strong { font-size: 11px; }
    acidify-patch-view .distortion-status { font-size: 8px; }
    acidify-patch-view .distortion-cell-label { font-size: 7px; }
    acidify-patch-view .distortion-types button { font-size: 8px; }
    acidify-patch-view .distortion-types button small { font-size: 6px; }
  }

  /* Einheitliche Tastenreihe unter dem Logo: drei gleiche Keys mit Status-LED. */
  acidify-patch-view .deck-a .tips-power-row { gap: 6px; justify-content: stretch; }
  acidify-patch-view .deck-a .tips-power-row .brand-key { flex: 1 1 0; min-width: 0; height: 20px; margin: 0; padding: 0;
    display: flex; align-items: center; justify-content: center; gap: 5px; cursor: pointer;
    border-radius: 2px; border: 1px solid #1a1e1f; width: auto; transform: none; text-shadow: none;
    background: linear-gradient(102deg,#fdfefe 0 18%,#dfe4e4 34%,#aeb6b8 52%,#eaeeee 68%,#c3cacb 86%,#8f9799 100%);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.95), inset 0 -2px 3px rgba(52,60,62,.3), 0 3px 3px rgba(0,0,0,.45); }
  acidify-patch-view .deck-a .tips-power-row .brand-key[aria-pressed="true"] {
    background: linear-gradient(102deg,#c6cccd 0 18%,#aeb5b7 34%,#8a9295 52%,#bcc3c4 68%,#99a1a3 86%,#727b7d 100%);
    box-shadow: inset 0 2px 5px rgba(30,36,38,.55), 0 1px 1px rgba(0,0,0,.5); }
  acidify-patch-view .deck-a .tips-power-row .brand-key .key-label { font: 900 7px/1 'Arial Narrow',Arial,sans-serif; letter-spacing: 1px; color: #1d2426; text-shadow: 0 1px 0 rgba(255,255,255,.5); }
  acidify-patch-view .deck-a .tips-power-row .brand-key.bypassed .key-label { color: #8e1f16; }
  acidify-patch-view .deck-a .tips-power-row .key-led { width: 5px; height: 5px; border-radius: 50%; flex: 0 0 auto;
    background: radial-gradient(circle at 35% 30%, #55201a, #2c0b07 70%, #1a0503); box-shadow: inset 0 1px 1px rgba(255,255,255,.16); }
  acidify-patch-view .deck-a .tips-power-row .key-led.lit {
    background: radial-gradient(circle at 35% 30%, #ff6a54, #9d1c11 68%, #5a0d06); box-shadow: inset 0 1px 1px rgba(255,255,255,.45), 0 0 6px rgba(220,42,26,.6); }

  /* ---------- Dark Mode: dunkles Anthrazit-Metall ---------- */
  acidify-patch-view.theme-dark .chassis {
    background-image:
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.72' numOctaves='2' seed='11' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.3'/%3E%3C/svg%3E"),
      repeating-linear-gradient(93deg, rgba(255,255,255,.03) 0 1px, rgba(0,0,0,.05) 1px 2px, transparent 2px 5px),
      linear-gradient(180deg,#4a4e4f 0%,#3b3f40 40%,#2d3132 78%,#212526 100%);
    box-shadow: 0 26px 44px rgba(0,0,0,.65), inset 0 2px 0 rgba(255,255,255,.16), inset 0 -6px 10px rgba(0,0,0,.55);
  }
  acidify-patch-view.theme-dark .top-strip.deck-a { border-bottom-color: #191c1d; }
  acidify-patch-view.theme-dark .deck-a {
    background-image: repeating-linear-gradient(93deg, rgba(255,255,255,.03) 0 1px, rgba(0,0,0,.06) 1px 2px, transparent 2px 5px),
      linear-gradient(180deg,#43474a 0%,#383c3f 44%,#2b2f31 100%);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.12), inset 0 -2px 3px rgba(0,0,0,.45); }
  acidify-patch-view.theme-dark .deck-b { border-color: #171a1b;
    background-image: repeating-linear-gradient(93deg, rgba(255,255,255,.03) 0 1px, rgba(0,0,0,.06) 1px 2px, transparent 2px 5px),
      linear-gradient(180deg,#42464900,#383c3f00), linear-gradient(180deg,#42464a 0%,#373b3e 46%,#2a2e30 100%);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.1), inset 0 -2px 3px rgba(0,0,0,.45); }
  acidify-patch-view.theme-dark .program-strip { border-color: #171a1b;
    background-image: repeating-linear-gradient(93deg, rgba(255,255,255,.03) 0 1px, rgba(0,0,0,.06) 1px 2px, transparent 2px 5px),
      linear-gradient(180deg,#42464a 0%,#373b3e 46%,#2a2e30 100%);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.1); }
  acidify-patch-view.theme-dark .deck-a > * { border-right-color: rgba(0,0,0,.6); box-shadow: 1px 0 0 rgba(255,255,255,.07); }
  acidify-patch-view.theme-dark .deck-a > *:last-child { box-shadow: none; }
  acidify-patch-view.theme-dark .deckb-cell { border-right-color: rgba(0,0,0,.6); box-shadow: 1px 0 0 rgba(255,255,255,.07); }
  acidify-patch-view.theme-dark .deckb-cell:last-child { box-shadow: none; }
  acidify-patch-view.theme-dark .keyboard,
  acidify-patch-view.theme-dark .time-controls {
    border-color: #131617; background: linear-gradient(180deg,#33373a,#26292b);
    box-shadow: inset 0 3px 7px rgba(0,0,0,.6), inset 0 -1px 0 rgba(255,255,255,.09), 0 1px 0 rgba(255,255,255,.08); }
  acidify-patch-view.theme-dark .cell-title { color: #b8bec0; border-bottom-color: rgba(0,0,0,.55); text-shadow: 0 1px 0 rgba(0,0,0,.7); }
  acidify-patch-view.theme-dark .silver-knob .control-label { color: #c3c8ca; }
  acidify-patch-view.theme-dark .silver-knob:has(.mod-slider:not([hidden])) .control-label { color: #ff6a54; }
  acidify-patch-view.theme-dark .wave-name { color: #9aa2a1; text-shadow: 0 1px 0 rgba(0,0,0,.7); }
  acidify-patch-view.theme-dark .wave-choice:has(button.active) .wave-name { color: #ff6a54; }
  acidify-patch-view.theme-dark .deck-a .brand { color: #b9bfc1; }
  acidify-patch-view.theme-dark .deck-a .model { color: #b0b6b8; text-shadow: 0 -0.5px 0 rgba(0,0,0,.6), 0 1px 0 rgba(0,0,0,.4); }
  acidify-patch-view.theme-dark .deck-a .computer { color: #848c8d; text-shadow: 0 1px 0 rgba(0,0,0,.55); }
  acidify-patch-view.theme-dark .power-label { color: #9aa2a1; text-shadow: 0 1px 0 rgba(0,0,0,.6); }
  acidify-patch-view.theme-dark .brand-legal span { color: #8a9293; text-shadow: 0 1px 0 rgba(0,0,0,.6); }
  acidify-patch-view.theme-dark .brand-legal .brand-version { color: #a5adae; text-shadow: 0 1px 0 rgba(0,0,0,.6); }
  acidify-patch-view.theme-dark .program-header { border-bottom-color: rgba(0,0,0,.6); box-shadow: 0 1px 0 rgba(255,255,255,.07); }
  acidify-patch-view.theme-dark .program-title b { color: #ff5545; text-shadow: 0 1px 0 rgba(0,0,0,.7); }
  acidify-patch-view.theme-dark .program-title > span:not(.program-legend) { color: #c3c8ca; text-shadow: 0 1px 0 rgba(0,0,0,.7); }
  acidify-patch-view.theme-dark .program-context { color: #969ea0; }
  acidify-patch-view.theme-dark .program-legend { border-left-color: rgba(255,255,255,.14); }
  acidify-patch-view.theme-dark .program-legend em { color: #a2aaab; }
  acidify-patch-view.theme-dark .selection-caption { color: #a2aaab; }
  acidify-patch-view.theme-dark .step-row,
  acidify-patch-view.theme-dark .edit-status,
  acidify-patch-view.theme-dark .arp-direction-cell,
  acidify-patch-view.theme-dark .arp-tools-cell {
    border-color: #131617; background: linear-gradient(180deg,#33373a,#26292b);
    box-shadow: inset 0 3px 7px rgba(0,0,0,.6), inset 0 -1px 0 rgba(255,255,255,.09), 0 1px 0 rgba(255,255,255,.08); }
  acidify-patch-view.theme-dark .edit-caption { color: #a2aaab; }
  acidify-patch-view.theme-dark .arp-status .octave-indicator,
  acidify-patch-view.theme-dark .edit-status .octave-indicator { color: #969ea0; }
  acidify-patch-view.theme-dark .power-ring { border-color: rgba(0,0,0,.65);
    background: radial-gradient(circle at 34% 26%, #565b5d, #3a3e40 62%, #2b2f30);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.2), inset 0 -2px 3px rgba(0,0,0,.5), 0 1px 0 rgba(255,255,255,.08); }
  acidify-patch-view.theme-dark .deck-a .tooltip-toggle[aria-pressed="false"],
  acidify-patch-view.theme-dark .deck-a .theme-toggle[aria-pressed="false"] {
    color: #c8cdcb;
    background: linear-gradient(102deg,#4a4e50 0 18%,#3f4345 34%,#2f3335 52%,#3f4345 68%,#353a3c 86%,#26292b 100%);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.18), inset 0 -2px 3px rgba(0,0,0,.5), 0 3px 3px rgba(0,0,0,.55); }
  acidify-patch-view.theme-dark .deck-a .tooltip-toggle[aria-pressed="true"] { color: #c8cdcb;
    background: linear-gradient(102deg,#3c4041 0 18%,#33373a 34%,#26292b 52%,#33373a 68%,#2b2f31 86%,#1e2123 100%);
    box-shadow: inset 0 2px 5px rgba(0,0,0,.6), 0 1px 1px rgba(0,0,0,.5); }
  acidify-patch-view.theme-dark .scope-legend > div { border-color: #060403; }
  acidify-patch-view.theme-dark .tips-power-row { border-color: rgba(0,0,0,.6);
    background: linear-gradient(180deg,#2e3234,#26292b);
    box-shadow: inset 0 2px 4px rgba(0,0,0,.55), inset 0 -1px 0 rgba(255,255,255,.08), 0 1px 0 rgba(255,255,255,.07); }
  acidify-patch-view.theme-dark .tempo-scale { color: #969ea0; text-shadow: 0 1px 0 rgba(0,0,0,.6); }
  acidify-patch-view.theme-dark .tempo-scale i { background: linear-gradient(90deg, rgba(0,0,0,.5), rgba(255,255,255,.25)); }
  acidify-patch-view.theme-dark .dist-mini-label { color: #9aa2a1; text-shadow: 0 1px 0 rgba(0,0,0,.6); }
  acidify-patch-view.theme-dark .master-cell .silver-knob .led-box .value-label,
  acidify-patch-view.theme-dark.studio-mode .master-cell .silver-knob .value-label {
    color: #ff6756; text-shadow: 0 0 5px rgba(255,57,37,.45); }

  /* Dark Mode: Silber-Taster werden Gunmetal, Chrom-Knoepfe und Tasten bleiben. */
  acidify-patch-view.theme-dark .osc-cell .wave-buttons button,
  acidify-patch-view.theme-dark .deck-b .clock-mode button,
  acidify-patch-view.theme-dark .deck-b .run-switch button,
  acidify-patch-view.theme-dark .stepper-buttons button,
  acidify-patch-view.theme-dark .function-button,
  acidify-patch-view.theme-dark .studio-actions button,
  acidify-patch-view.theme-dark .arp-direction button,
  acidify-patch-view.theme-dark .arp-hold button,
  acidify-patch-view.theme-dark .arp-capture,
  acidify-patch-view.theme-dark .deck-a .distortion-trigger,
  acidify-patch-view.theme-dark .deck-a .mods-trigger {
    border-color: #101314; color: #d0d4d3;
    background: linear-gradient(102deg,#5a5f61 0 18%,#4c5153 34%,#3d4245 52%,#4e5355 68%,#454a4c 86%,#33383a 100%);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.22), inset 0 -2px 3px rgba(0,0,0,.45), 0 3px 3px rgba(0,0,0,.55); }
  acidify-patch-view.theme-dark .osc-cell .wave-buttons button.active,
  acidify-patch-view.theme-dark .deck-b .clock-mode button.active,
  acidify-patch-view.theme-dark .deck-b .run-switch.is-on button,
  acidify-patch-view.theme-dark .function-button:active,
  acidify-patch-view.theme-dark .function-button.active,
  acidify-patch-view.theme-dark .studio-actions button:active,
  acidify-patch-view.theme-dark .arp-direction button.active,
  acidify-patch-view.theme-dark .arp-hold.is-on button,
  acidify-patch-view.theme-dark .arp-capture:active,
  acidify-patch-view.theme-dark .deck-a .distortion-trigger.active,
  acidify-patch-view.theme-dark .deck-a .mods-trigger.active {
    border-color: #101314;
    background: linear-gradient(102deg,#393d3f 0 18%,#313538 34%,#26292b 52%,#33373a 68%,#2b2f31 86%,#1e2123 100%);
    box-shadow: inset 0 2px 5px rgba(0,0,0,.65), 0 1px 1px rgba(0,0,0,.5); }
  acidify-patch-view.theme-dark .osc-cell .wave-buttons button { color: #9aa19f; }
  acidify-patch-view.theme-dark .osc-cell .wave-buttons button.active { color: #ff5545; }
  acidify-patch-view.theme-dark .function-button strong,
  acidify-patch-view.theme-dark .studio-actions button strong,
  acidify-patch-view.theme-dark .arp-direction button strong,
  acidify-patch-view.theme-dark .arp-hold-label,
  acidify-patch-view.theme-dark .arp-capture strong,
  acidify-patch-view.theme-dark .deck-b .clock-mode button,
  acidify-patch-view.theme-dark .deck-b .run-switch button { color: #d0d4d3; text-shadow: 0 1px 0 rgba(0,0,0,.6); }
  acidify-patch-view.theme-dark .function-button small,
  acidify-patch-view.theme-dark .studio-actions button small,
  acidify-patch-view.theme-dark .arp-direction button small,
  acidify-patch-view.theme-dark .arp-hold button small,
  acidify-patch-view.theme-dark .arp-capture small { color: #9aa19f; }
  acidify-patch-view.theme-dark .function-button.active strong,
  acidify-patch-view.theme-dark .arp-direction button.active strong,
  acidify-patch-view.theme-dark .arp-hold.is-on .arp-hold-label { color: #ff5545; }
  acidify-patch-view.theme-dark .step-cap { border-color: #22272a;
    background: linear-gradient(180deg,#565e60,#3b4244);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.3), inset -3px -5px 8px rgba(0,0,0,.3), inset 3px 4px 7px rgba(255,255,255,.08), 0 2px 3px rgba(0,0,0,.6); }
  acidify-patch-view.theme-dark .step-well { background: linear-gradient(180deg,#2a3033,#121517); }
  acidify-patch-view.theme-dark .sequence-step .step-index { color: #8f9896; }
  acidify-patch-view.theme-dark .step-group .sequence-step:first-child .step-index { color: #c9cecd; }
  acidify-patch-view.theme-dark .sequence-step.beyond .step-index { color: #5c6462; }
  acidify-patch-view.theme-dark .sequence-step.playing .step-index { color: #ff5545; }
  acidify-patch-view.theme-dark .sequence-step.selected .step-sel { border-color: #b9bfc0;
    box-shadow: inset 0 0 0 1px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.2), 0 1px 4px rgba(0,0,0,.4); }

  /* Dark Mode: Step-Rocker in Gunmetal (Winkel-Varianten wie im Silber). */
  acidify-patch-view.theme-dark .cap-rocker { background: linear-gradient(96deg,#5f6466 0 18%,#4f5456 34%,#404547 52%,#515658 68%,#474c4e 86%,#363b3d 100%); box-shadow: inset 0 1px 0 rgba(255,255,255,.28); }
  acidify-patch-view.theme-dark .step-group .sequence-step:nth-child(2) .cap-rocker { background: linear-gradient(100deg,#5f6466 0 18%,#4f5456 34%,#404547 52%,#515658 68%,#474c4e 86%,#363b3d 100%); }
  acidify-patch-view.theme-dark .step-group .sequence-step:nth-child(3) .cap-rocker { background: linear-gradient(104deg,#5f6466 0 18%,#4f5456 34%,#404547 52%,#515658 68%,#474c4e 86%,#363b3d 100%); }
  acidify-patch-view.theme-dark .step-group .sequence-step:nth-child(4) .cap-rocker { background: linear-gradient(108deg,#5f6466 0 18%,#4f5456 34%,#404547 52%,#515658 68%,#474c4e 86%,#363b3d 100%); }
  acidify-patch-view.theme-dark .step-group .sequence-step.selected .cap-rocker { background: linear-gradient(96deg,#3f4345 0 18%,#383c3e 34%,#2c3032 52%,#383c3f 68%,#303436 86%,#232628 100%); }
  acidify-patch-view.theme-dark .step-group .sequence-step.selected:nth-child(2) .cap-rocker { background: linear-gradient(100deg,#3f4345 0 18%,#383c3e 34%,#2c3032 52%,#383c3f 68%,#303436 86%,#232628 100%); }
  acidify-patch-view.theme-dark .step-group .sequence-step.selected:nth-child(3) .cap-rocker { background: linear-gradient(104deg,#3f4345 0 18%,#383c3e 34%,#2c3032 52%,#383c3f 68%,#303436 86%,#232628 100%); }
  acidify-patch-view.theme-dark .step-group .sequence-step.selected:nth-child(4) .cap-rocker { background: linear-gradient(108deg,#3f4345 0 18%,#383c3e 34%,#2c3032 52%,#383c3f 68%,#303436 86%,#232628 100%); }
  acidify-patch-view.theme-dark .studio-toggle span { background: #1d2120; color: #8f9896; }
  acidify-patch-view.theme-dark .studio-toggle { border-color: #101314; background: #1d2120; }
  acidify-patch-view.theme-dark .studio-toggle[data-view="classic"] .classic-label { background: linear-gradient(180deg,#9ca3a4,#767e80); color: #101415; }

  /* Dark Mode: Overlays (Distortion + Mods) folgen dem Anthrazit. */
  acidify-patch-view.theme-dark .distortion-overlay,
  acidify-patch-view.theme-dark .mods-overlay { border-color: #171a1b; color: #c3c8ca;
    background-image: repeating-linear-gradient(93deg, rgba(255,255,255,.03) 0 1px, rgba(0,0,0,.06) 1px 2px, transparent 2px 5px),
      linear-gradient(180deg,#42464a 0%,#373b3e 46%,#2a2e30 100%);
    box-shadow: 0 22px 40px rgba(0,0,0,.7), inset 0 1px 0 rgba(255,255,255,.1); }
  acidify-patch-view.theme-dark .distortion-overlay-head,
  acidify-patch-view.theme-dark .mods-overlay-head { border-bottom-color: rgba(0,0,0,.6); box-shadow: 0 1px 0 rgba(255,255,255,.07); }
  acidify-patch-view.theme-dark .distortion-overlay-head strong,
  acidify-patch-view.theme-dark .mods-overlay-head strong { color: #ff5545; text-shadow: 0 1px 0 rgba(0,0,0,.7); }
  acidify-patch-view.theme-dark .distortion-overlay-head span,
  acidify-patch-view.theme-dark .mods-overlay-head span,
  acidify-patch-view.theme-dark .distortion-status,
  acidify-patch-view.theme-dark .mods-status { color: #969ea0; }
  acidify-patch-view.theme-dark .distortion-overlay footer,
  acidify-patch-view.theme-dark .mods-overlay footer { border-top-color: rgba(255,255,255,.1); color: #969ea0; }
  acidify-patch-view.theme-dark .distortion-close,
  acidify-patch-view.theme-dark .mods-close,
  acidify-patch-view.theme-dark .distortion-types button,
  acidify-patch-view.theme-dark .distortion-power.run-switch button,
  acidify-patch-view.theme-dark .mod-switch button { border-color: #101314; color: #c3c8ca;
    background: linear-gradient(102deg,#5a5f61 0 18%,#4c5153 34%,#3d4245 52%,#4e5355 68%,#454a4c 86%,#33383a 100%);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.22), inset 0 -2px 3px rgba(0,0,0,.45), 0 3px 3px rgba(0,0,0,.55); }
  acidify-patch-view.theme-dark .distortion-types button.active,
  acidify-patch-view.theme-dark .distortion-power.run-switch.is-on button,
  acidify-patch-view.theme-dark .mod-switch.is-on button { border-color: #8c2c23; color: #ff5545;
    background: linear-gradient(102deg,#393d3f 0 18%,#313538 34%,#26292b 52%,#33373a 68%,#2b2f31 86%,#1e2123 100%);
    box-shadow: inset 0 2px 5px rgba(0,0,0,.65), 0 0 12px rgba(181,41,33,.25); }
  acidify-patch-view.theme-dark .distortion-types button strong { text-shadow: 0 1px 0 rgba(0,0,0,.6); }
  acidify-patch-view.theme-dark .distortion-types button small,
  acidify-patch-view.theme-dark .distortion-types button.active small { color: #9aa19f; }
  acidify-patch-view.theme-dark .mod-row.mod-cell { border-color: rgba(0,0,0,.55);
    background: linear-gradient(180deg, rgba(51,55,58,.75), rgba(38,41,43,.75)); }
  acidify-patch-view.theme-dark .mod-cell-head strong { color: #c3c8ca; text-shadow: 0 1px 0 rgba(0,0,0,.7); }
  acidify-patch-view.theme-dark .mod-cell.on .mod-cell-head strong { color: #ff5545; }
  acidify-patch-view.theme-dark .mod-cell .mod-state { color: #c3c8ca; text-shadow: 0 1px 0 rgba(0,0,0,.6); }
  acidify-patch-view.theme-dark .mod-fixed-label { color: #b0b6b8; text-shadow: 0 1px 0 rgba(0,0,0,.6); }
  acidify-patch-view.theme-dark .mod-cell-desc { color: #969ea0; }
  acidify-patch-view.theme-dark .distortion-overlay .control-label,
  acidify-patch-view.theme-dark .mods-overlay .control-label { color: #c3c8ca; }
  acidify-patch-view.theme-dark .distortion-power-label { color: #c3c8ca; text-shadow: 0 1px 0 rgba(0,0,0,.6); }
  acidify-patch-view.theme-dark .distortion-power.is-on .distortion-power-label { color: #ff5545; }
  acidify-patch-view.theme-dark .distortion-power button small,
  acidify-patch-view.theme-dark .mod-switch button small { color: #9aa19f; }
  acidify-patch-view.theme-dark .deck-a .tips-power-row .brand-key { border-color: #101314;
    background: linear-gradient(102deg,#5a5f61 0 18%,#4c5153 34%,#3d4245 52%,#4e5355 68%,#454a4c 86%,#33383a 100%);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.22), inset 0 -2px 3px rgba(0,0,0,.45), 0 3px 3px rgba(0,0,0,.55); }
  acidify-patch-view.theme-dark .deck-a .tips-power-row .brand-key[aria-pressed="true"] {
    background: linear-gradient(102deg,#393d3f 0 18%,#313538 34%,#26292b 52%,#33373a 68%,#2b2f31 86%,#1e2123 100%);
    box-shadow: inset 0 2px 5px rgba(0,0,0,.65), 0 1px 1px rgba(0,0,0,.5); }
  acidify-patch-view.theme-dark .deck-a .tips-power-row .brand-key .key-label { color: #c8cdcb; text-shadow: 0 1px 0 rgba(0,0,0,.6); }
  acidify-patch-view.theme-dark .deck-a .tips-power-row .brand-key.bypassed .key-label { color: #ff5545; }
</style>
<div class="chassis">
  <div class="panel">
    <section class="top-strip deck-a">
      <header class="branding brand-cell">
        <div>
          <div class="brand"><span class="acid">ACID</span>IFY</div>
          <div class="brand-rule"></div>
          <div class="model">AC-303 BASSLINE SYNTHESIZER</div>
          <div class="computer">MONOPHONIC · 4× MODELLED CORE</div>
        </div>
        <div class="brand-foot">
          <div class="tips-power-row">
            <button class="brand-key tooltip-toggle" type="button" aria-pressed="true" data-tooltip="Turn the English control tooltips on or off."><i class="key-led tips-led lit"></i><span class="key-label">TIPS</span><strong class="tooltip-toggle-state" hidden>ON</strong></button>
            <button class="brand-key theme-toggle" type="button" aria-pressed="false" data-tooltip="Switch the panel between silver and dark anthracite metal."><i class="key-led theme-led"></i><span class="key-label">DARK</span></button>
            <button class="brand-key power-cell" type="button" aria-pressed="true"
              data-tooltip="Bypass the whole instrument (dry signal passes through)."><i class="key-led power-led lit"></i><span class="key-label power-label">POWER</span></button>
          </div>
          <div class="brand-legal"><span>COMPUTER CONTROLLED</span><span class="brand-version">v2.8.0</span></div>
        </div>
      </header>
      <div class="osc-cell">
        <div class="cell-title">OSCILLATOR</div>
        <div class="control waveform" data-param="param7" data-endpoint-id="param7" data-min="0" data-max="1" data-step="1" data-init="0" data-control="buttons">
          <div class="wave-buttons">
            <div class="wave-choice"><button data-value="0" aria-label="Saw"><svg viewBox="0 0 28 20" aria-hidden="true"><path d="M2 16L9 4v12l7-12v12l7-12"/></svg></button><span class="wave-name">SAW</span></div>
            <div class="wave-choice"><button data-value="1" aria-label="Square"><svg viewBox="0 0 28 20" aria-hidden="true"><path d="M2 16V4h10v12h10V4h4"/></svg></button><span class="wave-name">SQR</span></div>
          </div>
        </div>
      </div>
      <div class="tone-bank">
        <div class="tone-controls">
          ${dial("param1", { modSlot: "param57" })}${dial("param2", { modSlot: "param52" })}${dial("param3", { plainSlot: true })}${dial("param4", { plainSlot: true })}${dial("param5", { plainSlot: true })}${dial("param6", { modSlot: "param59" })}
        </div>
      </div>
      <div class="volume-bank">
        <div class="master-cell">
          <div class="cell-title">MASTER</div>
          ${dial("param8")}
          <div class="master-minis">
            <div class="dist-mini" data-mini="param47" role="slider" tabindex="0" aria-label="Distortion drive"
              data-tooltip="Distortion drive — quick access to the DRIVE dial in the distortion stage.">
              <span class="dist-mini-label">DRV</span><div class="dist-mini-dial"><i class="dist-mini-pointer"></i></div>
            </div>
            <div class="dist-mini" data-mini="param48" role="slider" tabindex="0" aria-label="Distortion mix"
              data-tooltip="Distortion mix — quick access to the MIX dial in the distortion stage.">
              <span class="dist-mini-label">MIX</span><div class="dist-mini-dial"><i class="dist-mini-pointer"></i></div>
            </div>
          </div>
        </div>
        <div class="output-cell">
          <div class="cell-title">OUTPUT</div>
          <div class="vu-meter" aria-hidden="true"><i class="vu-scale l"></i><i class="vu-scale r"></i><i class="vu-bar l"></i><i class="vu-bar r"></i><span class="output-lamp" hidden></span></div>
          <div class="trigger-row">
            <button class="distortion-trigger" type="button" aria-expanded="false"
              aria-controls="distortion-overlay" aria-label="Distortion disabled; open controls"
              title="Distortion · OFF"><i class="distortion-led"></i><span>DIST</span></button>
            <button class="mods-trigger" type="button" aria-expanded="false"
              aria-controls="mods-overlay" aria-label="Circuit mods stock; open controls"
              title="Circuit Mods · STOCK"><i class="distortion-led mods-led"></i><span>MOD</span></button>
          </div>
        </div>
      </div>
    </section>

    <section class="deck-b">
      <div class="deckb-cell tempo-cell">
        <div class="cell-title">TEMPO · BPM</div>
        <div class="tempo-row">
          ${dial("param9", { size: "compact" })}
          <div class="tempo-side">
            <div class="led-box tempo-led"><span class="tempo-mirror value-label-mirror">128.0</span></div>
            <div class="tempo-scale"><span>SLOW 40</span><i></i><span>300 FAST</span></div>
          </div>
        </div>
      </div>
      <div class="deckb-cell clock-cell">
        <div class="cell-title">CLOCK</div>
        <div class="control clock-mode" data-param="param49" data-endpoint-id="param49"
          data-min="0" data-max="1" data-step="1" data-init="0" data-control="buttons"
          aria-label="Clock source">
          <div class="clock-choice"><span class="clock-lamp int"></span><button data-value="0" type="button">INT</button></div>
          <div class="clock-choice"><span class="clock-lamp daw"></span><button data-value="1" type="button">DAW</button></div>
        </div>
      </div>
      <div class="deckb-cell transport-cell">
        <div class="cell-title">TRANSPORT</div>
        <span class="run-lamp"></span>
        <div class="control run-switch" data-param="param10" data-endpoint-id="param10" data-min="0" data-max="1" data-step="1" data-init="0" data-control="toggle">
          <button data-value="0">RUN / STOP</button>
          <button data-value="1" hidden>RUN</button>
        </div>
      </div>
      <div class="deckb-cell stepper-cell">
        <div class="stepper-block">
          <div class="cell-title">SWING</div>
          <div class="control silver-stepper" data-param="param50" data-endpoint-id="param50" data-min="0" data-max="100" data-step="1" data-init="0" data-control="stepper">
            <div class="led-box"><span class="stepper-value">0%</span></div>
            <div class="stepper-buttons"><button data-step="-1" type="button" aria-label="Swing down">−</button><button data-step="1" type="button" aria-label="Swing up">+</button></div>
          </div>
        </div>
        <div class="stepper-block">
          <div class="cell-title">LENGTH</div>
          <div class="control silver-stepper" data-param="param11" data-endpoint-id="param11" data-min="1" data-max="16" data-step="1" data-init="16" data-control="stepper">
            <div class="led-box"><span class="stepper-value">16</span></div>
            <div class="stepper-buttons"><button data-step="-1" type="button" aria-label="Length down">−</button><button data-step="1" type="button" aria-label="Length up">+</button></div>
          </div>
        </div>
        <div class="stepper-block">
          <div class="cell-title">ROOT</div>
          <div class="control silver-stepper" data-param="param12" data-endpoint-id="param12" data-min="24" data-max="60" data-step="1" data-init="36" data-control="stepper">
            <div class="led-box"><span class="stepper-value">C2</span></div>
            <div class="stepper-buttons"><button data-step="-1" type="button" aria-label="Root down">−</button><button data-step="1" type="button" aria-label="Root up">+</button></div>
          </div>
        </div>
      </div>
      <div class="deckb-cell scope-cell">
        <div class="scope-head"><div class="cell-title">FILTER RESPONSE</div><span class="scope-hz">— Hz</span></div>
        <div class="scope-row">
          <div class="scope-screen">
            <svg class="scope-svg" viewBox="0 0 238 104" preserveAspectRatio="none">
              <path class="scope-env" d=""></path>
              <path class="scope-fill" d=""></path>
              <path class="scope-curve" d=""></path>
              <line class="scope-cursor" x1="0" y1="0" x2="0" y2="104"></line>
            </svg>
            <span class="scope-tag tl">VCF · 4-POLE</span>
            <span class="scope-tag bl">20 Hz</span>
            <span class="scope-tag br">20 kHz</span>
          </div>
          <div class="scope-legend">
            <div><span>RES</span><b data-scope="res">--</b></div>
            <div><span>ENV</span><b data-scope="env">--</b></div>
            <div><span>DEC</span><b data-scope="dec">--</b></div>
            <div><span>ACC</span><b data-scope="acc">--</b></div>
          </div>
        </div>
      </div>
    </section>

    <div class="distortion-scrim" hidden aria-hidden="true">
      <section class="distortion-overlay" id="distortion-overlay" role="dialog" aria-modal="true"
        aria-labelledby="distortion-title">
        <header class="distortion-overlay-head">
          <div>
            <strong id="distortion-title">DISTORTION STAGE</strong>
            <span class="distortion-status" role="status">TRUE BYPASS</span>
          </div>
          <button class="distortion-close" type="button" aria-label="Close distortion controls">×</button>
        </header>
        <div class="distortion-overlay-body">
          <div class="distortion-power-cell">
            <span class="distortion-cell-label">POWER</span>
            <span class="distortion-power-led"></span>
            <div class="control run-switch distortion-power" data-param="param45" data-endpoint-id="param45"
              data-min="0" data-max="1" data-step="1" data-init="0" data-control="toggle">
              <button data-value="1" type="button"><strong class="distortion-power-label">ON</strong><small>CLEAN BYPASS</small></button>
            </div>
          </div>
          <div class="distortion-type-cell">
            <span class="distortion-cell-label">CHARACTER</span>
            <div class="control distortion-types" data-param="param46" data-endpoint-id="param46"
              data-min="0" data-max="2" data-step="1" data-init="0" data-control="buttons">
              <button data-value="0" type="button"><strong>PURE</strong><small>SUBTLE</small></button>
              <button data-value="1" type="button"><strong>MACKIE</strong><small>1202</small></button>
              <button data-value="2" type="button"><strong>PHONO</strong><small>RIAA</small></button>
            </div>
          </div>
          <div class="distortion-knob-cell">${dial("param47")}</div>
          <div class="distortion-knob-cell">${dial("param48")}</div>
        </div>
        <footer>POST OUTPUT · 4× OVERSAMPLED · TYPE CHANGES CROSSFADED</footer>
      </section>
    </div>

    <div class="mods-scrim" hidden aria-hidden="true">
      <section class="mods-overlay" id="mods-overlay" role="dialog" aria-modal="true"
        aria-labelledby="mods-title">
        <header class="mods-overlay-head">
          <div>
            <strong id="mods-title">CIRCUIT MODS</strong>
            <span class="mods-status" role="status">STOCK 303</span>
          </div>
          <button class="mods-close" type="button" aria-label="Close circuit mods">×</button>
        </header>
        <div class="mods-overlay-body">
          <div class="mod-row mod-cell" data-mod-enable="param51">
            <div class="mod-cell-head"><strong>OVERDRIVE</strong><span class="mod-cell-led"></span></div>
            <div class="mod-cell-controls">
              <div class="control run-switch mod-switch" data-param="param51" data-endpoint-id="param51"
                data-min="0" data-max="1" data-step="1" data-init="0" data-control="toggle">
                <button data-value="1" type="button"><strong class="mod-state">OFF</strong><small>ENABLE</small></button>
              </div>
              <div class="mod-knob">${dial("param52")}</div>
            </div>
            <span class="mod-cell-desc">FILTER OVERDRIVE · R62 220k → 3k3</span>
          </div>
          <div class="mod-row mod-cell" data-mod-enable="param53">
            <div class="mod-cell-head"><strong>RESO BOOST</strong><span class="mod-cell-led"></span></div>
            <div class="mod-cell-controls">
              <div class="control run-switch mod-switch" data-param="param53" data-endpoint-id="param53"
                data-min="0" data-max="1" data-step="1" data-init="0" data-control="toggle">
                <button data-value="1" type="button"><strong class="mod-state">OFF</strong><small>ENABLE</small></button>
              </div>
              <div class="mod-fixed"><span class="mod-fixed-label">FEEDBACK</span><span class="mod-fixed-box"><span>x1.22</span></span></div>
            </div>
            <span class="mod-cell-desc">x0x R97 10k → 8k2 · k x1.22</span>
          </div>
          <div class="mod-row mod-cell" data-mod-enable="param54">
            <div class="mod-cell-head"><strong>CUTOFF RANGE</strong><span class="mod-cell-led"></span></div>
            <div class="mod-cell-controls">
              <div class="control run-switch mod-switch" data-param="param54" data-endpoint-id="param54"
                data-min="0" data-max="1" data-step="1" data-init="0" data-control="toggle">
                <button data-value="1" type="button"><strong class="mod-state">OFF</strong><small>ENABLE</small></button>
              </div>
              <div class="mod-fixed"><span class="mod-fixed-label">MAXIMUM</span><span class="mod-fixed-box"><span>5 kHz</span></span></div>
            </div>
            <span class="mod-cell-desc">TOP END 2.5 kHz → 5 kHz</span>
          </div>
          <div class="mod-row mod-cell" data-mod-enable="param55">
            <div class="mod-cell-head"><strong>ENV MOD</strong><span class="mod-cell-led"></span></div>
            <div class="mod-cell-controls">
              <div class="control run-switch mod-switch" data-param="param55" data-endpoint-id="param55"
                data-min="0" data-max="1" data-step="1" data-init="0" data-control="toggle">
                <button data-value="1" type="button"><strong class="mod-state">OFF</strong><small>ENABLE</small></button>
              </div>
              <div class="mod-fixed"><span class="mod-fixed-label">RANGE</span><span class="mod-fixed-box"><span>x3</span></span></div>
            </div>
            <span class="mod-cell-desc">SWEEP RANGE TRIPLED · DF</span>
          </div>
          <div class="mod-row mod-cell" data-mod-enable="param56">
            <div class="mod-cell-head"><strong>SLIDE TIME</strong><span class="mod-cell-led"></span></div>
            <div class="mod-cell-controls">
              <div class="control run-switch mod-switch" data-param="param56" data-endpoint-id="param56"
                data-min="0" data-max="1" data-step="1" data-init="0" data-control="toggle">
                <button data-value="1" type="button"><strong class="mod-state">OFF</strong><small>ENABLE</small></button>
              </div>
              <div class="mod-knob">${dial("param57")}</div>
            </div>
            <span class="mod-cell-desc">SLIDE POT IN SERIES · 22–132 ms</span>
          </div>
          <div class="mod-row mod-cell" data-mod-enable="param58">
            <div class="mod-cell-head"><strong>SOFT ATTACK</strong><span class="mod-cell-led"></span></div>
            <div class="mod-cell-controls">
              <div class="control run-switch mod-switch" data-param="param58" data-endpoint-id="param58"
                data-min="0" data-max="1" data-step="1" data-init="0" data-control="toggle">
                <button data-value="1" type="button"><strong class="mod-state">OFF</strong><small>ENABLE</small></button>
              </div>
              <div class="mod-knob">${dial("param59")}</div>
            </div>
            <span class="mod-cell-desc">VCA SOFT ATTACK · ENV + ACCENT</span>
          </div>
        </div>
        <footer><span>PARAM 51–59 · DEVIL FISH / X0X</span><span class="mods-footer-state">DEFAULTS = STOCK</span></footer>
      </section>
    </div>

    <section class="program-strip">
      <div class="program-header">
        <div class="program-title">
          <b>16 STEP</b><span>PATTERN PROGRAMMER</span>
          <small class="program-context">CLASSIC PROGRAMMING</small>
          <span class="program-legend" aria-hidden="true"><i class="legend-a">A</i><em>ACCENT</em><i class="legend-s">S</i><em>SLIDE</em><i class="legend-play"></i><em>PLAYING</em></span>
        </div>
        <div class="utility">
          <span class="selection-caption">STEP 01 · C2 · OCT +0</span>
          <span class="step-position" role="status">-- / 16</span>
          <button class="studio-toggle" data-view="classic" aria-pressed="false" aria-label="Open Studio edit mode" aria-keyshortcuts="M"
            title="Switch editor · keyboard shortcut M">
            <i></i><span class="classic-label">CLASSIC</span><span class="studio-label">STUDIO</span><span class="arp-label">ARP</span>
          </button>

        </div>
      </div>
      <div class="step-row">${steps}</div>
      <div class="editor classic-editor" aria-hidden="false">
        <div class="edit-status">
          <span class="edit-caption">SELECT STEP · CHOOSE KEY</span>
          <strong class="edit-readout">--</strong>
          <span class="octave-indicator"></span>
        </div>
        <div class="keyboard"><div class="keyboard-head"><span class="keyboard-title">KEYBOARD</span><span class="keyboard-hint">TONHÖHE DES GEWÄHLTEN STEPS</span></div><div class="keyboard-keys">${pitchKeys}</div></div>
        <div class="time-controls">
          <button class="function-button" data-transpose="-12" title="Transpose the selected step down one octave."><strong>OCT −</strong><small>TRANSPOSE</small></button>
          <button class="function-button" data-transpose="12" title="Transpose the selected step up one octave."><strong>OCT +</strong><small>TRANSPOSE</small></button>
          <button class="function-button" data-flag="1" title="Toggle the selected step between Gate and Rest."><strong>GATE</strong><small>REST / ON</small></button>
          <button class="function-button" data-flag="2" title="Toggle Accent for the selected step."><strong>ACCENT</strong><small>DYNAMICS</small></button>
          <button class="function-button" data-flag="4" title="Toggle Slide into the next active step."><strong>SLIDE</strong><small>LEGATO</small></button>
          <button class="function-button" data-classic-action="clear-step" title="Reset the selected step to its default pitch and timing state."><strong>CLEAR</strong><small>THIS STEP</small></button>
        </div>
      </div>
      <div class="editor arp-editor" aria-hidden="true">
        <div class="edit-status arp-status">
          <span class="edit-caption">ARPEGGIATOR</span>
          <strong class="arp-readout">OFF</strong>
          <button class="arp-capture" type="button"
            data-tooltip="Writes what the arp is playing into the 16-step pattern: a bank phrase is copied exactly (tiled to 16 steps, normalized to the root); a figure freezes the last note played on each step. Undo works as usual.">
            <strong>→ PATTERN</strong><small>CAPTURE</small>
          </button>
          <span class="octave-indicator arp-hint">PATTERN GIBT GATE · ACCENT · SLIDE</span>
        </div>
        <div class="arp-direction-cell">
          <span class="edit-caption">DIRECTION</span>
          <div class="control arp-direction" data-param="param61" data-endpoint-id="param61"
            data-min="0" data-max="16" data-step="1" data-init="0" data-control="buttons"
            data-tooltip="Arpeggio figure over the held notes; PHRASE plays the phrase bank transposed by the keys.">
            <button data-value="1" type="button" data-tooltip="Up: plays the held notes bottom to top."><strong>UP</strong><small>ASCEND</small></button>
            <button data-value="2" type="button" data-tooltip="Down: plays the held notes top to bottom."><strong>DOWN</strong><small>DESCEND</small></button>
            <button data-value="3" type="button" data-tooltip="Up-Down: rises then falls without repeating the turning points."><strong>UP-DN</strong><small>EXCL</small></button>
            <button data-value="5" type="button" data-tooltip="Up-Down+: rises then falls and repeats the top and bottom note."><strong>UP-DN+</strong><small>INCL</small></button>
            <button data-value="6" type="button" data-tooltip="Down-Up: falls then rises without repeating the turning points."><strong>DN-UP</strong><small>EXCL</small></button>
            <button data-value="7" type="button" data-tooltip="Down-Up+: falls then rises and repeats the bottom and top note."><strong>DN-UP+</strong><small>INCL</small></button>
            <button data-value="8" type="button" data-tooltip="Played: repeats the notes in the order the keys were pressed."><strong>PLAYED</strong><small>ORDER</small></button>
            <button data-value="9" type="button" data-tooltip="Double: walks upward and plays every note twice."><strong>DOUBLE</strong><small>TWICE</small></button>
            <button data-value="10" type="button" data-tooltip="Converge: alternates from the outside in - lowest, highest, second lowest."><strong>CONV</strong><small>OUT-IN</small></button>
            <button data-value="11" type="button" data-tooltip="Diverge: alternates from the inside out."><strong>DIV</strong><small>IN-OUT</small></button>
            <button data-value="12" type="button" data-tooltip="Pinky: bounces the highest note against the rising line, like a pedal tone."><strong>PINKY</strong><small>TOP PED</small></button>
            <button data-value="13" type="button" data-tooltip="Thumb: bounces the lowest note against the rising line, like a pedal tone."><strong>THUMB</strong><small>BASS PED</small></button>
            <button data-value="4" type="button" data-tooltip="Random: reproducible random order that never repeats a note directly."><strong>RND</strong><small>FREE</small></button>
            <button data-value="14" type="button" data-tooltip="Rnd-1: shuffles the notes once, then loops that order."><strong>RND-1</strong><small>LOOPED</small></button>
            <button data-value="15" type="button" data-tooltip="Walk: drunken walk - one random step up or down at a time."><strong>WALK</strong><small>DRUNK</small></button>
            <button data-value="16" type="button" data-tooltip="Phrase: plays a phrase from the bank, transposed by the held keys; choose it below."><strong>PHRASE</strong><small>BANK</small></button>
          </div>
        </div>
        <div class="arp-tools-cell">
          <div class="arp-tools-row">
            <div class="arp-tool-block">
              <span class="edit-caption">OCTAVES</span>
              <div class="control silver-stepper" data-param="param62" data-endpoint-id="param62"
                data-min="1" data-max="4" data-step="1" data-init="1" data-control="stepper"
                data-tooltip="How many octaves the arpeggio spans above the held notes.">
                <div class="led-box"><span class="stepper-value">1</span></div>
                <div class="stepper-buttons"><button data-step="-1" type="button" aria-label="Octaves down">−</button><button data-step="1" type="button" aria-label="Octaves up">+</button></div>
              </div>
            </div>
            <div class="arp-tool-block">
              <span class="edit-caption">HOLD</span>
              <div class="control run-switch arp-hold" data-param="param63" data-endpoint-id="param63"
                data-min="0" data-max="1" data-step="1" data-init="0" data-control="toggle"
                data-tooltip="Latch: keeps the chord arpeggiating after the keys are released.">
                <button data-value="1" type="button"><strong class="arp-hold-label">OFF</strong><small>LATCH</small></button>
              </div>
            </div>
          </div>
          <div class="arp-phrase-row">
            <span class="edit-caption">PHRASE</span>
            <div class="control silver-stepper arp-phrase" data-param="param64" data-endpoint-id="param64"
              data-min="0" data-max="90" data-step="1" data-init="0" data-control="stepper"
              data-tooltip="Phrase bank for the PHRASE figure: 00 plays your own pattern, 01-90 play the curated bank, transposed by the held keys.">
              <div class="led-box arp-phrase-display" role="button" tabindex="0" aria-haspopup="menu" aria-expanded="false"><span class="stepper-value">PATTERN</span></div>
              <div class="stepper-buttons"><button data-step="-1" type="button" aria-label="Previous phrase">−</button><button data-step="1" type="button" aria-label="Next phrase">+</button></div>
            </div>
            <div class="phrase-menu" role="menu" hidden></div>
          </div>
        </div>
      </div>
      <div class="studio-editor" aria-hidden="true">
        <div class="studio-matrix" aria-label="Studio step editor">
          <div class="studio-ruler"><span class="studio-lane-label"></span><div class="studio-lane-cells">${studioRuler}</div></div>
          ${studioLanes}
          <div class="studio-lane studio-contour" data-lane="contour">
            <span class="studio-lane-label">BASS LINE</span>
            <div class="studio-lane-cells studio-contour-groups">${studioContour}</div>
          </div>
          <div class="studio-lane studio-pitchgate" data-lane="pitchgate">
            <span class="studio-lane-label">PITCH<br>GATE</span>
            <div class="studio-lane-cells">${studioPitchGate}</div>
          </div>
        </div>
        <div class="studio-tools">
          <div class="studio-tool-head">
            <span class="studio-badge">STUDIO</span>
            <button class="studio-scale" type="button" aria-haspopup="menu" aria-expanded="false"
              aria-label="Generation scale Minor Pentatonic; click to choose a scale"
              data-tooltip="Choose the scale that Generate, Mutate and note edits snap to.">
              <span>SCALE</span><strong>MIN PENTA</strong><span aria-hidden="true">▾</span>
            </button>
            <div class="scale-menu" role="menu" hidden>
              ${GENERATION_SCALES.map((scale, index) => `
              <button type="button" role="menuitemradio" data-scale="${index}"
                data-tooltip="${scale.label} — ${scale.degrees.length} notes per octave."><span>${scale.label}</span><small>${scale.sub}</small></button>`).join("")}
            </div>
          </div>
          <div class="studio-groups">
            <div class="studio-group"><span class="studio-group-label">EDIT<i></i></span>
              <div class="studio-actions">
                <button data-studio-action="undo" data-tooltip="Undo the last pattern edit."><b>↶</b><small>UNDO</small></button>
                <button data-studio-action="redo" data-tooltip="Redo the last undone edit."><b>↷</b><small>REDO</small></button>
                <button data-studio-action="copy" data-tooltip="Copy the current pattern."><b>⧉</b><small>COPY</small></button>
                <button data-studio-action="paste" data-tooltip="Paste the copied pattern."><b>▣</b><small>PASTE</small></button>
              </div></div>
            <div class="studio-group"><span class="studio-group-label">ARRANGE<i></i></span>
              <div class="studio-actions">
                <button data-studio-action="rotate-left" data-tooltip="Rotate the whole pattern one step to the left."><b>◀</b><small>ROTATE</small></button>
                <button data-studio-action="rotate-right" data-tooltip="Rotate the whole pattern one step to the right."><b>▶</b><small>ROTATE</small></button>
                <button data-studio-action="reverse" data-tooltip="Play the pattern backwards — reverses the step order."><b>⇄</b><small>REVERSE</small></button>
                <button data-studio-action="pitch-mirror" data-tooltip="Mirror every pitch inside its range."><b>◇</b><small>MIRROR</small></button>
              </div></div>
            <div class="studio-group"><span class="studio-group-label">SELECTED STEP<i></i></span>
              <div class="studio-actions">
                <button data-studio-action="transpose-down" data-tooltip="Selected step one octave down."><b>−12</b><small>OCT</small></button>
                <button data-studio-action="transpose-up" data-tooltip="Selected step one octave up."><b>+12</b><small>OCT</small></button>
                <button data-studio-action="rest" data-tooltip="Toggle gate and rest for the selected step."><b>—</b><small>REST</small></button>
                <button data-studio-action="choose-note" aria-haspopup="dialog" data-tooltip="Choose an exact note for the selected steps."><b>♪</b><small>NOTE</small></button>
              </div></div>
            <div class="studio-group"><span class="studio-group-label">GENERATE<i></i></span>
              <div class="studio-actions">
                <button data-studio-action="generate" data-tooltip="Generate a new phrase inside the selected scale."><b>✣</b><small>PHRASE</small></button>
                <button data-studio-action="mutate" data-tooltip="Nudge the current phrase without losing its character."><b>≈</b><small>MUTATE</small></button>
                <button data-studio-action="scale" data-tooltip="Next scale for Generate and Mutate."><b>◧</b><small>SCALE</small></button>
                <button data-studio-action="select-all" data-tooltip="Select all 16 steps."><b>16</b><small>ALL</small></button>
              </div></div>
          </div>
          <span class="studio-toast" role="status"></span>
          <div class="studio-hint">RECHTSKLICK AUF STEP · TONHÖHE · SHIFT FÜR FEINWERTE</div>
        </div>
      </div>
    </section>
    <div class="footer-mark">ACIDIFY · SILVER SERIES · ANALOG-MODELLED BASSLINE · AMORPH EDITION</div>
  </div>
  <section class="pitch-menu" role="dialog" aria-modal="false" aria-hidden="true"
    aria-labelledby="pitch-menu-title" hidden>
    <header class="pitch-menu-head">
      <div>
        <strong class="pitch-menu-title" id="pitch-menu-title">CHOOSE NOTE</strong>
        <span>DIRECT STEP PITCH · ROOT-RELATIVE RANGE</span>
      </div>
      <button class="pitch-menu-close" type="button" aria-label="Close note chooser">×</button>
    </header>
    <div class="pitch-menu-grid" role="radiogroup" aria-label="Available notes">
      ${pitchChoices}
    </div>
    <footer class="pitch-menu-foot">25 SEMITONES · THREE VISIBLE OCTAVE LEVELS</footer>
  </section>
  <div class="tooltip-bubble" role="tooltip" hidden></div>
</div>`;
  }
}

const ACIDIFY_TAG = "acidify-patch-view";
if (!customElements.get(ACIDIFY_TAG)) customElements.define(ACIDIFY_TAG, AcidifyPatchView);

export default function createPatchView(patchConnection) {
  return new AcidifyPatchView(patchConnection);
}
