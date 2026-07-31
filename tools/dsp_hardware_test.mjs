#!/usr/bin/env node
// Hardware-Verhaltens-Pruefsteine (R5, docs/SOUND_GAP_ANALYSIS.md):
// Jeder belegte Geraete-Fakt wird hier als scheiterbarer Test kodiert.
// Aufruf: CMAJ=<cmaj> node tools/dsp_hardware_test.mjs
//
// Kodierte Fakten:
// 1. Roland-Stimmvorschrift (x0xb0x-Fabmanual, VCF): C1, Cutoff-Knopf 50 %,
//    Resonanz max, Saegezahn -> Resonanzspitze 500 Hz +-100.
// 2. Roland-Servicenotes S. 8: mehr Env Mod senkt die Basis-Cutoff
//    („equal to turning CUTOFF knob counterclockwise") — der eingeschwungene
//    Ausklang wird dumpfer, monoton ueber den Reglerweg.
// 3. Dieselbe Seite: das Sweep-Minimum faellt mit Env Mod unter die Basis.
// 4. Serviceplan S. 5: Slide-RC sitzt auf der Pitch-CV (1 Okt/V) — Auf- und
//    Abwaertsslides sind tonhoehensymmetrisch (tau = 22 ms in Oktaven).
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
const temp = await mkdtemp(path.join(os.tmpdir(), "acidify-hw-"));
const source0 = await readFile(path.join(root, "ACIDIFYDSP.cmajor"), "utf8");

function withInit(source, id, value) {
  const pattern = new RegExp(`(input event float ${id}\\b[^\\n]*init:\\s*)-?[0-9.]+`, "g");
  let count = 0;
  const result = source.replace(pattern, (_, prefix) => { count += 1; return `${prefix}${value}`; });
  if (count !== 2) throw new Error(`init ${id}: expected 2 declarations, got ${count}`);
  return result;
}

// Type-0-SMF, 480 Ticks/Viertel, 120 BPM.
function buildMidi(events) {
  const bytes = [0x00, 0xff, 0x51, 0x03, 0x07, 0xa1, 0x20];
  let lastTick = 0;
  for (const event of [...events].sort((a, b) => a.tick - b.tick)) {
    let delta = event.tick - lastTick;
    lastTick = event.tick;
    const vlq = [];
    do { vlq.unshift(delta & 0x7f); delta >>= 7; } while (delta > 0);
    for (let i = 0; i < vlq.length - 1; i += 1) vlq[i] |= 0x80;
    bytes.push(...vlq, event.on ? 0x90 : 0x80, event.note, event.on ? 0x50 : 0x00);
  }
  bytes.push(0x00, 0xff, 0x2f, 0x00);
  const header = [0x4d, 0x54, 0x68, 0x64, 0, 0, 0, 6, 0, 0, 0, 1, 0x01, 0xe0,
    0x4d, 0x54, 0x72, 0x6b, (bytes.length >> 24) & 0xff, (bytes.length >> 16) & 0xff, (bytes.length >> 8) & 0xff, bytes.length & 0xff];
  return Buffer.from([...header, ...bytes]);
}

