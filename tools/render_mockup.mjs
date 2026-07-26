import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const classicOutput = path.join(root, "mockup", "ACIDIFY_UI_Mockup.png");
const studioOutput = path.join(root, "mockup", "ACIDIFY_UI_Studio_Mockup.png");

try {
  const { chromium } = require("playwright");
  const executablePath = process.env.ACIDIFY_CHROMIUM_PATH;
  // Siehe tools/ui_smoke_test.mjs: das ES-Modul über file:// braucht dieses Flag
  // immer, die Sandbox-Flags nur bei einem extern vorgegebenen Binary.
  const launchArgs = ["--allow-file-access-from-files"];
  if (executablePath)
    launchArgs.push("--no-sandbox", "--disable-setuid-sandbox", "--single-process");

  const browser = await chromium.launch({
    headless: true,
    executablePath: executablePath || undefined,
    args: launchArgs,
  });
  const page = await browser.newPage({ viewport: { width: 1180, height: 580 }, deviceScaleFactor: 1 });
  const pageErrors = [];
  page.on("pageerror", error => pageErrors.push(error.message));
  const previewURL = pathToFileURL(path.join(root, "mockup", "preview.html")).href;
  await page.goto(previewURL);
  await page.waitForSelector("acidify-patch-view .chassis", { state: "visible" });
  await page.waitForTimeout(700);
  if (pageErrors.length) throw new Error(`UI page error: ${pageErrors.join("; ")}`);
  const chassis = page.locator("acidify-patch-view .chassis");
  await chassis.screenshot({ path: classicOutput });
  await page.goto(`${previewURL}?mode=studio`);
  await page.waitForSelector("acidify-patch-view.studio-mode .studio-matrix", { state: "visible" });
  await page.waitForTimeout(700);
  if (pageErrors.length) throw new Error(`UI page error: ${pageErrors.join("; ")}`);
  await chassis.screenshot({ path: studioOutput });
  await browser.close();
  console.log(`Rendered live UI: ${classicOutput}`);
  console.log(`Rendered live UI: ${studioOutput}`);
} catch (error) {
  console.error(`Live UI render failed: ${error.message}`);
  process.exitCode = 1;
}
