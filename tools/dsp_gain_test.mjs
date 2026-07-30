// Distortion-Lautheitstest ueber den ECHTEN Host-Pfad: die Parameter kommen
// als Events in den Produktions-Graphen (keine State-Patches), gemessen wird
// A-bewichtet (FFT, IEC-A-Kurve) gegen die Raw-Spur. Verhindert, dass die
// Modi-Angleichung nur auf dem Papier (Roh-RMS) stimmt.
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cmaj = process.argv[2] || process.env.CMAJ || "cmaj";
const sampleRate = Math.max(8000, Math.round(Number(process.argv[3]) || 48000));
const temp = await mkdtemp(path.join(os.tmpdir(), "acidify-gain-test-"));
const sourceTemplate = await readFile(path.join(root, "ACIDIFYDSP.cmajor"), "utf8");
const manifestTemplate = JSON.parse(await readFile(path.join(root, "ACIDIFY.cmajorpatch"), "utf8"));

const harness = String.raw`
processor GainEvents
{
    output event std::midi::Message midiOut;
    output event float p45;
    output event float p46;
    output event float p47;
    output event float p48;
    int frame = 0;
    void main()
    {
        loop
        {
            if (frame == int (float (processor.frequency) * 0.05f))
            {
                p45 <- __P45__;
                p46 <- __P46__;
                p47 <- __P47__;
                p48 <- 1.0f;
            }
            let step = int (float (processor.frequency) * 0.125f);
            let index = frame / step;
            let pos = frame % step;
            if (pos == 0 && index < 16)
                midiOut <- std::midi::createMessage (0x90, 0x24 + ((index % 4) == 0 ? 12 : 0), (index % 4) == 0 ? 0x7f : 0x50);
            else if (pos == step / 2 && index < 16)
                midiOut <- std::midi::createMessage (0x80, 0x24 + ((index % 4) == 0 ? 12 : 0), 0x00);
            frame += 1;
            advance();
        }
    }
}

graph GainProbe [[ main ]]
{
    output stream float<2> out;
    node events = GainEvents;
    node core = AcidifyCore * 4;
    connection
    {
        events.midiOut -> core.midiIn;
        events.p45 -> core.param45;
        events.p46 -> core.param46;
        events.p47 -> core.param47;
        events.p48 -> core.param48;
        core.out -> out;
    }
}
`;

const f = value => Number.isInteger(value) ? `${value}.0f` : `${value}f`;

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

function fft(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i += 1) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = -2 * Math.PI / len;
    const wr = Math.cos(ang), wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; k += 1) {
        const ur = re[i + k], ui = im[i + k];
        const vr = re[i + k + len / 2] * cr - im[i + k + len / 2] * ci;
        const vi = re[i + k + len / 2] * ci + im[i + k + len / 2] * cr;
        re[i + k] = ur + vr; im[i + k] = ui + vi;
        re[i + k + len / 2] = ur - vr; im[i + k + len / 2] = ui - vi;
        const ncr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = ncr;
      }
    }
  }
}

function aWeight(frequency) {
  if (frequency <= 0) return 0;
  const f2 = frequency * frequency;
  const numerator = 12194 ** 2 * f2 * f2;
  const denominator = (f2 + 20.6 ** 2)
    * Math.sqrt((f2 + 107.7 ** 2) * (f2 + 737.9 ** 2)) * (f2 + 12194 ** 2);
  return numerator / denominator / 0.7943;
}

function analyse(buffer) {
  const fmt = findChunk(buffer, "fmt ");
  const data = findChunk(buffer, "data");
  const channels = buffer.readUInt16LE(fmt.offset + 2);
  const count = Math.floor(data.size / 4);
  const mono = new Float64Array(Math.floor(count / channels));
  let peak = 0;
  for (let index = 0; index < count; index += 1) {
    const value = buffer.readFloatLE(data.offset + index * 4);
    if (!Number.isFinite(value)) throw new Error(`Non-finite sample at ${index}`);
    peak = Math.max(peak, Math.abs(value));
    if (index % channels === 0) mono[Math.floor(index / channels)] = value;
  }
  let n = 1;
  while (n < mono.length) n <<= 1;
  const re = new Float64Array(n), im = new Float64Array(n);
  re.set(mono);
  fft(re, im);
  let sum = 0;
  for (let k = 1; k < n / 2; k += 1) {
    const w = aWeight(k * sampleRate / n);
    sum += (re[k] * re[k] + im[k] * im[k]) * w * w * 2;
  }
  return { peak, aRms: Math.sqrt(sum / n) / Math.sqrt(mono.length) };
}

async function render(name, { enabled, type, drive }) {
  const dir = path.join(temp, name);
  await mkdir(dir, { recursive: true });
  let source = sourceTemplate.replace("graph Acidify [[ main ]]", "graph Acidify");
  source += harness
    .replace("__P45__", enabled ? "1.0f" : "0.0f")
    .replace("__P46__", f(type))
    .replace("__P47__", f(drive));
  await writeFile(path.join(dir, "ACIDIFYDSP.cmajor"), source);
  await writeFile(path.join(dir, "P.cmajorpatch"),
    `${JSON.stringify({ ...manifestTemplate, source: "ACIDIFYDSP.cmajor", view: undefined }, null, 2)}\n`);
  const wavPath = path.join(dir, "out.wav");
  const result = spawnSync(cmaj, [
    "render", `--rate=${sampleRate}`, `--length=${Math.round(sampleRate * 2.5)}`,
    "--channels=2", "--blockSize=128", `--output=${wavPath}`, path.join(dir, "P.cmajorpatch"),
  ], { cwd: dir, encoding: "utf8", env: process.env });
  if (result.status !== 0) {
    process.stderr.write(result.stdout || "");
    process.stderr.write(result.stderr || "");
    throw new Error(`${name}: cmaj render failed with exit code ${result.status}`);
  }
  return analyse(await readFile(wavPath));
}

try {
  const raw = await render("raw", { enabled: false, type: 0, drive: 0.35 });
  const dB = ratio => 20 * Math.log10(ratio);
  const cases = [
    { name: "pure-0.35", type: 0, drive: 0.35, min: -1.0, max: 1.0 },
    { name: "mackie-0.35", type: 1, drive: 0.35, min: -1.0, max: 1.0 },
    { name: "phono-0.35", type: 2, drive: 0.35, min: -1.0, max: 1.0 },
    { name: "phono-1.0", type: 2, drive: 1.0, min: -3.6, max: 0.5 },
  ];
  const report = {};
  for (const testCase of cases) {
    const metrics = await render(testCase.name, { enabled: true, type: testCase.type, drive: testCase.drive });
    const aRel = dB(metrics.aRms / raw.aRms);
    report[testCase.name] = { aRel: Number(aRel.toFixed(2)), peak: Number(metrics.peak.toFixed(4)) };
    if (aRel < testCase.min || aRel > testCase.max) {
      throw new Error(`${testCase.name}: A-weighted level off by ${aRel.toFixed(2)} dB (allowed ${testCase.min}..${testCase.max})`);
    }
    if (metrics.peak > 1.05) throw new Error(`${testCase.name}: peak ${metrics.peak} exceeds full scale`);
  }
  console.log(JSON.stringify({ ok: true, sampleRate, rawPeak: Number(raw.peak.toFixed(4)), cases: report }));
} finally {
  await rm(temp, { recursive: true, force: true });
}
