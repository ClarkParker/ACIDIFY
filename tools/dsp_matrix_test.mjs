import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cmaj = process.argv[2] || process.env.CMAJ || "cmaj";
const sampleRate = Math.max(8000, Math.round(Number(process.argv[3]) || 48000));
const temp = await mkdtemp(path.join(os.tmpdir(), "acidify-dsp-matrix-"));
const sourceTemplate = await readFile(path.join(root, "ACIDIFYDSP.cmajor"), "utf8");
const manifestTemplate = JSON.parse(await readFile(path.join(root, "ACIDIFY.cmajorpatch"), "utf8"));

const harness = String.raw`

processor AcidifyMatrixEvents
{
    output event std::midi::Message midiOut;
    int frame = 0;

    void main()
    {
        let halfSecond = int (float (processor.frequency) * 0.5f);
        let threeQuarters = int (float (processor.frequency) * 0.75f);
        let oneAndQuarter = int (float (processor.frequency) * 1.25f);
        let oneAndHalf = int (float (processor.frequency) * 1.5f);
        let twoSeconds = int (float (processor.frequency) * 2.0f);

        loop
        {
            if (frame == 0)
                midiOut <- std::midi::createMessage (0x90, 0x24, 0x6e);
            else if (frame == halfSecond)
                midiOut <- std::midi::createMessage (0x80, 0x24, 0x00);
            else if (frame == threeQuarters)
                midiOut <- std::midi::createMessage (0x90, 0x2b, 0x6e);
            else if (frame == oneAndQuarter)
                midiOut <- std::midi::createMessage (0x80, 0x2b, 0x00);
            else if (frame == oneAndHalf)
                midiOut <- std::midi::createMessage (0x90, 0x30, 0x6e);
            else if (frame == twoSeconds)
                midiOut <- std::midi::createMessage (0x80, 0x30, 0x00);

            frame += 1;
            advance();
        }
    }
}

graph AcidifyMatrixTest [[ main ]]
{
    output stream float<2> out;
    node events = AcidifyMatrixEvents;
    node core = AcidifyCore * 4;

    connection
    {
        events.midiOut -> core.midiIn;
        core.out -> out;
    }
}
`;

const cases = [
  { name: "clean", enabled: 0, type: 0, drive: 0.35, mix: 1, expectBypass: true },
  { name: "disabled-phono-max", enabled: 0, type: 2, drive: 1, mix: 1, expectBypass: true },
  { name: "pure-zero-drive", enabled: 1, type: 0, drive: 0, mix: 1, expectBypass: true },
  { name: "pure", enabled: 1, type: 0, drive: 0.75, mix: 1 },
  { name: "mackie", enabled: 1, type: 1, drive: 0.75, mix: 1 },
  { name: "phono", enabled: 1, type: 2, drive: 0.75, mix: 1 },
  { name: "mackie-parallel", enabled: 1, type: 1, drive: 0.75, mix: 0.5 },
  { name: "pure-max", enabled: 1, type: 0, drive: 1, mix: 1 },
  { name: "mackie-max", enabled: 1, type: 1, drive: 1, mix: 1 },
  { name: "phono-max", enabled: 1, type: 2, drive: 1, mix: 1 },
  { name: "mackie-zero-mix", enabled: 1, type: 1, drive: 1, mix: 0, expectBypass: true },
];

function withInitialValue(source, id, value) {
  const pattern = new RegExp(`(input event float ${id}[^\\n]*init:\\s*)-?[0-9.]+`, "g");
  let replacements = 0;
  const result = source.replace(pattern, (_, prefix) => {
    replacements += 1;
    return `${prefix}${value}`;
  });
  if (replacements !== 2) {
    throw new Error(`Expected two ${id} declarations, replaced ${replacements}`);
  }
  return result;
}

function withProcessorState(source, name, type, value) {
  const pattern = new RegExp(`(\\n    ${type} ${name} = )[^;]+;`);
  if (!pattern.test(source)) throw new Error(`Processor state ${name} not found`);
  return source.replace(pattern, (_, prefix) => `${prefix}${value};`);
}

