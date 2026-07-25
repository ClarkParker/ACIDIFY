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
    stepGroups: document.querySelectorAll(".step-group").length,
    pitchKeys: document.querySelectorAll(".pitch-key").length,
    whiteKeys: document.querySelectorAll(".pitch-key.white-key").length,
    blackKeys: document.querySelectorAll(".pitch-key.black-key").length,
    studioCells: document.querySelectorAll(".studio-cell").length,
    studioActions: document.querySelectorAll("[data-studio-action]").length,
  }));
  if (counts.controls !== 12 || counts.sequenceSteps !== 16 || counts.pitchKeys !== 12
      || counts.stepGroups !== 4 || counts.whiteKeys !== 7 || counts.blackKeys !== 5
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
    const transport = rect(".transport-bank");
    const synthesis = rect(".tone-bank");
    const master = rect(".volume-bank");
    const waveform = rect('.wave-buttons button[data-value="1"]');
    const toneDials = [...document.querySelectorAll(".tone-bank .dial")].map(node => {
      const bounds = node.getBoundingClientRect();
      return { centerY: bounds.top + bounds.height / 2 };
    });
    const volumeDial = rect('.control[data-param="param8"] .dial');
    const controlCenters = [
      waveform.top + waveform.height / 2,
      ...toneDials.map(dial => dial.centerY),
      volumeDial.top + volumeDial.height / 2,
    ];
    return {
      moduleGaps: [synthesis.left - transport.right, master.left - synthesis.right],
      synthesisMasterTopSpread: Math.abs(synthesis.top - master.top),
      synthesisMasterBottomSpread: Math.abs(synthesis.bottom - master.bottom),
      soundControlAxisSpread: Math.max(...controlCenters) - Math.min(...controlCenters),
      accentToMaster: master.left - accent.right,
      volumeLeftInset: volume.left - master.left,
      volumeRightInset: master.right - volume.right,
    };
  });
  if (upperPanelGeometry.moduleGaps.some(gap => gap < 12)
      || upperPanelGeometry.synthesisMasterTopSpread > 1
      || upperPanelGeometry.synthesisMasterBottomSpread > 1
      || upperPanelGeometry.soundControlAxisSpread > 2
      || upperPanelGeometry.accentToMaster < 12
      || upperPanelGeometry.volumeLeftInset < 12
      || upperPanelGeometry.volumeRightInset < 12) {
    throw new Error(`Unsafe upper-panel divider clearance: ${JSON.stringify(upperPanelGeometry)}`);
  }

  const lowerPanelGeometry = await page.evaluate(() => {
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
    const groups = [...document.querySelectorAll(".step-group")].map(node => {
      const bounds = node.getBoundingClientRect();
      return { left: bounds.left, right: bounds.right, width: bounds.width };
    });
    const status = rect(".edit-status");
    const keyboard = rect(".keyboard");
    const timing = rect(".time-controls");
    const functionButtons = [...document.querySelectorAll(".time-controls .function-button")].map(node => {
      const bounds = node.getBoundingClientRect();
      return {
        left: bounds.left,
        right: bounds.right,
        top: bounds.top,
        bottom: bounds.bottom,
        layoutLeft: node.offsetLeft,
        layoutTop: node.offsetTop,
      };
    });
    const c = rect('.pitch-key[data-pitch="0"]');
    const d = rect('.pitch-key[data-pitch="2"]');
    const cSharp = rect('.pitch-key[data-pitch="1"]');
    return {
      groups,
      groupGaps: groups.slice(1).map((group, index) => group.left - groups[index].right),
      moduleGaps: [keyboard.left - status.right, timing.left - keyboard.right],
      moduleTopSpread: Math.max(status.top, keyboard.top, timing.top) - Math.min(status.top, keyboard.top, timing.top),
      moduleBottomSpread: Math.max(status.bottom, keyboard.bottom, timing.bottom) - Math.min(status.bottom, keyboard.bottom, timing.bottom),
      actionMatrix: {
        width: timing.width,
        columns: new Set(functionButtons.map(button => button.layoutLeft)).size,
        rows: new Set(functionButtons.map(button => button.layoutTop)).size,
        contained: functionButtons.every(button => button.left >= timing.left + 7
          && button.right <= timing.right - 7
          && button.top >= timing.top + 7
          && button.bottom <= timing.bottom - 7),
      },
      blackKeyOverlay: {
        betweenCAndD: cSharp.left < c.right && cSharp.right > d.left,
        shorterThanWhite: cSharp.height < c.height,
        inFront: Number(getComputedStyle(document.querySelector('.pitch-key[data-pitch="1"]')).zIndex),
      },
    };
  });
  if (lowerPanelGeometry.groupGaps.some(gap => gap < 12)
      || lowerPanelGeometry.moduleGaps.some(gap => gap < 12)
      || lowerPanelGeometry.moduleTopSpread > 1
      || lowerPanelGeometry.moduleBottomSpread > 1
      || lowerPanelGeometry.actionMatrix.width < 275
      || lowerPanelGeometry.actionMatrix.columns !== 3
      || lowerPanelGeometry.actionMatrix.rows !== 2
      || !lowerPanelGeometry.actionMatrix.contained
      || !lowerPanelGeometry.blackKeyOverlay.betweenCAndD
      || !lowerPanelGeometry.blackKeyOverlay.shorterThanWhite
      || lowerPanelGeometry.blackKeyOverlay.inFront < 2) {
    throw new Error(`Unsafe lower-panel geometry: ${JSON.stringify(lowerPanelGeometry)}`);
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
    lowerPanelGeometry,
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
