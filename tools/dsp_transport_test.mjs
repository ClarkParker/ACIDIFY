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
    output event float swingOut;
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
                swingOut <- 100.0f;

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
    input stream float internalSwingIn;
    input stream float dawSwingIn;
    output stream float<6> out;

    void main()
    {
        loop
        {
            out <- float<6> (internalIn, dawIn, fallbackIn, handoffTempoIn,
                             internalSwingIn, dawSwingIn);
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
    output stream float<6> out;

    node events = AcidifyTransportEvents;
    // Exercise the exact production graph boundary, not AcidifyCore directly.
    // This proves that Amorph's public six-slot transportIn endpoint reaches the
    // oversampled core used by the shipped patch.
    node internal = Acidify;
    node daw = Acidify;
    node fallback = Acidify;
    node handoff = Acidify;
    node internalSwing = Acidify;
    node dawSwing = Acidify;
    node internalTrace = AcidifyStepTrace;
    node dawTrace = AcidifyStepTrace;
    node fallbackTrace = AcidifyStepTrace;
    node handoffTempoTrace = AcidifyTempoTrace;
    node internalSwingTrace = AcidifyStepTrace;
    node dawSwingTrace = AcidifyStepTrace;
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

        events.internalTempoOut -> internalSwing.param9;
        events.internalRunOut -> internalSwing.param10;
        events.swingOut -> internalSwing.param50;

        events.dawModeOut -> dawSwing.param49;
        events.swingOut -> dawSwing.param50;
        events.transportOut -> dawSwing.transportIn;

        internal.currentStep -> internalTrace.stepIn;
        daw.currentStep -> dawTrace.stepIn;
        fallback.currentStep -> fallbackTrace.stepIn;
        handoff.effectiveTempo -> handoffTempoTrace.tempoIn;
        internalSwing.currentStep -> internalSwingTrace.stepIn;
        dawSwing.currentStep -> dawSwingTrace.stepIn;
        internalTrace.out -> merge.internalIn;
        dawTrace.out -> merge.dawIn;
        fallbackTrace.out -> merge.fallbackIn;
        handoffTempoTrace.out -> merge.handoffTempoIn;
        internalSwingTrace.out -> merge.internalSwingIn;
        dawSwingTrace.out -> merge.dawSwingIn;
        merge.out -> out;
    }
}
`;

const gridHarness = String.raw`

