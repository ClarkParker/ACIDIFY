import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const renders = [
  { mode: "classic", width: 1180, height: 580, file: "ACIDIFY_UI_Mockup.png" },
  { mode: "sync", width: 1180, height: 580, file: "ACIDIFY_UI_DAW_Sync_Mockup.png" },
  { mode: "studio", width: 1180, height: 580, file: "ACIDIFY_UI_Studio_Mockup.png" },
  { mode: "distortion", width: 1180, height: 580, file: "ACIDIFY_UI_Distortion_Mockup.png" },
  { mode: "classic", width: 590, height: 290, file: "ACIDIFY_UI_Mockup_590x290.png" },
  { mode: "sync", width: 590, height: 290, file: "ACIDIFY_UI_DAW_Sync_Mockup_590x290.png" },
  { mode: "studio", width: 590, height: 290, file: "ACIDIFY_UI_Studio_Mockup_590x290.png" },
  { mode: "distortion", width: 590, height: 290, file: "ACIDIFY_UI_Distortion_Mockup_590x290.png" },
];

try {
  const { chromium } = require("playwright");
  const executablePath = process.env.ACIDIFY_CHROMIUM_PATH;
  const browser = await chromium.launch({
    headless: true,
    executablePath: executablePath || undefined,
    args: executablePath
      ? ["--no-sandbox", "--disable-setuid-sandbox", "--single-process", "--allow-file-access-from-files"]
      : [],
  });
  const page = await browser.newPage({ viewport: { width: 1180, height: 580 }, deviceScaleFactor: 1 });
  const pageErrors = [];
  page.on("pageerror", error => pageErrors.push(error.message));
  const previewURL = pathToFileURL(path.join(root, "mockup", "preview.html")).href;
  for (const render of renders) {
    await page.setViewportSize({ width: render.width, height: render.height });
    const url = render.mode === "classic" ? previewURL : `${previewURL}?mode=${render.mode}`;
    await page.goto(url);
    const readySelector = render.mode === "studio"
      ? "acidify-patch-view.studio-mode .studio-matrix"
      : render.mode === "distortion"
        ? "acidify-patch-view.distortion-open .distortion-overlay"
        : "acidify-patch-view .classic-editor";
    await page.waitForSelector(readySelector, { state: "visible" });
    await page.waitForTimeout(700);
    if (pageErrors.length) throw new Error(`UI page error: ${pageErrors.join("; ")}`);
    const output = path.join(root, "mockup", render.file);
    await page.locator("acidify-patch-view .chassis").screenshot({ path: output });
    console.log(`Rendered live UI: ${output}`);
  }
  await browser.close();
} catch (error) {
  console.error(`Live UI render failed: ${error.message}`);
  process.exitCode = 1;
}
