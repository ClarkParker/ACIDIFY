import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cmaj = process.argv[2] || process.env.CMAJ || "cmaj";
const sampleRate = Math.max(8000, Math.round(Number(process.argv[3]) || 48000));
const temp = await mkdtemp(path.join(os.tmpdir(), "acidify-articulation-"));
const sourceTemplate = await readFile(path.join(root, "ACIDIFYDSP.cmajor"), "utf8");
const manifestTemplate = JSON.parse(await readFile(path.join(root, "ACIDIFY.cmajorpatch"), "utf8"));

const harness = String.raw`

processor AcidifyArticulationEvents
{
    output event std::midi::Message legatoOut;
    output event std::midi::Message retriggerOut;
    int frame = 0;

    void main()
    {
        let halfSecond = int (float (processor.frequency) * 0.5f);
        let threeQuarters = int (float (processor.frequency) * 0.75f);
        let oneAndQuarter = int (float (processor.frequency) * 1.25f);

        loop
        {
            if (frame == 0)
            {
                legatoOut <- std::midi::createMessage (0x90, 0x24, 0x6e);
                retriggerOut <- std::midi::createMessage (0x90, 0x24, 0x6e);
            }
            else if (frame == halfSecond)
            {
                // C2 remains held on the legato side, so G2 must slide.
                legatoOut <- std::midi::createMessage (0x90, 0x2b, 0x50);

                // The control side releases first and must retrigger G2.
                retriggerOut <- std::midi::createMessage (0x80, 0x24, 0x00);
                retriggerOut <- std::midi::createMessage (0x90, 0x2b, 0x50);
            }
            else if (frame == threeQuarters)
            {
                // Releasing G2 must slide back to the still-held C2.
                legatoOut <- std::midi::createMessage (0x80, 0x2b, 0x00);

                retriggerOut <- std::midi::createMessage (0x80, 0x2b, 0x00);
                retriggerOut <- std::midi::createMessage (0x90, 0x24, 0x6e);
            }
            else if (frame == oneAndQuarter)
            {
                // Exercise MIDI All Notes Off on the held-note stack.
                legatoOut <- std::midi::createMessage (0xb0, 123, 0);
                retriggerOut <- std::midi::createMessage (0x80, 0x24, 0x00);
            }

            frame += 1;
            advance();
        }
    }
}

processor AcidifyArticulationMerge
{
    input stream float<2> legatoIn;
    input stream float<2> retriggerIn;
    output stream float<2> out;

    void main()
    {
        loop
        {
            out <- float<2> (legatoIn[0], retriggerIn[0]);
            advance();
        }
    }
}

graph AcidifyArticulationTest [[ main ]]
{
    output stream float<2> out;

    node events = AcidifyArticulationEvents;
    node legato = AcidifyCore * 4;
    node retrigger = AcidifyCore * 4;
    node merge = AcidifyArticulationMerge;

    connection
    {
        events.legatoOut -> legato.midiIn;
        events.retriggerOut -> retrigger.midiIn;
        legato.out -> merge.legatoIn;
        retrigger.out -> merge.retriggerIn;
        merge.out -> out;
    }
}
`;

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
  const fmt = findChunk(buffer, "fmt ");
  const data = findChunk(buffer, "data");
  const format = buffer.readUInt16LE(fmt.offset);
  const sampleFormat = format === 0xfffe && fmt.size >= 40 ? buffer.readUInt32LE(fmt.offset + 24) : format;
  const channels = buffer.readUInt16LE(fmt.offset + 2);
  const bits = buffer.readUInt16LE(fmt.offset + 14);
  const bytes = bits / 8;
  const sampleCount = Math.floor(data.size / bytes);
  const frameCount = Math.floor(sampleCount / channels);
  const samples = Array.from({ length: channels }, () => new Float64Array(frameCount));
  const peak = Array(channels).fill(0);
  const sumSquares = Array(channels).fill(0);
  const maxStep = Array(channels).fill(0);

  for (let index = 0; index < sampleCount; index += 1) {
    const offset = data.offset + index * bytes;
    let value;
    if (sampleFormat === 3 && bits === 32) value = buffer.readFloatLE(offset);
    else if (sampleFormat === 1 && bits === 16) value = buffer.readInt16LE(offset) / 32768;
    else if (sampleFormat === 1 && bits === 24) value = buffer.readIntLE(offset, 3) / 8388608;
    else if (sampleFormat === 1 && bits === 32) value = buffer.readInt32LE(offset) / 2147483648;
    else throw new Error(`Unsupported WAV format=${format}/${sampleFormat}, bits=${bits}`);
    if (!Number.isFinite(value)) throw new Error(`Non-finite sample at index ${index}`);

    const channel = index % channels;
    const frame = Math.floor(index / channels);
    samples[channel][frame] = value;
    peak[channel] = Math.max(peak[channel], Math.abs(value));
    sumSquares[channel] += value * value;
    if (frame > 0) {
      maxStep[channel] = Math.max(maxStep[channel],
        Math.abs(value - samples[channel][frame - 1]));
    }
  }

  const tailStart = Math.floor(frameCount * 0.92);
  const tailSquares = Array(channels).fill(0);
  for (let channel = 0; channel < channels; channel += 1) {
    for (let frame = tailStart; frame < frameCount; frame += 1) {
      tailSquares[channel] += samples[channel][frame] * samples[channel][frame];
    }
  }

  return {
    channels,
    samples,
    peak,
    rms: sumSquares.map(value => Math.sqrt(value / Math.max(1, frameCount))),
    tailRms: tailSquares.map(value => Math.sqrt(value / Math.max(1, frameCount - tailStart))),
    maxStep,
  };
}

