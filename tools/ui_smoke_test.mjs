import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const executablePath = process.env.ACIDIFY_CHROMIUM_PATH;
const { chromium } = require("playwright");

const browser = await chromium.launch({
  headless: true,
  executablePath: executablePath || undefined,
  args: executablePath
    ? ["--no-sandbox", "--disable-setuid-sandbox", "--single-process", "--allow-file-access-from-files"]
    : [],
});

try {
  const page = await browser.newPage({ viewport: { width: 1180, height: 580 } });
  const pageErrors = [];
  page.on("pageerror", error => pageErrors.push(error.message));
  await page.goto(pathToFileURL(path.join(root, "mockup", "preview.html")).href);
  await page.waitForSelector("acidify-patch-view .chassis", { state: "visible" });

  const counts = await page.evaluate(() => ({
    controls: document.querySelectorAll(".control[data-param]").length,
    sequenceSteps: document.querySelectorAll(".sequence-step").length,
    pitchKeys: document.querySelectorAll(".pitch-key").length,
    studioCells: document.querySelectorAll(".studio-cell").length,
    studioActions: document.querySelectorAll("[data-studio-action]").length,
  }));
  if (counts.controls !== 12 || counts.sequenceSteps !== 16 || counts.pitchKeys !== 12
      || counts.studioCells !== 64 || counts.studioActions !== 11) {
    throw new Error(`Unexpected UI element counts: ${JSON.stringify(counts)}`);
  }

  const upperPanelGeometry = await page.evaluate(() => {
    const rect = selector => {
      const bounds = document.querySelector(selector)?.getBoundingClientRect();
      if (!bounds) throw new Error(`Missing geometry target: ${selector}`);
      return {
        left: bounds.left,
        right: bounds.right,
        top: bounds.top,
        bottom: bounds.bottom,
        width: bounds.width,
        height: bounds.height,
      };
    };
    const accent = rect('.control[data-param="param6"] .tick-ring');
    const volume = rect('.control[data-param="param8"] .tick-ring');
    const master = rect(".volume-bank");
    return {
      accentToMaster: master.left - accent.right,
      volumeLeftInset: volume.left - master.left,
      volumeRightInset: master.right - volume.right,
    };
  });
  if (upperPanelGeometry.accentToMaster < 12
      || upperPanelGeometry.volumeLeftInset < 12
      || upperPanelGeometry.volumeRightInset < 12) {
    throw new Error(`Unsafe upper-panel divider clearance: ${JSON.stringify(upperPanelGeometry)}`);
  }

  const cutoff = page.locator('.control[data-param="param2"] .dial');
  const before = Number(await cutoff.getAttribute("aria-valuenow"));
  await cutoff.focus();
  await cutoff.press("ArrowRight");
  const after = Number(await cutoff.getAttribute("aria-valuenow"));
  if (!(after > before)) throw new Error(`Keyboard dial input failed: ${before} -> ${after}`);

  await page.locator('.wave-buttons button[data-value="1"]').click();
  if (await page.locator('.wave-buttons button[data-value="1"]').getAttribute("aria-pressed") !== "true") {
    throw new Error("Waveform toggle failed");
  }

  await page.locator(".run-switch button:visible").click();
  if (!(await page.locator(".run-lamp").evaluate(node => node.classList.contains("lit")))) {
    throw new Error("Run switch failed");
  }

  await page.locator('.sequence-step[data-step="7"]').click();
  if (!(await page.locator('.sequence-step[data-step="7"]').evaluate(node => node.classList.contains("selected")))) {
    throw new Error("Step selection failed");
  }

  const view = page.locator("acidify-patch-view");
  if (await view.evaluate(node => node.classList.contains("studio-mode"))) {
    throw new Error("Classic mode is not the default");
  }
  await page.locator(".studio-toggle").click();
  if (!(await view.evaluate(node => node.classList.contains("studio-mode")))) {
    throw new Error("Studio mode toggle failed");
  }

  await page.locator('.sequence-step[data-step="3"]').click();
  await page.locator('.sequence-step[data-step="6"]').click({ modifiers: ["Shift"] });
  const multiSelected = await page.locator(".sequence-step.multi-selected").count();
  if (multiSelected !== 4) throw new Error(`Studio range selection failed: ${multiSelected}`);

  const accent8 = page.locator('.studio-cell[data-kind="accent"][data-step="8"]');
  const accent9 = page.locator('.studio-cell[data-kind="accent"][data-step="9"]');
  const accent10 = page.locator('.studio-cell[data-kind="accent"][data-step="10"]');
  const start = await accent8.boundingBox();
  const end = await accent10.boundingBox();
  if (!start || !end) throw new Error("Studio paint cells are not visible");
  await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2);
  await page.mouse.down();
  await page.mouse.move(end.x + end.width / 2, end.y + end.height / 2, { steps: 8 });
  await page.mouse.up();
  if (!(await accent8.evaluate(node => node.classList.contains("active")))
      || !(await accent9.evaluate(node => node.classList.contains("active")))
      || !(await accent10.evaluate(node => node.classList.contains("active")))) {
    throw new Error("Studio drag-paint failed");
  }
  await page.locator('[data-studio-action="undo"]').click();
  if (await accent8.evaluate(node => node.classList.contains("active"))) {
    throw new Error("Studio undo failed");
  }

  await page.locator('.sequence-step[data-step="0"]').click();
  await page.locator('[data-studio-action="copy"]').click();
  await page.locator('.sequence-step[data-step="15"]').click();
  const beforePaste = await view.evaluate(node => node._stepSnapshot());
  await page.locator('[data-studio-action="paste"]').click();
  const afterPaste = await view.evaluate(node => node._stepSnapshot());
  if (afterPaste[15].pitch !== afterPaste[0].pitch || afterPaste[15].flags !== afterPaste[0].flags) {
    throw new Error("Studio copy/paste failed");
  }
  await page.keyboard.press("Control+z");
  const afterKeyboardUndo = await view.evaluate(node => node._stepSnapshot());
  if (afterKeyboardUndo[15].pitch !== beforePaste[15].pitch
      || afterKeyboardUndo[15].flags !== beforePaste[15].flags) {
    throw new Error("Studio keyboard undo failed");
  }

  await page.locator('.sequence-step[data-step="3"]').click();
  await page.locator('.sequence-step[data-step="6"]').click({ modifiers: ["Shift"] });
  const beforeTranspose = await view.evaluate(node => node._stepSnapshot());
  await page.locator('[data-studio-action="transpose-up"]').click();
  const afterTranspose = await view.evaluate(node => node._stepSnapshot());
  for (let index = 3; index <= 6; index += 1) {
    if (afterTranspose[index].pitch !== Math.min(24, beforeTranspose[index].pitch + 12)) {
      throw new Error(`Studio batch transpose failed at step ${index + 1}`);
    }
  }
  await page.locator('[data-studio-action="rest"]').click();
  const afterRest = await view.evaluate(node => node._stepSnapshot());
  if (afterRest.slice(3, 7).some(step => (step.flags & 1) !== 0)) {
    throw new Error("Studio batch rest failed");
  }
  await page.locator('[data-studio-action="undo"]').click();
  await page.locator('[data-studio-action="undo"]').click();

  await cutoff.focus();
  await cutoff.press("ArrowRight");
  if (!(await cutoff.locator("..").evaluate(node => node.classList.contains("value-visible")))) {
    throw new Error("Studio value feedback failed");
  }

  await page.setViewportSize({ width: 590, height: 290 });
  await page.waitForTimeout(350);
  const bounds = await page.locator("acidify-patch-view .chassis").boundingBox();
  if (!bounds || bounds.width > 591 || bounds.height > 291) {
    throw new Error(`Responsive scaling failed: ${JSON.stringify(bounds)}`);
  }

  if (pageErrors.length) throw new Error(`UI page error: ${pageErrors.join("; ")}`);
  console.log(JSON.stringify({
    ok: true,
    counts,
    upperPanelGeometry,
    cutoff: { before, after },
    studio: {
      multiSelected,
      dragPaint: true,
      undo: true,
      copyPaste: true,
      keyboardUndo: true,
      batchTranspose: true,
      batchRest: true,
    },
    scaledBounds: bounds,
  }));
} finally {
  await browser.close();
}
