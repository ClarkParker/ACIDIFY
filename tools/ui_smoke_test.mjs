import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import fs from "node:fs";

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const executablePath = process.env.ACIDIFY_CHROMIUM_PATH;
const { chromium } = require("playwright");

// preview.html lädt ACIDIFYUI.js als ES-Modul über file://. Chromium blockiert
// solche Anfragen als cross-origin, solange dieses Flag fehlt — unabhängig davon,
// ob das mitgelieferte oder ein externes Binary startet.
const launchArgs = ["--allow-file-access-from-files"];

// Nur nötig, wenn ein fremdes Binary gestartet wird (z. B. als root im Container).
if (executablePath)
  launchArgs.push("--no-sandbox", "--disable-setuid-sandbox", "--single-process");

const browser = await chromium.launch({
  headless: true,
  executablePath: executablePath || undefined,
  args: launchArgs,
});

try {
  const page = await browser.newPage({ viewport: { width: 1180, height: 580 } });
  const pageErrors = [];
  page.on("pageerror", error => pageErrors.push(error.message));
  await page.goto(pathToFileURL(path.join(root, "mockup", "preview.html")).href);
  await page.waitForSelector("acidify-patch-view .chassis", { state: "visible" });

  const counts = await page.evaluate(() => ({
    controls: document.querySelectorAll(".control[data-param]").length,
    endpointControls: document.querySelectorAll(".control[data-endpoint-id]").length,
    sequenceSteps: document.querySelectorAll(".sequence-step").length,
    stepGroups: document.querySelectorAll(".step-group").length,
    pitchKeys: document.querySelectorAll(".pitch-key").length,
    whiteKeys: document.querySelectorAll(".pitch-key.white-key").length,
    blackKeys: document.querySelectorAll(".pitch-key.black-key").length,
    studioCells: document.querySelectorAll(".studio-cell").length,
    studioCellGroups: document.querySelectorAll(".studio-lane .studio-cell-group").length,
    studioRulerGroups: document.querySelectorAll(".studio-ruler-group").length,
    studioActions: document.querySelectorAll("[data-studio-action]").length,
    pitchChoices: document.querySelectorAll(".pitch-menu-choice").length,
    distortionTriggers: document.querySelectorAll(".distortion-trigger:not(.mods-trigger)").length,
    distortionControls: document.querySelectorAll("#distortion-overlay .control[data-param]").length,
    modTriggers: document.querySelectorAll(".mods-trigger").length,
    modControls: document.querySelectorAll("#mods-overlay .control[data-param]").length,
    modRows: document.querySelectorAll(".mod-row").length,
    distortionTypes: document.querySelectorAll(".distortion-types button").length,
    clockModes: document.querySelectorAll(".clock-mode button").length,
    swingControls: document.querySelectorAll('.control[data-param="param50"]').length,
    basslineVisuals: document.querySelectorAll(".bassline-visual").length,
    basslineNodes: document.querySelectorAll(".bassline-node").length,
    tooltipToggles: document.querySelectorAll(".tooltip-toggle").length,
    tooltipBubbles: document.querySelectorAll(".tooltip-bubble").length,
    tooltipTargets: document.querySelectorAll("[data-tooltip]").length,
    nativeTitles: document.querySelectorAll("[title]").length,
    screws: document.querySelectorAll(".screw").length,
  }));
  if (counts.controls !== 31 || counts.endpointControls !== 31
      || counts.sequenceSteps !== 16 || counts.pitchKeys !== 12
      || counts.stepGroups !== 4 || counts.whiteKeys !== 7 || counts.blackKeys !== 5
      || counts.studioCells !== 48 || counts.studioCellGroups !== 12
      || counts.studioRulerGroups !== 4 || counts.studioActions !== 16
      || counts.pitchChoices !== 25
      || counts.distortionTriggers !== 1 || counts.distortionControls !== 4
      || counts.modTriggers !== 1 || counts.modControls !== 9 || counts.modRows !== 6
      || counts.distortionTypes !== 3 || counts.clockModes !== 2
      || counts.swingControls !== 1
      || counts.basslineVisuals !== 0 || counts.basslineNodes !== 0
      || counts.tooltipToggles !== 1 || counts.tooltipBubbles !== 1
      || counts.tooltipTargets < 100 || counts.nativeTitles !== 0
      || counts.screws !== 0) {
    throw new Error(`Unexpected UI element counts: ${JSON.stringify(counts)}`);
  }

  // Classic-Kopf nach dc-Template: Titel links, Utility rechts, Segment-Schalter 44x15 je Segment (CLASSIC/STUDIO/ARP).
  const header = await page.evaluate(() => {
    const rect = selector => {
      const bounds = document.querySelector(selector).getBoundingClientRect();
      return { left: bounds.left, right: bounds.right, width: bounds.width, height: bounds.height };
    };
    const seg = document.querySelector(".studio-toggle .classic-label").getBoundingClientRect();
    return {
      title: rect(".program-title"),
      utility: rect(".utility"),
      headerH: rect(".program-header").height,
      position: document.querySelector(".step-position").textContent.trim(),
      segW: seg.width, segH: seg.height,
    };
  });
  if (header.title.right > header.utility.left
      || Math.round(header.headerH) !== 25
      || !/^(--|\d{2})\s*\/\s*16$/.test(header.position)
      || Math.round(header.segW) !== 44 || Math.round(header.segH) !== 15) {
    throw new Error(`Program header layout failed: ${JSON.stringify(header)}`);
  }

  const stepBadges = await page.evaluate(() => {
    const read = (index, sel) => {
      const node = document.querySelector(`.sequence-step[data-step="${index}"] ${sel}`);
      if (!node) return null;
      const style = getComputedStyle(node);
      const box = node.getBoundingClientRect();
      return { text: node.textContent, width: box.width, height: box.height, background: style.backgroundImage };
    };
    const combined = document.querySelector('.sequence-step[data-step="5"]');
    return {
      accent: read(0, ".pill-a"),
      slide: read(1, ".pill-s"),
      combinedAccent: read(5, ".pill-a"),
      combinedSlide: read(5, ".pill-s"),
      accentLit: getComputedStyle(document.querySelector('.sequence-step[data-step="0"] .pill-a')).backgroundImage,
      combinedLabel: combined.getAttribute("aria-label"),
    };
  });
  if (!stepBadges.accent || stepBadges.accent.text !== "A" || !stepBadges.slide || stepBadges.slide.text !== "S"
      || stepBadges.accent.width < 12 || stepBadges.accent.height < 9
      || !stepBadges.accentLit.includes("linear-gradient")
      || !stepBadges.combinedLabel.includes("Accent")
      || !stepBadges.combinedLabel.includes("Slide")) {
    throw new Error(`Step pills are not rendered: ${JSON.stringify(stepBadges)}`);
  }

  const upperPanelGeometry = await page.evaluate(() => {
    const rect = selector => {
      const bounds = document.querySelector(selector)?.getBoundingClientRect();
      if (!bounds) throw new Error(`Missing geometry target: ${selector}`);
      return { left: bounds.left, right: bounds.right, top: bounds.top, bottom: bounds.bottom, width: bounds.width, height: bounds.height };
    };
    const deckA = rect(".deck-a");
    const deckB = rect(".deck-b");
    const brand = rect(".brand-cell");
    const osc = rect(".osc-cell");
    const tone = rect(".deck-a .tone-bank");
    const master = rect(".deck-a .volume-bank");
    const dials = [...document.querySelectorAll(".deck-a .tone-controls .silver-knob .dial")]
      .map(node => node.getBoundingClientRect());
    return {
      deckAHeight: deckA.height,
      deckBTop: deckB.top - deckA.bottom,
      cellOrder: [brand.right <= osc.left + 1, osc.right <= tone.left + 1, tone.right <= master.left + 1],
      dialCount: dials.length,
      dialAxisSpread: Math.max(...dials.map(d => d.top)) - Math.min(...dials.map(d => d.top)),
      scope: !!document.querySelector(".scope-curve")?.getAttribute("d")?.startsWith("M "),
      vu: !!document.querySelector(".vu-bar.l"),
    };
  });
  if (upperPanelGeometry.deckAHeight < 150 || upperPanelGeometry.deckAHeight > 190
      || upperPanelGeometry.deckBTop < 0
      || upperPanelGeometry.cellOrder.some(ok => !ok)
      || upperPanelGeometry.dialCount !== 6
      || upperPanelGeometry.dialAxisSpread > 2
      || !upperPanelGeometry.scope || !upperPanelGeometry.vu) {
    throw new Error(`Silver deck layout broken: ${JSON.stringify(upperPanelGeometry)}`);
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
        contained: functionButtons.every(button => button.left >= timing.left + 4
          && button.right <= timing.right - 4
          && button.top >= timing.top + 4
          && button.bottom <= timing.bottom - 4),
      },
      blackKeyOverlay: {
        betweenCAndD: cSharp.left < c.right && cSharp.right > d.left,
        shorterThanWhite: cSharp.height < c.height,
        inFront: Number(getComputedStyle(document.querySelector('.pitch-key[data-pitch="1"]')).zIndex),
      },
    };
  });
  if (lowerPanelGeometry.groupGaps.some(gap => gap < 4)
      || lowerPanelGeometry.moduleGaps.some(gap => gap < 6)
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

  const patchView = page.locator("acidify-patch-view");
  await patchView.evaluate(node => node._setTooltipsEnabled(true, false));
  await page.locator('.control[data-param="param2"] .dial').hover();
  await page.waitForTimeout(500);
  if (await patchView.evaluate(node => !node.querySelector(".tooltip-bubble").hidden)) {
    throw new Error("Tooltip appeared before the rest delay elapsed");
  }
  await page.waitForTimeout(700);
  const tooltipOn = await patchView.evaluate(node => ({
    enabled: node._tooltipsEnabled,
    pressed: node.querySelector(".tooltip-toggle").getAttribute("aria-pressed"),
    state: node.querySelector(".tooltip-toggle-state").textContent,
    visible: !node.querySelector(".tooltip-bubble").hidden,
    text: node.querySelector(".tooltip-bubble").textContent,
  }));
  if (!tooltipOn.enabled || tooltipOn.pressed !== "true" || tooltipOn.state !== "ON"
      || !tooltipOn.visible || !tooltipOn.text.includes("filter cutoff")) {
    throw new Error(`English tooltip display failed: ${JSON.stringify(tooltipOn)}`);
  }
  await page.locator(".tooltip-toggle").click();
  await page.locator('.control[data-param="param3"] .dial').hover();
  await page.waitForTimeout(430);
  const tooltipOff = await patchView.evaluate(node => ({
    enabled: node._tooltipsEnabled,
    pressed: node.querySelector(".tooltip-toggle").getAttribute("aria-pressed"),
    state: node.querySelector(".tooltip-toggle-state").textContent,
    visible: !node.querySelector(".tooltip-bubble").hidden,
  }));
  if (tooltipOff.enabled || tooltipOff.pressed !== "false" || tooltipOff.state !== "OFF"
      || tooltipOff.visible) {
    throw new Error(`Tooltip On/Off switch failed: ${JSON.stringify(tooltipOff)}`);
  }
  await page.locator(".tooltip-toggle").click();

  const cutoff = page.locator('.control[data-param="param2"] .dial');
  const before = Number(await cutoff.getAttribute("aria-valuenow"));
  await cutoff.focus();
  await cutoff.press("ArrowRight");
  const after = Number(await cutoff.getAttribute("aria-valuenow"));
  if (!(after > before)) throw new Error(`Keyboard dial input failed: ${before} -> ${after}`);

  const wheelChecks = await patchView.evaluate(node => {
    const spin = (selector, deltaY) => {
      node.querySelector(selector).dispatchEvent(new WheelEvent("wheel", { deltaY, bubbles: true, cancelable: true }));
    };
    const results = {};
    const cutoffBefore = Number(node._values.get("param2"));
    spin('.control[data-param="param2"] .dial', -100);
    results.dialNotch = Number((Number(node._values.get("param2")) - cutoffBefore).toFixed(4));
    spin('.control[data-param="param2"] .dial', 100);
    const swingBeforeWheel = Number(node._values.get("param50"));
    spin('.control[data-param="param50"]', -100);
    results.stepperNotch = Number(node._values.get("param50")) - swingBeforeWheel;
    spin('.control[data-param="param50"]', 100);
    const waveBefore = Number(node._values.get("param7"));
    spin('.control[data-param="param7"]', -100);
    results.buttonsNotch = Number(node._values.get("param7")) - waveBefore;
    spin('.control[data-param="param7"]', 100);
    return results;
  });
  if (wheelChecks.dialNotch !== 0.02 || wheelChecks.stepperNotch !== 1 || wheelChecks.buttonsNotch !== 1) {
    throw new Error(`Wheel steps failed: ${JSON.stringify(wheelChecks)}`);
  }

  const darkOn = await patchView.evaluate(node => {
    node.querySelector(".theme-toggle").click();
    return {
      classed: node.classList.contains("theme-dark"),
      pressed: node.querySelector(".theme-toggle").getAttribute("aria-pressed"),
      chassis: getComputedStyle(node.querySelector(".chassis")).backgroundImage.includes("rgb(74, 78, 79)"),
      darkControls: getComputedStyle(node.querySelector('[data-classic-action="clear-step"]')).backgroundImage.includes("rgb(90, 95, 97)"),
      stored: (() => { try { return window.localStorage.getItem("acidify.theme.dark"); } catch { return null; } })(),
    };
  });
  if (!darkOn.classed || darkOn.pressed !== "true" || !darkOn.chassis || !darkOn.darkControls
      || (darkOn.stored !== null && darkOn.stored !== "true")) {
    throw new Error(`Dark mode did not engage: ${JSON.stringify(darkOn)}`);
  }
  const darkOff = await patchView.evaluate(node => {
    node.querySelector(".theme-toggle").click();
    return {
      classed: node.classList.contains("theme-dark"),
      pressed: node.querySelector(".theme-toggle").getAttribute("aria-pressed"),
    };
  });
  if (darkOff.classed || darkOff.pressed !== "false") {
    throw new Error(`Dark mode did not release: ${JSON.stringify(darkOff)}`);
  }

  const brandRow = await patchView.evaluate(node => {
    const rect = sel => node.querySelector(sel).getBoundingClientRect();
    const row = rect(".tips-power-row");
    const cell = rect(".brand-cell");
    const parts = [".tooltip-toggle", ".theme-toggle", ".power-cell"].map(sel => {
      const b = rect(sel);
      return { sel, inRow: b.left >= row.left - 0.5 && b.right <= row.right + 0.5
        && b.top >= row.top - 2.5 && b.bottom <= row.bottom + 2.5, right: b.right };
    });
    return { parts, rowRight: row.right, cellRight: cell.right };
  });
  if (brandRow.parts.some(part => !part.inRow) || brandRow.rowRight > brandRow.cellRight) {
    throw new Error(`Brand row overflows its cell: ${JSON.stringify(brandRow)}`);
  }
  const brandKeys = await patchView.evaluate(node => {
    const keys = [...node.querySelectorAll(".tips-power-row .brand-key")];
    const widths = keys.map(key => key.getBoundingClientRect().width);
    return {
      count: keys.length,
      widthSpread: Math.max(...widths) - Math.min(...widths),
      leds: keys.map(key => Boolean(key.querySelector(".key-led"))),
      tipsLit: node.querySelector(".tips-led").classList.contains("lit"),
      powerLit: node.querySelector(".power-led").classList.contains("lit"),
    };
  });
  if (brandKeys.count !== 3 || brandKeys.widthSpread > 1 || brandKeys.leds.some(led => !led)
      || !brandKeys.tipsLit || !brandKeys.powerLit) {
    throw new Error(`Brand key row is not uniform: ${JSON.stringify(brandKeys)}`);
  }
  const powerBefore = await patchView.evaluate(node => Number(node._values.get("param60") ?? 1));
  await page.locator(".power-cell").click();
  const powerToggled = await patchView.evaluate(node => ({
    value: Number(node._values.get("param60")),
    led: node.querySelector(".power-led").classList.contains("lit"),
    pressed: node.querySelector(".power-cell").getAttribute("aria-pressed"),
  }));
  if (powerToggled.value !== (powerBefore >= 0.5 ? 0 : 1) || powerToggled.led !== (powerToggled.value >= 0.5)
      || powerToggled.pressed !== `${powerToggled.value >= 0.5}`) {
    throw new Error(`Power button click failed: ${powerBefore} -> ${JSON.stringify(powerToggled)}`);
  }
  await page.locator(".power-cell").click();
  if ((await patchView.evaluate(node => Number(node._values.get("param60")))) !== powerBefore) {
    throw new Error("Power button did not toggle back");
  }

  const swing = page.locator('.control[data-param="param50"]');
  const swingBefore = await patchView.evaluate(node => node._values.get("param50"));
  await swing.locator('button[data-step="1"]').click();
  const swingAfter = await patchView.evaluate(node => ({
    value: node._values.get("param50"),
    display: node.querySelector('.control[data-param="param50"] .stepper-value').textContent,
    tooltip: node.querySelector('.control[data-param="param50"]').dataset.tooltip,
  }));
  if (swingBefore !== 0 || swingAfter.value !== 1 || swingAfter.display !== "1%"
      || !swingAfter.tooltip.includes("2:1 triplet")) {
    throw new Error(`Swing control failed: ${JSON.stringify({ swingBefore, swingAfter })}`);
  }

  await page.locator('.wave-buttons button[data-value="1"]').click();
  if (await page.locator('.wave-buttons button[data-value="1"]').getAttribute("aria-pressed") !== "true") {
    throw new Error("Waveform toggle failed");
  }

  await page.locator(".run-switch button:visible").click();
  if (!(await page.locator(".run-lamp").evaluate(node => node.classList.contains("lit")))) {
    throw new Error("Run switch failed");
  }
  const clockInitial = await page.locator("acidify-patch-view").evaluate(node => ({
    mode: node._values.get("param49"),
    activeMode: node.querySelector(".clock-mode button.active")?.textContent.trim(),
    tempo: node._values.get("param9"),
    runDisabled: node.querySelector('.run-switch[data-param="param10"]').getAttribute("aria-disabled"),
  }));
  if (clockInitial.mode !== 0 || clockInitial.activeMode !== "INT" || clockInitial.tempo !== 128
      || clockInitial.runDisabled !== "false") {
    throw new Error(`Internal clock state failed: ${JSON.stringify(clockInitial)}`);
  }
  await page.locator('.clock-mode button[data-value="1"]').click();
  const runBeforeDawClick = await page.locator("acidify-patch-view")
    .evaluate(node => node._values.get("param10"));
  await page.locator('.run-switch[data-param="param10"] button:not([hidden])')
    .evaluate(button => button.click());
  const dawFallback = await page.locator("acidify-patch-view").evaluate(node => ({
    mode: node._values.get("param49"),
    run: node._values.get("param10"),
    activeMode: node.querySelector(".clock-mode button.active")?.textContent.trim(),
    runText: node.querySelector('.run-switch[data-param="param10"] button:not([hidden])').textContent,
    runDisabled: node.querySelector('.run-switch[data-param="param10"]').getAttribute("aria-disabled"),
    tempoDisabled: node.querySelector('.tempo-cell .dial').getAttribute("aria-disabled"),
  }));
  if (dawFallback.mode !== 1 || dawFallback.run === runBeforeDawClick
      || dawFallback.activeMode !== "DAW" || dawFallback.runText !== "RUN / STOP"
      || dawFallback.runDisabled !== "false" || dawFallback.tempoDisabled !== "false") {
    throw new Error(`DAW fallback state failed: ${JSON.stringify(dawFallback)}`);
  }
  const tempoBeforeFallbackInput = await page.locator("acidify-patch-view")
    .evaluate(node => node._values.get("param9"));
  await page.locator(".tempo-cell .dial").evaluate(dial => {
    dial.dispatchEvent(new WheelEvent("wheel", { deltaY: -100, bubbles: true, cancelable: true }));
    dial.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true }));
  });
  const tempoAfterFallbackInput = await page.locator("acidify-patch-view")
    .evaluate(node => node._values.get("param9"));
  if (!(tempoAfterFallbackInput > tempoBeforeFallbackInput)) {
    throw new Error(`DAW internal-tempo fallback failed: ${tempoBeforeFallbackInput} -> ${tempoAfterFallbackInput}`);
  }
  const dawLocked = await page.locator("acidify-patch-view").evaluate(node => {
    const originalSend = node.pc.sendEventOrValue;
    let mirrorSends = 0;
    node.pc.sendEventOrValue = (id, value) => {
      if (id === "param9") mirrorSends += 1;
      return originalSend.call(node.pc, id, value);
    };
    node._tempoListener(135.27);
    node._syncListener(7);
    for (let repeat = 0; repeat < 8; repeat += 1) node._tempoListener(135.27);
    node._transportListener(1);
    node.pc.sendEventOrValue = originalSend;
    return {
      running: node.querySelector(".run-lamp").classList.contains("lit"),
      tooltip: node.querySelector(".tempo-cell").dataset.tooltip ?? "",
      runText: node.querySelector('.run-switch[data-param="param10"] button:not([hidden])').textContent,
      runDisabled: node.querySelector('.run-switch[data-param="param10"]').getAttribute("aria-disabled"),
      tempoDisabled: node.querySelector('.tempo-cell .dial').getAttribute("aria-disabled"),
      dialTempo: Number(node.querySelector('.tempo-cell .dial').getAttribute("aria-valuenow")),
      parameterTempo: node._values.get("param9"),
      mirrorSends,
    };
  });
  if (!dawLocked.running
      || !dawLocked.tooltip.includes("Tempo follows the DAW")
      || dawLocked.runText !== "DAW FOLLOW"
      || dawLocked.runDisabled !== "true" || dawLocked.tempoDisabled !== "true"
      || Math.abs(dawLocked.dialTempo - 135.27) > 0.0001
      || Math.abs(dawLocked.parameterTempo - 135.27) > 0.0001
      || dawLocked.mirrorSends !== 1) {
    throw new Error(`DAW lock state failed: ${JSON.stringify(dawLocked)}`);
  }
  const tempoBeforeLockedInput = await page.locator("acidify-patch-view")
    .evaluate(node => node._values.get("param9"));
  await page.locator(".tempo-cell .dial").evaluate(dial => {
    dial.dispatchEvent(new WheelEvent("wheel", { deltaY: -100, bubbles: true, cancelable: true }));
    dial.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true }));
  });
  const tempoAfterLockedInput = await page.locator("acidify-patch-view")
    .evaluate(node => node._values.get("param9"));
  if (tempoAfterLockedInput !== tempoBeforeLockedInput) {
    throw new Error(`DAW tempo lock failed: ${tempoBeforeLockedInput} -> ${tempoAfterLockedInput}`);
  }
  await page.locator('.clock-mode button[data-value="0"]').click();
  const tempoHandoff = await page.locator("acidify-patch-view").evaluate(node => ({
    mode: node._values.get("param49"),
    parameterTempo: node._values.get("param9"),
    dialTempo: Number(node.querySelector('.tempo-cell .dial').getAttribute("aria-valuenow")),
    tempoDisabled: node.querySelector('.tempo-cell .dial').getAttribute("aria-disabled"),
    tooltip: node.querySelector(".tempo-cell").dataset.tooltip,
  }));
  if (tempoHandoff.mode !== 0 || tempoHandoff.tempoDisabled !== "false"
      || Math.abs(tempoHandoff.parameterTempo - 135.27) > 0.0001
      || Math.abs(tempoHandoff.dialTempo - 135.27) > 0.0001
      || !tempoHandoff.tooltip.includes("0.1 BPM")) {
    throw new Error(`DAW-to-internal tempo handoff failed: ${JSON.stringify(tempoHandoff)}`);
  }
  await page.locator(".tempo-cell .dial").evaluate(dial => {
    dial.dispatchEvent(new WheelEvent("wheel", { deltaY: -100, bubbles: true, cancelable: true }));
    dial.dispatchEvent(new KeyboardEvent("keydown", {
      key: "ArrowRight",
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    }));
  });
  const fineTempo = await page.locator("acidify-patch-view")
    .evaluate(node => node._values.get("param9"));
  if (Math.abs(fineTempo - 135.38) > 0.0001) {
    throw new Error(`Fine manual tempo adjustment failed: ${fineTempo}`);
  }

  const distortionTrigger = page.locator(".distortion-trigger");
  if (await distortionTrigger.evaluate(node => node.classList.contains("active"))) {
    throw new Error("Distortion is not bypassed by default");
  }
  await distortionTrigger.click();
  if (!(await page.locator(".distortion-overlay").isVisible())
      || await distortionTrigger.getAttribute("aria-expanded") !== "true") {
    throw new Error("Distortion overlay did not open");
  }
  await page.locator(".distortion-power button").click();
  await page.locator('.distortion-types button[data-value="1"]').click();
  const distortionState = await page.locator("acidify-patch-view").evaluate(node => ({
    enabled: node._values.get("param45"),
    type: node._values.get("param46"),
    status: node.querySelector(".distortion-status").textContent,
    triggerActive: node.querySelector(".distortion-trigger").classList.contains("active"),
    pendingEchoes: node._recentSends.length,
  }));
  if (distortionState.enabled !== 1 || distortionState.type !== 1
      || distortionState.status !== "MACKIE ACTIVE"
      || !distortionState.triggerActive || distortionState.pendingEchoes !== 0) {
    throw new Error(`Distortion controls failed: ${JSON.stringify(distortionState)}`);
  }
  const drive = page.locator('.control[data-param="param47"] .dial');
  const driveBefore = Number(await drive.getAttribute("aria-valuenow"));
  await drive.focus();
  await drive.press("ArrowRight");
  const driveAfter = Number(await drive.getAttribute("aria-valuenow"));
  if (!(driveAfter > driveBefore)) {
    throw new Error(`Distortion drive keyboard input failed: ${driveBefore} -> ${driveAfter}`);
  }
  await page.keyboard.press("Escape");
  if (await page.locator(".distortion-overlay").isVisible()
      || await distortionTrigger.getAttribute("aria-expanded") !== "false") {
    throw new Error("Distortion overlay did not close with Escape");
  }

  const miniDrive = page.locator('.dist-mini[data-mini="param47"]');
  const miniDriveBefore = Number(await miniDrive.getAttribute("aria-valuenow"));
  await miniDrive.hover();
  await page.mouse.wheel(0, -120);
  const miniDriveAfter = await page.locator("acidify-patch-view")
    .evaluate(node => Number(node._values.get("param47")));
  if (!(miniDriveAfter > miniDriveBefore)) {
    throw new Error(`Front-panel drive mini dial failed: ${miniDriveBefore} -> ${miniDriveAfter}`);
  }
  await miniDrive.dblclick();
  const miniDriveReset = await page.locator("acidify-patch-view")
    .evaluate(node => Number(node._values.get("param47")));
  if (Math.abs(miniDriveReset - 0.35) > 1.0e-6) {
    throw new Error(`Front-panel drive mini reset failed: ${miniDriveReset}`);
  }
  if ((await page.locator(".dist-mini").count()) !== 2) {
    throw new Error("Expected two front-panel distortion mini dials");
  }
  const miniPlacement = await page.locator("acidify-patch-view").evaluate(node => {
    const rect = sel => node.querySelector(sel).getBoundingClientRect();
    const minis = rect(".master-minis");
    const trigger = rect(".distortion-trigger");
    const dial = rect(".dist-mini-dial");
    return {
      gapToDist: +(trigger.left - minis.right).toFixed(1),
      bottomOffset: +Math.abs(minis.bottom - trigger.bottom).toFixed(1),
      dialSize: +dial.width.toFixed(1),
    };
  });
  if (miniPlacement.gapToDist < 4 || miniPlacement.gapToDist > 16
      || miniPlacement.bottomOffset > 2 || miniPlacement.dialSize < 23) {
    throw new Error(`Mini dials are not on the DIST row: ${JSON.stringify(miniPlacement)}`);
  }

  const powerCell = page.locator(".power-cell");
  await powerCell.click();
  const powerOff = await page.locator("acidify-patch-view").evaluate(node => ({
    value: Number(node._values.get("param60")),
    label: node.querySelector(".power-label").textContent,
    lit: node.querySelector(".power-led").classList.contains("lit"),
  }));
  if (powerOff.value !== 0 || powerOff.label !== "BYPASS" || powerOff.lit) {
    throw new Error(`Power bypass failed: ${JSON.stringify(powerOff)}`);
  }
  await powerCell.click();
  const powerOn = await page.locator("acidify-patch-view").evaluate(node => ({
    value: Number(node._values.get("param60")),
    label: node.querySelector(".power-label").textContent,
    lit: node.querySelector(".power-led").classList.contains("lit"),
  }));
  if (powerOn.value !== 1 || powerOn.label !== "POWER" || !powerOn.lit) {
    throw new Error(`Power re-enable failed: ${JSON.stringify(powerOn)}`);
  }

  const modsTrigger = page.locator(".mods-trigger");
  if (await modsTrigger.evaluate(node => node.classList.contains("active"))) {
    throw new Error("Circuit mods are not stock by default");
  }
  await modsTrigger.click();
  if (!(await page.locator(".mods-overlay").isVisible())
      || await modsTrigger.getAttribute("aria-expanded") !== "true") {
    throw new Error("Mods overlay did not open");
  }
  await page.locator('.control[data-param="param51"] button').click();
  await page.locator('.control[data-param="param53"] button').click();
  await page.waitForFunction(() => {
    const node = document.querySelector("acidify-patch-view");
    return node && node.querySelector(".mods-status").textContent === "2 OF 6 ACTIVE · MODIFIED CIRCUIT";
  });
  const modState = await page.locator("acidify-patch-view").evaluate(node => ({
    od: node._values.get("param51"),
    reso: node._values.get("param53"),
    status: node.querySelector(".mods-status").textContent,
    triggerActive: node.querySelector(".mods-trigger").classList.contains("active"),
    pendingEchoes: node._recentSends.length,
  }));
  if (modState.od !== 1 || modState.reso !== 1
      || modState.status !== "2 OF 6 ACTIVE · MODIFIED CIRCUIT"
      || !modState.triggerActive || modState.pendingEchoes !== 0) {
    throw new Error(`Mod controls failed: ${JSON.stringify(modState)}`);
  }
  const odAmt = page.locator('.control[data-param="param52"] .dial');
  const odBefore = Number(await odAmt.getAttribute("aria-valuenow"));
  await odAmt.focus();
  await odAmt.press("ArrowRight");
  const odAfter = Number(await odAmt.getAttribute("aria-valuenow"));
  if (!(odAfter > odBefore)) {
    throw new Error(`Overdrive amount keyboard input failed: ${odBefore} -> ${odAfter}`);
  }
  await page.locator('.control[data-param="param51"] button').click();
  await page.locator('.control[data-param="param53"] button').click();
  await page.waitForFunction(() => {
    const node = document.querySelector("acidify-patch-view");
    return node && node.querySelector(".mods-status").textContent === "ALL STOCK · FACTORY 303 CIRCUIT";
  });
  await page.keyboard.press("Escape");
  if (await page.locator(".mods-overlay").isVisible()
      || await modsTrigger.getAttribute("aria-expanded") !== "false") {
    throw new Error("Mods overlay did not close with Escape");
  }

  await page.locator('.sequence-step[data-step="7"]').click();
  if (!(await page.locator('.sequence-step[data-step="7"]').evaluate(node => node.classList.contains("selected")))) {
    throw new Error("Step selection failed");
  }
  await page.locator('.pitch-key[data-pitch="2"]').click();
  await page.locator('.sequence-step[data-step="7"]').evaluate(node => {
    node.dispatchEvent(new WheelEvent("wheel", { deltaY: -100, bubbles: true, cancelable: true }));
  });
  const wheelPitch = await page.locator("acidify-patch-view").evaluate(node => node._stepPitch(7));
  if (wheelPitch !== 3) throw new Error(`Classic semitone wheel failed: ${wheelPitch}`);
  const visibleClassicPitch = await page.locator("acidify-patch-view").evaluate(node => ({
    note: node.querySelector('.sequence-step[data-step="7"] .step-note').textContent,
    octave: node.querySelector('.sequence-step[data-step="7"] .step-octave').textContent,
    indicator: node.querySelector(".octave-indicator").textContent,
  }));
  if (visibleClassicPitch.note !== "D♯2" || visibleClassicPitch.octave !== "+0"
      || !visibleClassicPitch.indicator.includes("OCT +0")) {
    throw new Error(`Classic octave visibility failed: ${JSON.stringify(visibleClassicPitch)}`);
  }
  await page.locator('.sequence-step[data-step="7"]').click({ button: "right" });
  if (!(await page.locator(".pitch-menu").isVisible())) {
    throw new Error("Classic right-click note chooser did not open");
  }
  await page.locator('.pitch-menu-choice[data-pitch-value="14"]').click();
  const directClassicPitch = await page.locator("acidify-patch-view").evaluate(node => ({
    pitch: node._stepPitch(7),
    note: node.querySelector('.sequence-step[data-step="7"] .step-note').textContent,
    octave: node.querySelector('.sequence-step[data-step="7"] .step-octave').textContent,
  }));
  if (directClassicPitch.pitch !== 14 || directClassicPitch.note !== "D3"
      || directClassicPitch.octave !== "+1") {
    throw new Error(`Classic direct note choice failed: ${JSON.stringify(directClassicPitch)}`);
  }
  const gateFlagsBefore = await page.locator("acidify-patch-view").evaluate(node => node._stepFlags(7));
  await page.locator('.sequence-step[data-step="7"]').dblclick();
  const gateFlagsAfter = await page.locator("acidify-patch-view").evaluate(node => node._stepFlags(7));
  if ((gateFlagsBefore ^ gateFlagsAfter) !== 1) {
    throw new Error(`Classic double-click did not toggle the gate: ${gateFlagsBefore} -> ${gateFlagsAfter}`);
  }
  await page.locator('.sequence-step[data-step="7"]').dblclick();
  if ((await page.locator("acidify-patch-view").evaluate(node => node._stepFlags(7))) !== gateFlagsBefore) {
    throw new Error("Classic double-click gate toggle is not symmetric");
  }
  await page.locator('.sequence-step[data-step="7"]').click({ button: "right" });
  if (!(await page.locator(".pitch-menu").isVisible())) {
    throw new Error("Classic right-click note chooser did not open");
  }
  await page.keyboard.press("Escape");
  if (await page.locator(".pitch-menu").isVisible()) {
    throw new Error("Note chooser did not close with Escape");
  }
  const pillFlagsBefore = await page.locator("acidify-patch-view").evaluate(node => node._stepFlags(4));
  await page.locator('.sequence-step[data-step="4"] .pill-a').click();
  const pillFlagsAfter = await page.locator("acidify-patch-view").evaluate(node => node._stepFlags(4));
  if ((pillFlagsBefore ^ pillFlagsAfter) !== 2) {
    throw new Error(`Accent pill click did not toggle accent: ${pillFlagsBefore} -> ${pillFlagsAfter}`);
  }
  await page.locator('.sequence-step[data-step="4"] .pill-s').click();
  if (((await page.locator("acidify-patch-view").evaluate(node => node._stepFlags(4))) ^ pillFlagsAfter) !== 4) {
    throw new Error("Slide pill click did not toggle slide");
  }
  await page.locator('.sequence-step[data-step="4"] .pill-a').click();
  await page.locator('.sequence-step[data-step="4"] .pill-s').click();
  await page.locator('.sequence-step[data-step="7"]').click();

  await page.locator(".studio-toggle .arp-label").click();
  const arpOn = await page.locator("acidify-patch-view").evaluate(node => ({
    view: node.querySelector(".studio-toggle").dataset.view,
    mode: Number(node._values.get("param61")),
    context: node.querySelector(".program-context").textContent,
    readout: node.querySelector(".arp-readout").textContent,
    editorVisible: getComputedStyle(node.querySelector(".arp-editor")).display !== "none",
    classicHidden: getComputedStyle(node.querySelector(".classic-editor")).display === "none",
    stepStripVisible: getComputedStyle(node.querySelector(".step-row")).display !== "none",
  }));
  if (arpOn.view !== "arp" || arpOn.mode !== 1 || arpOn.context !== "ARPEGGIATOR"
      || arpOn.readout !== "UP" || !arpOn.editorVisible || !arpOn.classicHidden
      || !arpOn.stepStripVisible) {
    throw new Error(`Arp view did not engage: ${JSON.stringify(arpOn)}`);
  }
  await page.locator('.arp-direction [data-value="4"]').click();
  await page.locator('.arp-tool-block .silver-stepper .stepper-buttons [data-step="1"]').click();
  await page.locator(".arp-hold button").click();
  const arpTuned = await page.locator("acidify-patch-view").evaluate(node => ({
    mode: Number(node._values.get("param61")),
    octaves: Number(node._values.get("param62")),
    hold: Number(node._values.get("param63")),
    readout: node.querySelector(".arp-readout").textContent,
    holdLabel: node.querySelector(".arp-hold-label").textContent,
    randomActive: node.querySelector('.arp-direction [data-value="4"]').classList.contains("active"),
  }));
  if (arpTuned.mode !== 4 || arpTuned.octaves !== 2 || arpTuned.hold !== 1
      || arpTuned.readout !== "RND" || arpTuned.holdLabel !== "ON" || !arpTuned.randomActive) {
    throw new Error(`Arp controls failed: ${JSON.stringify(arpTuned)}`);
  }
  const figureCount = await page.locator(".arp-direction [data-value]").count();
  if (figureCount !== 16) throw new Error(`Expected 16 arp figures, got ${figureCount}`);
  const figureTooltips = await page.locator(".arp-direction [data-value][data-tooltip]").count();
  if (figureTooltips !== 16) throw new Error(`Expected 16 per-figure tooltips, got ${figureTooltips}`);
  await page.waitForTimeout(900);
  const arpLiveState = await page.locator("acidify-patch-view").evaluate(node => ({
    liveCells: node.querySelectorAll(".sequence-step.arp-live").length,
    sampleNote: node.querySelector(".sequence-step.arp-live .step-note")?.textContent ?? "",
    idleNote: node.querySelector(".sequence-step:not(.arp-live) .step-note")?.textContent ?? "",
  }));
  if (arpLiveState.liveCells < 1 || !/^[A-G]♯?-?\d$/.test(arpLiveState.sampleNote)
      || (arpLiveState.idleNote !== "···" && arpLiveState.idleNote !== "")) {
    throw new Error(`Arp live note display failed: ${JSON.stringify(arpLiveState)}`);
  }
  await page.locator('.arp-direction [data-value="16"]').click();
  await page.locator(".arp-phrase-display").click();
  const phraseMenu = await page.locator("acidify-patch-view").evaluate(node => ({
    hidden: node.querySelector(".phrase-menu").hidden,
    options: node.querySelectorAll(".phrase-menu [data-phrase]").length,
    readout: node.querySelector(".arp-readout").textContent,
  }));
  if (phraseMenu.hidden || phraseMenu.options !== 91 || phraseMenu.readout !== "PATTERN") {
    throw new Error(`Phrase menu failed: ${JSON.stringify(phraseMenu)}`);
  }
  await page.locator('.phrase-menu [data-phrase="13"]').click();
  const phrasePicked = await page.locator("acidify-patch-view").evaluate(node => ({
    value: Number(node._values.get("param64")),
    hidden: node.querySelector(".phrase-menu").hidden,
    readout: node.querySelector(".arp-readout").textContent,
    display: node.querySelector(".arp-phrase .stepper-value").textContent,
    stripDimmed: node.classList.contains("phrase-active"),
  }));
  if (phrasePicked.value !== 13 || !phrasePicked.hidden || phrasePicked.readout !== "ACID UP"
      || phrasePicked.display !== "ACID UP" || !phrasePicked.stripDimmed) {
    throw new Error(`Phrase selection failed: ${JSON.stringify(phrasePicked)}`);
  }
  const beforeCapture = await page.locator("acidify-patch-view").evaluate(node => node._stepSnapshot());
  await page.locator(".arp-capture").click();
  const acidUp = JSON.parse(fs.readFileSync(path.join(root, "tools", "data", "arp_phrases.json"), "utf8"))[12];
  const capturedPhrase = await page.locator("acidify-patch-view").evaluate(node => ({
    snapshot: node._stepSnapshot(),
    toast: node.querySelector(".studio-toast").textContent,
  }));
  for (let index = 0; index < 16; index += 1) {
    const step = acidUp.steps[index % acidUp.length];
    const expectedFlags = step.gate | (step.accent << 1) | (step.slide << 2);
    const expectedPitch = step.gate ? step.pitch : 0;
    const got = capturedPhrase.snapshot[index];
    if (got.flags !== expectedFlags || got.pitch !== expectedPitch) {
      throw new Error(`Phrase capture mismatch at step ${index + 1}: ${JSON.stringify(got)} vs ${JSON.stringify(step)}`);
    }
  }
  if (!capturedPhrase.toast.includes("ACID UP")) {
    throw new Error(`Phrase capture toast failed: ${capturedPhrase.toast}`);
  }
  await page.locator("acidify-patch-view").evaluate(node => node._runStudioAction("undo"));
  const undonePhrase = await page.locator("acidify-patch-view").evaluate(node => node._stepSnapshot());
  if (JSON.stringify(undonePhrase) !== JSON.stringify(beforeCapture)) {
    throw new Error("Phrase capture undo did not restore the pattern");
  }
  await page.locator('.arp-phrase .stepper-buttons [data-step="-1"]').click();
  const phraseStepped = await page.locator("acidify-patch-view").evaluate(node => Number(node._values.get("param64")));
  if (phraseStepped !== 12) throw new Error(`Phrase stepper failed: ${phraseStepped}`);
  await page.locator('.arp-direction [data-value="4"]').click();
  await page.waitForTimeout(600);
  const liveCapture = await page.locator("acidify-patch-view").evaluate(node => {
    const liveNotes = [...node._arpLiveNotes];
    node.querySelector(".arp-capture").click();
    return { liveNotes, root: Math.round(node._values.get("param12")), snapshot: node._stepSnapshot() };
  });
  if (!liveCapture.liveNotes.some(note => note >= 0)) {
    throw new Error("Live capture test has no live notes to freeze");
  }
  for (let index = 0; index < 16; index += 1) {
    const note = liveCapture.liveNotes[index];
    const got = liveCapture.snapshot[index];
    if (note >= 0) {
      if (got.pitch !== note - liveCapture.root || (got.flags & 1) !== 1) {
        throw new Error(`Live capture mismatch at step ${index + 1}: note ${note}, got ${JSON.stringify(got)}`);
      }
    } else if ((got.flags & 1) !== 0) {
      throw new Error(`Live capture left a gate on unplayed step ${index + 1}`);
    }
  }
  await page.locator("acidify-patch-view").evaluate(node => node._runStudioAction("undo"));
  const undoneLive = await page.locator("acidify-patch-view").evaluate(node => node._stepSnapshot());
  if (JSON.stringify(undoneLive) !== JSON.stringify(beforeCapture)) {
    throw new Error("Live capture undo did not restore the pattern");
  }
  await page.locator(".studio-toggle .classic-label").click();
  const arpOff = await page.locator("acidify-patch-view").evaluate(node => ({
    view: node.querySelector(".studio-toggle").dataset.view,
    mode: Number(node._values.get("param61")),
    classicVisible: getComputedStyle(node.querySelector(".classic-editor")).display !== "none",
    stepNote: node.querySelector('.sequence-step[data-step="0"] .step-note').textContent,
    liveLeftovers: node.querySelectorAll(".sequence-step.arp-live").length,
  }));
  if (arpOff.view !== "classic" || arpOff.mode !== 0 || !arpOff.classicVisible
      || !/^[A-G]♯?\d$/.test(arpOff.stepNote) || arpOff.liveLeftovers !== 0) {
    throw new Error(`Arp view did not release: ${JSON.stringify(arpOff)}`);
  }
  await page.locator('.function-button[data-flag="2"]').click();
  await page.locator('[data-classic-action="clear-step"]').click();
  const clearedStep = await page.locator("acidify-patch-view").evaluate(node => node._stepSnapshot()[7]);
  if (clearedStep.pitch !== 0 || clearedStep.flags !== 0) {
    throw new Error(`Classic clear-step failed: ${JSON.stringify(clearedStep)}`);
  }
  await page.locator('.control[data-param="param12"] .stepper-buttons button[data-step="1"]').click();
  const localEchoState = await page.locator("acidify-patch-view").evaluate(node => ({
    root: node._values.get("param12"),
    readout: node.querySelector(".edit-readout").textContent,
    pendingEchoes: node._recentSends.length,
  }));
  if (localEchoState.root !== 37 || localEchoState.readout !== "08  C#2"
      || localEchoState.pendingEchoes !== 0) {
    throw new Error(`Parameter echo protection failed: ${JSON.stringify(localEchoState)}`);
  }
  await page.locator('.control[data-param="param12"] .stepper-buttons button[data-step="-1"]').click();

  const view = page.locator("acidify-patch-view");
  if (await view.evaluate(node => node.classList.contains("studio-mode"))) {
    throw new Error("Classic mode is not the default");
  }
  await page.locator(".studio-toggle").click();
  if (!(await view.evaluate(node => node.classList.contains("studio-mode")))) {
    throw new Error("Studio mode toggle failed");
  }
  const workflow = await page.evaluate(() => {
    const toggle = document.querySelector(".studio-toggle").getBoundingClientRect();
    const tools = document.querySelector(".studio-tools").getBoundingClientRect();
    const matrix = document.querySelector(".studio-matrix").getBoundingClientRect();
    const scale = document.querySelector(".studio-scale").getBoundingClientRect();
    const actionRows = new Set(
      [...document.querySelectorAll(".studio-actions button")].map(node => Math.round(node.offsetTop))
    );
    const context = document.querySelector(".program-context").textContent;
    const groups = [...document.querySelectorAll(".studio-lane[data-lane=\"accent\"] .studio-cell-group")]
      .map(node => node.getBoundingClientRect())
      .map(bounds => ({ left: bounds.left, right: bounds.right }));
    return {
      toggle: { width: toggle.width, height: toggle.height },
      tools: { width: tools.width, right: tools.right },
      matrix: { width: matrix.width, left: matrix.left },
      scale: { width: scale.width, height: scale.height },
      actionRows: actionRows.size,
      context,
      groupGaps: groups.slice(1).map((group, index) => group.left - groups[index].right),
    };
  });
  if (Math.round(workflow.toggle.width) !== 134 || Math.round(workflow.toggle.height) !== 17
      || Math.round(workflow.tools.width) !== 314 || workflow.matrix.width < 800
      || workflow.tools.right - workflow.matrix.left < 900
      || workflow.scale.width < 100 || Math.round(workflow.scale.height) !== 12
      || workflow.actionRows !== 4
      || workflow.context !== "STUDIO MATRIX"
      || workflow.groupGaps.some(gap => gap < 7)) {
    throw new Error(`Studio workflow hierarchy failed: ${JSON.stringify(workflow)}`);
  }

  await page.locator('.studio-cell[data-kind="pitch"][data-step="3"]').click();
  await page.locator('.studio-cell[data-kind="pitch"][data-step="6"]').click({ modifiers: ["Shift"] });
  const multiSelected = await page.locator(".sequence-step.multi-selected").count();
  if (multiSelected !== 4) throw new Error(`Studio range selection failed: ${multiSelected}`);
  const beforeStudioStripWheel = await view.evaluate(node => node._stepSnapshot());
  await page.locator('.sequence-step[data-step="4"]').evaluate(node => {
    node.dispatchEvent(new WheelEvent("wheel", { deltaY: -100, bubbles: true, cancelable: true }));
  });
  const afterStudioStripWheel = await view.evaluate(node => node._stepSnapshot());
  for (let index = 3; index <= 6; index += 1) {
    if (afterStudioStripWheel[index].pitch !== Math.min(24, beforeStudioStripWheel[index].pitch + 1)) {
      throw new Error(`Studio top-strip wheel failed at step ${index + 1}`);
    }
  }
  await page.locator('[data-studio-action="choose-note"]').click();
  if (!(await page.locator(".pitch-menu").isVisible())) {
    throw new Error("Studio NOTE action did not open the note chooser");
  }
  const menuBounds = await page.locator(".pitch-menu").boundingBox();
  const chassisBounds = await page.locator("acidify-patch-view .chassis").boundingBox();
  if (!menuBounds || !chassisBounds
      || menuBounds.x < chassisBounds.x || menuBounds.y < chassisBounds.y
      || menuBounds.x + menuBounds.width > chassisBounds.x + chassisBounds.width
      || menuBounds.y + menuBounds.height > chassisBounds.y + chassisBounds.height) {
    throw new Error(`Note chooser escaped the chassis: ${JSON.stringify({ menuBounds, chassisBounds })}`);
  }
  await page.locator('.pitch-menu-choice[data-pitch-value="8"]').click();
  const directStudioPitch = await view.evaluate(node => ({
    pitches: node._stepSnapshot().slice(3, 7).map(step => step.pitch),
    selectionSize: node._selectedIndices().length,
  }));
  if (directStudioPitch.pitches.some(pitch => pitch !== 8)
      || directStudioPitch.selectionSize !== 4) {
    throw new Error(`Studio batch note choice failed: ${JSON.stringify(directStudioPitch)}`);
  }
  await page.locator('.studio-cell[data-kind="pitch"][data-step="8"]').click({ button: "right" });
  if (!(await page.locator(".pitch-menu").isVisible())) {
    throw new Error("Studio right-click note chooser did not open");
  }
  await page.locator('.pitch-menu-choice[data-pitch-value="24"]').click();
  const studioContextPitch = await view.evaluate(node => ({
    pitch: node._stepPitch(8),
    cell: node.querySelector('.studio-cell[data-kind="pitch"][data-step="8"] .step-note').textContent,
    octave: node.querySelector('.sequence-step[data-step="8"] .step-octave').textContent,
  }));
  if (studioContextPitch.pitch !== 24 || studioContextPitch.cell !== "C4"
      || studioContextPitch.octave !== "+2") {
    throw new Error(`Studio right-click note choice failed: ${JSON.stringify(studioContextPitch)}`);
  }
  const studioGateBefore = await page.locator("acidify-patch-view").evaluate(node => node._stepFlags(9));
  await page.locator('.studio-cell[data-kind="pitch"][data-step="9"]').dblclick();
  const studioGateAfter = await page.locator("acidify-patch-view").evaluate(node => node._stepFlags(9));
  if ((studioGateBefore ^ studioGateAfter) !== 1) {
    throw new Error(`Studio double-click did not toggle the gate: ${studioGateBefore} -> ${studioGateAfter}`);
  }
  await page.locator('.studio-cell[data-kind="pitch"][data-step="9"]').dblclick();

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

  await page.locator('.studio-cell[data-kind="pitch"][data-step="0"]').click();
  await page.locator('[data-studio-action="copy"]').click();
  await page.locator('.studio-cell[data-kind="pitch"][data-step="15"]').click();
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

  await page.locator('.studio-cell[data-kind="pitch"][data-step="3"]').click();
  await page.locator('.studio-cell[data-kind="pitch"][data-step="6"]').click({ modifiers: ["Shift"] });
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

  await page.locator('.studio-cell[data-kind="pitch"][data-step="0"]').click();
  await page.locator('.studio-cell[data-kind="pitch"][data-step="3"]').click({ modifiers: ["Shift"] });
  const smartEditBefore = await view.evaluate(node => {
    const draft = node._stepSnapshot();
    [0, 3, 7, 12].forEach((pitch, index) => {
      draft[index] = { pitch, flags: [1, 3, 5, 7][index] };
    });
    node._applySnapshot(draft, true);
    return node._stepSnapshot();
  });

  await page.locator('[data-studio-action="reverse"]').click();
  const afterReverse = await view.evaluate(node => node._stepSnapshot());
  for (let index = 0; index < 4; index += 1) {
    const source = smartEditBefore[3 - index];
    if (afterReverse[index].pitch !== source.pitch || afterReverse[index].flags !== source.flags) {
      throw new Error(`Studio reverse failed at step ${index + 1}`);
    }
  }
  await page.locator('[data-studio-action="undo"]').click();

  await page.locator('[data-studio-action="pitch-mirror"]').click();
  const afterMirror = await view.evaluate(node => node._stepSnapshot());
  const mirroredPitches = [12, 9, 5, 0];
  if (afterMirror.slice(0, 4).some((step, index) =>
    step.pitch !== mirroredPitches[index] || step.flags !== smartEditBefore[index].flags
  )) {
    throw new Error(`Studio pitch mirror failed: ${JSON.stringify(afterMirror.slice(0, 4))}`);
  }
  await page.locator('[data-studio-action="undo"]').click();

  const initialScale = await page.locator(".studio-scale strong").textContent();
  await page.locator(".studio-scale").click();
  const scaleMenuState = await page.locator("acidify-patch-view").evaluate(node => {
    const menu = node.querySelector(".scale-menu");
    return {
      hidden: menu.hidden,
      options: menu.querySelectorAll("[data-scale]").length,
      active: menu.querySelector(".active span")?.textContent,
    };
  });
  if (scaleMenuState.hidden || scaleMenuState.options !== 10 || scaleMenuState.active !== "MIN PENTA") {
    throw new Error(`Scale menu did not open correctly: ${JSON.stringify(scaleMenuState)}`);
  }
  await page.locator('.scale-menu [data-scale="6"]').click();
  const selectedScale = await page.locator(".studio-scale strong").textContent();
  const scaleMenuClosed = await page.locator("acidify-patch-view").evaluate(node => node.querySelector(".scale-menu").hidden);
  if (initialScale !== "MIN PENTA" || selectedScale !== "MAJOR" || !scaleMenuClosed) {
    throw new Error(`Studio scale selector failed: ${initialScale} -> ${selectedScale}, closed=${scaleMenuClosed}`);
  }

  await view.evaluate(() => {
    window.__acidifyOriginalRandom = Math.random;
    Math.random = () => .4;
  });
  await page.locator('[data-studio-action="generate"]').click();
  await view.evaluate(() => {
    Math.random = window.__acidifyOriginalRandom;
    delete window.__acidifyOriginalRandom;
  });
  const generated = await view.evaluate(node => node._stepSnapshot());
  const majorScale = new Set([0, 2, 4, 5, 7, 9, 11, 12, 14, 16, 17, 19, 21, 23, 24]);
  if (generated.slice(0, 4).some(step => !majorScale.has(step.pitch)
      || ((step.flags & 1) === 0 && step.flags !== 0))
      || !generated.slice(0, 4).some(step => (step.flags & 1) !== 0)) {
    throw new Error(`Scale-aware Generate failed: ${JSON.stringify(generated.slice(0, 4))}`);
  }
  await page.locator('[data-studio-action="undo"]').click();
  const afterGenerateUndo = await view.evaluate(node => node._stepSnapshot());
  if (JSON.stringify(afterGenerateUndo) !== JSON.stringify(smartEditBefore)) {
    throw new Error("Generate did not integrate with Undo");
  }

  await view.evaluate(() => {
    window.__acidifyOriginalRandom = Math.random;
    Math.random = () => .2;
  });
  await page.locator('[data-studio-action="mutate"]').click();
  await view.evaluate(() => {
    Math.random = window.__acidifyOriginalRandom;
    delete window.__acidifyOriginalRandom;
  });
  const mutated = await view.evaluate(node => node._stepSnapshot());
  const mutatedIndices = [0, 1, 2, 3].filter(index =>
    mutated[index].pitch !== smartEditBefore[index].pitch
      || mutated[index].flags !== smartEditBefore[index].flags
  );
  if (mutatedIndices.length < 1
      || mutatedIndices.some(index => !majorScale.has(mutated[index].pitch))) {
    throw new Error(`Scale-aware Mutate failed: ${JSON.stringify(mutated.slice(0, 4))}`);
  }
  await page.locator('[data-studio-action="undo"]').click();
  const afterMutateUndo = await view.evaluate(node => node._stepSnapshot());
  if (JSON.stringify(afterMutateUndo) !== JSON.stringify(smartEditBefore)) {
    throw new Error("Mutate did not integrate with Undo");
  }

  await cutoff.focus();
  await cutoff.press("ArrowRight");
  if (!(await page.locator('.control[data-param="param2"]').evaluate(node => node.classList.contains("value-visible")))) {
    throw new Error("Studio value feedback failed");
  }

  await page.locator(".studio-toggle .classic-label").click();
  if (await page.locator("acidify-patch-view").evaluate(node => node.classList.contains("studio-mode"))) {
    throw new Error("Return to Classic mode failed");
  }

  await page.setViewportSize({ width: 590, height: 290 });
  await page.waitForTimeout(350);
  const bounds = await page.locator("acidify-patch-view .chassis").boundingBox();
  if (!bounds || bounds.width > 591 || bounds.height > 291) {
    throw new Error(`Responsive scaling failed: ${JSON.stringify(bounds)}`);
  }
  const compactBadges = await page.evaluate(() => {
    const chassis = document.querySelector(".chassis").getBoundingClientRect();
    const scale = chassis.width / 1180;
    const accent = document.querySelector(".sequence-step.accented .pill-a").getBoundingClientRect();
    const slide = document.querySelector(".sequence-step.sliding .pill-s").getBoundingClientRect();
    return { scale, accentPixels: accent.width, slidePixels: slide.width };
  });
  if (!Number.isFinite(compactBadges.accentPixels)
      || !Number.isFinite(compactBadges.slidePixels)
      || compactBadges.accentPixels < 7 || compactBadges.slidePixels < 7) {
    throw new Error(`Step-state badges became too small at 590×290: ${JSON.stringify(compactBadges)}`);
  }
  const reconnect = await page.evaluate(async () => {
    const node = document.querySelector("acidify-patch-view");
    const connection = node.pc;
    const originalSend = connection.sendEventOrValue;
    let sends = 0;
    connection.sendEventOrValue = (...args) => {
      sends += 1;
      return originalSend.apply(connection, args);
    };
    node.remove();
    document.body.appendChild(node);
    await new Promise(resolve => setTimeout(resolve, 30));
    node.querySelector(".run-switch button:not([hidden])").click();
    connection.sendEventOrValue = originalSend;
    return {
      sends,
      controls: node.querySelectorAll(".control[data-param]").length,
      endpointControls: node.querySelectorAll(".control[data-endpoint-id]").length,
      pendingEchoes: node._recentSends.length,
      mounted: node._mounted,
    };
  });
  if (reconnect.sends !== 1 || reconnect.controls !== 31 || reconnect.endpointControls !== 31
      || reconnect.pendingEchoes !== 0 || !reconnect.mounted) {
    throw new Error(`Reconnect lifecycle failed: ${JSON.stringify(reconnect)}`);
  }

  if (pageErrors.length) throw new Error(`UI page error: ${pageErrors.join("; ")}`);
  console.log(JSON.stringify({
    ok: true,
    counts,
    header,
    stepBadges,
    compactBadges,
    upperPanelGeometry,
    lowerPanelGeometry,
    cutoff: { before, after },
    studio: {
      workflow,
      clearedStep,
      wheelPitch,
      visibleClassicPitch,
      directClassicPitch,
      localEchoState,
      multiSelected,
      studioStripWheel: true,
      directStudioPitch,
      studioContextPitch,
      dragPaint: true,
      undo: true,
      copyPaste: true,
      keyboardUndo: true,
      batchTranspose: true,
      batchRest: true,
      reverse: afterReverse.slice(0, 4),
      pitchMirror: afterMirror.slice(0, 4),
      generationScale: selectedScale,
      generated: generated.slice(0, 4),
      mutated: mutated.slice(0, 4),
      smartEditUndo: true,
    },
    distortion: {
      state: distortionState,
      drive: { before: driveBefore, after: driveAfter },
      overlay: true,
      escapeClose: true,
    },
    mods: {
      state: modState,
      overdriveAmount: { before: odBefore, after: odAfter },
      backToStock: true,
      overlay: true,
      escapeClose: true,
    },
    clock: {
      initial: clockInitial,
      fallback: dawFallback,
      fallbackTempoEditable: tempoAfterFallbackInput > tempoBeforeFallbackInput,
      lockedInputSuppressed: tempoAfterLockedInput === tempoBeforeLockedInput,
      locked: dawLocked,
      handoff: tempoHandoff,
      fineTempo,
    },
    tooltips: { on: tooltipOn, off: tooltipOff },
    scaledBounds: bounds,
    reconnect,
  }));
} finally {
  await browser.close();
}
