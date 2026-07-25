import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cmaj = process.argv[2] || process.env.CMAJ || "cmaj";
const sampleRate = Math.max(8000, Math.round(Number(process.argv[3]) || 48000));
const temp = await mkdtemp(path.join(os.tmpdir(), "acidify-transport-"));
const sourceTemplate = await readFile(path.join(root, "ACIDIFYDSP.cmajor"), "utf8");
const manifestTemplate = JSON.parse(await readFile(path.join(root, "ACIDIFY.cmajorpatch"), "utf8"));

const harness = String.raw`

processor AcidifyTransportEvents
{
    output event float internalTempoOut;
    output event float internalRunOut;
    output event float dawModeOut;
    output event float handoffModeOut;
    output event float64 transportOut;

    int frame = 0;

    void sendAmorphTransport (bool playing, float64 bpm, float64 quarterNote)
    {
        transportOut <- playing ? 1.0 : 0.0;
        transportOut <- bpm;
        transportOut <- 4.0;
        transportOut <- 4.0;
        transportOut <- quarterNote;
        transportOut <- 0.0;
    }

    void main()
    {
        let halfSecond = int (float (processor.frequency) * 0.5f);
        let oneSecond = int (float (processor.frequency));
        let oneAndQuarter = int (float (processor.frequency) * 1.25f);
        let oneAndThreeQuarters = int (float (processor.frequency) * 1.75f);
        let twoSeconds = int (float (processor.frequency) * 2.0f);
        let twoAndQuarter = int (float (processor.frequency) * 2.25f);

        loop
        {
            if (frame == 0)
            {
                internalTempoOut <- 120.0f;
                internalRunOut <- 1.0f;

                dawModeOut <- 1.0f;
                handoffModeOut <- 1.0f;
                // A negative slot-4 value deliberately withholds position while
                // still exercising Amorph BPM and Play/Stop delivery.
                sendAmorphTransport (true, 120.0, -1.0);
            }
            else if (frame == halfSecond)
            {
                // The matching PPQ then locks without a phase jump.
                sendAmorphTransport (true, 120.0, 1.0);
            }
            else if (frame == oneSecond)
            {
                internalRunOut <- 0.0f;
                sendAmorphTransport (false, 120.0, 2.0);
            }
            else if (frame == oneAndQuarter)
            {
                internalRunOut <- 1.0f;

                sendAmorphTransport (true, 180.0, 8.5);
            }
            else if (frame == oneAndThreeQuarters)
            {
                // Seek while playing: tick 48 must jump to pattern step 0.
                sendAmorphTransport (true, 180.0, 12.0);
            }
            else if (frame == twoSeconds)
            {
                // Releasing DAW sync must retain the last received host BPM as
                // the new internal-tempo baseline.
                handoffModeOut <- 0.0f;
            }
            else if (frame == twoAndQuarter)
            {
                internalRunOut <- 0.0f;
                sendAmorphTransport (false, 180.0, 13.5);
            }

            frame += 1;
            advance();
        }
    }
}

processor AcidifyStepTrace
{
    input event float stepIn;
    output stream float out;
    float value = 0.0f;

    event stepIn (float step)
    {
        value = (step + 1.0f) / 16.0f;
    }

    void main()
    {
        loop
        {
            out <- value;
            advance();
        }
    }
}

processor AcidifyTraceMerge
{
    input stream float internalIn;
    input stream float dawIn;
    input stream float fallbackIn;
    input stream float handoffTempoIn;
    output stream float<4> out;

    void main()
    {
        loop
        {
            out <- float<4> (internalIn, dawIn, fallbackIn, handoffTempoIn);
            advance();
        }
    }
}

processor AcidifyTempoTrace
{
    input event float tempoIn;
    output stream float out;
    float tempo = 0.0f;

    event tempoIn (float nextTempo)
    {
        tempo = nextTempo;
    }

    void main()
    {
        loop
        {
            out <- tempo / 300.0f;
            advance();
        }
    }
}

graph AcidifyTransportTest [[ main ]]
{
    output stream float<4> out;

    node events = AcidifyTransportEvents;
    // Exercise the exact production graph boundary, not AcidifyCore directly.
    // This proves that Amorph's public six-slot transportIn endpoint reaches the
    // oversampled core used by the shipped patch.
    node internal = Acidify;
    node daw = Acidify;
    node fallback = Acidify;
    node handoff = Acidify;
    node internalTrace = AcidifyStepTrace;
    node dawTrace = AcidifyStepTrace;
    node fallbackTrace = AcidifyStepTrace;
    node handoffTempoTrace = AcidifyTempoTrace;
    node merge = AcidifyTraceMerge;

    connection
    {
        events.internalTempoOut -> internal.param9;
        events.internalRunOut -> internal.param10;

        events.dawModeOut -> daw.param49;
        events.transportOut -> daw.transportIn;

        // DAW mode with no host transport stream must retain the internal controls.
        events.internalTempoOut -> fallback.param9;
        events.internalRunOut -> fallback.param10;
        events.dawModeOut -> fallback.param49;

        events.internalTempoOut -> handoff.param9;
        events.handoffModeOut -> handoff.param49;
        events.transportOut -> handoff.transportIn;

        internal.currentStep -> internalTrace.stepIn;
        daw.currentStep -> dawTrace.stepIn;
        fallback.currentStep -> fallbackTrace.stepIn;
        handoff.effectiveTempo -> handoffTempoTrace.tempoIn;
        internalTrace.out -> merge.internalIn;
        dawTrace.out -> merge.dawIn;
        fallbackTrace.out -> merge.fallbackIn;
        handoffTempoTrace.out -> merge.handoffTempoIn;
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

function readChannels(buffer) {
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

  for (let index = 0; index < sampleCount; index += 1) {
    const offset = data.offset + index * bytes;
    let value;
    if (sampleFormat === 3 && bits === 32) value = buffer.readFloatLE(offset);
    else if (sampleFormat === 1 && bits === 16) value = buffer.readInt16LE(offset) / 32768;
    else if (sampleFormat === 1 && bits === 24) value = buffer.readIntLE(offset, 3) / 8388608;
    else if (sampleFormat === 1 && bits === 32) value = buffer.readInt32LE(offset) / 2147483648;
    else throw new Error(`Unsupported WAV format=${format}/${sampleFormat}, bits=${bits}`);
    if (!Number.isFinite(value)) throw new Error(`Non-finite sample at index ${index}`);
    samples[index % channels][Math.floor(index / channels)] = value;
  }

  return samples;
}

function transitions(samples) {
  const result = [];
  let previous = null;
  for (let frame = 0; frame < samples.length; frame += 1) {
    const step = Math.round(samples[frame] * 16) - 1;
    if (step < -1 || step > 15) throw new Error(`Invalid encoded step ${step} at frame ${frame}`);
    if (step !== previous) {
      result.push({ frame, step });
      previous = step;
    }
  }
  while (result[0]?.step === -1) result.shift();
  return result;
}

function expectedInternal() {
  return [
    ...Array.from({ length: 8 }, (_, step) => ({ time: step * 0.125, step })),
    { time: 1.0, step: -1 },
    ...Array.from({ length: 8 }, (_, step) => ({ time: 1.25 + step * 0.125, step })),
    { time: 2.25, step: -1 },
  ];
}

function expectedDaw() {
  return [
    ...Array.from({ length: 8 }, (_, step) => ({ time: step * 0.125, step })),
    { time: 1.0, step: -1 },
    ...[2, 3, 4, 5, 6, 7].map((step, index) => ({
      time: 1.25 + index / 12,
      step,
    })),
    ...[0, 1, 2, 3, 4, 5].map((step, index) => ({
      time: 1.75 + index / 12,
      step,
    })),
    { time: 2.25, step: -1 },
  ];
}

function validate(actual, expected, label) {
  if (actual.length !== expected.length) {
    throw new Error(`${label}: expected ${expected.length} transitions, got ${actual.length}: `
      + JSON.stringify(actual));
  }

  const toleranceFrames = 4;
  const timelineOrigin = actual[0].frame;
  actual.forEach((transition, index) => {
    const target = expected[index];
    const targetFrame = timelineOrigin + Math.round(target.time * sampleRate);
    if (transition.step !== target.step
        || Math.abs(transition.frame - targetFrame) > toleranceFrames) {
      throw new Error(`${label}: transition ${index} expected step ${target.step} `
        + `at ${targetFrame}, got step ${transition.step} at ${transition.frame}`);
    }
  });

  return timelineOrigin;
}

try {
  const sourcePath = path.join(temp, "ACIDIFYDSP.cmajor");
  const manifestPath = path.join(temp, "ACIDIFY.cmajorpatch");
  const wavPath = path.join(temp, "transport.wav");
  const mainNeedle = "graph Acidify [[ main ]]";
  if (!sourceTemplate.includes(mainNeedle)) throw new Error("Production main graph not found");
  const source = `${sourceTemplate.replace(mainNeedle, "graph Acidify")}${harness}`;
  await writeFile(sourcePath, source);
  await writeFile(manifestPath, `${JSON.stringify({ ...manifestTemplate, view: undefined }, null, 2)}\n`);

  const render = spawnSync(cmaj, [
    "render",
    `--rate=${sampleRate}`,
    `--length=${Math.round(sampleRate * 3.0)}`,
    "--channels=4",
    "--blockSize=128",
    `--output=${wavPath}`,
    manifestPath,
  ], { cwd: temp, encoding: "utf8", env: process.env });
  if (render.status !== 0) {
    process.stderr.write(render.stdout || "");
    process.stderr.write(render.stderr || "");
    throw new Error(`cmaj render failed with exit code ${render.status}`);
  }

  const channels = readChannels(await readFile(wavPath));
  if (channels.length !== 4) throw new Error(`Expected 4-channel trace, got ${channels.length} channels`);
  const internal = transitions(channels[0]);
  const daw = transitions(channels[1]);
  const fallback = transitions(channels[2]);
  const handoffTempo = time => channels[3][Math.round(time * sampleRate)] * 300;
  const internalOrigin = validate(internal, expectedInternal(), "Internal clock");
  const dawOrigin = validate(daw, expectedDaw(), "DAW clock");
  const fallbackOrigin = validate(fallback, expectedInternal(), "DAW no-host fallback");
  // The public 4× graph forwards status events with a fixed reporting latency,
  // so sample well inside each stable section rather than at the event edge.
  const handoffBeforeChange = handoffTempo(0.75);
  const handoffDuringSync = handoffTempo(1.8);
  const handoffAfterRelease = handoffTempo(2.7);
  if (Math.abs(handoffBeforeChange - 120) > 0.02
      || Math.abs(handoffDuringSync - 180) > 0.02
      || Math.abs(handoffAfterRelease - 180) > 0.02) {
    throw new Error(`DAW tempo handoff failed: ${JSON.stringify({
      handoffBeforeChange,
      handoffDuringSync,
      handoffAfterRelease,
    })}`);
  }

  console.log(JSON.stringify({
    ok: true,
    sampleRate,
    rendererLatencyFrames: { internal: internalOrigin, daw: dawOrigin, fallback: fallbackOrigin },
    internalTransitions: internal,
    dawTransitions: daw,
    fallbackTransitions: fallback,
    tempoHandoff: {
      beforeHostChange: handoffBeforeChange,
      duringSync: handoffDuringSync,
      afterSyncRelease: handoffAfterRelease,
    },
    checks: {
      productionGraphBoundary: true,
      amorphSixSlotTransport: true,
      noHostManualFallback: true,
      internal120Bpm: true,
      dawNoPositionFallback: true,
      daw120Bpm: true,
      daw180Bpm: true,
      transportStopStart: true,
      dawSeek: true,
      hostTempoHandoff: true,
    },
  }));
} finally {
  if (process.env.ACIDIFY_KEEP_TEMP === "1") {
    console.error(`Kept transport workspace: ${temp}`);
  } else {
    await rm(temp, { recursive: true, force: true });
  }
}