function readWavMono(buffer) {
  let offset = 12, fmt = null, data = null;
  while (offset + 8 <= buffer.length) {
    const id = buffer.toString("ascii", offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    if (id === "fmt ") fmt = { channels: buffer.readUInt16LE(offset + 10), bits: buffer.readUInt16LE(offset + 22) };
    if (id === "data") { data = buffer.subarray(offset + 8, offset + 8 + size); break; }
    offset += 8 + size + (size & 1);
  }
  const out = [];
  if (fmt.bits === 32) for (let i = 0; i + 4 * fmt.channels <= data.length; i += 4 * fmt.channels) out.push(data.readFloatLE(i));
  else for (let i = 0; i + 2 * fmt.channels <= data.length; i += 2 * fmt.channels) out.push(data.readInt16LE(i) / 32768);
  return out;
}

async function render(name, params, midiEvents, seconds = 3.0) {
  let s = source0;
  s = withInit(s, "param10", 0);
  for (const [id, value] of Object.entries(params)) s = withInit(s, id, value);
  const file = path.join(temp, `${name}.cmajor`);
  const patch = path.join(temp, `${name}.cmajorpatch`);
  await writeFile(file, s);
  await writeFile(patch, JSON.stringify({ CmajorVersion: 1, ID: `com.test.hw.${name}`, version: "0.0.1", name, source: [`${name}.cmajor`] }));
  const midiPath = path.join(temp, `${name}.mid`);
  await writeFile(midiPath, buildMidi(midiEvents));
  const wavPath = path.join(temp, `${name}.wav`);
  const run = spawnSync(cmaj, ["render", `--rate=${rate}`, `--length=${Math.round(rate * seconds)}`, `--midi=${midiPath}`, `--output=${wavPath}`, patch], { encoding: "utf8" });
  if (run.status !== 0) throw new Error(`${name}: cmaj render failed: ${run.stderr}`);
  return readWavMono(await readFile(wavPath));
}

function fft(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i += 1) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len;
    for (let i = 0; i < n; i += len) {
      for (let k = 0; k < len / 2; k += 1) {
        const c = Math.cos(ang * k), s = Math.sin(ang * k);
        const ur = re[i + k], ui = im[i + k];
        const vr = re[i + k + len / 2] * c - im[i + k + len / 2] * s;
        const vi = re[i + k + len / 2] * s + im[i + k + len / 2] * c;
        re[i + k] = ur + vr; im[i + k] = ui + vi;
        re[i + k + len / 2] = ur - vr; im[i + k + len / 2] = ui - vi;
      }
    }
  }
}

function spectrum(samples, startSeconds, n = 32768) {
  const start = Math.round(rate * startSeconds);
  const re = new Array(n), im = new Array(n).fill(0);
  for (let i = 0; i < n; i += 1) {
    const w = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (n - 1));
    re[i] = (samples[start + i] ?? 0) * w;
  }
  fft(re, im);
  const bins = n / 2;
  const mag = new Array(bins).fill(0);
  for (let i = 1; i < bins; i += 1) mag[i] = re[i] * re[i] + im[i] * im[i];
  return { mag, hz: i => (i * rate) / n, bins };
}

function centroidAndBand(samples, startSeconds) {
  const { mag, hz, bins } = spectrum(samples, startSeconds);
  let total = 0, cNum = 0, above800 = 0;
  for (let i = 1; i < bins; i += 1) {
    total += mag[i];
    cNum += mag[i] * hz(i);
    if (hz(i) >= 800) above800 += mag[i];
  }
  return {
    centroidHz: cNum / Math.max(total, 1e-30),
    above800Db: 10 * Math.log10(above800 / Math.max(total, 1e-30) + 1e-30),
  };
}

function harmonicPower(samples, startSeconds, fundamentalHz, k) {
  const { mag, hz, bins } = spectrum(samples, startSeconds);
  const target = fundamentalHz * k;
  const center = Math.round((target / rate) * 32768);
  let sum = 0;
  for (let i = Math.max(1, center - 2); i <= Math.min(bins - 1, center + 2); i += 1) sum += mag[i];
  return sum;
}

// Resonanzlage quellunabhaengig: Verhaeltnis der Obertonpegel bei Resonanz
// max gegen Resonanz null. Der Quellabfall (1/n) und globale Pegel kuerzen
// sich; das Maximum des Verhaeltnisses liegt an der Resonanzueberhoehung.
function resonancePeakByRatio(wavRes, wavFlat, startSeconds, fundamentalHz, kLo, kHi) {
  let bestK = kLo, best = -Infinity;
  const ratios = {};
  for (let k = kLo; k <= kHi; k += 1) {
    const r = harmonicPower(wavRes, startSeconds, fundamentalHz, k)
            / Math.max(harmonicPower(wavFlat, startSeconds, fundamentalHz, k), 1e-30);
    ratios[k] = Number((10 * Math.log10(r)).toFixed(2));
    if (r > best) { best = r; bestK = k; }
  }
  return { peakHz: bestK * fundamentalHz, ratiosDb: ratios };
}

// Zweipoliger 350-Hz-Tiefpass: isoliert den Grundton, damit Obertoene keine
// zusaetzlichen Nulldurchgaenge erzeugen.
function fundamentalOnly(samples) {
  const a = 1 - Math.exp((-2 * Math.PI * 350) / rate);
  let y1 = 0, y2 = 0;
  const out = new Array(samples.length);
  for (let i = 0; i < samples.length; i += 1) {
    y1 += a * (samples[i] - y1);
    y2 += a * (y1 - y2);
    out[i] = y2;
  }
  return out;
}

