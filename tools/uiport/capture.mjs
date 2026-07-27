// Capture Soll (design template) and Ist (real ACIDIFYUI.js) at 1180x580 in 4 states.
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import path from "node:path";
import fs from "node:fs";

const SP = "/tmp/claude-0/-home-user/0aabc4bd-199f-5b28-a7c3-419feec50919/scratchpad";
const ROOT = "/home/user/ACIDIFY";
const OUT = path.join(SP, "shots");
fs.mkdirSync(OUT, { recursive: true });

const require = createRequire(path.join(SP, "node_modules/"));
const { chromium } = require("playwright");
const exe = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

const launch = () => chromium.launch({
  headless: true,
  executablePath: exe,
  args: ["--allow-file-access-from-files", "--no-sandbox", "--disable-setuid-sandbox",
         "--single-process", "--force-device-scale-factor=1", "--hide-scrollbars",
         "--disable-lcd-text", "--font-render-hinting=none"],
});
let browser = await launch();

async function shoot(page, sel, file) {
  const el = page.locator(sel).locator("visible=true").first();
  await el.waitFor({ state: "visible" });
  // Maus neutral parken und Fokus lösen, damit kein Hover-/Fokus-Tooltip im Bild hängt
  await page.mouse.move(2, 578);
  await page.evaluate(() => document.activeElement && document.activeElement.blur && document.activeElement.blur());
  await page.waitForTimeout(300);
  const box = await el.boundingBox();
  await page.screenshot({ path: path.join(OUT, file),
    clip: { x: Math.round(box.x), y: Math.round(box.y), width: 1180, height: 580 } });
  console.log(file, JSON.stringify(box));
}

// ---------- Soll: design template ----------
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 700 } });
  page.on("pageerror", e => console.error("REF pageerror:", e.message));
  await page.route("https://unpkg.com/**", route => {
    const url = route.request().url();
    const local = url.includes("react-dom") ? "react-dom.production.min.js"
      : url.includes("react@") ? "react.production.min.js"
      : url.includes("babel") ? "babel.min.js" : null;
    if (!local) return route.abort();
    route.fulfill({ path: path.join(SP, local), contentType: "application/javascript" });
  });
  await page.goto(pathToFileURL(path.join(ROOT, "design", "ACIDIFY GUI.dc.html")).href);
  await page.waitForFunction(() => {
    const hit = [...document.querySelectorAll("div")].find(d => d.offsetWidth === 1180 && d.offsetHeight === 580);
    if (hit) hit.setAttribute("data-shot-frame", "1");
    return Boolean(hit);
  }, undefined, { timeout: 20000 });
  const frameSel = "div[data-shot-frame]";
  await page.waitForTimeout(400);
  await shoot(page, frameSel, "ref_classic.png");

  // studio
  await page.click('button[data-mode="1"]');
  await page.waitForTimeout(250);
  await shoot(page, frameSel, "ref_studio.png");
  await page.click('button[data-mode="0"]');
  await page.waitForTimeout(250);

  // distortion overlay (button text DIST)
  await page.click('button:has-text("DIST")');
  await page.waitForTimeout(250);
  await shoot(page, frameSel, "ref_dist.png");
  await page.locator('button:text-is("×")').locator("visible=true").first().click();
  await page.waitForTimeout(250);

  // mods overlay
  await page.click('button:has-text("MOD"):not(:has-text("DIST"))');
  await page.waitForTimeout(250);
  await shoot(page, frameSel, "ref_mods.png");
  await page.close();
}

// ---------- Ist: real UI ----------
await browser.close();
browser = await launch();
{
  const page = await browser.newPage({ viewport: { width: 1180, height: 580 } });
  page.on("pageerror", e => console.error("ACT pageerror:", e.message));
  await page.goto(pathToFileURL(path.join(ROOT, "mockup", "_capture.html")).href);
  await page.waitForSelector("acidify-patch-view .chassis", { state: "visible" });
  await page.waitForTimeout(400);

  await shoot(page, "acidify-patch-view .chassis", "act_classic.png");

  // studio
  await page.click(".studio-toggle");
  await page.waitForTimeout(250);
  await shoot(page, "acidify-patch-view .chassis", "act_studio.png");
  await page.click(".studio-toggle");
  await page.waitForTimeout(250);

  // distortion overlay
  await page.click(".distortion-trigger:not(.mods-trigger)");
  await page.waitForTimeout(250);
  await shoot(page, "acidify-patch-view .chassis", "act_dist.png");
  await page.click(".distortion-close");
  await page.waitForTimeout(200);

  // mods overlay
  await page.click(".mods-trigger");
  await page.waitForTimeout(250);
  await shoot(page, "acidify-patch-view .chassis", "act_mods.png");
  await page.close();
}

await browser.close();
console.log("done");