function differenceRms(a, b) {
  if (a.length !== b.length) throw new Error(`Sample length mismatch: ${a.length} vs ${b.length}`);
  let sumSquares = 0;
  for (let index = 0; index < a.length; index += 1) {
    const difference = a[index] - b[index];
    sumSquares += difference * difference;
  }
  return Math.sqrt(sumSquares / Math.max(1, a.length));
}

try {
  const sourcePath = path.join(temp, "ACIDIFYDSP.cmajor");
  const manifestPath = path.join(temp, "ACIDIFY.cmajorpatch");
  const wavPath = path.join(temp, "articulation.wav");
  const mainNeedle = "graph Acidify [[ main ]]";
  if (!sourceTemplate.includes(mainNeedle)) throw new Error("Production main graph not found");
  const source = `${sourceTemplate.replace(mainNeedle, "graph Acidify")}${harness}`;
  await writeFile(sourcePath, source);
  await writeFile(manifestPath, `${JSON.stringify({ ...manifestTemplate, view: undefined }, null, 2)}\n`);

  const render = spawnSync(cmaj, [
    "render",
    `--rate=${sampleRate}`,
    `--length=${Math.round(sampleRate * 2.5)}`,
    "--channels=2",
    "--blockSize=128",
    `--output=${wavPath}`,
    manifestPath,
  ], { cwd: temp, encoding: "utf8", env: process.env });
  if (render.status !== 0) {
    process.stderr.write(render.stdout || "");
    process.stderr.write(render.stderr || "");
    throw new Error(`cmaj render failed with exit code ${render.status}`);
  }

  const result = analyseWav(await readFile(wavPath));
  if (result.channels !== 2) throw new Error(`Expected stereo, got ${result.channels} channels`);
  for (let channel = 0; channel < 2; channel += 1) {
    if (result.peak[channel] <= 0.0001 || result.rms[channel] <= 0.00001) {
      throw new Error(`Channel ${channel}: silent or too quiet`);
    }
    if (result.peak[channel] > 1.05) throw new Error(`Channel ${channel}: unsafe peak`);
    if (result.maxStep[channel] > 0.8) throw new Error(`Channel ${channel}: discontinuity`);
    if (result.tailRms[channel] > 0.0001) throw new Error(`Channel ${channel}: stuck note`);
  }

  const delta = differenceRms(result.samples[0], result.samples[1]);
  if (delta <= 0.0001) throw new Error(`Slide path is indistinguishable from retrigger, delta=${delta}`);

  console.log(JSON.stringify({
    ok: true,
    sampleRate,
    differenceRms: Number(delta.toFixed(6)),
    legato: {
      peak: Number(result.peak[0].toFixed(6)),
      rms: Number(result.rms[0].toFixed(6)),
      tailRms: Number(result.tailRms[0].toFixed(9)),
      maxStep: Number(result.maxStep[0].toFixed(6)),
    },
    retrigger: {
      peak: Number(result.peak[1].toFixed(6)),
      rms: Number(result.rms[1].toFixed(6)),
      tailRms: Number(result.tailRms[1].toFixed(9)),
      maxStep: Number(result.maxStep[1].toFixed(6)),
    },
  }));
} finally {
  await rm(temp, { recursive: true, force: true });
}
