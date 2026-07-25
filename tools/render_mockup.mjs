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
  await page.goto(pathToFileURL(path.join(root, "mockup", "preview.html")).href);
  await page.waitForSelector("acidify-patch-view .chassis", { state: "visible" });
  await page.waitForTimeout(700);
  if (pageErrors.length) throw new Error(`UI page error: ${pageErrors.join("; ")}`);
  await page.screenshot({ path: classicOutput });
  await page.locator(".studio-toggle").click();
  await page.waitForTimeout(220);
  await page.screenshot({ path: studioOutput });
  await browser.close();
  console.log(`Rendered live UI: ${classicOutput}`);
  console.log(`Rendered live UI: ${studioOutput}`);
} catch (error) {
  console.error(`Live UI render failed: ${error.message}`);
  process.exitCode = 1;
}
