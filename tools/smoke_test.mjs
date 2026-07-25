import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cmaj = process.argv[2] || process.env.CMAJ || "cmaj";
const sampleRate = Math.max(8000, Math.round(Number(process.argv[3]) || 48000));
const patchPath = process.argv[4] ? path.resolve(process.argv[4]) : path.join(root, "ACIDIFY.cmajorpatch");
const temp = await mkdtemp(path.join(os.tmpdir(), "acidify-smoke-"));
const midiPath = path.join(temp, "accent-c2.mid");
const wavPath = path.join(temp, "accent-c2.wav");

// Type-0 MIDI: 120 BPM, accented C2 for two quarter notes.
const midi = Buffer.from([
  0x4d, 0x54, 0x68, 0x64, 0x00, 0x00, 0x00, 0x06,
  0x00, 0x00, 0x00, 0x01, 0x01, 0xe0,
  0x4d, 0x54, 0x72, 0x6b, 0x00, 0x00, 0x00, 0x14,
  0x00, 0xff, 0x51, 0x03, 0x07, 0xa1, 0x20,
  0x00, 0x90, 0x24, 0x6e,
  0x87, 0x40, 0x80, 0x24, 0x00,
  0x00, 0xff, 0x2f, 0x00,
]);

function findChunk(buffer, name) {
  let offset = 12;
  while (offset + 8 <= buffer.length) {
    const id = buffer.toString("ascii", offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    if (id === name) return { offset: offset + 8, size };
    offset += 8 + size + (size & 1);
  }
  throw new Error(`WAV chunk ${name} not found`);
}

function analyseWav(buffer) {
  if (buffer.toString("ascii", 0, 4) !== "RIFF" || buffer.toString("ascii", 8, 12) !== "WAVE") {
    throw new Error("Renderer output is not a WAV file");
  }
  const fmt = findChunk(buffer, "fmt ");
  const data = findChunk(buffer, "data");
  const format = buffer.readUInt16LE(fmt.offset);
  const sampleFormat = format === 0xfffe && fmt.size >= 40 ? buffer.readUInt32LE(fmt.offset + 24) : format;
  const channels = buffer.readUInt16LE(fmt.offset + 2);
  const bits = buffer.readUInt16LE(fmt.offset + 14);
  const bytes = bits / 8;
  const sampleCount = Math.floor(data.size / bytes);
  let peak = 0;
  let sumSquares = 0;

  for (let i = 0; i < sampleCount; i += 1) {
    const offset = data.offset + i * bytes;
    let value;
    if (sampleFormat === 3 && bits === 32) value = buffer.readFloatLE(offset);
    else if (sampleFormat === 1 && bits === 16) value = buffer.readInt16LE(offset) / 32768;
    else if (sampleFormat === 1 && bits === 24) value = buffer.readIntLE(offset, 3) / 8388608;
    else if (sampleFormat === 1 && bits === 32) value = buffer.readInt32LE(offset) / 2147483648;
    else throw new Error(`Unsupported WAV format=${format}/${sampleFormat}, bits=${bits}`);
    if (!Number.isFinite(value)) throw new Error(`Non-finite sample at index ${i}`);
    peak = Math.max(peak, Math.abs(value));
    sumSquares += value * value;
  }

  return { channels, sampleCount, peak, rms: Math.sqrt(sumSquares / Math.max(1, sampleCount)) };
}

try {
  await writeFile(midiPath, midi);
  const result = spawnSync(cmaj, [
    "render",
    `--rate=${sampleRate}`,
    `--length=${sampleRate * 2}`,
    "--channels=2",
    "--blockSize=128",
    `--midi=${midiPath}`,
    `--output=${wavPath}`,
    patchPath,
  ], { cwd: root, encoding: "utf8", env: process.env });

  if (result.status !== 0) {
    process.stderr.write(result.stdout || "");
    process.stderr.write(result.stderr || "");
    throw new Error(`cmaj render failed with exit code ${result.status}`);
  }

  const metrics = analyseWav(await readFile(wavPath));
  if (metrics.channels !== 2) throw new Error(`Expected stereo output, got ${metrics.channels} channels`);
  if (metrics.peak <= 0.0001) throw new Error(`Audio is silent (peak=${metrics.peak})`);
  if (metrics.rms <= 0.00001) throw new Error(`Audio RMS is too low (${metrics.rms})`);
  if (metrics.peak > 1.05) throw new Error(`Output exceeds safe full scale (peak=${metrics.peak})`);

  console.log(`ACIDIFY smoke test passed @ ${sampleRate} Hz: peak=${metrics.peak.toFixed(5)}, rms=${metrics.rms.toFixed(5)}, samples=${metrics.sampleCount}`);
} finally {
  await rm(temp, { recursive: true, force: true });
}
