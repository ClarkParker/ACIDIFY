import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

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
    distortionTriggers: document.querySelectorAll(".distortion-trigger").length,
    distortionControls: document.querySelectorAll(".distortion-overlay .control[data-param]").length,
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
  if (counts.controls !== 18 || counts.endpointControls !== 18
      || counts.sequenceSteps !== 16 || counts.pitchKeys !== 12
      || counts.stepGroups !== 4 || counts.whiteKeys !== 7 || counts.blackKeys !== 5
      || counts.studioCells !== 64 || counts.studioCellGroups !== 16
      || counts.studioRulerGroups !== 4 || counts.studioActions !== 15
      || counts.pitchChoices !== 25
      || counts.distortionTriggers !== 1 || counts.distortionControls !== 4
      || counts.distortionTypes !== 3 || counts.clockModes !== 2
      || counts.swingControls !== 1
      || counts.basslineVisuals !== 1 || counts.basslineNodes !== 16
      || counts.tooltipToggles !== 1 || counts.tooltipBubbles !== 1
      || counts.tooltipTargets < 100 || counts.nativeTitles !== 0
      || counts.screws !== 0) {
    throw new Error(`Unexpected UI element counts: ${JSON.stringify(counts)}`);
  }

  const bassline = await page.evaluate(() => {
    const rect = selector => {
      const bounds = document.querySelector(selector).getBoundingClientRect();
      return { left: bounds.left, right: bounds.right, width: bounds.width, height: bounds.height };
    };
    const node = index => document.querySelector(`.bassline-node[data-step="${index}"]`);
    return {
      title: rect(".program-title"),
      visual: rect(".bassline-visual"),
      utility: rect(".utility"),
      path: document.querySelector(".bassline-path").getAttribute("d"),
      slidePath: document.querySelector(".bassline-slide-path").getAttribute("d"),
      lowY: Number(node(0).getAttribute("cy")),
      highY: Number(node(4).getAttribute("cy")),
      accent: node(0).classList.contains("accented"),
      slide: node(1).classList.contains("sliding"),
      selected: node(0).classList.contains("selected"),
      tooltip: document.querySelector(".bassline-visual").dataset.tooltip,
    };
  });
  if (bassline.visual.width < 170 || bassline.visual.height < 29
      || bassline.title.right > bassline.visual.left
      || bassline.visual.right > bassline.utility.left
      || !bassline.path.startsWith("M ") || !bassline.path.includes(" L ")
      || !bassline.slidePath.includes(" L ")
      || !(bassline.lowY > bassline.highY)
      || !bassline.accent || !bassline.slide || !bassline.selected
      || !bassline.tooltip.includes("pitch contour")) {
    throw new Error(`Bassline visualization failed: ${JSON.stringify(bassline)}`);
  }

  const stepBadges = await page.evaluate(() => {
    const accentStep = document.querySelector('.sequence-step[data-step="0"]');
    const slideStep = document.querySelector('.sequence-step[data-step="1"]');
    const combinedStep = document.querySelector('.sequence-step[data-step="5"]');
    const read = (node, pseudo) => {
      const style = getComputedStyle(node, pseudo);
      return {
        content: style.content.replaceAll('"', ""),
        width: Number.parseFloat(style.width),
        height: Number.parseFloat(style.height),
        fontSize: Number.parseFloat(style.fontSize),
        background: style.backgroundImage,
        top: Number.parseFloat(style.top),
      };
    };
    return {
      accent: read(accentStep, "::before"),
      slide: read(slideStep, "::after"),
      combinedAccent: read(combinedStep, "::before"),
      combinedSlide: read(combinedStep, "::after"),
      combinedLabel: combinedStep.getAttribute("aria-label"),
    };
  });
  if (stepBadges.accent.content !== "A" || stepBadges.slide.content !== "↗"
      || stepBadges.combinedAccent.content !== "A" || stepBadges.combinedSlide.content !== "↗"
      || stepBadges.accent.width < 18 || stepBadges.accent.height < 18
      || stepBadges.slide.width < 18 || stepBadges.slide.height < 18
      || stepBadges.accent.fontSize < 12 || stepBadges.slide.fontSize < 15
      || stepBadges.accent.background === "none" || stepBadges.slide.background === "none"
      || stepBadges.accent.top < 15 || stepBadges.accent.top > 19
      || stepBadges.slide.top < 15 || stepBadges.slide.top > 19
      || !stepBadges.combinedLabel.includes("Accent")
      || !stepBadges.combinedLabel.includes("Slide")) {
    throw new Error(`Step-state badges are not prominent or accessible: ${JSON.stringify(stepBadges)}`);
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
      moduleTopSpread: Math.max(transport.top, synthesis.top, master.top)
        - Math.min(transport.top, synthesis.top, master.top),
      moduleBottomSpread: Math.max(transport.bottom, synthesis.bottom, master.bottom)
        - Math.min(transport.bottom, synthesis.bottom, master.bottom),
      soundControlAxisSpread: Math.max(...controlCenters) - Math.min(...controlCenters),
      accentToMaster: master.left - accent.right,
      volumeLeftInset: volume.left - master.left,
      volumeRightInset: master.right - volume.right,
    };
  });
  if (upperPanelGeometry.moduleGaps.some(gap => gap < 12)
      || upperPanelGeometry.moduleTopSpread > 1
      || upperPanelGeometry.moduleBottomSpread > 1
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

  const patchView = page.locator("acidify-patch-view");
  await patchView.evaluate(node => node._setTooltipsEnabled(true, false));
  await page.locator('.control[data-param="param2"] .dial').hover();
  await page.waitForTimeout(430);
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
    readout: node.querySelector(".clock-readout").textContent,
    runDisabled: node.querySelector('.run-switch[data-param="param10"]').getAttribute("aria-disabled"),
  }));
  if (clockInitial.mode !== 0 || clockInitial.readout !== "INT · 128 BPM"
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
    readout: node.querySelector(".clock-readout").textContent,
    runText: node.querySelector('.run-switch[data-param="param10"] button:not([hidden])').textContent,
    runDisabled: node.querySelector('.run-switch[data-param="param10"]').getAttribute("aria-disabled"),
    tempoDisabled: node.querySelector('.tempo-box .dial').getAttribute("aria-disabled"),
  }));
  if (dawFallback.mode !== 1 || dawFallback.run === runBeforeDawClick
      || dawFallback.readout !== "DAW · INT FALLBACK" || dawFallback.runText !== "RUN / STOP"
      || dawFallback.runDisabled !== "false" || dawFallback.tempoDisabled !== "false") {
    throw new Error(`DAW fallback state failed: ${JSON.stringify(dawFallback)}`);
  }
  const tempoBeforeFallbackInput = await page.locator("acidify-patch-view")
    .evaluate(node => node._values.get("param9"));
  await page.locator(".tempo-box .dial").evaluate(dial => {
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
      readout: node.querySelector(".clock-readout").textContent,
      running: node.querySelector(".run-lamp").classList.contains("lit"),
      tooltip: node.querySelector(".clock-readout").dataset.tooltip,
      runText: node.querySelector('.run-switch[data-param="param10"] button:not([hidden])').textContent,
      runDisabled: node.querySelector('.run-switch[data-param="param10"]').getAttribute("aria-disabled"),
      tempoDisabled: node.querySelector('.tempo-box .dial').getAttribute("aria-disabled"),
      dialTempo: Number(node.querySelector('.tempo-box .dial').getAttribute("aria-valuenow")),
      parameterTempo: node._values.get("param9"),
      mirrorSends,
    };
  });
  if (dawLocked.readout !== "DAW · 135.27 BPM" || !dawLocked.running
      || !dawLocked.tooltip.includes("position locked")
      || dawLocked.runText !== "DAW FOLLOW"
      || dawLocked.runDisabled !== "true" || dawLocked.tempoDisabled !== "true"
      || Math.abs(dawLocked.dialTempo - 135.27) > 0.0001
      || Math.abs(dawLocked.parameterTempo - 135.27) > 0.0001
      || dawLocked.mirrorSends !== 1) {
    throw new Error(`DAW lock state failed: ${JSON.stringify(dawLocked)}`);
  }
  const tempoBeforeLockedInput = await page.locator("acidify-patch-view")
    .evaluate(node => node._values.get("param9"));
  await page.locator(".tempo-box .dial").evaluate(dial => {
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
    dialTempo: Number(node.querySelector('.tempo-box .dial').getAttribute("aria-valuenow")),
    tempoDisabled: node.querySelector('.tempo-box .dial').getAttribute("aria-disabled"),
    tooltip: node.querySelector(".tempo-box").dataset.tooltip,
  }));
  if (tempoHandoff.mode !== 0 || tempoHandoff.tempoDisabled !== "false"
      || Math.abs(tempoHandoff.parameterTempo - 135.27) > 0.0001
      || Math.abs(tempoHandoff.dialTempo - 135.27) > 0.0001
      || !tempoHandoff.tooltip.includes("0.1 BPM")) {
    throw new Error(`DAW-to-internal tempo handoff failed: ${JSON.stringify(tempoHandoff)}`);
  }
  await page.locator(".tempo-box .dial").evaluate(dial => {
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
  await page.locator('.sequence-step[data-step="7"]').dblclick();
  if (!(await page.locator(".pitch-menu").isVisible())) {
    throw new Error("Classic double-click note chooser did not open");
  }
  await page.keyboard.press("Escape");
  if (await page.locator(".pitch-menu").isVisible()) {
    throw new Error("Note chooser did not close with Escape");
  }
  await page.locator('.function-button[data-flag="2"]').click();
  await page.locator('[data-classic-action="clear-step"]').click();
  const clearedStep = await page.locator("acidify-patch-view").evaluate(node => node._stepSnapshot()[7]);
  if (clearedStep.pitch !== 0 || clearedStep.flags !== 0) {
    throw new Error(`Classic clear-step failed: ${JSON.stringify(clearedStep)}`);
  }
  await page.locator('.control[data-param="param12"] .stepper button[data-step="1"]').click();
  const localEchoState = await page.locator("acidify-patch-view").evaluate(node => ({
    root: node._values.get("param12"),
    readout: node.querySelector(".edit-readout").textContent,
    pendingEchoes: node._recentSends.length,
  }));
  if (localEchoState.root !== 37 || localEchoState.readout !== "08  C#2"
      || localEchoState.pendingEchoes !== 0) {
    throw new Error(`Parameter echo protection failed: ${JSON.stringify(localEchoState)}`);
  }
  await page.locator('.control[data-param="param12"] .stepper button[data-step="-1"]').click();

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
    const groups = [...document.querySelectorAll(".studio-lane[data-lane=\"gate\"] .studio-cell-group")]
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
  if (workflow.toggle.width < 130 || workflow.toggle.height < 28
      || workflow.tools.width < 390 || workflow.matrix.width < 620
      || workflow.matrix.left - workflow.tools.right < 12
      || workflow.scale.width < 100 || workflow.scale.height < 15
      || workflow.actionRows !== 2
      || workflow.context !== "STUDIO MATRIX"
      || workflow.groupGaps.some(gap => gap < 7)) {
    throw new Error(`Studio workflow hierarchy failed: ${JSON.stringify(workflow)}`);
  }

  await page.locator('.sequence-step[data-step="3"]').click();
  await page.locator('.sequence-step[data-step="6"]').click({ modifiers: ["Shift"] });
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
    selection: node.querySelector(".studio-selection").textContent,
  }));
  if (directStudioPitch.pitches.some(pitch => pitch !== 8)
      || !directStudioPitch.selection.includes("OCT +0")) {
    throw new Error(`Studio batch note choice failed: ${JSON.stringify(directStudioPitch)}`);
  }
  await page.locator('.studio-cell[data-kind="pitch"][data-step="8"]').click({ button: "right" });
  if (!(await page.locator(".pitch-menu").isVisible())) {
    throw new Error("Studio right-click note chooser did not open");
  }
  await page.locator('.pitch-menu-choice[data-pitch-value="24"]').click();
  const studioContextPitch = await view.evaluate(node => ({
    pitch: node._stepPitch(8),
    cell: node.querySelector('.studio-cell[data-kind="pitch"][data-step="8"]').textContent,
    octave: node.querySelector('.sequence-step[data-step="8"] .step-octave').textContent,
  }));
  if (studioContextPitch.pitch !== 24 || studioContextPitch.cell !== "C4"
      || studioContextPitch.octave !== "+2") {
    throw new Error(`Studio right-click note choice failed: ${JSON.stringify(studioContextPitch)}`);
  }
  await page.locator('.studio-cell[data-kind="pitch"][data-step="9"]').dblclick();
  if (!(await page.locator(".pitch-menu").isVisible())) {
    throw new Error("Studio double-click note chooser did not open");
  }
  await page.locator(".pitch-menu-close").click();

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

  await page.locator('.sequence-step[data-step="0"]').click();
  await page.locator('.sequence-step[data-step="3"]').click({ modifiers: ["Shift"] });
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
  await page.locator(".studio-scale").click();
  const selectedScale = await page.locator(".studio-scale strong").textContent();
  if (initialScale !== "MIN PENTA" || selectedScale !== "MAJOR") {
    throw new Error(`Studio scale selector failed: ${initialScale} -> ${selectedScale}`);
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
  if (!(await cutoff.locator("..").evaluate(node => node.classList.contains("value-visible")))) {
    throw new Error("Studio value feedback failed");
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
    const accentStyle = getComputedStyle(
      document.querySelector(".sequence-step.accented"),
      "::before"
    );
    const slideStyle = getComputedStyle(
      document.querySelector(".sequence-step.sliding"),
      "::after"
    );
    return {
      scale,
      accentPixels: Number.parseFloat(accentStyle.width) * scale,
      slidePixels: Number.parseFloat(slideStyle.width) * scale,
    };
  });
  if (!Number.isFinite(compactBadges.accentPixels)
      || !Number.isFinite(compactBadges.slidePixels)
      || compactBadges.accentPixels < 9 || compactBadges.slidePixels < 9) {
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
  if (reconnect.sends !== 1 || reconnect.controls !== 18 || reconnect.endpointControls !== 18
      || reconnect.pendingEchoes !== 0 || !reconnect.mounted) {
    throw new Error(`Reconnect lifecycle failed: ${JSON.stringify(reconnect)}`);
  }

  if (pageErrors.length) throw new Error(`UI page error: ${pageErrors.join("; ")}`);
  console.log(JSON.stringify({
    ok: true,
    counts,
    bassline,
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