// Instantane Frequenz aus steigenden Nulldurchgaengen (linear interpoliert).
function pitchTrack(samples) {
  const crossings = [];
  for (let i = 1; i < samples.length; i += 1) {
    if (samples[i - 1] <= 0 && samples[i] > 0) {
      const frac = -samples[i - 1] / (samples[i] - samples[i - 1]);
      crossings.push(i - 1 + frac);
    }
  }
  const track = [];
  for (let k = 1; k < crossings.length; k += 1) {
    const period = crossings[k] - crossings[k - 1];
    if (period > 0) track.push({ t: crossings[k] / rate, hz: rate / period });
  }
  return track;
}

// Zeit vom Slide-Start bis zum Kreuzen der Zielschwelle, beides aus der
// Tonhoehenspur selbst: erste Schwellenkreuzung nach dem Attackfenster,
// als Startreferenz der letzte Spurpunkt davor, der noch im 3%-Band der
// Startfrequenz lag. cmaj-Render-Latenz und MIDI-Zeitbasis kuerzen sich
// damit vollstaendig heraus.
function slideCrossingTime(track, startHz, thresholdHz, upward, earliestSeconds) {
  const crossed = f => (upward ? f >= thresholdHz : f <= thresholdHz);
  const inStartBand = f => Math.abs(f - startHz) <= startHz * 0.03;
  for (let i = 0; i < track.length; i += 1) {
    if (track[i].t < earliestSeconds || !crossed(track[i].hz)) continue;
    for (let j = i - 1; j >= 0; j -= 1) {
      if (inStartBand(track[j].hz)) return track[i].t - track[j].t;
    }
    return null;
  }
  return null;
}

function assertOk(condition, label, detail) {
  if (!condition) throw new Error(`${label}: ${JSON.stringify(detail)}`);
}

const results = {};
const single36 = [{ tick: 0, on: true, note: 36 }];

// 1) Roland-Stimmvorschrift: C1 (65,4 Hz), Cutoff 50 %, Resonanz max ->
//    Resonanzspitze 500 Hz +-100 im eingeschwungenen Teil.
{
  const wavRes = await render("tuning", { param2: 0.5, param3: 1.0, param4: 0.0, param7: 0 }, single36);
  const wavFlat = await render("tuningflat", { param2: 0.5, param3: 0.0, param4: 0.0, param7: 0 }, single36);
  const { peakHz, ratiosDb } = resonancePeakByRatio(wavRes, wavFlat, 2.0, 65.406, 2, 16);
  assertOk(peakHz >= 400 && peakHz <= 600, "Roland tuning 500 Hz +-100", { peakHz, ratiosDb });
  results.rolandTuningPeakHz = Number(peakHz.toFixed(1));
}

// 2+3) Env Mod senkt Basis und Ausklang monoton (Servicenotes S. 8).
{
  const tails = {};
  for (const e of [0.0, 0.5, 1.0]) {
    const wav = await render(`env${e * 100}`, { param2: 0.45, param3: 0.72, param4: e }, single36);
    tails[e] = centroidAndBand(wav, 2.0);
  }
  assertOk(tails[0.5].centroidHz < tails[0.0].centroidHz * 0.97
        && tails[1.0].centroidHz < tails[0.5].centroidHz * 0.97,
    "Env-Mod tail monotonically darker", tails);
  assertOk(tails[0.0].above800Db - tails[1.0].above800Db >= 4,
    "Env-Mod max at least 4 dB darker above 800 Hz", tails);
  results.envModTails = {
    e0: Number(tails[0.0].centroidHz.toFixed(1)),
    e05: Number(tails[0.5].centroidHz.toFixed(1)),
    e1: Number(tails[1.0].centroidHz.toFixed(1)),
  };
}