function cmajorFloat(value) {
  return Number.isInteger(value) ? `${value}.0f` : `${value}f`;
}

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
  }

  return {
    channels,
    samples,
    peak,
    rms: sumSquares.map(value => Math.sqrt(value / Math.max(1, frameCount))),
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
  const metrics = new Map();

  for (const testCase of cases) {
    const caseDir = path.join(temp, testCase.name);
    const sourcePath = path.join(caseDir, "ACIDIFYDSP.cmajor");
    const manifestPath = path.join(caseDir, "ACIDIFY.cmajorpatch");
    const wavPath = path.join(caseDir, `${testCase.name}.wav`);
    await mkdir(caseDir, { recursive: true });

    let source = sourceTemplate;
    source = withInitialValue(source, "param45", testCase.enabled);
    source = withInitialValue(source, "param46", testCase.type);
    source = withInitialValue(source, "param47", testCase.drive);
    source = withInitialValue(source, "param48", testCase.mix);
    source = withProcessorState(source, "distortionEnabled", "bool",
      testCase.enabled ? "true" : "false");
    source = withProcessorState(source, "distortionType", "int", testCase.type);
    source = withProcessorState(source, "distortionDrive", "float", cmajorFloat(testCase.drive));
    source = withProcessorState(source, "distortionMix", "float", cmajorFloat(testCase.mix));
    const outputNeedle = "out <- float<2> (sample, sample);";
    if (!source.includes(outputNeedle)) throw new Error("Stereo test output site not found");
    source = source.replace(outputNeedle,
      "out <- float<2> (abs (cleanVoice * instrumentMakeup) < 0.0000000001f ? 0.0f : cleanVoice * instrumentMakeup, sample);");
    const mainNeedle = "graph Acidify [[ main ]]";
    if (!source.includes(mainNeedle)) throw new Error("Production main graph not found");
    source = `${source.replace(mainNeedle, "graph Acidify")}${harness}`;
    await writeFile(sourcePath, source);
    await writeFile(manifestPath, `${JSON.stringify({ ...manifestTemplate, view: undefined }, null, 2)}\n`);

    const render = spawnSync(cmaj, [
      "render",
      `--rate=${sampleRate}`,
      `--length=${sampleRate * 3}`,
      "--channels=2",
      "--blockSize=128",
      `--output=${wavPath}`,
      manifestPath,
    ], { cwd: caseDir, encoding: "utf8", env: process.env });
    if (render.status !== 0) {
      process.stderr.write(render.stdout || "");
      process.stderr.write(render.stderr || "");
      throw new Error(`${testCase.name}: cmaj render failed with exit code ${render.status}`);
    }

    const result = analyseWav(await readFile(wavPath));
    if (result.channels !== 2) throw new Error(`${testCase.name}: expected stereo`);
    if (result.peak[0] <= 0.0001 || result.rms[0] <= 0.00001
        || result.peak[1] <= 0.0001 || result.rms[1] <= 0.00001) {
      throw new Error(`${testCase.name}: silent or too quiet`);
    }
    if (result.peak[1] > 1.05) {
      throw new Error(`${testCase.name}: unsafe processed peak ${result.peak[1]}`);
    }
    result.differenceRms = differenceRms(result.samples[0], result.samples[1]);
    if (testCase.expectBypass) {
      if (result.differenceRms > 1.0e-10) {
        throw new Error(`${testCase.name}: bypass is not sample-transparent, `
          + `delta=${result.differenceRms}`);
      }
    } else if (result.differenceRms <= 1.0e-5) {
      throw new Error(`${testCase.name}: processed channel is indistinguishable from clean`);
    }
    metrics.set(testCase.name, result);
  }

  console.log(JSON.stringify({
    ok: true,
    sampleRate,
    cases: Object.fromEntries([...metrics].map(([name, result]) => [name, {
      cleanPeak: Number(result.peak[0].toFixed(6)),
      processedPeak: Number(result.peak[1].toFixed(6)),
      processedRms: Number(result.rms[1].toFixed(6)),
      differenceRms: Number(result.differenceRms.toFixed(6)),
    }])),
  }));
} finally {
  if (process.env.ACIDIFY_KEEP_TEMP === "1") {
    console.error(`Kept matrix workspace: ${temp}`);
  } else {
    await rm(temp, { recursive: true, force: true });
  }
}
