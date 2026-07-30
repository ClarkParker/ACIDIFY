#!/usr/bin/env node
// Arpeggiator-Nachweis am echten Patch: Akkord per SMF in cmaj render,
// Tonhoehen pro Step per Autokorrelation, jeder Modus mit widerlegbarer
// Erwartung. Aufruf: CMAJ=<cmaj> node tools/dsp_arp_test.mjs
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const cmaj = process.env.CMAJ || process.argv[2];
if (!cmaj) throw new Error("CMAJ binary not given (env CMAJ or argv[2])");
const rate = 48000;
const temp = await mkdtemp(path.join(os.tmpdir(), "acidify-arp-"));
const source0 = await readFile(path.join(root, "ACIDIFYDSP.cmajor"), "utf8");

function withInit(source, id, value) {
  const pattern = new RegExp(`(input event float ${id}\\b[^\\n]*init:\\s*)-?[0-9.]+`, "g");
  let count = 0;
  const result = source.replace(pattern, (_, prefix) => {
    count += 1;
    return `${prefix}${value}`;
  });
  if (count !== 2) throw new Error(`init ${id}: expected 2 declarations, got ${count}`);
  return result;
}

// Type-0-SMF, 480 ticks/Viertel, 120 BPM. events: [{tick, on, note}]
function buildMidi(events) {
  const bytes = [0x00, 0xff, 0x51, 0x03, 0x07, 0xa1, 0x20];
  let lastTick = 0;
  const sorted = [...events].sort((a, b) => a.tick - b.tick);
  for (const event of sorted) {
    let delta = event.tick - lastTick;
    lastTick = event.tick;
    const vlq = [];
    do {
      vlq.unshift(delta & 0x7f);
      delta >>= 7;
    } while (delta > 0);
    for (let i = 0; i < vlq.length - 1; i += 1) vlq[i] |= 0x80;
    bytes.push(...vlq, event.on ? 0x90 : 0x80, event.note, event.on ? 0x6e : 0x00);
  }
  bytes.push(0x00, 0xff, 0x2f, 0x00);
  const header = [0x4d, 0x54, 0x68, 0x64, 0x00, 0x00, 0x00, 0x06, 0x00, 0x00, 0x00, 0x01, 0x01, 0xe0,
    0x4d, 0x54, 0x72, 0x6b, (bytes.length >> 24) & 0xff, (bytes.length >> 16) & 0xff, (bytes.length >> 8) & 0xff, bytes.length & 0xff];
  return Buffer.from([...header, ...bytes]);
}