processor AcidifyGridEvents
{
    output event float tempoOut;
    output event float runOut;
    output event float swingOut;
    output event float gridEighthOut;
    output event float gridTripletOut;
    output event float lengthEightOut;
    output event float modeRevOut;
    output event float modePendulumOut;
    output event float modeInvertOut;
    output event float modeRandomOut;
    output event float dawModeOut;
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
        let seekFrame = int (float (processor.frequency) * 1.4f);
        let stopFrame = int (float (processor.frequency) * 3.05f);

        loop
        {
            if (frame == 0)
            {
                tempoOut <- 120.0f;
                runOut <- 1.0f;
                swingOut <- 100.0f;
                gridEighthOut <- 6.0f;
                gridTripletOut <- 1.0f;
                lengthEightOut <- 8.0f;
                modeRevOut <- 1.0f;
                modePendulumOut <- 2.0f;
                modeInvertOut <- 3.0f;
                modeRandomOut <- 4.0f;
                dawModeOut <- 1.0f;
                sendAmorphTransport (true, 120.0, 0.0);
            }
            else if (frame == seekFrame)
            {
                // Seek mid-step: grid 1/8 pairs span one quarter note, so PPQ
                // 100.25 sits in the even half of pair 100 -> absolute step 200.
                sendAmorphTransport (true, 120.0, 100.25);
            }
            else if (frame == stopFrame)
            {
                runOut <- 0.0f;
                sendAmorphTransport (false, 120.0, -1.0);
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

processor AcidifyGridMerge
{
    input stream float gridEighthIn;
    input stream float gridTripletIn;
    input stream float gridSwingIn;
    input stream float reverseIn;
    input stream float pendulumIn;
    input stream float invertIn;
    input stream float randomIn;
    input stream float dawGridIn;
    output stream float<8> out;

    void main()
    {
        loop
        {
            out <- float<8> (gridEighthIn, gridTripletIn, gridSwingIn,
                             reverseIn, pendulumIn, invertIn, randomIn,
                             dawGridIn);
            advance();
        }
    }
}

graph AcidifyGridTest [[ main ]]
{
    output stream float<8> out;

    node events = AcidifyGridEvents;
    node gridEighth = Acidify;
    node gridTriplet = Acidify;
    node gridSwing = Acidify;
    node reverse = Acidify;
    node pendulum = Acidify;
    node invert = Acidify;
    node random = Acidify;
    node dawGrid = Acidify;
    node gridEighthTrace = AcidifyStepTrace;
    node gridTripletTrace = AcidifyStepTrace;
    node gridSwingTrace = AcidifyStepTrace;
    node reverseTrace = AcidifyStepTrace;
    node pendulumTrace = AcidifyStepTrace;
    node invertTrace = AcidifyStepTrace;
    node randomTrace = AcidifyStepTrace;
    node dawGridTrace = AcidifyStepTrace;
    node merge = AcidifyGridMerge;

    connection
    {
        events.tempoOut -> gridEighth.param9;
        events.tempoOut -> gridTriplet.param9;
        events.tempoOut -> gridSwing.param9;
        events.tempoOut -> reverse.param9;
        events.tempoOut -> pendulum.param9;
        events.tempoOut -> invert.param9;
        events.tempoOut -> random.param9;
        events.runOut -> gridEighth.param10;
        events.runOut -> gridTriplet.param10;
        events.runOut -> gridSwing.param10;
        events.runOut -> reverse.param10;
        events.runOut -> pendulum.param10;
        events.runOut -> invert.param10;
        events.runOut -> random.param10;

        events.gridEighthOut -> gridEighth.param65;
        events.gridEighthOut -> gridSwing.param65;
        events.gridEighthOut -> dawGrid.param65;
        events.gridTripletOut -> gridTriplet.param65;
        events.swingOut -> gridSwing.param50;

        events.lengthEightOut -> pendulum.param11;
        events.lengthEightOut -> invert.param11;
        events.lengthEightOut -> random.param11;
        events.modeRevOut -> reverse.param66;
        events.modePendulumOut -> pendulum.param66;
        events.modeInvertOut -> invert.param66;
        events.modeRandomOut -> random.param66;

        events.dawModeOut -> dawGrid.param49;
        events.transportOut -> dawGrid.transportIn;

        gridEighth.currentStep -> gridEighthTrace.stepIn;
        gridTriplet.currentStep -> gridTripletTrace.stepIn;
        gridSwing.currentStep -> gridSwingTrace.stepIn;
        reverse.currentStep -> reverseTrace.stepIn;
        pendulum.currentStep -> pendulumTrace.stepIn;
        invert.currentStep -> invertTrace.stepIn;
        random.currentStep -> randomTrace.stepIn;
        dawGrid.currentStep -> dawGridTrace.stepIn;
        gridEighthTrace.out -> merge.gridEighthIn;
        gridTripletTrace.out -> merge.gridTripletIn;
        gridSwingTrace.out -> merge.gridSwingIn;
        reverseTrace.out -> merge.reverseIn;
        pendulumTrace.out -> merge.pendulumIn;
        invertTrace.out -> merge.invertIn;
        randomTrace.out -> merge.randomIn;
        dawGridTrace.out -> merge.dawGridIn;
        merge.out -> out;
    }
}
`;

// DAW-Sync + Phrase-Modus (Zeilen-Audit 2.17.2): Der DAW-Gate-Abschalter
// muss die EFFEKTIVEN Flags des Steps nutzen (Phrase ersetzt die
// Pattern-Maske), nicht die Pattern-Flags. Phrase 37 hat Slides auf den
// Phrase-Steps 0/2/4 und reine Gates auf 5/6/7; die Note kommt waehrend
// Pattern-Step 0, also spielt Phrase-Step p auf Pattern-Step p+1.
// Zwei gegenlaeufige Nachweise:
//   A) Pattern-Step 3 (Phrase-Slide, Pattern-Flags nur Gate): das Gate
//      muss den GANZEN Step halten — der alte Code kappte es in Stepmitte.
//   B) Pattern-Step 8 (Phrase-Gate, Pattern-Flags Rest): das Gate muss in
//      Stepmitte enden — der alte Code hielt es den ganzen Step.
const phraseHarness = String.raw`

processor AcidifyPhraseEvents
{
    output event float dawModeOut;
    output event float arpModeOut;
    output event float phraseOut;
    output event float64 transportOut;
    output event std::midi::Message midiOut;

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
        let noteFrame = int (float (processor.frequency) * 0.025f);

        loop
        {
            if (frame == 0)
            {
                dawModeOut <- 1.0f;
                arpModeOut <- 16.0f;
                phraseOut <- 37.0f;
                sendAmorphTransport (true, 120.0, 0.0);
            }
            else if (frame == noteFrame)
            {
                // Note C3, Velocity 0x50 (< 100, kein Accent) — pflegt im
                // laufenden Sequencer nur den Arp-Pool.
                midiOut <- std::midi::Message ((0x90 << 16) | (48 << 8) | 0x50);
            }

            frame += 1;
            advance();
        }
    }
}

processor AcidifyPhraseStepTrace
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

processor AcidifyPhraseMerge
{
    input stream float<2> audioIn;
    input stream float stepIn;
    output stream float<2> out;

    void main()
    {
        loop
        {
            out <- float<2> (audioIn[0], stepIn);
            advance();
        }
    }
}

graph AcidifyPhraseGateTest [[ main ]]
{
    output stream float<2> out;

    node events = AcidifyPhraseEvents;
    node phrase = Acidify;
    node stepTrace = AcidifyPhraseStepTrace;
    node merge = AcidifyPhraseMerge;

    connection
    {
        events.dawModeOut -> phrase.param49;
        events.arpModeOut -> phrase.param61;
        events.phraseOut -> phrase.param64;
        events.transportOut -> phrase.transportIn;
        events.midiOut -> phrase.midiIn;
        phrase.currentStep -> stepTrace.stepIn;
        phrase.out -> merge.audioIn;
        stepTrace.out -> merge.stepIn;
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

function swungSection(startTime, steps, secondsPerQuarter) {
  const longStep = secondsPerQuarter / 3;
  const pair = secondsPerQuarter / 2;
  return Array.from({ length: steps }, (_, step) => ({
    time: startTime + Math.floor(step / 2) * pair + (step % 2 ? longStep : 0),
    step,
  }));
}

function expectedInternalSwing() {
  return [
    ...swungSection(0, 8, 0.5),
    { time: 1.0, step: -1 },
    ...swungSection(1.25, 8, 0.5),
    { time: 2.25, step: -1 },
  ];
}

function expectedDawSwing() {
  return [
    ...swungSection(0, 8, 0.5),
    { time: 1.0, step: -1 },
    ...[2, 3, 4, 5, 6, 7].map((step, index) => ({
      time: 1.25 + Math.floor(index / 2) / 6 + (index % 2 ? 1 / 9 : 0),
      step,
    })),
    ...[0, 1, 2, 3, 4, 5].map((step, index) => ({
      time: 1.75 + Math.floor(index / 2) / 6 + (index % 2 ? 1 / 9 : 0),
      step,
    })),
    { time: 2.25, step: -1 },
  ];
}

// Mirror of the DSP countdown: each internal step lasts
// round(rate * 60 * durationQN / bpm) frames, accumulated per step, so the
// expectation stays sample-accurate at every rate.
function internalTimeline(stepOf, durationOf, stopTime, bpm = 120) {
  const stopFrame = Math.round(sampleRate * stopTime);
  const entries = [];
  let frame = 0;
  let index = 0;
  while (frame < stopFrame) {
    entries.push({ time: frame / sampleRate, step: stepOf(index) });
    frame += Math.max(1, Math.round((sampleRate * 60 * durationOf(index)) / bpm));
    index += 1;
  }
  entries.push({ time: stopTime, step: -1 });
  return entries;
}

// Mirror of the DSP RND mode: Lehmer MINSTD from the fixed seed, never the
// same step twice in a row while the pattern is longer than one step.
function lehmerSteps(count, length) {
  let state = 20260731n;
  let last = -1;
  const steps = [];
  for (let index = 0; index < count; index += 1) {
    state = (state * 48271n) % 2147483647n;
    if (length <= 1 || last < 0) {
      last = Number(state % BigInt(length));
    } else {
      let draw = Number(state % BigInt(length - 1));
      if (draw >= last) draw += 1;
      last = draw;
    }
    steps.push(last);
  }
  return steps;
}

function expectedGridEighth() {
  return internalTimeline(k => k % 16, () => 0.5, 3.05);
}

function expectedGridTriplet() {
  return internalTimeline(k => k % 16, () => 1 / 6, 3.05);
}

function expectedGridSwing() {
  // Grid 1/8 at 100% swing: pairs of 2/3 + 1/3 quarter notes.
  return internalTimeline(k => k % 16, k => (k % 2 === 0 ? 2 / 3 : 1 / 3), 3.05);
}

function expectedReverse() {
  return internalTimeline(k => 15 - (k % 16), () => 0.25, 3.05);
}

function expectedPendulum() {
  return internalTimeline(k => {
    const p = k % 14;
    return p < 8 ? p : 14 - p;
  }, () => 0.25, 3.05);
}

function expectedInvert() {
  return internalTimeline(k => {
    const p = k % 8;
    return p % 2 === 0 ? p / 2 : 7 - (p - 1) / 2;
  }, () => 0.25, 3.05);
}

function expectedRandom() {
  const steps = lehmerSteps(64, 8);
  return internalTimeline(k => steps[k], () => 0.25, 3.05);
}

function expectedDawGrid() {
  // Grid 1/8 in DAW sync: one absolute step per half quarter note, bound to
  // the host PPQ. The 1.4s seek to PPQ 100.25 lands in the even half of pair
  // 100 -> absolute step 200 -> pattern step 200 % 16 = 8.
  return [
    ...[0, 1, 2, 3, 4, 5].map(step => ({ time: step * 0.25, step })),
    { time: 1.4, step: 8 },
    ...[9, 10, 11, 12, 13, 14, 15].map((step, index) => ({
      time: 1.525 + index * 0.25,
      step,
    })),
    { time: 3.05, step: -1 },
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

async function renderTrace(tag, harnessText, channelCount, lengthSeconds) {
  const sourceName = `ACIDIFY_${tag}.cmajor`;
  const sourcePath = path.join(temp, sourceName);
  const manifestPath = path.join(temp, `ACIDIFY_${tag}.cmajorpatch`);
  const wavPath = path.join(temp, `${tag}.wav`);
  const mainNeedle = "graph Acidify [[ main ]]";
  if (!sourceTemplate.includes(mainNeedle)) throw new Error("Production main graph not found");
  await writeFile(sourcePath, `${sourceTemplate.replace(mainNeedle, "graph Acidify")}${harnessText}`);
  await writeFile(manifestPath, `${JSON.stringify({
    ...manifestTemplate,
    source: sourceName,
    view: undefined,
  }, null, 2)}\n`);

  const render = spawnSync(cmaj, [
    "render",
    `--rate=${sampleRate}`,
    `--length=${Math.round(sampleRate * lengthSeconds)}`,
    `--channels=${channelCount}`,
    "--blockSize=128",
    `--output=${wavPath}`,
    manifestPath,
  ], { cwd: temp, encoding: "utf8", env: process.env });
  if (render.status !== 0) {
    process.stderr.write(render.stdout || "");
    process.stderr.write(render.stderr || "");
    throw new Error(`cmaj render (${tag}) failed with exit code ${render.status}`);
  }

  const channels = readChannels(await readFile(wavPath));
  if (channels.length !== channelCount) {
    throw new Error(`${tag}: expected ${channelCount}-channel trace, got ${channels.length} channels`);
  }
  return channels;
}

try {
  const channels = await renderTrace("transport", harness, 6, 3.0);
  const internal = transitions(channels[0]);
  const daw = transitions(channels[1]);
  const fallback = transitions(channels[2]);
  const handoffTempo = time => channels[3][Math.round(time * sampleRate)] * 300;
  const internalSwing = transitions(channels[4]);
  const dawSwing = transitions(channels[5]);
  const internalOrigin = validate(internal, expectedInternal(), "Internal clock");
  const dawOrigin = validate(daw, expectedDaw(), "DAW clock");
  const fallbackOrigin = validate(fallback, expectedInternal(), "DAW no-host fallback");
  const internalSwingOrigin = validate(internalSwing, expectedInternalSwing(), "Internal swing");
  const dawSwingOrigin = validate(dawSwing, expectedDawSwing(), "DAW swing");
  // The public 4× graph forwards status events with a fixed reporting latency,
  // so sample well inside each stable section rather than at the event edge.
  const handoffBeforeChange = handoffTempo(0.75);
  const handoffDuringSync = handoffTempo(1.8);
  const handoffAfterRelease = handoffTempo(2.7);

  const phraseChannels = await renderTrace("phrase", phraseHarness, 2, 2.0);
  const phraseSteps = transitions(phraseChannels[1]);
  const phraseAudio = phraseChannels[0];
  const stepStart = step => {
    const hit = phraseSteps.find(t => t.step === step);
    if (!hit) throw new Error(`DAW phrase gate: step ${step} never started: ${JSON.stringify(phraseSteps)}`);
    return hit.frame;
  };
  // Fenster spaet im Step (95..120 ms nach Stepstart bei 125 ms Steplaenge):
  // nach der Stepmitte (62,5 ms) plus 8 ms Halten + 8 ms Rampe der
  // unaccentierten Abschaltung ist ein gekapptes Gate hier sicher still.
  const lateRms = step => {
    const from = stepStart(step) + Math.round(0.095 * sampleRate);
    const to = stepStart(step) + Math.round(0.120 * sampleRate);
    if (to > phraseAudio.length) {
      throw new Error(`DAW phrase gate: window for step ${step} exceeds render`
        + ` (${to} > ${phraseAudio.length})`);
    }
    let sum = 0;
    for (let i = from; i < to; i += 1) sum += phraseAudio[i] * phraseAudio[i];
    return Math.sqrt(sum / Math.max(to - from, 1));
  };
  const phraseSlideHold = lateRms(3);   // Phrase-Slide, Pattern sagt Gate-ohne-Slide
  const phraseGateRelease = lateRms(8); // Phrase-Gate, Pattern sagt Rest
  if (phraseSlideHold < 0.01) {
    throw new Error(`DAW phrase gate: slide step was cut at mid-step (late rms ${phraseSlideHold})`);
  }
  if (phraseGateRelease > phraseSlideHold / 8 || phraseGateRelease > 0.004) {
    throw new Error(`DAW phrase gate: plain gate step was held past mid-step (late rms ${phraseGateRelease})`);
  }

  const gridChannels = await renderTrace("grid", gridHarness, 8, 3.75);
  const gridEighth = transitions(gridChannels[0]);
  const gridTriplet = transitions(gridChannels[1]);
  const gridSwing = transitions(gridChannels[2]);
  const reverse = transitions(gridChannels[3]);
  const pendulum = transitions(gridChannels[4]);
  const invert = transitions(gridChannels[5]);
  const random = transitions(gridChannels[6]);
  const dawGrid = transitions(gridChannels[7]);
  validate(gridEighth, expectedGridEighth(), "Grid 1/8 internal");
  validate(gridTriplet, expectedGridTriplet(), "Grid 1/16T internal");
  validate(gridSwing, expectedGridSwing(), "Grid 1/8 + 100% swing");
  validate(reverse, expectedReverse(), "Play mode REV");
  validate(pendulum, expectedPendulum(), "Play mode FWD&REV");
  validate(invert, expectedInvert(), "Play mode INVERT");
  validate(random, expectedRandom(), "Play mode RND (Lehmer)");
  validate(dawGrid, expectedDawGrid(), "DAW PPQ binding at grid 1/8");
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
    rendererLatencyFrames: {
      internal: internalOrigin,
      daw: dawOrigin,
      fallback: fallbackOrigin,
      internalSwing: internalSwingOrigin,
      dawSwing: dawSwingOrigin,
    },
    internalTransitions: internal,
    dawTransitions: daw,
    fallbackTransitions: fallback,
    internalSwingTransitions: internalSwing,
    dawSwingTransitions: dawSwing,
    gridTransitions: {
      gridEighth,
      gridTriplet,
      gridSwing,
      reverse,
      pendulum,
      invert,
      random,
      dawGrid,
    },
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
      internalTripletSwing: true,
      dawTripletSwing: true,
      gridEighthInternal: true,
      gridTripletInternal: true,
      gridSwingPairs: true,
      playModeReverse: true,
      playModePendulum: true,
      playModeInvert: true,
      playModeRandomDeterministic: true,
      dawGridPositionBinding: true,
      dawPhraseEffectiveFlags: true,
    },
    dawPhraseGate: {
      slideHoldLateRms: +phraseSlideHold.toFixed(5),
      gateReleaseLateRms: +phraseGateRelease.toFixed(6),
    },
  }));
} finally {
  if (process.env.ACIDIFY_KEEP_TEMP === "1") {
    console.error(`Kept transport workspace: ${temp}`);
  } else {
    await rm(temp, { recursive: true, force: true });
  }
}