// 4) Slide-Symmetrie in der CV-Domaene: Zeit bis zur geometrischen
//    Mittenfrequenz muss auf- und abwaerts gleich sein (tau = 22 ms).
{
  const up = [
    { tick: 0, on: true, note: 48 },
    { tick: 960, on: true, note: 60 },
    { tick: 1200, on: false, note: 48 },
    { tick: 2400, on: false, note: 60 },
  ];
  const down = [
    { tick: 0, on: true, note: 60 },
    { tick: 960, on: true, note: 48 },
    { tick: 1200, on: false, note: 60 },
    { tick: 2400, on: false, note: 48 },
  ];
  // Filter weit auf + Resonanz null, damit der Grundton den Nulldurchgang
  // dominiert; Saw. C3 = 130,8 Hz, C4 = 261,6 Hz, Mitte 185 Hz.
  const params = { param2: 1.0, param3: 0.0, param4: 0.0 };
  const wavUp = await render("slideup", params, up, 2.6);
  const wavDown = await render("slidedown", params, down, 2.6);
  const trackUp = pitchTrack(fundamentalOnly(wavUp));
  const trackDown = pitchTrack(fundamentalOnly(wavDown));
  const tUp = slideCrossingTime(trackUp, 130.8, 185.0, true, 0.6);
  const tDown = slideCrossingTime(trackDown, 261.6, 185.0, false, 0.6);
  assertOk(tUp !== null && tDown !== null, "slide crossings found", { tUp, tDown });
  const asymmetry = Math.abs(tUp - tDown) / ((tUp + tDown) / 2);
  // Hz-Domaenen-Glide (Befund 3) laege bei ~45-60 % Asymmetrie; CV-Domaene
  // ist symmetrisch bis auf die Zyklus-Quantisierung der Spur (~2-4 ms).
  assertOk(asymmetry < 0.3, "slide up/down symmetric in octaves", { tUp, tDown, asymmetry });
  // Groessenordnung der Zeitkonstante: Kreuzung der Mitte bei tau*ln(2),
  // plus bis zu ~1,5 Zyklen Spur-Lag.
  const expected = 0.022 * Math.log(2);
  assertOk(tUp > expected * 0.5 && tUp < expected * 2.2,
    "slide time constant magnitude", { tUp, expected });
  results.slide = {
    tUpMs: Number((tUp * 1000).toFixed(2)),
    tDownMs: Number((tDown * 1000).toFixed(2)),
    asymmetry: Number(asymmetry.toFixed(3)),
  };
}

// 5) Sweep-Attack-Geschwindigkeit (2.16.1): Die Cutoff-CV kennt am
//    Geraet KEINE Traegheit — nur die 100-us-MEG-Attack-Stufe (D37/
//    R152/C62); C23 ist Emitter-Bypass der Antilog-Quelle, keine
//    CV-Glaettung. Der Filter-Schwerpunkt muss deshalb schon im ersten
//    4-ms-Fenster nach Note-On hell sein. Referenz: 2.12.0/korrigiert
//    ~728 Hz; die faelschliche 10-ms-CV-Glaettung (2.13.0-2.16.0) lag
//    bei ~221 Hz und MUSS hier scheitern.
{
  const wav = await render("attack", { param2: 0.45, param3: 0.72, param4: 0.9, param5: 0.5 }, single36);
  let peak = 0;
  for (let i = 0; i < wav.length; i += 1) peak = Math.max(peak, Math.abs(wav[i]));
  // Onset = echtes VCA-Oeffnen. Schwelle 25 % vom Peak, weil vor dem
  // Oeffnen der modellierte BA662-Durchgriff (~-20 dB, dumpf) liegt —
  // seit der 4-ms-Gate-Totzone (2.17.0) ist dieses Fenster sichtbar
  // und darf den Detektor nicht fangen.
  let onset = 0;
  for (let i = 0; i < wav.length; i += 1) {
    if (Math.abs(wav[i]) > 0.25 * peak) { onset = i; break; }
  }
  const win = Math.round(rate * 0.004);
  const seg = wav.slice(onset, onset + win);
  let num = 0, den = 0;
  for (let f = 100; f <= 4000; f += 50) {
    const w = 2 * Math.PI * f / rate, c = Math.cos(w);
    let s0 = 0, s1 = 0, s2 = 0;
    for (let i = 0; i < seg.length; i += 1) { s0 = seg[i] + 2 * c * s1 - s2; s2 = s1; s1 = s0; }
    const p = Math.max(s1 * s1 + s2 * s2 - 2 * c * s1 * s2, 0);
    num += f * p; den += p;
  }
  const firstWindowCentroidHz = den > 1e-30 ? num / den : 0;
  assertOk(firstWindowCentroidHz >= 500,
    "sweep attack fast (no CV lag): first 4 ms window bright", { firstWindowCentroidHz });
  results.attackFirstWindowCentroidHz = Number(firstWindowCentroidHz.toFixed(1));
}

console.log(JSON.stringify({ ok: true, sampleRate: rate, results }, null, 1));