function readWavMono(buffer) {
  let offset = 12;
  let fmt = null;
  let data = null;
  while (offset + 8 <= buffer.length) {
    const id = buffer.toString("ascii", offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    if (id === "fmt ") fmt = { format: buffer.readUInt16LE(offset + 8), channels: buffer.readUInt16LE(offset + 10), bits: buffer.readUInt16LE(offset + 22) };
    if (id === "data") { data = buffer.subarray(offset + 8, offset + 8 + size); break; }
    offset += 8 + size + (size & 1);
  }
  const { channels, bits } = fmt;
  const out = [];
  if (bits === 32) for (let i = 0; i + 4 * channels <= data.length; i += 4 * channels) out.push(data.readFloatLE(i));
  else if (bits === 16) for (let i = 0; i + 2 * channels <= data.length; i += 2 * channels) out.push(data.readInt16LE(i) / 32768);
  else throw new Error(`bits ${bits}`);
  return out;
}

function detectMidiNote(samples) {
  // Autokorrelation ueber MIDI 24..72 (32,7..523 Hz)
  let bestLag = -1;
  let bestScore = 0;
  let energy = 0;
  for (const v of samples) energy += v * v;
  if (energy / samples.length < 1e-7) return -1; // Stille
  for (let lag = Math.round(rate / 523.25); lag <= Math.round(rate / 32.7); lag += 1) {
    let corr = 0;
    let norm = 0;
    for (let i = 0; i + lag < samples.length; i += 1) {
      corr += samples[i] * samples[i + lag];
      norm += samples[i] * samples[i];
    }
    const score = corr / Math.max(norm, 1e-12);
    if (score > bestScore) { bestScore = score; bestLag = lag; }
  }
  if (bestLag < 0) return -1;
  const freq = rate / bestLag;
  return Math.round(69 + 12 * Math.log2(freq / 440));
}

async function render(name, { mode, octaves = 1, hold = 0, phrase = 0, midiEvents }) {
  let source = source0;
  source = withInit(source, "param9", 120);
  source = withInit(source, "param10", 1);
  source = withInit(source, "param11", 16);
  source = withInit(source, "param61", mode);
  source = withInit(source, "param62", octaves);
  source = withInit(source, "param63", hold);
  source = withInit(source, "param64", phrase);
  for (let step = 0; step < 16; step += 1) {
    source = withInit(source, `param${29 + step}`, 1); // nur Gate, kein Accent/Slide
  }
  const dir = path.join(temp, name);
  const patch = path.join(temp, `${name}.cmajorpatch`);
  const cmajorFile = path.join(temp, `${name}.cmajor`);
  await writeFile(cmajorFile, source);
  await writeFile(patch, JSON.stringify({ CmajorVersion: 1, ID: `com.test.arp.${name}`, version: "0.0.1", name, source: [`${name}.cmajor`] }));
  const midiPath = path.join(temp, `${name}.mid`);
  await writeFile(midiPath, buildMidi(midiEvents));
  const wavPath = path.join(temp, `${name}.wav`);
  const run = spawnSync(cmaj, ["render", `--rate=${rate}`, "--length=192000", `--midi=${midiPath}`, `--output=${wavPath}`, patch], { encoding: "utf8" });
  if (run.status !== 0) throw new Error(`${name}: cmaj render failed: ${run.stderr}`);
  return readFile(wavPath);
}

function stepPitches(samples, stepCount) {
  // Onset suchen, dann Fenster in der ersten Gate-Haelfte jedes 6000er-Steps
  let onset = -1;
  for (let i = 0; i < samples.length; i += 1) if (Math.abs(samples[i]) > 0.02) { onset = i; break; }
  if (onset < 0) return { onset, pitches: [] };
  const stepSamples = 6000; // 120 BPM, 16tel @48k
  const start = Math.max(0, onset - 200);
  const pitches = [];
  for (let step = 0; step < stepCount; step += 1) {
    const from = start + step * stepSamples + 400;
    pitches.push(detectMidiNote(samples.slice(from, from + 2200)));
  }
  return { onset, pitches };
}

function assertEqual(actual, expected, label) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

const CHORD = [36, 40, 43];
const holdAll = CHORD.map(note => ({ tick: 0, on: true, note }));
const results = {};

// 1) Up: 36 40 43 zyklisch
{
  const wav = readWavMono(await render("up", { mode: 1, midiEvents: holdAll }));
  const { pitches } = stepPitches(wav, 9);
  assertEqual(pitches, [36, 40, 43, 36, 40, 43, 36, 40, 43], "arp up");
  results.up = pitches.slice(0, 3);
}
// 2) Down
{
  const wav = readWavMono(await render("down", { mode: 2, midiEvents: holdAll }));
  const { pitches } = stepPitches(wav, 6);
  assertEqual(pitches, [43, 40, 36, 43, 40, 36], "arp down");
  results.down = pitches.slice(0, 3);
}
// 3) Up-Down, Endpunkte einfach: 36 40 43 40 | 36 40 43 40
{
  const wav = readWavMono(await render("updown", { mode: 3, midiEvents: holdAll }));
  const { pitches } = stepPitches(wav, 8);
  assertEqual(pitches, [36, 40, 43, 40, 36, 40, 43, 40], "arp up-down");
  results.updown = pitches.slice(0, 4);
}
// 4) Random: deterministisch (zwei Renders bit-identisch), Pool-treu,
//    mindestens zwei verschiedene Tonhoehen, keine Direkt-Wiederholung
{
  const first = await render("rnd1", { mode: 4, midiEvents: holdAll });
  const second = await render("rnd2", { mode: 4, midiEvents: holdAll });
  if (!first.equals(second)) throw new Error("arp random is not deterministic");
  const { pitches } = stepPitches(readWavMono(first), 12);
  for (const pitch of pitches) {
    if (!CHORD.includes(pitch)) throw new Error(`arp random left the pool: ${JSON.stringify(pitches)}`);
  }
  if (new Set(pitches).size < 2) throw new Error(`arp random has no variety: ${JSON.stringify(pitches)}`);
  for (let i = 1; i < pitches.length; i += 1) {
    if (pitches[i] === pitches[i - 1]) throw new Error(`arp random repeats directly: ${JSON.stringify(pitches)}`);
  }
  results.random = pitches.slice(0, 8);
}
// 5) Zwei Oktaven aufwaerts
{
  const wav = readWavMono(await render("oct2", { mode: 1, octaves: 2, midiEvents: holdAll }));
  const { pitches } = stepPitches(wav, 6);
  assertEqual(pitches, [36, 40, 43, 48, 52, 55], "arp octaves=2");
  results.octaves2 = pitches;
}
// 6) Hold: Noten bei Tick 960 loslassen (2 Viertel = 1 s) — mit Hold laeuft
//    der Arp weiter, ohne Hold wird der Rest still
{
  const releaseAll = [...holdAll, ...CHORD.map(note => ({ tick: 960, on: false, note }))];
  const held = readWavMono(await render("hold1", { mode: 1, hold: 1, midiEvents: releaseAll }));
  const tailHeld = held.slice(144000);
  const rmsHeld = Math.sqrt(tailHeld.reduce((a, v) => a + v * v, 0) / tailHeld.length);
  if (rmsHeld < 0.003) throw new Error(`arp hold released early: tail rms ${rmsHeld}`);
  const unheld = readWavMono(await render("hold0", { mode: 1, hold: 0, midiEvents: releaseAll }));
  const tailFree = unheld.slice(144000);
  const rmsFree = Math.sqrt(tailFree.reduce((a, v) => a + v * v, 0) / tailFree.length);
  if (rmsFree > 0.0005) throw new Error(`arp without hold kept playing: tail rms ${rmsFree}`);
  results.hold = { heldTailRms: +rmsHeld.toFixed(5), freeTailRms: +rmsFree.toFixed(6) };
}
// 8) Neue Figuren (2.5.0) — jede mit exakter Erwartung
{
  const wav = readWavMono(await render("updninc", { mode: 5, midiEvents: holdAll }));
  assertEqual(stepPitches(wav, 8).pitches, [36, 40, 43, 43, 40, 36, 36, 40], "arp up-down inclusive");
}
{
  const wav = readWavMono(await render("dnup", { mode: 6, midiEvents: holdAll }));
  assertEqual(stepPitches(wav, 6).pitches, [43, 40, 36, 40, 43, 40], "arp down-up exclusive");
}
{
  const wav = readWavMono(await render("dnupinc", { mode: 7, midiEvents: holdAll }));
  assertEqual(stepPitches(wav, 8).pitches, [43, 40, 36, 36, 40, 43, 43, 40], "arp down-up inclusive");
}
{
  // Played: Anschlagsreihenfolge E2, C2, G2
  const played = [
    { tick: 0, on: true, note: 40 },
    { tick: 2, on: true, note: 36 },
    { tick: 4, on: true, note: 43 },
  ];
  const wav = readWavMono(await render("played", { mode: 8, midiEvents: played }));
  assertEqual(stepPitches(wav, 6).pitches, [40, 36, 43, 40, 36, 43], "arp played order");
}
{
  const wav = readWavMono(await render("double", { mode: 9, midiEvents: holdAll }));
  assertEqual(stepPitches(wav, 8).pitches, [36, 36, 40, 40, 43, 43, 36, 36], "arp double");
}
{
  const wav = readWavMono(await render("conv", { mode: 10, midiEvents: holdAll }));
  assertEqual(stepPitches(wav, 6).pitches, [36, 43, 40, 36, 43, 40], "arp converge");
}
{
  const wav = readWavMono(await render("div", { mode: 11, midiEvents: holdAll }));
  assertEqual(stepPitches(wav, 6).pitches, [40, 43, 36, 40, 43, 36], "arp diverge");
}
{
  const wav = readWavMono(await render("pinky", { mode: 12, midiEvents: holdAll }));
  assertEqual(stepPitches(wav, 6).pitches, [36, 43, 40, 43, 36, 43], "arp pinky");
}
{
  const wav = readWavMono(await render("thumb", { mode: 13, midiEvents: holdAll }));
  assertEqual(stepPitches(wav, 6).pitches, [36, 40, 36, 43, 36, 40], "arp thumb pedal");
}
{
  // Rnd-Once: erste Runde ist Permutation des Pools, zweite Runde identisch
  const first = await render("rndonce1", { mode: 14, midiEvents: holdAll });
  const second = await render("rndonce2", { mode: 14, midiEvents: holdAll });
  if (!first.equals(second)) throw new Error("arp rnd-once is not deterministic");
  const { pitches } = stepPitches(readWavMono(first), 6);
  const round1 = [...pitches.slice(0, 3)].sort((a, b) => a - b);
  assertEqual(round1, CHORD, "arp rnd-once permutation");
  assertEqual(pitches.slice(3, 6), pitches.slice(0, 3), "arp rnd-once loops");
}
{
  // Walk: poolgetreu und nur Nachbarschritte im sortierten Pool
  const wav = readWavMono(await render("walk", { mode: 15, midiEvents: holdAll }));
  const { pitches } = stepPitches(wav, 12);
  for (const pitch of pitches) {
    if (!CHORD.includes(pitch)) throw new Error(`arp walk left the pool: ${JSON.stringify(pitches)}`);
  }
  for (let i = 1; i < pitches.length; i += 1) {
    const step = Math.abs(CHORD.indexOf(pitches[i]) - CHORD.indexOf(pitches[i - 1]));
    if (step > 1) throw new Error(`arp walk jumped: ${JSON.stringify(pitches)}`);
  }
  results.walk = pitches.slice(0, 8);
}
// 9) Phrase-Modus
{
  // Phrase 0 = eigenes Pattern, transponiert von der gehaltenen Taste (E2 = 40)
  const single = [{ tick: 0, on: true, note: 40 }];
  const wav = readWavMono(await render("phr0", { mode: 16, phrase: 0, midiEvents: single }));
  // Phrase 0 bleibt transportgebunden; der Harness liefert die Tick-0-Note
  // erst an der Latenzgrenze, hoerbar ist deshalb ab Pattern-Step 1:
  // rel Root 0 7 0 12 10 7 3, Step 8 wieder 0.
  assertEqual(stepPitches(wav, 8).pitches, [40, 47, 40, 52, 50, 47, 43, 40], "phrase 0 own pattern transposed");
}
{
  // Phrase aus der Bank gegen die JSON-Quelle (OCT 8TH = Bank 1)
  const table = JSON.parse(await readFile(path.join(root, "tools", "data", "arp_phrases.json"), "utf8"));
  const bank1 = table[0];
  const expected = bank1.steps.slice(0, 8).map(step => (step.gate ? 40 + step.pitch : -1));
  const single = [{ tick: 0, on: true, note: 40 }];
  const wav = readWavMono(await render("phr1", { mode: 16, phrase: 1, midiEvents: single }));
  assertEqual(stepPitches(wav, 8).pitches, expected, `phrase 1 (${bank1.name}) vs JSON`);
  results.phraseBank1 = { name: bank1.name, pitches: expected.slice(0, 4) };
}
{
  // Melodische Bank-Phrase gegen JSON (ACID UP = Bank 13)
  const table = JSON.parse(await readFile(path.join(root, "tools", "data", "arp_phrases.json"), "utf8"));
  const bank = table[12];
  const expected = bank.steps.slice(0, 8).map(step => (step.gate ? 40 + step.pitch : -1));
  const single = [{ tick: 0, on: true, note: 40 }];
  const wav = readWavMono(await render("phr13", { mode: 16, phrase: 13, midiEvents: single }));
  assertEqual(stepPitches(wav, 8).pitches, expected, `phrase 13 (${bank.name}) vs JSON`);
}
{
  // Mehrere gehaltene Noten: Transposition wandert pro Phrasen-Zyklus
  const two = [{ tick: 0, on: true, note: 36 }, { tick: 0, on: true, note: 43 }];
  const wav = readWavMono(await render("phrmulti", { mode: 16, phrase: 1, midiEvents: two }));
  const { pitches } = stepPitches(wav, 18);
  assertEqual(pitches.slice(0, 2), [36, 48], "phrase multi cycle 1 base");
  assertEqual(pitches.slice(16, 18), [43, 55], "phrase multi cycle 2 base");
}

// 7) Arp aus: eingehender Akkord darf den laufenden Sequencer nicht beruehren
{
  const withChord = await render("off1", { mode: 0, midiEvents: holdAll });
  const withoutChord = await render("off2", { mode: 0, midiEvents: [] });
  if (!withChord.equals(withoutChord)) throw new Error("arp off: incoming MIDI changed the running sequencer");
  results.offBitIdentical = true;
}

console.log(JSON.stringify({ ok: true, sampleRate: rate, results }, null, 1));
