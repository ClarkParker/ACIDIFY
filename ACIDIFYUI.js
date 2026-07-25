// ACIDIFY — hardware-inspired modern 303-class Amorph instrument UI.
// WINDOW SIZE: 1180x580
//
// Single-file light-DOM Web Component. No imports, fonts, images or CDN assets.

const ACIDIFY_GLOBALS = [
  { id: "param1",  type: "dial",    label: "TUNING",       min: -1, max: 1,   step: 0.01, init: 0,    format: v => `${v >= 0 ? "+" : ""}${v.toFixed(2)}` },
  { id: "param2",  type: "dial",    label: "CUTOFF",       min: 0,  max: 1,   step: 0.001, init: 0.45, format: v => `${Math.round(v * 100)}` },
  { id: "param3",  type: "dial",    label: "RESONANCE",    min: 0,  max: 1,   step: 0.001, init: 0.72, format: v => `${Math.round(v * 100)}` },
  { id: "param4",  type: "dial",    label: "ENV MOD",      min: 0,  max: 1,   step: 0.001, init: 0.68, format: v => `${Math.round(v * 100)}` },
  { id: "param5",  type: "dial",    label: "DECAY",        min: 0,  max: 1,   step: 0.001, init: 0.45, format: v => `${Math.round(v * 100)}` },
  { id: "param6",  type: "dial",    label: "ACCENT",       min: 0,  max: 1,   step: 0.001, init: 0.65, format: v => `${Math.round(v * 100)}` },
  { id: "param7",  type: "toggle",  label: "WAVEFORM",     min: 0,  max: 1,   step: 1, init: 0 },
  { id: "param8",  type: "dial",    label: "VOLUME",       min: -36, max: 0,  step: 0.1, init: -6,    format: v => `${v.toFixed(1)} dB` },
  { id: "param9",  type: "dial",    label: "TEMPO",        min: 40, max: 300, step: 0.01, coarseStep: 0.1, init: 128, format: formatTempo },
  { id: "param10", type: "toggle",  label: "RUN",          min: 0,  max: 1,   step: 1, init: 0 },
  { id: "param11", type: "stepper", label: "LENGTH",       min: 1,  max: 16,  step: 1, init: 16,      format: v => `${Math.round(v)}` },
  { id: "param12", type: "stepper", label: "ROOT",         min: 24, max: 60,  step: 1, init: 36,      format: v => noteName(Math.round(v)) },
  { id: "param45", type: "toggle",  label: "DISTORTION",   min: 0,  max: 1,   step: 1, init: 0 },
  { id: "param46", type: "toggle",  label: "TYPE",         min: 0,  max: 2,   step: 1, init: 0 },
  { id: "param47", type: "dial",    label: "DRIVE",        min: 0,  max: 1,   step: 0.001, init: 0.35, format: v => `${Math.round(v * 100)}` },
  { id: "param48", type: "dial",    label: "MIX",          min: 0,  max: 1,   step: 0.001, init: 1,    format: v => `${Math.round(v * 100)}%` },
  { id: "param49", type: "toggle",  label: "CLOCK",        min: 0,  max: 1,   step: 1, init: 0 },
  { id: "param50", type: "stepper", label: "SWING",        min: 0,  max: 100, step: 1, init: 0,        format: v => `${Math.round(v)}%` },
];

const STEP_PITCH_DEFAULTS = [0, 0, 7, 0, 12, 10, 7, 3, 0, 0, 12, 7, 10, 5, 3, 7];
const STEP_FLAG_DEFAULTS = [3, 5, 1, 1, 3, 5, 1, 1, 0, 1, 3, 5, 1, 1, 1, 5];
const STEP_PITCH_IDS = [
  "param13", "param14", "param15", "param16", "param17", "param18", "param19", "param20",
  "param21", "param22", "param23", "param24", "param25", "param26", "param27", "param28",
];
const STEP_FLAG_IDS = [
  "param29", "param30", "param31", "param32", "param33", "param34", "param35", "param36",
  "param37", "param38", "param39", "param40", "param41", "param42", "param43", "param44",
];
const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const DISTORTION_NAMES = ["PURE", "MACKIE", "PHONO"];
const GENERATION_SCALES = [
  { id: "minor-pentatonic", label: "MIN PENTA", degrees: [0, 3, 5, 7, 10] },
  { id: "minor", label: "MINOR", degrees: [0, 2, 3, 5, 7, 8, 10] },
  { id: "major", label: "MAJOR", degrees: [0, 2, 4, 5, 7, 9, 11] },
  { id: "chromatic", label: "CHROMA", degrees: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] },
];
const TOOLTIP_STORAGE_KEY = "acidify.tooltips.enabled";
const CONTROL_TOOLTIPS = {
  param1: "Fine-tunes the instrument by one semitone up or down. Drag or use the arrow keys; hold Shift for finer movement. Double-click to reset.",
  param2: "Sets the filter cutoff frequency. Higher values make the sound brighter. Hold Shift while dragging for finer movement.",
  param3: "Sets filter resonance around the cutoff frequency. Higher values increase the characteristic acid peak.",
  param4: "Controls how strongly the filter envelope moves the cutoff frequency.",
  param5: "Sets the filter-envelope decay time.",
  param6: "Sets the global intensity of accented steps and high-velocity MIDI notes.",
  param7: "Selects the oscillator waveform: sawtooth or the modelled 303-style square wave.",
  param8: "Sets the final output level in decibels.",
  param9: "Sets the internal clock tempo. Wheel or arrow keys change 0.1 BPM; hold Shift for 0.01 BPM. In DAW mode the knob follows the host tempo.",
  param10: "Starts or stops the internal pattern clock. In DAW mode this follows host transport when available.",
  param11: "Sets the active pattern length from 1 to 16 steps.",
  param12: "Sets the MIDI root note used by the 16-step pattern.",
  param45: "Turns the optional post-output distortion stage on or off.",
  param46: "Selects the distortion character: Pure, Mackie or Phono.",
  param47: "Sets the amount of drive applied by the selected distortion character.",
  param48: "Blends the distorted signal with the clean instrument output.",
  param49: "Selects the clock source. INT uses the internal tempo and RUN/STOP; DAW follows host tempo, transport and position.",
  param50: "Adds swing to each pair of sixteenth notes. 0% is straight; 100% reaches a 2:1 triplet feel.",
};

function noteName(note) {
  const n = Math.max(0, Math.min(127, Math.round(Number(note) || 0)));
  return `${NOTE_NAMES[n % 12]}${Math.floor(n / 12) - 1}`;
}

function clamp(value, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function formatTempo(value) {
  const rounded = Math.round(clamp(value, 0, 999) * 100) / 100;
  const decimals = Number.isInteger(rounded) ? 0 : Number.isInteger(rounded * 10) ? 1 : 2;
  return `${rounded.toFixed(decimals)} BPM`;
}

class DialControl {
  constructor({ patchConnection, sendValue, node, config }) {
    this.pc = patchConnection;
    this.sendValue = sendValue;
    this.node = node;
    this.config = config;
    this.dial = node.querySelector(".dial");
    this.valueLabel = node.querySelector(".value-label");
    this.value = config.init;
    this.dragging = false;
    this.startY = 0;
    this.startValue = config.init;
    this.feedbackTimer = null;
    this.node.style.setProperty("--default-norm", (config.init - config.min) / (config.max - config.min || 1));
    this.isDisabled = () => this.dial.getAttribute("aria-disabled") === "true"
      || this.node.getAttribute("aria-disabled") === "true";

    this.onPointerDown = e => {
      if (this.isDisabled()) return;
      this.dragging = true;
      this.startY = e.clientY;
      this.startValue = this.value;
      this.showFeedback();
      this.dial.setPointerCapture(e.pointerId);
      this.pc.sendParameterGestureStart?.(this.config.id);
      e.preventDefault();
    };
    this.onPointerMove = e => {
      if (!this.dragging) return;
      const range = this.config.max - this.config.min;
      const sensitivity = e.shiftKey ? 0.0015 : 0.007;
      this.showFeedback();
      this.setValue(this.startValue + (this.startY - e.clientY) * range * sensitivity, true);
    };
    this.onPointerEnd = e => {
      if (!this.dragging) return;
      this.dragging = false;
      if (this.dial.hasPointerCapture?.(e.pointerId)) this.dial.releasePointerCapture(e.pointerId);
      this.pc.sendParameterGestureEnd?.(this.config.id);
    };
    this.onDoubleClick = () => {
      if (this.isDisabled()) return;
      this.pc.sendParameterGestureStart?.(this.config.id);
      this.showFeedback();
      this.setValue(this.config.init, true);
      this.pc.sendParameterGestureEnd?.(this.config.id);
    };
    this.onWheel = e => {
      e.preventDefault();
      if (this.isDisabled()) return;
      const increment = e.shiftKey
        ? (this.config.fineStep || this.config.step || (this.config.max - this.config.min) / 100)
        : (this.config.coarseStep || this.config.step || (this.config.max - this.config.min) / 100);
      this.pc.sendParameterGestureStart?.(this.config.id);
      this.showFeedback();
      this.setValue(this.value + (e.deltaY < 0 ? increment : -increment), true);
      this.pc.sendParameterGestureEnd?.(this.config.id);
    };
    this.onKeyDown = e => {
      if (this.isDisabled()) return;
      const increment = e.shiftKey
        ? (this.config.fineStep || this.config.step || (this.config.max - this.config.min) / 100)
        : (this.config.coarseStep || this.config.step || (this.config.max - this.config.min) / 100);
      let next = null;
      if (e.key === "ArrowUp" || e.key === "ArrowRight") next = this.value + increment;
      if (e.key === "ArrowDown" || e.key === "ArrowLeft") next = this.value - increment;
      if (e.key === "Home") next = this.config.min;
      if (e.key === "End") next = this.config.max;
      if (next === null) return;
      e.preventDefault();
      this.pc.sendParameterGestureStart?.(this.config.id);
      this.showFeedback();
      this.setValue(next, true);
      this.pc.sendParameterGestureEnd?.(this.config.id);
    };

    this.dial.addEventListener("pointerdown", this.onPointerDown);
    this.dial.addEventListener("pointermove", this.onPointerMove);
    this.dial.addEventListener("pointerup", this.onPointerEnd);
    this.dial.addEventListener("pointercancel", this.onPointerEnd);
    this.dial.addEventListener("dblclick", this.onDoubleClick);
    this.dial.addEventListener("wheel", this.onWheel, { passive: false });
    this.dial.addEventListener("keydown", this.onKeyDown);
    this.setValue(config.init, false);
  }

  showFeedback() {
    this.node.classList.add("value-visible");
    if (this.feedbackTimer) window.clearTimeout(this.feedbackTimer);
    this.feedbackTimer = window.setTimeout(() => {
      if (!this.dragging) this.node.classList.remove("value-visible");
    }, 900);
  }

  dispose() {
    if (this.feedbackTimer) window.clearTimeout(this.feedbackTimer);
    this.feedbackTimer = null;
  }

  setValue(raw, notify) {
    if (this.dragging && !notify) return;
    const { min, max, step } = this.config;
    let value = clamp(raw, min, max);
    if (step > 0) value = Number((Math.round(value / step) * step).toFixed(8));
    value = clamp(value, min, max);
    this.value = value;
    const norm = (value - min) / (max - min || 1);
    this.node.style.setProperty("--norm", norm);
    this.dial.setAttribute("aria-valuenow", `${value}`);
    const formatted = this.config.format(value);
    this.dial.setAttribute("aria-valuetext", formatted);
    this.valueLabel.textContent = formatted;
    if (notify) this.sendValue(this.config.id, value);
  }
}

class ToggleControl {
  constructor({ patchConnection, sendValue, node, config, onChange }) {
    this.pc = patchConnection;
    this.sendValue = sendValue;
    this.node = node;
    this.config = config;
    this.onChange = onChange;
    this.value = config.init;
    this.buttons = [...node.querySelectorAll("[data-value]")];
    this.onClick = e => {
      if (node.getAttribute("aria-disabled") === "true") return;
      const button = e.target.closest("[data-value]");
      if (!button) return;
      const value = node.classList.contains("run-switch")
        ? (this.value >= 0.5 ? 0 : 1)
        : Number(button.dataset.value);
      this.setValue(value, true);
    };
    node.addEventListener("click", this.onClick);
    this.setValue(config.init, false);
  }

  setValue(raw, notify) {
    const value = clamp(Math.round(Number(raw) || 0), this.config.min, this.config.max);
    this.value = value;
    this.buttons.forEach(button => {
      const active = Number(button.dataset.value) === value;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", `${active}`);
    });
    this.node.classList.toggle("is-on", value >= 0.5);
    this.onChange?.(value);
    if (notify) this.sendValue(this.config.id, value);
  }
}

class StepperControl {
  constructor({ patchConnection, sendValue, node, config, onChange }) {
    this.pc = patchConnection;
    this.sendValue = sendValue;
    this.node = node;
    this.config = config;
    this.onChange = onChange;
    this.valueLabel = node.querySelector(".stepper-value");
    this.value = config.init;
    this.onClick = e => {
      const direction = Number(e.target.closest("[data-step]")?.dataset.step || 0);
      if (direction) this.setValue(this.value + direction * config.step, true);
    };
    node.addEventListener("click", this.onClick);
    this.setValue(config.init, false);
  }

  setValue(raw, notify) {
    const { min, max, step } = this.config;
    const value = clamp(Math.round((Number(raw) || min) / step) * step, min, max);
    this.value = value;
    this.valueLabel.textContent = this.config.format(value);
    if (notify) this.sendValue(this.config.id, value);
    this.onChange?.(value);
  }
}

class AcidifyPatchView extends HTMLElement {
  constructor(patchConnection) {
    super();
    this.pc = patchConnection;
    this._controls = new Map();
    this._values = new Map();
    this._selectedStep = 0;
    this._selectedSteps = new Set([0]);
    this._selectionAnchor = 0;
    this._playingStep = -1;
    this._studioMode = false;
    this._distortionOpen = false;
    this._pitchMenuOpen = false;
    this._pitchMenuTargets = [];
    this._pitchMenuReturnFocus = null;
    this._history = [];
    this._future = [];
    this._clipboard = null;
    this._generationScaleIndex = 0;
    this._paintState = null;
    this._paramListener = null;
    this._stepListener = null;
    this._meterListener = null;
    this._tempoListener = null;
    this._transportListener = null;
    this._syncListener = null;
    this._resizeFn = null;
    this._resizeObserver = null;
    this._scaleTimer = null;
    this._meter = 0;
    this._effectiveTempo = 128;
    this._transportRunning = false;
    this._hostSyncFlags = 0;
    this._tooltipsEnabled = this._loadTooltipPreference();
    this._tooltipTimer = null;
    this._tooltipTarget = null;
    this._tooltipToggleClick = null;
    this._tooltipPointerOver = null;
    this._tooltipPointerOut = null;
    this._tooltipFocusIn = null;
    this._tooltipFocusOut = null;
    this._studioPointerEnd = null;
    this._studioKeyDown = null;
    this._distortionKeyDown = null;
    this._pitchMenuKeyDown = null;
    this._pitchMenuOutsidePointer = null;
    this._midiHandler = null;
    this._recentSends = [];
    this._mounted = false;
  }

  connectedCallback() {
    if (this._mounted) return;
    this._mounted = true;
    this._distortionOpen = false;
    this._pitchMenuOpen = false;
    this._pitchMenuTargets = [];
    this._pitchMenuReturnFocus = null;
    this.innerHTML = this.getHTML();
    this._controls.clear();
    this._values.clear();
    this._recentSends = [];
    this._buildControls();
    this._wireSteps();
    this._wireKeyboard();
    this._wireStudio();
    this._wirePitchMenu();
    this._wireDistortion();
    this._wireTooltips();
    this._renderStepStrip();
    this._renderStepEditor();
    this._renderStudio();

    this._paramListener = ({ endpointID, value }) => {
      if (this._consumeEcho(endpointID, value)) return;
      this._values.set(endpointID, Number(value));
      const control = this._controls.get(endpointID);
      if (control) control.setValue(value, false);
      if (endpointID === "param45" || endpointID === "param46"
          || endpointID === "param47" || endpointID === "param48") {
        this._renderDistortionState();
      }
      if (endpointID === "param9" || endpointID === "param10" || endpointID === "param49") {
        this._renderTransportState();
      }
      if (endpointID === "param12") {
        this._renderStepStrip();
        this._renderStepEditor();
        this._renderStudio();
        if (this._pitchMenuOpen) this._refreshPitchMenu();
      }
      if (this._isStepParam(endpointID)) {
        this._renderStepStrip();
        this._renderStepEditor();
        this._renderStudio();
        if (this._pitchMenuOpen) this._refreshPitchMenu();
      }
    };
    this.pc.addAllParameterListener(this._paramListener);
    this._controls.forEach((_, id) => this.pc.requestParameterValue(id));

    this._stepListener = value => {
      const n = typeof value === "object" ? Number(value.value ?? value.step ?? -1) : Number(value);
      this._playingStep = Number.isFinite(n) ? Math.round(n) : -1;
      this._renderStepStrip();
      this._renderStudio();
    };
    this.pc.addEndpointListener("currentStep", this._stepListener);

    this._meterListener = value => {
      const n = typeof value === "object" ? Number(value.value ?? 0) : Number(value);
      this._meter = clamp(n, 0, 1);
      this.querySelector(".output-lamp")?.style.setProperty("--level", this._meter);
    };
    this.pc.addEndpointListener("meterOut", this._meterListener);

    this._tempoListener = value => {
      const n = typeof value === "object" ? Number(value.value ?? value.bpm ?? 0) : Number(value);
      if (Number.isFinite(n) && n > 0) this._effectiveTempo = n;
      this._renderTransportState();
    };
    this.pc.addEndpointListener("effectiveTempo", this._tempoListener);

    this._transportListener = value => {
      const n = typeof value === "object" ? Number(value.value ?? value.running ?? 0) : Number(value);
      this._transportRunning = Number.isFinite(n) && n >= 0.5;
      this._renderTransportState();
    };
    this.pc.addEndpointListener("transportRunning", this._transportListener);

    this._syncListener = value => {
      const n = typeof value === "object" ? Number(value.value ?? value.flags ?? 0) : Number(value);
      this._hostSyncFlags = Number.isFinite(n) ? clamp(Math.round(n), 0, 7) : 0;
      this._renderTransportState();
    };
    this.pc.addEndpointListener("hostSyncStatus", this._syncListener);

    this._midiHandler = messages => {
      messages.forEach(({ s, d1, d2 }) => {
        const kind = s & 0xf0;
        if (kind === 0x90 && d2 > 0) this._showMidiNote(d1, true);
        else if (kind === 0x80 || (kind === 0x90 && d2 === 0)) this._showMidiNote(d1, false);
      });
    };
    window.__amorphProcessMidi = this._midiHandler;

    let parent = this.parentElement;
    while (parent && parent !== document.body) {
      parent.style.overflow = "hidden";
      parent.style.margin = "0";
      parent.style.padding = "0";
      parent = parent.parentElement;
    }

    this._resizeFn = () => this._doScale();
    window.addEventListener("resize", this._resizeFn);
    this._resizeObserver = typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(() => this._doScale())
      : null;
    this._resizeObserver?.observe(document.documentElement);
    this._scaleTimer = window.setInterval(() => this._doScale(), 250);
    this._doScale();
    this._renderTransportState();
  }

  disconnectedCallback() {
    if (!this._mounted) return;
    if (this._paramListener) this.pc.removeAllParameterListener(this._paramListener);
    if (this._stepListener) this.pc.removeEndpointListener("currentStep", this._stepListener);
    if (this._meterListener) this.pc.removeEndpointListener("meterOut", this._meterListener);
    if (this._tempoListener) this.pc.removeEndpointListener("effectiveTempo", this._tempoListener);
    if (this._transportListener) this.pc.removeEndpointListener("transportRunning", this._transportListener);
    if (this._syncListener) this.pc.removeEndpointListener("hostSyncStatus", this._syncListener);
    window.removeEventListener("resize", this._resizeFn);
    this._resizeObserver?.disconnect();
    if (this._scaleTimer) window.clearInterval(this._scaleTimer);
    if (this._toastTimer) window.clearTimeout(this._toastTimer);
    if (this._studioKeyDown) this.removeEventListener("keydown", this._studioKeyDown);
    if (this._distortionKeyDown) this.removeEventListener("keydown", this._distortionKeyDown);
    if (this._pitchMenuKeyDown) this.removeEventListener("keydown", this._pitchMenuKeyDown);
    if (this._pitchMenuOutsidePointer) this.removeEventListener("pointerdown", this._pitchMenuOutsidePointer, true);
    if (this._tooltipToggleClick) this.querySelector(".tooltip-toggle")?.removeEventListener("click", this._tooltipToggleClick);
    if (this._tooltipPointerOver) this.removeEventListener("pointerover", this._tooltipPointerOver);
    if (this._tooltipPointerOut) this.removeEventListener("pointerout", this._tooltipPointerOut);
    if (this._tooltipFocusIn) this.removeEventListener("focusin", this._tooltipFocusIn);
    if (this._tooltipFocusOut) this.removeEventListener("focusout", this._tooltipFocusOut);
    if (window.__amorphProcessMidi === this._midiHandler) delete window.__amorphProcessMidi;
    this._hideTooltip();
    this._controls.forEach(control => control.dispose?.());
    this._controls.clear();
    this._values.clear();
    this._recentSends = [];
    this._paramListener = null;
    this._stepListener = null;
    this._meterListener = null;
    this._tempoListener = null;
    this._transportListener = null;
    this._syncListener = null;
    this._resizeFn = null;
    this._resizeObserver = null;
    this._scaleTimer = null;
    this._toastTimer = null;
    this._studioPointerEnd = null;
    this._studioKeyDown = null;
    this._distortionKeyDown = null;
    this._pitchMenuKeyDown = null;
    this._pitchMenuOutsidePointer = null;
    this._tooltipToggleClick = null;
    this._tooltipPointerOver = null;
    this._tooltipPointerOut = null;
    this._tooltipFocusIn = null;
    this._tooltipFocusOut = null;
    this._tooltipTarget = null;
    this._pitchMenuTargets = [];
    this._pitchMenuReturnFocus = null;
    this._midiHandler = null;
    this._mounted = false;
  }

  _loadTooltipPreference() {
    try {
      return window.localStorage.getItem(TOOLTIP_STORAGE_KEY) !== "false";
    } catch {
      return true;
    }
  }

  _wireTooltips() {
    Object.entries(CONTROL_TOOLTIPS).forEach(([id, text]) => {
      const node = this.querySelector(`.control[data-param="${id}"]`);
      if (node) node.dataset.tooltip = text;
    });
    this.querySelectorAll("[title]").forEach(node => {
      if (!node.dataset.tooltip) node.dataset.tooltip = node.getAttribute("title") || "";
      node.removeAttribute("title");
    });
    this.querySelectorAll("button[aria-label]").forEach(node => {
      if (!node.dataset.tooltip) node.dataset.tooltip = node.getAttribute("aria-label") || "";
    });

    const toggle = this.querySelector(".tooltip-toggle");
    this._tooltipToggleClick = () => this._setTooltipsEnabled(!this._tooltipsEnabled, true);
    toggle?.addEventListener("click", this._tooltipToggleClick);

    this._tooltipPointerOver = event => {
      const target = this._findTooltipTarget(event.target);
      if (!target || target === this._findTooltipTarget(event.relatedTarget)) return;
      this._scheduleTooltip(target, 360);
    };
    this._tooltipPointerOut = event => {
      const target = this._findTooltipTarget(event.target);
      if (!target || target === this._findTooltipTarget(event.relatedTarget)) return;
      if (this._tooltipTarget === target) this._hideTooltip();
    };
    this._tooltipFocusIn = event => {
      const target = this._findTooltipTarget(event.target);
      if (target) this._scheduleTooltip(target, 120);
    };
    this._tooltipFocusOut = event => {
      const target = this._findTooltipTarget(event.target);
      if (!target || target === this._findTooltipTarget(event.relatedTarget)) return;
      if (this._tooltipTarget === target) this._hideTooltip();
    };
    this.addEventListener("pointerover", this._tooltipPointerOver);
    this.addEventListener("pointerout", this._tooltipPointerOut);
    this.addEventListener("focusin", this._tooltipFocusIn);
    this.addEventListener("focusout", this._tooltipFocusOut);
    this._setTooltipsEnabled(this._tooltipsEnabled, false);
  }

  _findTooltipTarget(node) {
    if (!(node instanceof Element)) return null;
    const target = node.closest("[data-tooltip]");
    return target && this.contains(target) ? target : null;
  }

  _setTooltipsEnabled(enabled, persist) {
    this._tooltipsEnabled = Boolean(enabled);
    this.classList.toggle("tooltips-off", !this._tooltipsEnabled);
    const toggle = this.querySelector(".tooltip-toggle");
    toggle?.setAttribute("aria-pressed", `${this._tooltipsEnabled}`);
    toggle?.setAttribute("aria-label", `Tooltips ${this._tooltipsEnabled ? "on" : "off"}; click to turn them ${this._tooltipsEnabled ? "off" : "on"}`);
    const state = toggle?.querySelector(".tooltip-toggle-state");
    if (state) state.textContent = this._tooltipsEnabled ? "ON" : "OFF";
    if (!this._tooltipsEnabled) this._hideTooltip();
    if (persist) {
      try {
        window.localStorage.setItem(TOOLTIP_STORAGE_KEY, `${this._tooltipsEnabled}`);
      } catch {
        // Some embedded or file-based hosts intentionally disable local storage.
      }
    }
  }

  _scheduleTooltip(target, delay) {
    if (!this._tooltipsEnabled || !target?.dataset.tooltip) return;
    if (this._tooltipTimer) window.clearTimeout(this._tooltipTimer);
    this._tooltipTarget = target;
    this._tooltipTimer = window.setTimeout(() => {
      this._tooltipTimer = null;
      this._showTooltip(target);
    }, delay);
  }

  _showTooltip(target) {
    if (!this._tooltipsEnabled || !target?.isConnected || this._tooltipTarget !== target) return;
    const bubble = this.querySelector(".tooltip-bubble");
    const chassis = this.querySelector(".chassis");
    const text = target.dataset.tooltip?.trim();
    if (!bubble || !chassis || !text) return;
    bubble.textContent = text;
    bubble.hidden = false;

    const chassisBounds = chassis.getBoundingClientRect();
    const targetBounds = target.getBoundingClientRect();
    const scaleX = chassisBounds.width / 1180 || 1;
    const scaleY = chassisBounds.height / 580 || 1;
    const targetLeft = (targetBounds.left - chassisBounds.left) / scaleX;
    const targetTop = (targetBounds.top - chassisBounds.top) / scaleY;
    const targetWidth = targetBounds.width / scaleX;
    const targetHeight = targetBounds.height / scaleY;
    let left = targetLeft + targetWidth / 2 - bubble.offsetWidth / 2;
    let top = targetTop - bubble.offsetHeight - 10;
    if (top < 10) top = targetTop + targetHeight + 10;
    left = clamp(left, 10, 1180 - bubble.offsetWidth - 10);
    top = clamp(top, 10, 580 - bubble.offsetHeight - 10);
    bubble.style.left = `${left}px`;
    bubble.style.top = `${top}px`;
  }

  _hideTooltip() {
    if (this._tooltipTimer) window.clearTimeout(this._tooltipTimer);
    this._tooltipTimer = null;
    this._tooltipTarget = null;
    const bubble = this.querySelector(".tooltip-bubble");
    if (bubble) bubble.hidden = true;
  }

  _sendParameter(endpointID, rawValue) {
    const value = Number(rawValue);
    const now = performance.now();
    this._values.set(endpointID, value);
    if (endpointID === "param45" || endpointID === "param46"
        || endpointID === "param47" || endpointID === "param48") {
      this._renderDistortionState();
    }
    if (endpointID === "param9" || endpointID === "param10" || endpointID === "param49") {
      this._renderTransportState();
    }
    this._recentSends = this._recentSends.filter(entry => now - entry.time < 1500);
    this._recentSends.push({ endpointID, value, time: now });
    if (this._recentSends.length > 64) this._recentSends.shift();
    this.pc.sendEventOrValue(endpointID, rawValue);
  }

  _consumeEcho(endpointID, rawValue) {
    const value = Number(rawValue);
    const now = performance.now();
    this._recentSends = this._recentSends.filter(entry => now - entry.time < 1500);
    const index = this._recentSends.findIndex(entry =>
      entry.endpointID === endpointID && Math.abs(entry.value - value) <= 1e-6
    );
    if (index < 0) return false;
    this._recentSends.splice(index, 1);
    return true;
  }

  _buildControls() {
    const sendValue = (endpointID, value) => this._sendParameter(endpointID, value);
    ACIDIFY_GLOBALS.forEach(config => {
      const node = this.querySelector(`.control[data-param="${config.id}"]`);
      if (!node) return;
      let control;
      if (config.type === "dial") {
        control = new DialControl({ patchConnection: this.pc, sendValue, node, config });
      } else if (config.type === "toggle") {
        control = new ToggleControl({
          patchConnection: this.pc,
          sendValue,
          node,
          config,
          onChange: value => {
            if (config.id === "param10" || config.id === "param49") {
              this._renderTransportState();
            }
            if (config.id === "param45" || config.id === "param46") {
              this._renderDistortionState();
            }
          },
        });
      } else {
        control = new StepperControl({
          patchConnection: this.pc,
          sendValue,
          node,
          config,
          onChange: () => {
            if (config.id === "param12") {
              this._renderStepStrip();
              this._renderStepEditor();
              this._renderStudio();
              if (this._pitchMenuOpen) this._refreshPitchMenu();
            }
          },
        });
      }
      this._values.set(config.id, config.init);
      this._controls.set(config.id, control);
    });

    for (let index = 0; index < 16; index += 1) {
      const pitchID = STEP_PITCH_IDS[index];
      const flagsID = STEP_FLAG_IDS[index];
      this._values.set(pitchID, STEP_PITCH_DEFAULTS[index]);
      this._values.set(flagsID, STEP_FLAG_DEFAULTS[index]);
      this._controls.set(pitchID, {
        setValue: (value, notify) => this._setStepValue(index, "pitch", value, notify),
      });
      this._controls.set(flagsID, {
        setValue: (value, notify) => this._setStepValue(index, "flags", value, notify),
      });
    }
  }

  _wireSteps() {
    this.querySelectorAll(".sequence-step").forEach(node => {
      node.addEventListener("click", event => {
        const index = Number(node.dataset.step);
        if (this._studioMode) {
          this._selectStudioStep(index, event);
        } else {
          this._selectedStep = index;
          this._selectedSteps = new Set([index]);
          this._selectionAnchor = index;
        }
        this._renderStepStrip();
        this._renderStepEditor();
        this._renderStudio();
      });
      node.addEventListener("wheel", event => {
        event.preventDefault();
        const index = Number(node.dataset.step);
        const offset = event.deltaY < 0 ? 1 : -1;
        if (this._studioMode) {
          if (!this._selectedSteps.has(index)) {
            this._selectedStep = index;
            this._selectedSteps = new Set([index]);
            this._selectionAnchor = index;
          }
          this._transposeSelection(offset, "Step-strip pitch wheel");
        } else {
          this._selectedStep = index;
          this._selectedSteps = new Set([index]);
          this._selectionAnchor = index;
          this._setStepValue(index, "pitch", this._stepPitch(index) + offset, true);
        }
      }, { passive: false });
      node.addEventListener("contextmenu", event => {
        event.preventDefault();
        this._openPitchMenu(Number(node.dataset.step), event.clientX, event.clientY, node);
      });
      node.addEventListener("dblclick", event => {
        event.preventDefault();
        this._openPitchMenu(Number(node.dataset.step), event.clientX, event.clientY, node);
      });
    });
  }

  _wireKeyboard() {
    this.querySelectorAll(".pitch-key").forEach(key => {
      key.addEventListener("click", () => {
        const semitone = Number(key.dataset.pitch);
        const current = this._stepPitch(this._selectedStep);
        const octave = current >= 12 ? 12 : 0;
        const next = clamp(octave + semitone, 0, 24);
        this._setStepValue(this._selectedStep, "pitch", next, true);
      });
    });
    this.querySelectorAll("[data-transpose]").forEach(button => {
      button.addEventListener("click", () => {
        const offset = Number(button.dataset.transpose);
        this._setStepValue(this._selectedStep, "pitch", this._stepPitch(this._selectedStep) + offset, true);
      });
    });
    this.querySelectorAll("[data-flag]").forEach(button => {
      button.addEventListener("click", () => {
        const bit = Number(button.dataset.flag);
        const flags = this._stepFlags(this._selectedStep);
        this._setStepValue(this._selectedStep, "flags", flags ^ bit, true);
      });
    });
    this.querySelector('[data-classic-action="clear-step"]')?.addEventListener("click", () => {
      const index = this._selectedStep;
      this._mutatePattern("Clear step", draft => {
        draft[index] = { pitch: 0, flags: 0 };
      });
    });
  }

  _wireStudio() {
    this.querySelector(".studio-toggle")?.addEventListener("click", () => {
      this._setStudioMode(!this._studioMode);
    });

    this.querySelector(".studio-scale")?.addEventListener("click", () => {
      this._generationScaleIndex = (this._generationScaleIndex + 1) % GENERATION_SCALES.length;
      this._updateStudioToolbar();
      this._showStudioToast(`SCALE · ${this._generationScale().label}`);
    });

    this.querySelectorAll("[data-studio-action]").forEach(button => {
      button.addEventListener("click", () => {
        if (button.dataset.studioAction === "choose-note") {
          const box = button.getBoundingClientRect();
          this._openPitchMenu(
            this._selectedStep,
            box.left + box.width / 2,
            box.top + box.height / 2,
            button
          );
        } else {
          this._runStudioAction(button.dataset.studioAction);
        }
      });
    });

    this.querySelectorAll(".studio-cell").forEach(cell => {
      const index = Number(cell.dataset.step);
      const kind = cell.dataset.kind;
      cell.addEventListener("pointerdown", event => {
        if (!this._studioMode) return;
        if (event.button !== 0) return;
        if (kind === "pitch") {
          this._selectStudioStep(index, event);
          this._renderStepStrip();
          this._renderStepEditor();
          this._renderStudio();
          return;
        }
        if (!this._selectedSteps.has(index)) {
          this._selectedStep = index;
          this._selectedSteps = new Set([index]);
          this._selectionAnchor = index;
        }
        const bit = kind === "gate" ? 1 : kind === "accent" ? 2 : 4;
        const targetOn = (this._stepFlags(index) & bit) === 0;
        this._paintState = {
          kind,
          bit,
          targetOn,
          before: this._stepSnapshot(),
          visited: new Set(),
        };
        this._paintStudioCell(index);
        event.preventDefault();
      });
      cell.addEventListener("pointerenter", () => {
        if (this._paintState?.kind === kind) this._paintStudioCell(index);
      });
      if (kind === "pitch") {
        cell.addEventListener("wheel", event => {
          if (!this._studioMode) return;
          event.preventDefault();
          if (!this._selectedSteps.has(index)) {
            this._selectedStep = index;
            this._selectedSteps = new Set([index]);
            this._selectionAnchor = index;
          }
          this._transposeSelection(event.deltaY < 0 ? 1 : -1, "Pitch wheel");
        }, { passive: false });
        cell.addEventListener("contextmenu", event => {
          event.preventDefault();
          this._openPitchMenu(index, event.clientX, event.clientY, cell);
        });
        cell.addEventListener("dblclick", event => {
          event.preventDefault();
          this._openPitchMenu(index, event.clientX, event.clientY, cell);
        });
      }
    });

    this._studioPointerEnd = () => {
      if (!this._paintState) return;
      this._pushHistory(this._paintState.before, `Paint ${this._paintState.kind}`);
      this._paintState = null;
      this._renderStudio();
    };
    const matrix = this.querySelector(".studio-matrix");
    matrix?.addEventListener("pointerup", this._studioPointerEnd);
    matrix?.addEventListener("pointercancel", this._studioPointerEnd);
    matrix?.addEventListener("pointerleave", this._studioPointerEnd);

    this._studioKeyDown = event => {
      const command = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();
      if (this._distortionOpen && event.key === "Escape") return;
      if (this._pitchMenuOpen && event.key === "Escape") return;
      if (!command && key === "m") {
        event.preventDefault();
        this._setStudioMode(!this._studioMode);
        return;
      }
      if (!this._studioMode) return;
      if (command && key === "z") {
        event.preventDefault();
        this._runStudioAction(event.shiftKey ? "redo" : "undo");
      } else if (command && key === "y") {
        event.preventDefault();
        this._runStudioAction("redo");
      } else if (command && key === "c") {
        event.preventDefault();
        this._runStudioAction("copy");
      } else if (command && key === "v") {
        event.preventDefault();
        this._runStudioAction("paste");
      } else if (event.key === "Escape") {
        event.preventDefault();
        this._setStudioMode(false);
      }
    };
    this.addEventListener("keydown", this._studioKeyDown);
  }

  _wirePitchMenu() {
    this.querySelector(".pitch-menu-close")?.addEventListener("click", () => {
      this._closePitchMenu();
    });
    this.querySelectorAll(".pitch-menu-choice").forEach(button => {
      button.addEventListener("click", () => {
        this._setPitchMenuChoice(Number(button.dataset.pitchValue));
      });
    });
    this._pitchMenuKeyDown = event => {
      if (!this._pitchMenuOpen || event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      this._closePitchMenu();
    };
    this._pitchMenuOutsidePointer = event => {
      if (!this._pitchMenuOpen || event.target.closest(".pitch-menu")) return;
      this._closePitchMenu(false);
    };
    this.addEventListener("keydown", this._pitchMenuKeyDown);
    this.addEventListener("pointerdown", this._pitchMenuOutsidePointer, true);
  }

  _octaveLabel(pitch) {
    return `OCT +${Math.floor(clamp(Math.round(pitch), 0, 24) / 12)}`;
  }

  _openPitchMenu(index, clientX, clientY, returnFocus) {
    const target = clamp(Math.round(index), 0, 15);
    if (this._studioMode && this._selectedSteps.has(target)) {
      this._selectedStep = target;
    } else {
      this._selectedStep = target;
      this._selectedSteps = new Set([target]);
      this._selectionAnchor = target;
    }
    this._pitchMenuTargets = this._studioMode ? this._selectedIndices() : [target];
    this._pitchMenuReturnFocus = returnFocus ?? null;
    this._pitchMenuOpen = true;
    this._renderStepStrip();
    this._renderStepEditor();
    this._renderStudio();

    const menu = this.querySelector(".pitch-menu");
    const chassis = this.querySelector(".chassis");
    if (!menu || !chassis) return;
    menu.hidden = false;
    menu.setAttribute("aria-hidden", "false");
    const bounds = chassis.getBoundingClientRect();
    const scaleX = bounds.width / 1180 || 1;
    const scaleY = bounds.height / 580 || 1;
    const localX = (Number(clientX) - bounds.left) / scaleX;
    const localY = (Number(clientY) - bounds.top) / scaleY;
    const menuWidth = 394;
    const menuHeight = 278;
    const left = clamp(localX - menuWidth / 2, 18, 1180 - menuWidth - 18);
    const preferredTop = localY + 12;
    const top = preferredTop + menuHeight <= 562
      ? preferredTop
      : clamp(localY - menuHeight - 12, 18, 562 - menuHeight);
    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
    this._refreshPitchMenu();
    queueMicrotask(() => {
      const initialFocus = menu.querySelector(".pitch-menu-choice.active")
        ?? menu.querySelector(".pitch-menu-choice");
      initialFocus?.focus();
    });
  }

  _refreshPitchMenu() {
    if (!this._pitchMenuOpen) return;
    const root = Math.round(this._values.get("param12") ?? 36);
    const targets = this._pitchMenuTargets.length ? this._pitchMenuTargets : [this._selectedStep];
    const pitches = targets.map(index => this._stepPitch(index));
    const commonPitch = pitches.every(pitch => pitch === pitches[0]) ? pitches[0] : -1;
    const title = this.querySelector(".pitch-menu-title");
    if (title) {
      title.textContent = targets.length === 1
        ? `STEP ${String(targets[0] + 1).padStart(2, "0")} · ${noteName(root + pitches[0]).replace("#", "♯")}`
        : `${targets.length} STEPS · ${commonPitch >= 0
          ? noteName(root + commonPitch).replace("#", "♯")
          : "MIXED NOTES"}`;
    }
    this.querySelectorAll(".pitch-menu-choice").forEach(button => {
      const pitch = Number(button.dataset.pitchValue);
      const absolute = noteName(root + pitch).replace("#", "♯");
      button.querySelector("strong").textContent = absolute;
      button.querySelector("small").textContent = this._octaveLabel(pitch);
      button.classList.toggle("active", pitch === commonPitch);
      button.setAttribute("aria-checked", `${pitch === commonPitch}`);
      button.setAttribute("aria-label", `Set ${targets.length === 1 ? `step ${targets[0] + 1}` : `${targets.length} selected steps`} to ${absolute}, ${this._octaveLabel(pitch)}`);
      button.dataset.tooltip = `Set ${targets.length === 1 ? `step ${targets[0] + 1}` : `${targets.length} selected steps`} to ${absolute} (${this._octaveLabel(pitch)}).`;
    });
  }

  _setPitchMenuChoice(rawPitch) {
    const pitch = clamp(Math.round(rawPitch), 0, 24);
    const targets = this._pitchMenuTargets.length
      ? [...this._pitchMenuTargets]
      : [this._selectedStep];
    this._mutatePattern("Choose note", draft => {
      targets.forEach(index => {
        draft[index].pitch = pitch;
      });
    });
    const root = Math.round(this._values.get("param12") ?? 36);
    this._showStudioToast(`${noteName(root + pitch).replace("#", "♯")} · ${this._octaveLabel(pitch)}`);
    this._closePitchMenu();
  }

  _closePitchMenu(restoreFocus = true) {
    if (!this._pitchMenuOpen) return;
    const focusTarget = this._pitchMenuReturnFocus;
    this._pitchMenuOpen = false;
    this._pitchMenuTargets = [];
    this._pitchMenuReturnFocus = null;
    const menu = this.querySelector(".pitch-menu");
    if (menu) {
      menu.hidden = true;
      menu.setAttribute("aria-hidden", "true");
    }
    if (restoreFocus) focusTarget?.focus?.();
  }

  _wireDistortion() {
    this.querySelector(".distortion-trigger")?.addEventListener("click", () => {
      this._setDistortionOpen(true);
    });
    this.querySelector(".distortion-close")?.addEventListener("click", () => {
      this._setDistortionOpen(false);
    });
    this.querySelector(".distortion-scrim")?.addEventListener("pointerdown", event => {
      if (event.target === event.currentTarget) this._setDistortionOpen(false);
    });
    this._distortionKeyDown = event => {
      if (!this._distortionOpen || event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      this._setDistortionOpen(false);
    };
    this.addEventListener("keydown", this._distortionKeyDown);
    this._renderDistortionState();
  }

  _setDistortionOpen(enabled) {
    this._distortionOpen = Boolean(enabled);
    if (this._distortionOpen) this._closePitchMenu(false);
    this.classList.toggle("distortion-open", this._distortionOpen);
    const trigger = this.querySelector(".distortion-trigger");
    const scrim = this.querySelector(".distortion-scrim");
    trigger?.setAttribute("aria-expanded", `${this._distortionOpen}`);
    if (scrim) {
      scrim.hidden = !this._distortionOpen;
      scrim.setAttribute("aria-hidden", `${!this._distortionOpen}`);
    }
    if (this._distortionOpen) {
      queueMicrotask(() => this.querySelector(".distortion-close")?.focus());
    } else {
      trigger?.focus();
    }
  }

  _mirrorHostTempoToParameter() {
    const control = this._controls.get("param9");
    const config = ACIDIFY_GLOBALS.find(item => item.id === "param9");
    if (!control || !config || control.dragging) return null;
    control.setValue(clamp(this._effectiveTempo, config.min, config.max), false);
    const mirroredTempo = control.value;
    const storedTempo = Number(this._values.get("param9"));
    if (!Number.isFinite(storedTempo) || Math.abs(storedTempo - mirroredTempo) > 0.0001) {
      this._sendParameter("param9", mirroredTempo);
    }
    return mirroredTempo;
  }

  _renderTransportState() {
    const dawMode = Number(this._values.get("param49") ?? 0) >= 0.5;
    const manualRunning = Number(this._values.get("param10") ?? 0) >= 0.5;
    const hasTempo = (this._hostSyncFlags & 1) !== 0;
    const hasTransport = (this._hostSyncFlags & 2) !== 0;
    const hasPosition = (this._hostSyncFlags & 4) !== 0;
    const hostReady = hasTempo && hasTransport;
    const runHostControlled = dawMode && hasTransport;
    const tempoHostControlled = dawMode && hasTempo;
    const mirroredTempo = tempoHostControlled ? this._mirrorHostTempoToParameter() : null;
    const internalTempo = Number(mirroredTempo ?? this._values.get("param9") ?? 128);
    const effectiveTempo = Number(dawMode && hasTempo ? this._effectiveTempo : internalTempo);
    const running = runHostControlled ? this._transportRunning : manualRunning;

    this.querySelector(".run-lamp")?.classList.toggle("lit", running);
    const runSwitch = this.querySelector('.run-switch[data-param="param10"]');
    runSwitch?.classList.toggle("is-on", running);
    runSwitch?.classList.toggle("daw-controlled", runHostControlled);
    runSwitch?.setAttribute("aria-disabled", `${runHostControlled}`);
    if (runSwitch) runSwitch.dataset.tooltip = runHostControlled
      ? "Transport follows the DAW"
      : dawMode
        ? "No DAW transport received; RUN/STOP controls the internal fallback"
        : CONTROL_TOOLTIPS.param10;
    const runButton = runSwitch?.querySelector('[data-value="0"]');
    if (runButton) runButton.textContent = runHostControlled ? "DAW FOLLOW" : "RUN / STOP";

    const tempoBox = this.querySelector(".tempo-box");
    tempoBox?.classList.toggle("daw-locked", tempoHostControlled);
    const tempoDial = tempoBox?.querySelector(".dial");
    tempoDial?.setAttribute("aria-disabled", `${tempoHostControlled}`);
    if (tempoDial) tempoDial.tabIndex = tempoHostControlled ? -1 : 0;
    if (tempoBox) tempoBox.dataset.tooltip = tempoHostControlled
      ? "Tempo follows the DAW and is mirrored to this knob. Switch to INT to keep the current BPM and make fine manual adjustments."
      : dawMode
        ? "No DAW tempo received; this sets the internal fallback BPM"
        : CONTROL_TOOLTIPS.param9;

    const readout = this.querySelector(".clock-readout");
    if (readout) {
      readout.textContent = !dawMode
        ? `INT · ${formatTempo(internalTempo)}`
        : hostReady
          ? `DAW · ${formatTempo(effectiveTempo)}`
          : hasTempo
            ? `DAW ${formatTempo(effectiveTempo)} · INT RUN`
            : hasTransport
              ? `INT ${formatTempo(internalTempo)} · DAW RUN`
              : "DAW · INT FALLBACK";
      readout.classList.toggle("locked", dawMode && hostReady);
      readout.classList.toggle("waiting", dawMode && !hostReady);
      readout.dataset.tooltip = dawMode
        ? (hostReady
          ? (hasPosition
            ? "DAW tempo, transport and timeline position locked"
            : "DAW tempo and transport locked; timeline position unavailable")
          : hasTempo
            ? "DAW tempo received; transport uses manual RUN/STOP fallback"
            : hasTransport
              ? "DAW transport received; tempo uses the internal BPM fallback"
              : "Host sent no Cmajor timeline events; internal BPM and RUN/STOP remain active")
        : "Internal clock";
    }
  }

  _renderDistortionState() {
    const enabled = Number(this._values.get("param45") ?? 0) >= 0.5;
    const typeIndex = clamp(Math.round(Number(this._values.get("param46") ?? 0)), 0, 2);
    const name = DISTORTION_NAMES[typeIndex];
    const trigger = this.querySelector(".distortion-trigger");
    trigger?.classList.toggle("active", enabled);
    trigger?.setAttribute("aria-label", `Distortion ${enabled ? `${name} enabled` : "disabled"}; open controls`);
    if (trigger) trigger.dataset.tooltip = enabled
      ? `${name} distortion is active. Click to open the distortion controls.`
      : "Distortion is bypassed. Click to open the distortion controls.";
    const status = this.querySelector(".distortion-status");
    if (status) status.textContent = enabled ? `${name} ACTIVE` : "TRUE BYPASS";
    this.querySelector(".distortion-led")?.classList.toggle("lit", enabled);
  }

  _setStudioMode(enabled) {
    if (this._pitchMenuOpen) this._closePitchMenu(false);
    this._studioMode = Boolean(enabled);
    this.classList.toggle("studio-mode", this._studioMode);
    const toggle = this.querySelector(".studio-toggle");
    toggle?.setAttribute("aria-pressed", `${this._studioMode}`);
    toggle?.setAttribute("aria-label", this._studioMode ? "Return to Classic mode" : "Open Studio edit mode");
    if (toggle) toggle.dataset.tooltip = this._studioMode
      ? "Return to the Classic step-programming view. Keyboard shortcut: M."
      : "Open the Studio matrix for multi-step editing. Keyboard shortcut: M.";
    const modeStatus = this.querySelector(".program-context");
    if (modeStatus) modeStatus.textContent = this._studioMode ? "STUDIO MATRIX" : "CLASSIC PROGRAMMING";
    this.querySelector(".classic-editor")?.setAttribute("aria-hidden", `${this._studioMode}`);
    this.querySelector(".studio-editor")?.setAttribute("aria-hidden", `${!this._studioMode}`);
    if (!this._studioMode) {
      this._selectedSteps = new Set([this._selectedStep]);
      this._paintState = null;
    }
    this._renderStepStrip();
    this._renderStepEditor();
    this._renderStudio();
  }

  _selectStudioStep(index, event = {}) {
    if (event.shiftKey) {
      const start = Math.min(this._selectionAnchor, index);
      const end = Math.max(this._selectionAnchor, index);
      this._selectedSteps = new Set(Array.from({ length: end - start + 1 }, (_, offset) => start + offset));
    } else if (event.ctrlKey || event.metaKey) {
      const next = new Set(this._selectedSteps);
      if (next.has(index) && next.size > 1) next.delete(index);
      else next.add(index);
      this._selectedSteps = next;
      this._selectionAnchor = index;
    } else {
      this._selectedSteps = new Set([index]);
      this._selectionAnchor = index;
    }
    this._selectedStep = index;
  }

  _selectedIndices() {
    return [...this._selectedSteps].sort((a, b) => a - b);
  }

  _stepSnapshot() {
    return Array.from({ length: 16 }, (_, index) => ({
      pitch: this._stepPitch(index),
      flags: this._stepFlags(index),
    }));
  }

  _snapshotMatches(a, b) {
    return a.every((step, index) => step.pitch === b[index].pitch && step.flags === b[index].flags);
  }

  _applySnapshot(snapshot, notify = true) {
    snapshot.forEach((step, index) => {
      const pitchID = STEP_PITCH_IDS[index];
      const flagsID = STEP_FLAG_IDS[index];
      const pitch = clamp(Math.round(step.pitch), 0, 24);
      const flags = clamp(Math.round(step.flags), 0, 7);
      if (pitch !== this._stepPitch(index)) {
        this._values.set(pitchID, pitch);
        if (notify) this._sendParameter(pitchID, pitch);
      }
      if (flags !== this._stepFlags(index)) {
        this._values.set(flagsID, flags);
        if (notify) this._sendParameter(flagsID, flags);
      }
    });
    this._renderStepStrip();
    this._renderStepEditor();
    this._renderStudio();
  }

  _pushHistory(before, label) {
    const after = this._stepSnapshot();
    if (this._snapshotMatches(before, after)) return;
    this._history.push({ before, after, label });
    if (this._history.length > 64) this._history.shift();
    this._future = [];
    this._updateStudioToolbar();
  }

  _mutatePattern(label, mutate) {
    const before = this._stepSnapshot();
    const draft = before.map(step => ({ ...step }));
    mutate(draft);
    this._applySnapshot(draft, true);
    this._pushHistory(before, label);
  }

  _paintStudioCell(index) {
    const state = this._paintState;
    if (!state || state.visited.has(index)) return;
    state.visited.add(index);
    const flags = this._stepFlags(index);
    const next = state.targetOn ? (flags | state.bit) : (flags & ~state.bit);
    this._setStepValue(index, "flags", next, true, false);
  }

  _transposeSelection(offset, label = "Transpose") {
    const selected = this._selectedIndices();
    this._mutatePattern(label, draft => {
      selected.forEach(index => {
        draft[index].pitch = clamp(draft[index].pitch + offset, 0, 24);
      });
    });
  }

  _generationScale() {
    return GENERATION_SCALES[this._generationScaleIndex] || GENERATION_SCALES[0];
  }

  _scalePitches() {
    const pitches = [];
    const degrees = this._generationScale().degrees;
    for (let octave = 0; octave < 2; octave += 1) {
      degrees.forEach(degree => pitches.push(octave * 12 + degree));
    }
    pitches.push(24);
    return [...new Set(pitches)].filter(pitch => pitch >= 0 && pitch <= 24).sort((a, b) => a - b);
  }

  _nearestScalePitch(rawPitch) {
    const pitch = clamp(Math.round(rawPitch), 0, 24);
    return this._scalePitches().reduce((nearest, candidate) =>
      Math.abs(candidate - pitch) < Math.abs(nearest - pitch) ? candidate : nearest
    );
  }

  _adjacentScalePitch(rawPitch, direction) {
    const scale = this._scalePitches();
    const nearest = this._nearestScalePitch(rawPitch);
    const index = scale.indexOf(nearest);
    return scale[clamp(index + (direction < 0 ? -1 : 1), 0, scale.length - 1)];
  }

  _generatedScalePitch() {
    const scale = this._scalePitches();
    // Bias generation toward the lower octave while retaining the full range.
    const shaped = Math.pow(Math.random(), 1.35);
    return scale[Math.min(scale.length - 1, Math.floor(shaped * scale.length))];
  }

  _runStudioAction(action) {
    const selected = this._selectedIndices();
    if (action === "undo") {
      const entry = this._history.pop();
      if (entry) {
        this._future.push(entry);
        this._applySnapshot(entry.before, true);
        this._showStudioToast(`UNDO · ${entry.label}`);
      }
    } else if (action === "redo") {
      const entry = this._future.pop();
      if (entry) {
        this._history.push(entry);
        this._applySnapshot(entry.after, true);
        this._showStudioToast(`REDO · ${entry.label}`);
      }
    } else if (action === "copy") {
      this._clipboard = selected.map(index => ({
        pitch: this._stepPitch(index),
        flags: this._stepFlags(index),
      }));
      this._showStudioToast(`COPIED ${selected.length} STEP${selected.length === 1 ? "" : "S"}`);
    } else if (action === "paste" && this._clipboard?.length) {
      this._mutatePattern("Paste", draft => {
        if (selected.length === 1) {
          this._clipboard.forEach((step, offset) => {
            const index = selected[0] + offset;
            if (index < 16) draft[index] = { ...step };
          });
        } else {
          selected.forEach((index, offset) => {
            draft[index] = { ...this._clipboard[offset % this._clipboard.length] };
          });
        }
      });
      this._showStudioToast("PASTED");
    } else if (action === "select-all") {
      this._selectedSteps = new Set(Array.from({ length: 16 }, (_, index) => index));
      this._showStudioToast("ALL STEPS SELECTED");
    } else if (action === "transpose-down") {
      this._transposeSelection(-12, "Octave down");
    } else if (action === "transpose-up") {
      this._transposeSelection(12, "Octave up");
    } else if (action === "rotate-left" || action === "rotate-right") {
      const targets = selected.length > 1 ? selected : Array.from({ length: 16 }, (_, index) => index);
      const direction = action === "rotate-left" ? -1 : 1;
      this._mutatePattern(direction < 0 ? "Rotate left" : "Rotate right", draft => {
        const source = targets.map(index => ({ ...draft[index] }));
        targets.forEach((index, position) => {
          const sourcePosition = (position - direction + targets.length) % targets.length;
          draft[index] = source[sourcePosition];
        });
      });
    } else if (action === "reverse") {
      const targets = selected.length > 1 ? selected : Array.from({ length: 16 }, (_, index) => index);
      this._mutatePattern("Reverse", draft => {
        const source = targets.map(index => ({ ...draft[index] })).reverse();
        targets.forEach((index, position) => {
          draft[index] = source[position];
        });
      });
      this._showStudioToast("ORDER REVERSED");
    } else if (action === "pitch-mirror") {
      const targets = selected.length > 1 ? selected : Array.from({ length: 16 }, (_, index) => index);
      this._mutatePattern("Pitch mirror", draft => {
        const pitches = targets.map(index => draft[index].pitch);
        const low = Math.min(...pitches);
        const high = Math.max(...pitches);
        targets.forEach(index => {
          draft[index].pitch = low + high - draft[index].pitch;
        });
      });
      this._showStudioToast("PITCH CONTOUR MIRRORED");
    } else if (action === "generate") {
      this._mutatePattern(`Generate ${this._generationScale().label}`, draft => {
        selected.forEach(index => {
          const gate = Math.random() < .84;
          const accent = gate && Math.random() < .28;
          const slide = gate && Math.random() < .2;
          draft[index].pitch = this._generatedScalePitch();
          draft[index].flags = (gate ? 1 : 0) | (accent ? 2 : 0) | (slide ? 4 : 0);
        });
        if (selected.every(index => (draft[index].flags & 1) === 0))
          draft[selected[0]].flags |= 1;
      });
      this._showStudioToast(`GENERATED · ${this._generationScale().label}`);
    } else if (action === "mutate") {
      this._mutatePattern(`Mutate ${this._generationScale().label}`, draft => {
        let changed = false;
        selected.forEach(index => {
          const before = { ...draft[index] };
          if (Math.random() < .35) {
            const direction = Math.random() < .5 ? -1 : 1;
            draft[index].pitch = this._adjacentScalePitch(draft[index].pitch, direction);
          }
          if (Math.random() < .1) draft[index].flags ^= 1;
          if ((draft[index].flags & 1) !== 0) {
            if (Math.random() < .18) draft[index].flags ^= 2;
            if (Math.random() < .12) draft[index].flags ^= 4;
          } else {
            draft[index].flags &= 1;
          }
          if (before.pitch !== draft[index].pitch || before.flags !== draft[index].flags)
            changed = true;
        });
        if (!changed) {
          const index = selected[0];
          const direction = draft[index].pitch >= 12 ? -1 : 1;
          let next = this._adjacentScalePitch(draft[index].pitch, direction);
          if (next === draft[index].pitch)
            next = this._adjacentScalePitch(draft[index].pitch, -direction);
          draft[index].pitch = next;
        }
      });
      this._showStudioToast(`MUTATED · ${this._generationScale().label}`);
    } else if (action === "rest") {
      this._mutatePattern("Toggle rest", draft => {
        const makeGate = selected.every(index => (draft[index].flags & 1) === 0);
        selected.forEach(index => {
          draft[index].flags = makeGate ? (draft[index].flags | 1) : (draft[index].flags & ~1);
        });
      });
    }
    this._renderStepStrip();
    this._renderStepEditor();
    this._renderStudio();
  }

  _showStudioToast(message) {
    const toast = this.querySelector(".studio-toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("visible");
    window.clearTimeout(this._toastTimer);
    this._toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 1050);
  }

  _updateStudioToolbar() {
    const selected = this._selectedIndices();
    const scale = this._generationScale();
    const scaleButton = this.querySelector(".studio-scale");
    const scaleValue = scaleButton?.querySelector("strong");
    if (scaleValue) scaleValue.textContent = scale.label;
    if (scaleButton) {
      scaleButton.setAttribute("aria-label", `Generation scale ${scale.label}; click for next scale`);
      scaleButton.dataset.tooltip = `Generate and Mutate currently use the root-relative ${scale.label} scale. Click to choose the next scale.`;
    }
    const selection = this.querySelector(".studio-selection");
    if (selection) {
      const root = Math.round(this._values.get("param12") ?? 36);
      const pitches = selected.map(index => this._stepPitch(index));
      const octaves = pitches.map(pitch => Math.floor(pitch / 12));
      const commonOctave = octaves.every(octave => octave === octaves[0]) ? octaves[0] : -1;
      selection.textContent = selected.length === 1
        ? `STEP ${String(selected[0] + 1).padStart(2, "0")} · ${noteName(root + pitches[0]).replace("#", "♯")} · OCT +${octaves[0]}`
        : `${selected.length} STEPS · ${commonOctave >= 0 ? `OCT +${commonOctave}` : "MIXED OCT"}`;
    }
    const undo = this.querySelector('[data-studio-action="undo"]');
    const redo = this.querySelector('[data-studio-action="redo"]');
    const paste = this.querySelector('[data-studio-action="paste"]');
    if (undo) undo.disabled = this._history.length === 0;
    if (redo) redo.disabled = this._future.length === 0;
    if (paste) paste.disabled = !this._clipboard?.length;
  }

  _isStepParam(id) {
    const n = Number(String(id).replace("param", ""));
    return n >= 13 && n <= 44;
  }

  _stepPitch(index) {
    return clamp(Math.round(this._values.get(STEP_PITCH_IDS[index]) ?? STEP_PITCH_DEFAULTS[index]), 0, 24);
  }

  _stepFlags(index) {
    return clamp(Math.round(this._values.get(STEP_FLAG_IDS[index]) ?? STEP_FLAG_DEFAULTS[index]), 0, 7);
  }

  _setStepValue(index, kind, raw, notify, record = notify) {
    const before = record ? this._stepSnapshot() : null;
    const isPitch = kind === "pitch";
    const id = isPitch ? STEP_PITCH_IDS[index] : STEP_FLAG_IDS[index];
    const value = clamp(Math.round(Number(raw) || 0), 0, isPitch ? 24 : 7);
    this._values.set(id, value);
    if (notify) this._sendParameter(id, value);
    this._renderStepStrip();
    this._renderStepEditor();
    this._renderStudio();
    if (this._pitchMenuOpen) this._refreshPitchMenu();
    if (before) this._pushHistory(before, isPitch ? "Edit pitch" : "Edit timing");
  }

  _renderStepStrip() {
    this.querySelectorAll(".sequence-step").forEach((node, index) => {
      const flags = this._stepFlags(index);
      node.classList.toggle("selected", index === this._selectedStep);
      node.classList.toggle("multi-selected", this._studioMode && this._selectedSteps.has(index));
      node.classList.toggle("playing", index === this._playingStep);
      node.classList.toggle("rest", (flags & 1) === 0);
      node.classList.toggle("accented", (flags & 2) !== 0);
      node.classList.toggle("sliding", (flags & 4) !== 0);
      const root = Math.round(this._values.get("param12") ?? 36);
      const pitch = this._stepPitch(index);
      const absoluteNote = noteName(root + pitch).replace("#", "♯");
      const states = [
        (flags & 1) !== 0 ? "Gate" : "Rest",
        (flags & 2) !== 0 ? "Accent" : "",
        (flags & 4) !== 0 ? "Slide" : "",
      ].filter(Boolean).join(", ");
      node.querySelector(".step-note").textContent = absoluteNote;
      node.querySelector(".step-octave").textContent = `+${Math.floor(pitch / 12)}`;
      node.setAttribute("aria-label", `Step ${index + 1}, ${absoluteNote}, ${this._octaveLabel(pitch)}, ${states}; click to edit, wheel changes semitone, right-click or double-click chooses a note`);
      node.dataset.tooltip = `Step ${index + 1}: ${absoluteNote}, ${this._octaveLabel(pitch)}, ${states}. Wheel changes one semitone; right-click or double-click opens direct note selection.`;
    });
    this._renderBassline();
  }

  _renderBassline() {
    const path = this.querySelector(".bassline-path");
    const slidePath = this.querySelector(".bassline-slide-path");
    const nodes = [...this.querySelectorAll(".bassline-node")];
    if (!path || !slidePath || nodes.length !== 16) return;

    const root = Math.round(this._values.get("param12") ?? 36);
    const points = Array.from({ length: 16 }, (_, index) => {
      const pitch = this._stepPitch(index);
      return {
        index,
        pitch,
        flags: this._stepFlags(index),
        x: 35 + index * (199 / 15),
        y: 24 - pitch * (18 / 24),
      };
    });
    path.setAttribute("d", points.map((point, index) =>
      `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`
    ).join(" "));
    slidePath.setAttribute("d", points.slice(0, -1)
      .filter(point => (point.flags & 4) !== 0)
      .map(point => {
        const next = points[point.index + 1];
        return `M ${point.x.toFixed(2)} ${point.y.toFixed(2)} L ${next.x.toFixed(2)} ${next.y.toFixed(2)}`;
      }).join(" "));

    nodes.forEach((node, index) => {
      const point = points[index];
      const absoluteNote = noteName(root + point.pitch).replace("#", "♯");
      node.setAttribute("cx", point.x.toFixed(2));
      node.setAttribute("cy", point.y.toFixed(2));
      node.dataset.pitch = `${point.pitch}`;
      node.classList.toggle("rest", (point.flags & 1) === 0);
      node.classList.toggle("accented", (point.flags & 2) !== 0);
      node.classList.toggle("sliding", (point.flags & 4) !== 0);
      node.classList.toggle("selected", this._selectedSteps.has(index));
      node.classList.toggle("playing", index === this._playingStep);
      node.setAttribute("aria-label", `Step ${index + 1}, ${absoluteNote}`);
    });

    const visual = this.querySelector(".bassline-visual");
    if (visual) {
      visual.dataset.tooltip = "Live pitch contour for all 16 steps. Red nodes are accented, amber links are slides, dim nodes are rests, and the bright ring follows playback.";
    }
  }

  _renderStepEditor() {
    const pitch = this._stepPitch(this._selectedStep);
    const flags = this._stepFlags(this._selectedStep);
    const root = Math.round(this._values.get("param12") ?? 36);
    const absoluteNote = root + pitch;
    const display = this.querySelector(".edit-readout");
    if (display) display.textContent = `${String(this._selectedStep + 1).padStart(2, "0")}  ${noteName(absoluteNote)}`;
    this.querySelectorAll(".pitch-key").forEach(key => {
      key.classList.toggle("active", Number(key.dataset.pitch) === pitch % 12);
    });
    this.querySelectorAll("[data-flag]").forEach(button => {
      const active = (flags & Number(button.dataset.flag)) !== 0;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", `${active}`);
    });
    const octave = this.querySelector(".octave-indicator");
    if (octave) octave.textContent = `${this._octaveLabel(pitch)} · +${pitch} SEMITONES FROM ROOT`;
  }

  _renderStudio() {
    this.querySelectorAll(".studio-cell").forEach(cell => {
      const index = Number(cell.dataset.step);
      const kind = cell.dataset.kind;
      const flags = this._stepFlags(index);
      const active = kind === "pitch"
        ? this._selectedSteps.has(index)
        : (flags & (kind === "gate" ? 1 : kind === "accent" ? 2 : 4)) !== 0;
      cell.classList.toggle("active", active);
      cell.classList.toggle("selected", this._selectedSteps.has(index));
      cell.classList.toggle("playing", index === this._playingStep);
      cell.setAttribute("aria-pressed", `${active}`);
      if (kind === "pitch") {
        const root = Math.round(this._values.get("param12") ?? 36);
        const pitch = this._stepPitch(index);
        const absoluteNote = noteName(root + pitch).replace("#", "♯");
        cell.textContent = absoluteNote;
        cell.setAttribute("aria-label", `Step ${index + 1} note ${absoluteNote}, ${this._octaveLabel(pitch)}; wheel changes semitone, right-click or double-click chooses a note`);
        cell.dataset.tooltip = `Step ${index + 1}: ${absoluteNote}, ${this._octaveLabel(pitch)}. Wheel changes one semitone; right-click or double-click opens direct note selection.`;
      } else {
        const label = kind === "gate" ? "Gate" : kind === "accent" ? "Accent" : "Slide";
        const state = active ? "on" : "off";
        cell.setAttribute("aria-label", `Step ${index + 1} ${label}, ${state}`);
        cell.dataset.tooltip = `${label} is ${state} for step ${index + 1}. Click or drag across the lane to change it.`;
      }
    });
    this._updateStudioToolbar();
  }

  _showMidiNote(note, active) {
    const key = this.querySelector(`.pitch-key[data-pitch="${((note % 12) + 12) % 12}"]`);
    key?.classList.toggle("midi", active);
  }

  _doScale() {
    const chassis = this.querySelector(".chassis");
    if (!chassis) return;
    const width = window.innerWidth || 1180;
    const height = window.innerHeight || 580;
    const style = this.style;
    style.width = `${width}px`;
    style.height = `${height}px`;
    let effectiveScale = this.getBoundingClientRect().width / width;
    if (!Number.isFinite(effectiveScale) || effectiveScale < 0.3 || effectiveScale > 3) effectiveScale = 1;
    style.width = `${width / effectiveScale}px`;
    style.height = `${height / effectiveScale}px`;
    let zoom = Math.min(width / 1180, height / 580) / effectiveScale;
    zoom = Math.round(clamp(zoom, 0.4, 2.5) * 20) / 20;
    chassis.style.zoom = zoom;
    chassis.style.transform = "";
  }

  getHTML() {
    const dial = id => {
      const c = ACIDIFY_GLOBALS.find(item => item.id === id);
      return `
        <div class="control knob-control" data-param="${c.id}" data-endpoint-id="${c.id}" data-min="${c.min}" data-max="${c.max}" data-step="${c.step}" data-init="${c.init}" data-control="dial">
          <div class="tick-ring"></div>
          <div class="dial" role="slider" tabindex="0" aria-label="${c.label}" aria-valuemin="${c.min}" aria-valuemax="${c.max}">
            <div class="dial-cap"><i class="dial-pointer"></i></div>
          </div>
          <div class="control-label">${c.label}</div>
          <div class="value-label">--</div>
        </div>`;
    };
    const steps = Array.from({ length: 4 }, (_, group) => `
      <div class="step-group" role="group" aria-label="Steps ${group * 4 + 1} to ${group * 4 + 4}">
        ${Array.from({ length: 4 }, (_, position) => {
          const index = group * 4 + position;
          return `
            <button class="sequence-step" data-step="${index}" aria-label="Step ${index + 1}"
              aria-haspopup="dialog">
              <span class="step-led"></span><span class="step-octave">+0</span>
              <span class="step-index">${index + 1}</span><span class="step-note">--</span>
            </button>`;
        }).join("")}
      </div>`).join("");
    const pitchKeys = NOTE_NAMES.map((name, index) => `
      <button class="pitch-key ${name.includes("#") ? "black-key" : "white-key"}" data-pitch="${index}"
        aria-label="Set selected step to ${name}" title="Set selected step to ${name}">
        <span>${name.replace("#", "♯")}</span>
      </button>`).join("");
    const studioLanes = [
      { kind: "pitch", label: "NOTE" },
      { kind: "gate", label: "GATE" },
      { kind: "accent", label: "ACCENT" },
      { kind: "slide", label: "SLIDE" },
    ].map(lane => `
      <div class="studio-lane" data-lane="${lane.kind}">
        <span class="studio-lane-label">${lane.label}</span>
        <div class="studio-lane-cells">
          ${Array.from({ length: 4 }, (_, group) => `
            <div class="studio-cell-group" role="group" aria-label="${lane.label} steps ${group * 4 + 1} to ${group * 4 + 4}">
              ${Array.from({ length: 4 }, (_, position) => {
                const index = group * 4 + position;
                return `<button class="studio-cell" data-kind="${lane.kind}" data-step="${index}"
                  ${lane.kind === "pitch" ? 'aria-haspopup="dialog"' : ""}
                  aria-label="Step ${index + 1} ${lane.label}" aria-pressed="false"></button>`;
              }).join("")}
            </div>`).join("")}
        </div>
      </div>`).join("");
    const studioRuler = Array.from({ length: 4 }, (_, group) => `
      <div class="studio-cell-group studio-ruler-group" aria-hidden="true">
        ${Array.from({ length: 4 }, (_, position) => {
          const index = group * 4 + position;
          return `<span>${String(index + 1).padStart(2, "0")}</span>`;
        }).join("")}
      </div>`).join("");
    const pitchChoices = Array.from({ length: 25 }, (_, pitch) => `
      <button class="pitch-menu-choice" type="button" role="radio" data-pitch-value="${pitch}"
        aria-checked="false">
        <strong>--</strong><small>OCT +${Math.floor(pitch / 12)}</small>
      </button>`).join("");
    const basslineNodes = Array.from({ length: 16 }, (_, index) =>
      `<circle class="bassline-node" data-step="${index}" cx="${35 + index * (199 / 15)}" cy="24" r="2"></circle>`
    ).join("");

    return `
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body, html { overflow: hidden; margin: 0; padding: 0; background: transparent; }
  ::-webkit-scrollbar { width: 0 !important; height: 0 !important; display: none !important; }
  * { scrollbar-width: none; }
  acidify-patch-view {
    display: flex; align-items: center; justify-content: center;
    width: 100%; height: 100%; min-width: 0; min-height: 0; overflow: hidden;
    background: transparent; color: #171713; font-family: "Arial Narrow", "Helvetica Neue", Arial, sans-serif;
    user-select: none; -webkit-user-select: none;
  }
  acidify-patch-view button { font: inherit; color: inherit; border: 0; outline: 0; }
  acidify-patch-view .chassis {
    position: relative; flex: 0 0 auto; width: 1180px; height: 580px; overflow: hidden;
    border-radius: 33px 33px 27px 27px;
    background:
      radial-gradient(ellipse at 50% -18%, rgba(255,255,255,.9) 0 12%, transparent 54%),
      linear-gradient(90deg, rgba(255,255,255,.4) 0, transparent 2.4%, transparent 97%, rgba(40,38,31,.33) 100%),
      repeating-linear-gradient(7deg, rgba(255,255,255,.025) 0 1px, rgba(57,54,45,.025) 1px 3px),
      linear-gradient(180deg, #e5e1d2 0%, #d1ccbb 48%, #b5ae9c 84%, #969082 100%);
    border: 1px solid #777268;
    box-shadow:
      0 30px 46px rgba(0,0,0,.46),
      0 7px 12px rgba(0,0,0,.32),
      inset 0 3px 1px rgba(255,255,255,.82),
      inset 0 -8px 12px rgba(61,56,44,.34),
      inset 4px 0 5px rgba(255,255,255,.22),
      inset -4px 0 6px rgba(60,56,48,.16);
  }
  acidify-patch-view .chassis::before {
    content: ""; position: absolute; z-index: 0; pointer-events: none;
    left: 14px; right: 14px; top: 11px; bottom: 16px; border-radius: 24px 24px 18px 18px;
    border: 1px solid rgba(73,70,62,.42);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.74), 0 1px 0 rgba(255,255,255,.35);
  }
  acidify-patch-view .chassis::after {
    content: ""; position: absolute; z-index: 0; pointer-events: none;
    left: 45px; right: 45px; bottom: 5px; height: 10px; border-radius: 0 0 40% 40%;
    background: linear-gradient(180deg, rgba(72,68,57,.04), rgba(47,43,36,.28));
    filter: blur(.3px);
  }
  acidify-patch-view .panel {
    position: absolute; z-index: 1; left: 28px; top: 23px; width: 1120px; height: 522px;
    border: 1px solid #77776f; border-radius: 9px;
    background:
      radial-gradient(ellipse at 34% -12%, rgba(255,255,255,.38), transparent 47%),
      repeating-linear-gradient(90deg, rgba(255,255,255,.035) 0 1px, rgba(49,50,48,.025) 1px 2px, transparent 2px 5px),
      linear-gradient(164deg, #dddeda 0%, #cacbc7 45%, #b7b8b4 100%);
    box-shadow:
      inset 0 1px 0 #f8f8f3,
      inset 0 -2px 4px rgba(0,0,0,.25),
      inset 1px 0 1px rgba(255,255,255,.48),
      0 3px 4px rgba(0,0,0,.34);
  }
  acidify-patch-view .panel::before {
    content: ""; position: absolute; inset: 1px; z-index: 0; pointer-events: none; border-radius: 8px;
    opacity: .17; mix-blend-mode: multiply;
    background:
      radial-gradient(circle at 16% 26%, rgba(36,34,30,.16) 0 .45px, transparent .8px),
      radial-gradient(circle at 77% 64%, rgba(255,255,255,.32) 0 .45px, transparent .85px);
    background-size: 13px 17px, 17px 13px;
  }
  acidify-patch-view .panel > * { z-index: 1; }
  acidify-patch-view .panel > section,
  acidify-patch-view .panel > .footer-mark { z-index: 2; }
  acidify-patch-view .panel::after {
    content: ""; position: absolute; left: 4px; right: 4px; bottom: 2px; height: 6px;
    border-radius: 0 0 7px 7px;
    background: linear-gradient(180deg, transparent, rgba(57,57,53,.17));
    pointer-events: none;
  }
  acidify-patch-view .screw {
    position: absolute; width: 16px; height: 16px; border-radius: 50%; z-index: 5;
    background:
      radial-gradient(circle at 36% 29%, rgba(255,255,255,.95) 0 5%, transparent 7%),
      conic-gradient(from 28deg, #777872, #d7d8d3, #73746f, #c7c8c3, #676863, #b8b9b4, #777872);
    border: 1px solid #686963;
    box-shadow: 0 1px 2px rgba(0,0,0,.46), inset 0 0 0 1px rgba(255,255,255,.22);
  }
  acidify-patch-view .screw::after {
    content: ""; position: absolute; left: 2px; right: 2px; top: 6px; height: 2px;
    border-radius: 2px; background: linear-gradient(#4a4b47, #898a84);
    box-shadow: 0 1px rgba(255,255,255,.35); transform: rotate(-17deg);
  }
  acidify-patch-view .s1 { left: 12px; top: 12px; } .s2 { right: 12px; top: 12px; }
  acidify-patch-view .s3 { left: 12px; bottom: 12px; } .s4 { right: 12px; bottom: 12px; }
  acidify-patch-view .top-strip {
    --fib-1: 8px;
    --fib-2: 13px;
    --fib-3: 21px;
    position: absolute; left: 24px; right: 24px; top: 22px; height: 214px;
    border-bottom: 2px solid #24241f;
    box-shadow: 0 1px 0 rgba(255,255,255,.44);
  }
  acidify-patch-view .branding {
    position: absolute; left: 16px; top: 8px; width: 228px; height: 58px;
  }
  acidify-patch-view .brand {
    font-family: Impact, "Arial Black", sans-serif; font-size: 29px; line-height: 30px;
    letter-spacing: 1px; color: #1c1c19; text-shadow: 0 .4px rgba(255,255,255,.28);
  }
  acidify-patch-view .brand .acid { color: #a9201a; }
  acidify-patch-view .model {
    margin-top: -1px; font-size: 11px; font-weight: 900; letter-spacing: 2.8px;
    text-shadow: 0 .4px rgba(255,255,255,.26);
  }
  acidify-patch-view .computer { color: #55554e; font-size: 8px; letter-spacing: 2.4px; margin-top: 3px; }
  acidify-patch-view .transport-bank,
  acidify-patch-view .tone-bank,
  acidify-patch-view .volume-bank {
    border: 1px solid rgba(58,58,53,.72); border-radius: 6px;
    background:
      linear-gradient(135deg, rgba(255,255,255,.13), transparent 42%),
      linear-gradient(180deg, rgba(112,112,105,.025), rgba(255,255,255,.045));
    box-shadow:
      inset 0 1px rgba(255,255,255,.52),
      inset 1px 0 rgba(255,255,255,.2),
      0 1px rgba(255,255,255,.3);
  }
  acidify-patch-view .transport-bank {
    position: absolute; left: 0; top: 75px; width: 260px; height: 116px;
    display: grid; grid-template-columns: 104px 1fr; gap: 13px;
    padding: 18px 10px 8px;
  }
  acidify-patch-view .bank-title {
    position: absolute; left: 12px; top: 5px;
    color: #55554e; font-size: 6.5px; line-height: 8px; font-weight: 900; letter-spacing: 1.35px;
    text-shadow: 0 .5px rgba(255,255,255,.48);
  }
  acidify-patch-view .tempo-box, acidify-patch-view .mode-box {
    position: relative; min-width: 0; padding-top: 1px;
  }
  acidify-patch-view .mini-title {
    text-align: center; font-size: 8px; font-weight: 900; letter-spacing: 1.2px;
  }
  acidify-patch-view .transport-bank .knob-control {
    zoom: .68; width: 104px; height: 118px; margin: 2px auto 0;
  }
  acidify-patch-view .transport-bank .control-label { margin-top: 10px; }
  acidify-patch-view .mode-box {
    display: flex; flex-direction: column; align-items: center; gap: 7px;
    border-left: 1px solid rgba(68,68,63,.45);
    box-shadow: inset 1px 0 rgba(255,255,255,.38);
  }
  acidify-patch-view .run-lamp, acidify-patch-view .output-lamp {
    position: relative; width: 14px; height: 14px; border-radius: 50%; border: 1px solid #4f1a15;
    background:
      radial-gradient(circle at 34% 25%, rgba(255,255,255,.38) 0 5%, transparent 8%),
      radial-gradient(circle at 45% 42%, #7f241c, #4a1511 48%, #210906 78%);
    box-shadow:
      0 1px 0 rgba(255,255,255,.62),
      0 0 0 2px rgba(72,72,67,.26),
      inset 0 -2px 3px #170403,
      inset 1px 1px 2px rgba(255,255,255,.2);
  }
  acidify-patch-view .run-lamp.lit {
    background:
      radial-gradient(circle at 34% 27%, #fffbd5 0 7%, transparent 11%),
      radial-gradient(circle, #ff8c68 0, #fb3823 34%, #9c0f08 74%);
    box-shadow:
      0 0 5px rgba(255,51,31,.8),
      0 0 11px rgba(255,42,25,.44),
      0 1px 0 rgba(255,255,255,.55),
      0 0 0 2px rgba(72,72,67,.26),
      inset 0 0 2px #fff;
  }
  acidify-patch-view .run-switch {
    width: 104px; height: 38px; padding: 5px; border-radius: 5px; cursor: pointer;
    perspective: 100px;
    background:
      linear-gradient(180deg, #171714, #33332e 14%, #1c1c19 100%);
    border: 1px solid #10100e;
    box-shadow:
      inset 0 3px 5px #050504,
      inset 0 -1px rgba(255,255,255,.14),
      0 1px 0 rgba(255,255,255,.66);
  }
  acidify-patch-view .run-switch button {
    position: relative; width: 100%; height: 100%; border-radius: 2px; cursor: pointer;
    background:
      linear-gradient(100deg, rgba(255,255,255,.13), transparent 30% 72%, rgba(0,0,0,.25)),
      linear-gradient(180deg, #6a6961 0%, #4b4a44 43%, #292925 100%);
    border: 1px solid #1d1d1a; color: #e8e7dd;
    font-size: 8px; font-weight: 900; letter-spacing: .8px;
    text-shadow: 0 1px #151512;
    box-shadow: 0 3px 2px rgba(0,0,0,.7), inset 0 1px 0 rgba(255,255,255,.25);
    transform-origin: center bottom;
  }
  acidify-patch-view .run-switch.is-on button {
    transform: translateY(2px) rotateX(-4deg);
    background:
      linear-gradient(100deg, rgba(255,255,255,.07), transparent 70%, rgba(0,0,0,.25)),
      linear-gradient(#3d3934, #1c1b18);
    color: #ffb3a9;
    box-shadow: 0 1px 1px #050504, inset 0 2px 4px rgba(0,0,0,.45);
  }
  acidify-patch-view .waveform {
    position: relative; width: 82px; height: 145px;
  }
  acidify-patch-view .wave-title {
    position: absolute; left: 0; right: 0; top: 88px;
    text-align: center; font-size: 8.5px; font-weight: 900; letter-spacing: .7px;
    text-shadow: 0 .5px rgba(255,255,255,.38);
  }
  acidify-patch-view .wave-buttons {
    position: absolute; left: 0; right: 0; top: 22px;
    display: flex; justify-content: center; gap: 7px;
  }
  acidify-patch-view .wave-buttons button {
    position: relative; width: 31px; height: 31px; padding: 5px 4px; cursor: pointer; border-radius: 3px;
    background:
      linear-gradient(105deg, rgba(255,255,255,.16), transparent 35% 75%, rgba(0,0,0,.25)),
      linear-gradient(#67665f, #353530 62%, #252521);
    border: 1px solid #171714;
    box-shadow:
      0 3px 2px rgba(0,0,0,.52),
      inset 0 1px rgba(255,255,255,.25),
      0 0 0 2px rgba(78,78,72,.12);
    color: #e0dfd5;
  }
  acidify-patch-view .wave-buttons svg {
    display: block; width: 100%; height: 100%; overflow: visible;
    fill: none; stroke: currentColor; stroke-width: 2.2; stroke-linecap: square; stroke-linejoin: miter;
    filter: drop-shadow(0 1px #151512);
  }
  acidify-patch-view .wave-buttons button.active {
    transform: translateY(2px); color: #ff4c3c;
    background:
      linear-gradient(105deg, rgba(255,255,255,.06), transparent 70%, rgba(0,0,0,.28)),
      linear-gradient(#383530, #1b1a17);
    box-shadow: 0 1px 1px rgba(0,0,0,.6), inset 0 2px 5px #0b0b09, 0 0 0 2px rgba(78,78,72,.1);
  }
  acidify-patch-view .tone-bank {
    position: absolute; left: 273px; top: 11px; width: 648px; height: 180px;
    padding: 0 12px;
  }
  acidify-patch-view .tone-controls {
    position: absolute; left: 10px; right: 10px; top: 35px; bottom: 0;
    display: grid; grid-template-columns: 82px repeat(6, minmax(0, 1fr));
    align-items: start; justify-items: center;
  }
  acidify-patch-view .tone-bank .knob-control { width: 90px; }
  acidify-patch-view .tone-bank .dial { width: 72px; height: 72px; }
  acidify-patch-view .tone-bank .dial::before,
  acidify-patch-view .tone-bank .dial-cap { inset: 7px; }
  acidify-patch-view .tone-bank .tick-ring { top: -9px; width: 90px; height: 90px; }
  acidify-patch-view .tone-bank .tick-ring::after {
    left: 43px; transform-origin: 2px 44px;
  }
  acidify-patch-view .volume-bank {
    position: absolute; right: 0; top: 11px; width: 136px; height: 180px;
    display: flex; flex-direction: column; align-items: center;
    padding-top: 35px;
  }
  acidify-patch-view .master-head {
    position: absolute; left: 12px; right: 10px; top: 5px; height: 12px;
    display: flex; align-items: center; justify-content: space-between;
    color: #50504a; font-size: 6.5px; line-height: 8px; font-weight: 900; letter-spacing: 1.25px;
    text-shadow: 0 .5px rgba(255,255,255,.45);
  }
  acidify-patch-view .master-output {
    display: flex; align-items: center; gap: 4px; color: #62625b;
    font-size: 5.5px; letter-spacing: .7px;
  }
  acidify-patch-view .master-output .output-lamp {
    width: 9px; height: 9px;
  }
  acidify-patch-view .volume-bank .knob-control { width: 94px; }
  acidify-patch-view .control { position: relative; }
  acidify-patch-view .knob-control {
    --norm: .5; width: 102px; height: 145px; display: flex; flex-direction: column;
    align-items: center; justify-content: flex-start;
  }
  acidify-patch-view .dial {
    position: relative; width: 75px; height: 75px; border-radius: 50%; cursor: ns-resize; touch-action: none;
    background:
      radial-gradient(circle, transparent 0 61%, rgba(255,255,255,.13) 62%, transparent 65%),
      repeating-conic-gradient(from 1deg, #171714 0 5deg, #3b3a35 5deg 8deg, #10100e 8deg 13deg);
    border: 1px solid #0b0b09;
    box-shadow:
      0 7px 7px rgba(0,0,0,.5),
      0 2px 2px rgba(0,0,0,.58),
      inset 0 2px 2px rgba(255,255,255,.2),
      inset 0 -4px 4px #080807;
  }
  acidify-patch-view .dial::before {
    content: ""; position: absolute; inset: 7px; border-radius: 50%; z-index: 0;
    background:
      radial-gradient(circle at 34% 25%, rgba(255,255,255,.31) 0 2%, rgba(255,255,255,.09) 14%, transparent 34%),
      radial-gradient(circle at 50% 47%, #393833 0, #252521 57%, #11110f 82%, #060605 100%);
    border: 1px solid #080807;
    box-shadow:
      inset 0 2px 3px rgba(255,255,255,.16),
      inset -3px -6px 8px rgba(0,0,0,.66),
      0 1px 1px rgba(255,255,255,.08);
  }
  acidify-patch-view .dial::after {
    content: ""; position: absolute; inset: 12px; border-radius: 50%; z-index: 1; pointer-events: none;
    border-top: 1px solid rgba(255,255,255,.1);
    box-shadow: inset 3px 4px 7px rgba(255,255,255,.025);
  }
  acidify-patch-view .dial-cap {
    position: absolute; inset: 7px; z-index: 2; border-radius: 50%;
    transform: rotate(calc(-135deg + var(--norm) * 270deg));
  }
  acidify-patch-view .dial-pointer {
    position: absolute; left: 50%; top: 4px; width: 3px; height: 20px; margin-left: -1.5px;
    border-radius: 2px; background: linear-gradient(90deg, #aaa99f, #f4f1df 46%, #d0cec0);
    box-shadow: 0 0 1px #fff, 1px 1px 1px #000;
  }
  acidify-patch-view .tick-ring {
    position: absolute; top: -9px; width: 94px; height: 94px; border-radius: 50%;
    background: repeating-conic-gradient(from 222deg, #262620 0 1.2deg, transparent 1.2deg 13.5deg);
    -webkit-mask: radial-gradient(circle, transparent 69%, #000 70% 75%, transparent 76%);
            mask: radial-gradient(circle, transparent 69%, #000 70% 75%, transparent 76%);
    clip-path: polygon(0 0, 100% 0, 100% 82%, 50% 50%, 0 82%);
    filter: drop-shadow(0 1px rgba(255,255,255,.24));
  }
  acidify-patch-view .tick-ring::after {
    content: ""; position: absolute; left: 45px; top: 1px; width: 4px; height: 5px;
    border-radius: 3px; background: #a51d17; box-shadow: 0 1px rgba(255,255,255,.25);
    transform-origin: 2px 46px;
    transform: rotate(calc(-135deg + var(--default-norm) * 270deg));
    opacity: .55;
  }
  acidify-patch-view .dial:focus-visible {
    outline: 2px solid rgba(169,32,26,.72); outline-offset: 5px;
  }
  acidify-patch-view .control-label {
    margin-top: 13px; font-size: 8.5px; font-weight: 900; letter-spacing: .7px; white-space: nowrap;
    text-shadow: 0 .5px rgba(255,255,255,.38);
  }
  acidify-patch-view .value-label {
    margin-top: 4px; min-width: 50px; text-align: center; font: 8px "Courier New", monospace;
    color: #681712; opacity: .86; letter-spacing: .25px;
  }
  acidify-patch-view.studio-mode .value-label {
    position: absolute; z-index: 20; left: 50%; top: -27px; margin: 0; padding: 5px 8px;
    width: max-content; min-width: 54px; border: 1px solid #080907; border-radius: 4px;
    color: #ff7768; background: linear-gradient(#282a27, #121311);
    box-shadow: 0 6px 12px rgba(0,0,0,.38), inset 0 1px rgba(255,255,255,.08);
    text-shadow: 0 0 4px rgba(255,55,37,.45);
    opacity: 0; pointer-events: none;
    transform: translate(-50%, 4px); transition: opacity 120ms ease, transform 120ms ease;
  }
  acidify-patch-view.studio-mode .value-visible .value-label,
  acidify-patch-view.studio-mode .knob-control:focus-within .value-label {
    opacity: 1; transform: translate(-50%, 0);
  }
  acidify-patch-view .program-strip {
    position: absolute; left: 24px; right: 24px; top: 254px; height: 242px;
  }
  acidify-patch-view .program-header {
    height: 42px; display: flex; align-items: center; justify-content: space-between;
    border-bottom: 1px solid #53534d; font-size: 8px; font-weight: 900; letter-spacing: 1.2px;
    box-shadow: 0 1px rgba(255,255,255,.44);
  }
  acidify-patch-view .program-title {
    display: grid; grid-template-columns: auto auto; align-items: baseline; column-gap: 8px;
    font-size: 11px; letter-spacing: 2.2px; white-space: nowrap;
  }
  acidify-patch-view .program-title b { color: #a51d17; }
  acidify-patch-view .program-context {
    grid-column: 1 / -1; margin-top: 3px;
    color: #66665f; font-size: 5.5px; line-height: 6px; letter-spacing: 1.45px;
  }
  acidify-patch-view .bassline-visual {
    position: relative; flex: 1 1 190px; min-width: 170px; max-width: 250px; height: 30px;
    margin: 0 10px; overflow: hidden; border: 1px solid #171714; border-radius: 5px;
    background:
      linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px),
      linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px),
      linear-gradient(#292a26, #151613);
    background-size: 13px 100%, 100% 6px, 100% 100%;
    box-shadow: inset 0 2px 5px rgba(0,0,0,.62), 0 1px rgba(255,255,255,.5);
  }
  acidify-patch-view .bassline-visual > span {
    position: absolute; z-index: 2; left: 5px; top: 4px;
    color: #76776f; font-size: 4.5px; font-weight: 900; letter-spacing: .65px;
  }
  acidify-patch-view .bassline-visual svg { position: absolute; inset: 0; width: 100%; height: 100%; }
  acidify-patch-view .bassline-path,
  acidify-patch-view .bassline-slide-path {
    fill: none; stroke-linecap: round; stroke-linejoin: round;
  }
  acidify-patch-view .bassline-path { stroke: #8c8d84; stroke-width: 1; opacity: .72; }
  acidify-patch-view .bassline-slide-path {
    stroke: #efb34e; stroke-width: 1.8; opacity: .92;
    filter: drop-shadow(0 0 1.5px rgba(239,179,78,.45));
  }
  acidify-patch-view .bassline-node {
    fill: #deddd3; stroke: #171714; stroke-width: .8;
    transition: fill 90ms ease, stroke 90ms ease, opacity 90ms ease;
  }
  acidify-patch-view .bassline-node.rest { opacity: .28; fill: #66675f; }
  acidify-patch-view .bassline-node.accented { fill: #e2493a; }
  acidify-patch-view .bassline-node.sliding { stroke: #f0b34d; stroke-width: 1.2; }
  acidify-patch-view .bassline-node.selected { stroke: #fff8ec; stroke-width: 1.45; }
  acidify-patch-view .bassline-node.playing {
    fill: #ffefe8; stroke: #ff4937; stroke-width: 2;
    filter: drop-shadow(0 0 2.5px rgba(255,60,42,.85));
  }
  acidify-patch-view .utility {
    flex: 0 0 auto; display: flex; align-items: center; gap: 13px; height: 100%;
  }
  acidify-patch-view .studio-toggle {
    position: relative; width: 140px; height: 29px; padding: 0 7px; cursor: pointer; border-radius: 5px;
    display: flex; align-items: center; justify-content: space-between; overflow: hidden;
    color: #5e5e58;
    background:
      linear-gradient(180deg, rgba(255,255,255,.2), transparent 34%),
      linear-gradient(#aaa9a1, #d5d4cb 48%, #9b9a92);
    border: 1px solid #66665f;
    box-shadow:
      inset 0 1px #f3f2eb,
      inset 0 -1px rgba(43,43,39,.18),
      0 1px rgba(255,255,255,.42),
      0 2px 2px rgba(0,0,0,.2);
    font-size: 7px; font-weight: 900; letter-spacing: .8px;
  }
  acidify-patch-view .studio-toggle i {
    position: absolute; z-index: 0; left: 4px; top: 4px; width: 65px; height: 21px; border-radius: 3px;
    background:
      linear-gradient(105deg, rgba(255,255,255,.17), transparent 35% 78%, rgba(0,0,0,.25)),
      linear-gradient(#5a5953, #2c2c28);
    border: 1px solid #20201d;
    box-shadow:
      0 2px 2px rgba(0,0,0,.38),
      inset 0 1px rgba(255,255,255,.18),
      inset 0 -1px rgba(0,0,0,.35);
    transition: transform 140ms cubic-bezier(.2,.8,.2,1), background 140ms ease;
  }
  acidify-patch-view .studio-toggle span { position: relative; z-index: 1; width: 59px; text-align: center; }
  acidify-patch-view .studio-toggle .classic-label { color: #f2f0e7; text-shadow: 0 1px #171714; }
  acidify-patch-view .studio-toggle[aria-pressed="true"] i {
    transform: translateX(66px);
    background:
      linear-gradient(105deg, rgba(255,255,255,.16), transparent 38% 78%, rgba(63,0,0,.18)),
      linear-gradient(#b63329, #72150f);
    box-shadow:
      0 2px 2px rgba(0,0,0,.4),
      inset 0 1px rgba(255,255,255,.18),
      0 0 8px rgba(180,34,24,.22);
  }
  acidify-patch-view .studio-toggle[aria-pressed="true"] .classic-label {
    color: #5e5e58; text-shadow: none;
  }
  acidify-patch-view .studio-toggle[aria-pressed="true"] .studio-label {
    color: #fff1e9; text-shadow: 0 1px #5b0c08;
  }
  acidify-patch-view .studio-toggle:focus-visible,
  acidify-patch-view .studio-scale:focus-visible,
  acidify-patch-view .stepper button:focus-visible,
  acidify-patch-view .sequence-step:focus-visible,
  acidify-patch-view .function-button:focus-visible,
  acidify-patch-view .studio-actions button:focus-visible,
  acidify-patch-view .studio-cell:focus-visible,
  acidify-patch-view .pitch-key:focus-visible,
  acidify-patch-view .wave-buttons button:focus-visible,
  acidify-patch-view .run-switch button:focus-visible {
    outline: 2px solid rgba(169,32,26,.82); outline-offset: 2px;
  }
  acidify-patch-view .stepper {
    display: grid; grid-template-columns: 24px 64px 24px; height: 27px; align-items: center;
    background: #262622; border: 1px solid #121210; border-radius: 4px; overflow: hidden;
    box-shadow: inset 0 2px 4px rgba(0,0,0,.62), 0 1px 0 rgba(255,255,255,.55);
  }
  acidify-patch-view .stepper button {
    height: 100%; cursor: pointer; color: #e5e4da;
    background:
      linear-gradient(100deg, rgba(255,255,255,.13), transparent 45%, rgba(0,0,0,.18)),
      linear-gradient(#64635c, #383833);
    font-weight: 900; text-shadow: 0 1px #111;
    box-shadow: inset 0 1px rgba(255,255,255,.2), 0 1px 1px rgba(0,0,0,.5);
  }
  acidify-patch-view .stepper button:active {
    transform: translateY(1px); background: linear-gradient(#353530, #4c4b45);
    box-shadow: inset 0 2px 3px rgba(0,0,0,.45);
  }
  acidify-patch-view .stepper-value {
    height: 100%; display: grid; place-items: center; color: #ff6756;
    background:
      linear-gradient(180deg, rgba(255,255,255,.035), transparent 32%),
      #17120f;
    font: 11px "Courier New", monospace; border-inline: 1px solid #080807;
    letter-spacing: 1px; text-shadow: 0 0 4px rgba(255,57,37,.58);
    box-shadow: inset 0 2px 4px rgba(0,0,0,.58);
  }
  acidify-patch-view .stepper-label { font-size: 7px; text-align: center; margin-top: 2px; }
  acidify-patch-view .output-lamp {
    --level: 0; filter: brightness(calc(.42 + var(--level) * 2.4));
    background:
      radial-gradient(circle at 34% 26%, #ffe5cf 0 5%, transparent 9%),
      radial-gradient(circle, #ff8e70, #e42b1d 35%, #65100c 75%);
    box-shadow:
      0 0 calc(var(--level) * 10px) #ff2b19,
      0 1px rgba(255,255,255,.5),
      0 0 0 2px rgba(72,72,67,.22),
      inset 0 -2px 3px #310705;
  }
  acidify-patch-view .step-row {
    display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 13px;
    height: 68px; padding: 8px 0 6px;
  }
  acidify-patch-view .step-group {
    position: relative; min-width: 0; display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 4px;
  }
  acidify-patch-view .step-group:not(:last-child)::after {
    content: ""; position: absolute; right: -7px; top: 4px; bottom: 2px; width: 1px;
    background: rgba(70,70,65,.44);
    box-shadow: 1px 0 rgba(255,255,255,.48);
    pointer-events: none;
  }
  acidify-patch-view .sequence-step {
    position: relative; height: 54px; cursor: pointer; border-radius: 4px;
    background:
      linear-gradient(105deg, rgba(255,255,255,.42) 0, transparent 20% 77%, rgba(67,66,60,.18) 100%),
      linear-gradient(180deg, #ebeae1 0%, #d3d2c8 46%, #b2b1a8 82%, #96968f 100%);
    border: 1px solid #777770;
    box-shadow:
      0 4px 2px rgba(0,0,0,.34),
      0 1px 1px rgba(0,0,0,.26),
      inset 0 1px #fff,
      inset 1px 0 rgba(255,255,255,.38),
      inset -1px 0 rgba(51,51,48,.14);
  }
  acidify-patch-view .sequence-step:active, acidify-patch-view .sequence-step.selected {
    transform: translateY(3px);
    background:
      linear-gradient(105deg, rgba(255,255,255,.25), transparent 75%, rgba(57,56,51,.14)),
      linear-gradient(#aaa9a0, #d4d3ca 36%, #c4c3ba);
    box-shadow: 0 1px 1px rgba(0,0,0,.3), inset 0 3px 5px rgba(0,0,0,.28);
  }
  acidify-patch-view .sequence-step.multi-selected {
    outline: 2px solid rgba(165,29,23,.68); outline-offset: -3px;
  }
  acidify-patch-view .sequence-step.multi-selected:not(.selected) {
    transform: translateY(1px);
  }
  acidify-patch-view .step-led {
    position: absolute; top: 5px; left: 50%; width: 10px; height: 10px; margin-left: -5px; border-radius: 50%;
    background:
      radial-gradient(circle at 34% 27%, rgba(255,255,255,.22) 0 5%, transparent 9%),
      radial-gradient(circle, #651b15, #3c0e0b 60%, #1e0705 100%);
    border: 1px solid #2b0806;
    box-shadow: 0 1px rgba(255,255,255,.43), inset 0 -2px 2px #170302, 0 0 0 1px rgba(76,76,70,.18);
  }
  acidify-patch-view .sequence-step.playing .step-led {
    background:
      radial-gradient(circle at 34% 26%, #fffbdc 0 8%, transparent 12%),
      radial-gradient(circle, #ff9a79, #ff3a25 34%, #a20f08 72%);
    box-shadow: 0 0 5px #ff2918, 0 0 10px rgba(255,41,24,.52), inset 0 0 2px #fff;
  }
  acidify-patch-view .sequence-step.accented::before {
    content: "A"; position: absolute; left: 3px; top: 17px; z-index: 2;
    width: 18px; height: 18px; display: grid; place-items: center;
    border: 1px solid #6d100b; border-radius: 4px;
    color: #fff8f2; background: linear-gradient(180deg, #e75243, #981b14);
    font-size: 12px; line-height: 1; font-weight: 950;
    text-shadow: 0 1px #5b0b07;
    box-shadow: 0 0 0 1px rgba(255,255,255,.3), 0 1px 3px rgba(60,4,2,.42);
  }
  acidify-patch-view .sequence-step.sliding::after {
    content: "↗"; position: absolute; right: 3px; top: 17px; z-index: 2;
    width: 18px; height: 18px; display: grid; place-items: center;
    border: 1px solid #70520b; border-radius: 4px;
    color: #261800; background: linear-gradient(180deg, #ffe17a, #d89d22);
    font-size: 15px; line-height: 1; font-weight: 950;
    text-shadow: 0 1px rgba(255,255,255,.5);
    box-shadow: 0 0 0 1px rgba(255,255,255,.34), 0 1px 3px rgba(51,36,0,.38);
  }
  acidify-patch-view .sequence-step.rest { opacity: .55; }
  acidify-patch-view .step-index { display: block; margin-top: 20px; font-size: 8px; font-weight: 900; }
  acidify-patch-view .step-note { display: block; margin-top: 1px; font-size: 9px; color: #5f1713; font-weight: 900; }
  acidify-patch-view .editor {
    height: 122px; display: grid; grid-template-columns: 144px minmax(0, 1fr) 280px; gap: 13px;
    border-top: 1px solid rgba(255,255,255,.62); padding-top: 8px;
    box-shadow: inset 0 1px rgba(61,61,57,.18);
  }
  acidify-patch-view .studio-editor { display: none; }
  acidify-patch-view.studio-mode .classic-editor { display: none; }
  acidify-patch-view.studio-mode .studio-editor {
    position: relative; height: 122px; padding-top: 8px;
    display: grid; grid-template-columns: 404px 1fr; gap: 13px;
    border-top: 1px solid rgba(255,255,255,.62);
    box-shadow: inset 0 1px rgba(61,61,57,.18);
    animation: studio-enter 140ms ease-out both;
  }
  @keyframes studio-enter {
    from { opacity: 0; transform: translateY(3px); }
    to { opacity: 1; transform: translateY(0); }
  }
  acidify-patch-view .studio-tools {
    position: relative; min-width: 0; height: 108px; padding: 7px;
    border: 1px solid rgba(74,74,68,.72); border-radius: 5px;
    background:
      linear-gradient(135deg, rgba(255,255,255,.13), transparent 46%),
      linear-gradient(180deg, rgba(116,116,108,.025), rgba(255,255,255,.04));
    box-shadow:
      inset 0 1px rgba(255,255,255,.52),
      inset 1px 0 rgba(255,255,255,.2),
      0 1px rgba(255,255,255,.28);
  }
  acidify-patch-view .studio-tool-head {
    height: 18px; display: flex; align-items: flex-start; justify-content: space-between;
    font-size: 6px; letter-spacing: 1px; color: #65655e;
  }
  acidify-patch-view .studio-selection { color: #9b2019; font-size: 8px; letter-spacing: 1.25px; }
  acidify-patch-view .studio-scale {
    height: 16px; min-width: 105px; padding: 0 6px; cursor: pointer;
    display: flex; align-items: center; justify-content: space-between; gap: 7px;
    border: 1px solid #1a1a17; border-radius: 3px;
    color: #b9b8af; background: linear-gradient(#55544e, #292925);
    box-shadow: inset 0 1px rgba(255,255,255,.16), 0 1px rgba(255,255,255,.32);
    font-size: 5px; font-weight: 900; letter-spacing: .55px;
  }
  acidify-patch-view .studio-scale strong { color: #ff9a89; font-size: 5.5px; letter-spacing: .45px; }
  acidify-patch-view .studio-scale:active { transform: translateY(1px); }
  acidify-patch-view .studio-actions {
    display: grid; grid-template-columns: repeat(8, 1fr); gap: 5px; align-content: start;
  }
  acidify-patch-view .studio-actions button {
    height: 34px; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center;
    border-radius: 4px; color: #e9e8df; background:
      linear-gradient(105deg, rgba(255,255,255,.12), transparent 32% 78%, rgba(0,0,0,.28)),
      linear-gradient(#52524c, #292925);
    border: 1px solid #191916;
    box-shadow: 0 2px 2px rgba(0,0,0,.32), inset 0 1px rgba(255,255,255,.18);
    font: 10px "Arial Narrow", Arial, sans-serif; line-height: 10px;
  }
  acidify-patch-view .studio-actions button small {
    margin-top: 3px; color: #aaa9a1; font-size: 5.5px; font-weight: 900; letter-spacing: .45px;
  }
  acidify-patch-view .studio-actions button:hover:not(:disabled) { color: #ff8a78; }
  acidify-patch-view .studio-actions button:active:not(:disabled) {
    transform: translateY(1px); background: linear-gradient(#292925, #41413c);
    box-shadow: inset 0 2px 4px rgba(0,0,0,.46);
  }
  acidify-patch-view .studio-actions button:disabled { opacity: .28; cursor: default; }
  acidify-patch-view .studio-toast {
    position: absolute; z-index: 10; left: 7px; bottom: 4px; padding: 4px 7px; border-radius: 3px;
    color: #ff8070; background: rgba(20,18,16,.94); font: 7px "Courier New", monospace; letter-spacing: .7px;
    opacity: 0; transform: translateY(3px); pointer-events: none; transition: 120ms ease;
  }
  acidify-patch-view .studio-toast.visible { opacity: 1; transform: translateY(0); }
  acidify-patch-view .studio-matrix {
    position: relative; min-width: 0; height: 108px; padding: 5px 8px 12px; border-radius: 6px;
    background:
      linear-gradient(110deg, rgba(255,255,255,.035), transparent 27% 75%, rgba(0,0,0,.22)),
      linear-gradient(#242520, #151613);
    border: 1px solid #090a08;
    box-shadow: inset 0 2px 7px rgba(0,0,0,.58), 0 1px rgba(255,255,255,.52);
  }
  acidify-patch-view .studio-ruler {
    height: 12px; display: grid; grid-template-columns: 43px 1fr; gap: 6px; align-items: center;
  }
  acidify-patch-view .studio-lane {
    height: 19px; display: grid; grid-template-columns: 43px 1fr; gap: 6px; align-items: center;
  }
  acidify-patch-view .studio-lane-label {
    color: #85867d; text-align: right; font-size: 5.5px; font-weight: 900; letter-spacing: .55px;
  }
  acidify-patch-view .studio-lane-cells {
    min-width: 0; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px;
  }
  acidify-patch-view .studio-cell-group {
    min-width: 0; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 3px;
  }
  acidify-patch-view .studio-ruler-group span {
    color: #575851; text-align: center; font: 5px "Courier New", monospace;
  }
  acidify-patch-view .studio-ruler-group:not(:last-child) {
    position: relative;
  }
  acidify-patch-view .studio-ruler-group:not(:last-child)::after {
    content: ""; position: absolute; right: -5px; top: 1px; bottom: -77px; width: 1px;
    background: rgba(125,126,116,.2); pointer-events: none;
  }
  acidify-patch-view .studio-cell {
    position: relative; height: 15px; min-width: 0; cursor: crosshair; border-radius: 3px;
    color: #6d6e67; background: linear-gradient(#30312d, #22231f);
    border: 1px solid #11120f;
    box-shadow: inset 0 1px rgba(255,255,255,.055);
    font: 7px "Courier New", monospace;
    transition: color 100ms ease, background 100ms ease, box-shadow 100ms ease;
  }
  acidify-patch-view .studio-cell.selected {
    border-color: #77302a;
  }
  acidify-patch-view .studio-cell[data-kind="pitch"].active {
    color: #ff8b79; background: linear-gradient(#44312c, #2c1d19);
  }
  acidify-patch-view .studio-lane[data-lane="gate"] .studio-cell.active {
    background: linear-gradient(#b9b8ae, #6f7069); border-color: #c7c6bc;
    box-shadow: 0 0 4px rgba(221,218,199,.17), inset 0 1px rgba(255,255,255,.35);
  }
  acidify-patch-view .studio-lane[data-lane="accent"] .studio-cell.active {
    background: linear-gradient(#ed5b49, #971c13); border-color: #ff7666;
    box-shadow: 0 0 5px rgba(255,54,35,.38), inset 0 1px rgba(255,255,255,.3);
  }
  acidify-patch-view .studio-lane[data-lane="slide"] .studio-cell.active {
    background: linear-gradient(#d09252, #71431e); border-color: #dba05c;
    box-shadow: 0 0 4px rgba(220,145,74,.24), inset 0 1px rgba(255,255,255,.24);
  }
  acidify-patch-view .studio-cell.playing::after {
    content: ""; position: absolute; inset: -2px; border: 1px solid #ff5c49; border-radius: 4px;
    box-shadow: 0 0 5px rgba(255,55,37,.45); pointer-events: none;
  }
  acidify-patch-view .studio-hint {
    position: absolute; right: 8px; bottom: 3px; color: #55564f;
    font-size: 5px; font-weight: 900; letter-spacing: .75px;
  }
  acidify-patch-view .edit-status {
    min-width: 0; height: 108px; padding: 10px 11px;
    display: flex; flex-direction: column; justify-content: center;
    border: 1px solid rgba(74,74,68,.72); border-radius: 5px;
    background:
      linear-gradient(135deg, rgba(255,255,255,.13), transparent 46%),
      linear-gradient(180deg, rgba(116,116,108,.025), rgba(255,255,255,.04));
    box-shadow:
      inset 0 1px rgba(255,255,255,.52),
      inset 1px 0 rgba(255,255,255,.2),
      0 1px rgba(255,255,255,.28);
  }
  acidify-patch-view .edit-caption { font-size: 7px; font-weight: 900; letter-spacing: 1px; }
  acidify-patch-view .edit-readout {
    margin-top: 7px; height: 34px; display: grid; place-items: center; border-radius: 3px;
    background:
      linear-gradient(180deg, rgba(255,255,255,.045), transparent 26%),
      repeating-linear-gradient(90deg, transparent 0 3px, rgba(0,0,0,.05) 3px 4px),
      #1c100d;
    border: 1px solid #0a0706; color: #ff513b;
    box-shadow: inset 0 3px 5px rgba(0,0,0,.68), 0 1px rgba(255,255,255,.52);
    font: 17px "Courier New", monospace; letter-spacing: 2px;
    text-shadow: 0 0 4px #e32418, 0 0 8px rgba(227,36,24,.38);
  }
  acidify-patch-view .octave-indicator { margin-top: 7px; font-size: 7px; color: #555; }
  acidify-patch-view .octave-indicator::after { content: "NORMAL"; font-weight: 900; }
  acidify-patch-view .octave-indicator.high::after { content: "UP"; color: #a51d17; }
  acidify-patch-view .keyboard {
    position: relative; min-width: 0; height: 108px; padding: 8px;
    border: 1px solid rgba(74,74,68,.72); border-radius: 5px;
    background:
      linear-gradient(135deg, rgba(255,255,255,.13), transparent 46%),
      linear-gradient(180deg, rgba(73,73,68,.05), rgba(255,255,255,.055));
    box-shadow:
      inset 0 1px rgba(255,255,255,.52),
      inset 1px 0 rgba(255,255,255,.2),
      0 1px rgba(255,255,255,.28);
  }
  acidify-patch-view .keyboard-keys {
    position: relative; width: 100%; height: 100%;
  }
  acidify-patch-view .pitch-key {
    position: absolute; top: 0; bottom: 0; width: 14.285714%; cursor: pointer;
    border-radius: 3px 3px 5px 5px;
    border: 1px solid #73736d;
    background:
      linear-gradient(100deg, rgba(119,117,107,.2), transparent 15% 77%, rgba(75,74,69,.22)),
      linear-gradient(180deg, #f2f0e7 0%, #e2e0d6 55%, #c0beb4 84%, #9f9e96 100%);
    box-shadow:
      0 5px 2px rgba(0,0,0,.37),
      0 1px 1px rgba(0,0,0,.24),
      inset 0 1px #fff,
      inset 1px 0 rgba(255,255,255,.45),
      inset -1px 0 rgba(67,66,61,.18);
    font-size: 8px; font-weight: 900;
  }
  acidify-patch-view .pitch-key[data-pitch="0"] { left: 0; }
  acidify-patch-view .pitch-key[data-pitch="2"] { left: 14.285714%; }
  acidify-patch-view .pitch-key[data-pitch="4"] { left: 28.571428%; }
  acidify-patch-view .pitch-key[data-pitch="5"] { left: 42.857142%; }
  acidify-patch-view .pitch-key[data-pitch="7"] { left: 57.142856%; }
  acidify-patch-view .pitch-key[data-pitch="9"] { left: 71.42857%; }
  acidify-patch-view .pitch-key[data-pitch="11"] { left: 85.714284%; }
  acidify-patch-view .pitch-key.black-key {
    z-index: 2; bottom: auto; width: 9.2%; height: 63%; color: #e9e7dc;
    background:
      linear-gradient(100deg, rgba(255,255,255,.09), transparent 24% 74%, rgba(0,0,0,.4)),
      linear-gradient(180deg, #393934 0%, #272723 57%, #11110f 84%, #070706 100%);
    border-color: #050505;
    box-shadow:
      0 5px 2px rgba(0,0,0,.56),
      inset 0 1px rgba(255,255,255,.14),
      inset 1px 0 rgba(255,255,255,.06);
  }
  acidify-patch-view .pitch-key[data-pitch="1"] { left: 9.685714%; }
  acidify-patch-view .pitch-key[data-pitch="3"] { left: 23.971428%; }
  acidify-patch-view .pitch-key[data-pitch="6"] { left: 52.542856%; }
  acidify-patch-view .pitch-key[data-pitch="8"] { left: 66.82857%; }
  acidify-patch-view .pitch-key[data-pitch="10"] { left: 81.114284%; }
  acidify-patch-view .pitch-key.active, acidify-patch-view .pitch-key.midi {
    transform: translateY(4px); color: #b42018;
    box-shadow: 0 1px 1px rgba(0,0,0,.28), inset 0 3px 5px rgba(0,0,0,.36);
  }
  acidify-patch-view .pitch-key.midi {
    background:
      linear-gradient(100deg, rgba(255,255,255,.3), transparent 78%, rgba(92,30,21,.18)),
      linear-gradient(#ffd3c8, #d97865);
  }
  acidify-patch-view .pitch-key span { position: absolute; bottom: 7px; left: 0; right: 0; }
  acidify-patch-view .time-controls {
    height: 108px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;
    align-content: center; padding: 8px;
    border: 1px solid rgba(74,74,68,.72); border-radius: 5px;
    background:
      linear-gradient(135deg, rgba(255,255,255,.13), transparent 46%),
      linear-gradient(180deg, rgba(116,116,108,.025), rgba(255,255,255,.04));
    box-shadow:
      inset 0 1px rgba(255,255,255,.52),
      inset 1px 0 rgba(255,255,255,.2),
      0 1px rgba(255,255,255,.28);
  }
  acidify-patch-view .function-button {
    height: 40px; cursor: pointer; border-radius: 4px;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    font-size: 7px; font-weight: 900; letter-spacing: .4px;
    background:
      linear-gradient(105deg, rgba(255,255,255,.38), transparent 22% 78%, rgba(68,67,62,.16)),
      linear-gradient(180deg, #e5e3da 0%, #cbc9c0 55%, #a5a49c 100%);
    border: 1px solid #74736c;
    box-shadow:
      0 4px 2px rgba(0,0,0,.35),
      inset 0 1px #fff,
      inset 1px 0 rgba(255,255,255,.35),
      inset -1px 0 rgba(64,63,58,.12);
    text-shadow: 0 .5px rgba(255,255,255,.42);
  }
  acidify-patch-view .function-button strong {
    color: #252521; font-size: 7px; line-height: 8px; letter-spacing: .55px;
  }
  acidify-patch-view .function-button small {
    margin-top: 3px; color: #6a6962; font-size: 5px; line-height: 6px; font-weight: 900; letter-spacing: .45px;
  }
  acidify-patch-view .function-button:active, acidify-patch-view .function-button.active {
    transform: translateY(3px); color: #a51d17;
    background:
      linear-gradient(105deg, rgba(255,255,255,.18), transparent 76%, rgba(67,66,61,.13)),
      linear-gradient(#aaa89f, #d4d2c8 44%, #c1bfb6);
    box-shadow: 0 1px 1px rgba(0,0,0,.25), inset 0 3px 5px rgba(0,0,0,.28);
  }
  acidify-patch-view .function-button.active strong { color: #a51d17; }
  acidify-patch-view .footer-mark {
    position: absolute; right: 37px; bottom: 5px; font-size: 6px; font-weight: 900; letter-spacing: 1.15px; color: #57574f;
    text-shadow: 0 .5px rgba(255,255,255,.34);
  }

  /* 0.4 geometry baseline.
     The interaction model stays untouched. The reconciled hardware surface
     below supersedes this release's unapproved graphite palette. */
  acidify-patch-view {
    --surface-0: #0b0d11;
    --surface-1: #11151a;
    --surface-2: #171c23;
    --surface-3: #202630;
    --surface-4: #2a323e;
    --line: #343e4c;
    --line-soft: rgba(143, 160, 181, .14);
    --ink: #f2f5f7;
    --muted: #8995a4;
    --faint: #5d6876;
    --acid: #ff4e3e;
    --acid-hot: #ff7568;
    --amber: #ffb454;
    color: var(--ink);
    font-family: Inter, "Avenir Next", "Segoe UI", Helvetica, Arial, sans-serif;
  }
  acidify-patch-view .chassis {
    border-radius: 24px;
    border: 1px solid #343b46;
    background:
      radial-gradient(ellipse at 50% -18%, rgba(100, 115, 135, .26), transparent 55%),
      linear-gradient(145deg, #262c35 0%, #13171d 42%, #090b0e 100%);
    box-shadow:
      0 32px 64px rgba(0, 0, 0, .55),
      0 8px 18px rgba(0, 0, 0, .46),
      inset 0 1px 0 rgba(255, 255, 255, .12),
      inset 0 -4px 8px rgba(0, 0, 0, .48);
  }
  acidify-patch-view .chassis::before {
    left: 9px; right: 9px; top: 9px; bottom: 10px;
    border-radius: 17px;
    border: 1px solid rgba(158, 174, 194, .12);
    box-shadow: inset 0 1px rgba(255, 255, 255, .045);
  }
  acidify-patch-view .chassis::after {
    left: 56px; right: 56px; bottom: 3px; height: 6px;
    background: linear-gradient(180deg, transparent, rgba(0, 0, 0, .48));
  }
  acidify-patch-view .panel {
    left: 18px; top: 18px; width: 1144px; height: 544px;
    border: 1px solid #303844; border-radius: 16px;
    background:
      radial-gradient(circle at 84% 2%, rgba(255, 78, 62, .055), transparent 25%),
      linear-gradient(155deg, rgba(255, 255, 255, .025), transparent 34%),
      linear-gradient(180deg, #191e25 0%, #11151a 100%);
    box-shadow:
      inset 0 1px rgba(255, 255, 255, .06),
      inset 0 -1px rgba(0, 0, 0, .7),
      0 5px 12px rgba(0, 0, 0, .48);
  }
  acidify-patch-view .panel::before {
    inset: 0; border-radius: 15px; opacity: .32; mix-blend-mode: normal;
    background:
      linear-gradient(90deg, rgba(255, 255, 255, .018) 1px, transparent 1px),
      linear-gradient(rgba(255, 255, 255, .012) 1px, transparent 1px);
    background-size: 16px 16px;
    -webkit-mask: linear-gradient(180deg, #000, transparent 75%);
            mask: linear-gradient(180deg, #000, transparent 75%);
  }
  acidify-patch-view .panel::after {
    left: 18px; right: 18px; top: 0; bottom: auto; height: 2px;
    border-radius: 0 0 2px 2px;
    background: linear-gradient(90deg, transparent, var(--acid) 22% 48%, rgba(255, 180, 84, .72) 64%, transparent);
    opacity: .7;
  }
  acidify-patch-view .screw { display: none; }

  acidify-patch-view .top-strip {
    left: 22px; right: 22px; top: 20px; height: 198px;
    border: 0; box-shadow: none;
  }
  acidify-patch-view .transport-bank,
  acidify-patch-view .tone-bank,
  acidify-patch-view .volume-bank {
    top: 0; height: 198px; border-radius: 11px;
    border: 1px solid var(--line);
    background:
      linear-gradient(145deg, rgba(255, 255, 255, .035), transparent 36%),
      linear-gradient(180deg, #202630, #171c23);
    box-shadow:
      inset 0 1px rgba(255, 255, 255, .045),
      0 10px 22px rgba(0, 0, 0, .17);
  }
  acidify-patch-view .transport-bank {
    left: 0; width: 260px;
    grid-template-columns: 104px 1fr; gap: 13px;
    padding: 82px 12px 12px;
    overflow: hidden;
  }
  acidify-patch-view .branding {
    z-index: 4; left: 16px; top: 13px; width: 228px; height: 52px;
  }
  acidify-patch-view .brand {
    color: var(--ink); font-family: Inter, "Avenir Next", "Segoe UI", sans-serif;
    font-size: 29px; line-height: 29px; font-weight: 800; letter-spacing: -.7px;
    text-shadow: none;
  }
  acidify-patch-view .brand .acid { color: var(--acid); }
  acidify-patch-view .model {
    margin-top: 2px; color: #c2cad4; font-size: 8px; letter-spacing: 1.45px; text-shadow: none;
  }
  acidify-patch-view .computer {
    margin-top: 3px; color: var(--faint); font-size: 6px; font-weight: 700; letter-spacing: 1.9px;
  }
  acidify-patch-view .bank-title {
    left: 13px; top: 11px; color: var(--muted); font-size: 6px; letter-spacing: 1.5px; text-shadow: none;
  }
  acidify-patch-view .transport-bank .bank-title { top: 73px; }
  acidify-patch-view .mini-title {
    color: #cdd4dc; font-size: 7px; letter-spacing: 1.05px;
  }
  acidify-patch-view .transport-bank .knob-control {
    zoom: .64; width: 104px; height: 118px; margin-top: 3px;
  }
  acidify-patch-view .transport-bank .control-label { margin-top: 9px; }
  acidify-patch-view .mode-box {
    gap: 8px; border-left-color: var(--line-soft); box-shadow: none;
  }
  acidify-patch-view .run-switch {
    width: 108px; height: 39px; padding: 4px; border-radius: 7px;
    background: #0c0f13; border-color: #050608;
    box-shadow: inset 0 2px 6px rgba(0, 0, 0, .82), 0 1px rgba(255, 255, 255, .055);
  }
  acidify-patch-view .run-switch button {
    border-radius: 4px; color: #e6ebef;
    background: linear-gradient(180deg, #3b4653, #252c35);
    border-color: #485464; box-shadow: 0 2px 3px rgba(0, 0, 0, .55), inset 0 1px rgba(255, 255, 255, .09);
    text-shadow: none;
  }
  acidify-patch-view .run-switch.is-on button {
    color: #fff4f1; border-color: #b3392f;
    background: linear-gradient(180deg, #db4a3d, #8f251d);
    box-shadow: 0 0 14px rgba(255, 78, 62, .22), inset 0 1px rgba(255, 255, 255, .14);
  }
  acidify-patch-view .run-lamp,
  acidify-patch-view .output-lamp {
    border-color: #3d1411;
    background: radial-gradient(circle at 40% 35%, #823027, #32100d 62%, #120504);
    box-shadow: 0 0 0 2px rgba(255, 255, 255, .04), inset 0 -1px 2px #080202;
  }
  acidify-patch-view .run-lamp.lit {
    background: radial-gradient(circle at 36% 31%, #fff5d9 0 7%, #ff7568 14%, #ff3e31 45%, #8b130d 78%);
    box-shadow: 0 0 5px var(--acid), 0 0 14px rgba(255, 78, 62, .42), 0 0 0 2px rgba(255, 255, 255, .05);
  }

  acidify-patch-view .tone-bank { left: 273px; width: 676px; padding: 0 12px; }
  acidify-patch-view .tone-controls {
    left: 10px; right: 10px; top: 39px; bottom: 0;
    grid-template-columns: 82px repeat(6, minmax(0, 1fr));
  }
  acidify-patch-view .tone-bank .knob-control,
  acidify-patch-view .volume-bank .knob-control { width: 90px; height: 150px; }
  acidify-patch-view .tone-bank .dial,
  acidify-patch-view .volume-bank .dial { width: 70px; height: 70px; }
  acidify-patch-view .tone-bank .dial::before,
  acidify-patch-view .tone-bank .dial-cap,
  acidify-patch-view .volume-bank .dial::before,
  acidify-patch-view .volume-bank .dial-cap { inset: 7px; }
  acidify-patch-view .tone-bank .tick-ring,
  acidify-patch-view .volume-bank .tick-ring { top: -9px; width: 88px; height: 88px; }
  acidify-patch-view .tone-bank .tick-ring::after,
  acidify-patch-view .volume-bank .tick-ring::after { left: 42px; transform-origin: 2px 43px; }
  acidify-patch-view .waveform { width: 82px; height: 150px; }
  acidify-patch-view .wave-buttons { top: 19px; gap: 8px; }
  acidify-patch-view .wave-buttons button {
    width: 33px; height: 33px; border-radius: 7px; color: #95a1af;
    background: linear-gradient(180deg, #303845, #202630);
    border-color: #414b59;
    box-shadow: 0 3px 5px rgba(0, 0, 0, .4), inset 0 1px rgba(255, 255, 255, .055);
  }
  acidify-patch-view .wave-buttons button.active {
    transform: none; color: var(--acid-hot); border-color: #a33a31;
    background: linear-gradient(180deg, #402823, #251916);
    box-shadow: 0 0 13px rgba(255, 78, 62, .16), inset 0 1px rgba(255, 255, 255, .045);
  }
  acidify-patch-view .wave-title {
    top: 84px; color: #dce1e6; font-size: 7px; letter-spacing: .8px; text-shadow: none;
  }
  acidify-patch-view .volume-bank {
    right: 0; width: 136px; padding-top: 39px;
  }
  acidify-patch-view .master-head {
    left: 13px; right: 12px; top: 10px; color: var(--muted);
    font-size: 6px; letter-spacing: 1.4px; text-shadow: none;
  }
  acidify-patch-view .master-output { color: var(--faint); }
  acidify-patch-view .master-output .output-lamp { width: 9px; height: 9px; }

  acidify-patch-view .dial {
    background:
      radial-gradient(circle, transparent 0 61%, rgba(255, 255, 255, .055) 62%, transparent 66%),
      repeating-conic-gradient(from 1deg, #090b0e 0 5deg, #252b33 5deg 8deg, #0b0d10 8deg 13deg);
    border-color: #050609;
    box-shadow:
      0 8px 14px rgba(0, 0, 0, .5),
      0 2px 3px rgba(0, 0, 0, .7),
      inset 0 2px 2px rgba(255, 255, 255, .08),
      inset 0 -4px 5px #050607;
  }
  acidify-patch-view .dial::before {
    background:
      radial-gradient(circle at 34% 24%, rgba(255, 255, 255, .18) 0 2%, rgba(255, 255, 255, .045) 16%, transparent 36%),
      radial-gradient(circle at 50% 48%, #353d47 0%, #1d2229 58%, #0b0d10 84%);
    border-color: #07090b;
    box-shadow: inset 0 2px 2px rgba(255, 255, 255, .07), inset -3px -6px 9px rgba(0, 0, 0, .72);
  }
  acidify-patch-view .dial::after { border-top-color: rgba(255, 255, 255, .065); }
  acidify-patch-view .dial-pointer {
    top: 4px; width: 3px; height: 20px;
    background: linear-gradient(90deg, #e94a3d, #ff9a8f 48%, #cf2f25);
    box-shadow: 0 0 5px rgba(255, 78, 62, .32);
  }
  acidify-patch-view .tick-ring {
    background: repeating-conic-gradient(from 222deg, #687484 0 1.2deg, transparent 1.2deg 13.5deg);
    opacity: .66; filter: none;
  }
  acidify-patch-view .tick-ring::after {
    background: var(--acid); box-shadow: 0 0 4px rgba(255, 78, 62, .35); opacity: .45;
  }
  acidify-patch-view .dial:focus-visible { outline-color: rgba(255, 78, 62, .88); }
  acidify-patch-view .control-label {
    margin-top: 12px; color: #d7dde3; font-size: 7px; letter-spacing: .65px; text-shadow: none;
  }
  acidify-patch-view .value-label {
    margin-top: 4px; color: var(--acid-hot); opacity: .9; font: 7px ui-monospace, SFMono-Regular, Menlo, monospace;
  }

  acidify-patch-view .program-strip {
    left: 22px; right: 22px; top: 237px; height: 283px; padding: 0 13px 13px;
    border: 1px solid var(--line); border-radius: 12px;
    background:
      linear-gradient(145deg, rgba(255, 255, 255, .025), transparent 42%),
      linear-gradient(180deg, #171c22, #12161b);
    box-shadow: inset 0 1px rgba(255, 255, 255, .035), 0 10px 24px rgba(0, 0, 0, .18);
  }
  acidify-patch-view .program-header {
    height: 48px; border-bottom-color: var(--line-soft); box-shadow: none;
  }
  acidify-patch-view .program-title {
    font-size: 11px; color: #dce2e7; letter-spacing: 1.9px; column-gap: 9px;
  }
  acidify-patch-view .program-title b { color: var(--acid-hot); }
  acidify-patch-view .program-context {
    color: var(--faint); font-size: 5.5px; letter-spacing: 1.55px;
  }
  acidify-patch-view .utility { gap: 13px; }
  acidify-patch-view .studio-toggle {
    width: 156px; height: 32px; padding: 0 8px; border-radius: 8px;
    color: var(--muted); background: #0f1318; border-color: #343d49;
    box-shadow: inset 0 2px 5px rgba(0, 0, 0, .46), 0 1px rgba(255, 255, 255, .035);
    font-size: 6.5px; letter-spacing: .9px;
  }
  acidify-patch-view .studio-toggle i {
    left: 4px; top: 4px; width: 72px; height: 24px; border-radius: 5px;
    background: linear-gradient(180deg, #3c4653, #252c35);
    border-color: #485363;
    box-shadow: 0 2px 4px rgba(0, 0, 0, .45), inset 0 1px rgba(255, 255, 255, .08);
  }
  acidify-patch-view .studio-toggle span { width: 66px; }
  acidify-patch-view .studio-toggle .classic-label { color: #f2f5f7; text-shadow: none; }
  acidify-patch-view .studio-toggle[aria-pressed="true"] i {
    transform: translateX(72px);
    background: linear-gradient(180deg, #e15145, #9b2921);
    border-color: #ef6558;
    box-shadow: 0 0 15px rgba(255, 78, 62, .2), inset 0 1px rgba(255, 255, 255, .13);
  }
  acidify-patch-view .studio-toggle[aria-pressed="true"] .classic-label { color: var(--faint); }
  acidify-patch-view .studio-toggle[aria-pressed="true"] .studio-label { color: #fff; text-shadow: none; }
  acidify-patch-view .studio-toggle:focus-visible,
  acidify-patch-view .stepper button:focus-visible,
  acidify-patch-view .sequence-step:focus-visible,
  acidify-patch-view .function-button:focus-visible,
  acidify-patch-view .studio-actions button:focus-visible,
  acidify-patch-view .studio-cell:focus-visible,
  acidify-patch-view .pitch-key:focus-visible,
  acidify-patch-view .wave-buttons button:focus-visible,
  acidify-patch-view .run-switch button:focus-visible {
    outline-color: var(--acid-hot);
  }
  acidify-patch-view .stepper {
    grid-template-columns: 25px 62px 25px; height: 30px; border-radius: 7px;
    background: #0d1115; border-color: #303945;
    box-shadow: inset 0 2px 5px rgba(0, 0, 0, .58);
  }
  acidify-patch-view .stepper button {
    color: #cbd2d9; background: linear-gradient(180deg, #343d48, #222831);
    box-shadow: none; text-shadow: none;
  }
  acidify-patch-view .stepper button:active { background: #181d23; }
  acidify-patch-view .stepper-value {
    color: var(--acid-hot); background: #0b0e12; border-inline-color: #2c343e;
    font: 10px ui-monospace, SFMono-Regular, Menlo, monospace;
    text-shadow: 0 0 7px rgba(255, 78, 62, .4);
  }
  acidify-patch-view .stepper-label { margin-top: 3px; color: var(--muted); font-size: 6px; letter-spacing: 1px; }
  acidify-patch-view .output-lamp {
    filter: brightness(calc(.35 + var(--level) * 2.7));
    background: radial-gradient(circle at 36% 30%, #fff3d8 0 5%, #ff6b5e 15%, #eb3529 43%, #5b0c08 78%);
    box-shadow: 0 0 calc(var(--level) * 11px) var(--acid), 0 0 0 2px rgba(255, 255, 255, .035);
  }

  acidify-patch-view .step-row {
    height: 70px; padding: 8px 0;
    grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 13px;
  }
  acidify-patch-view .step-group { gap: 5px; }
  acidify-patch-view .step-group:not(:last-child)::after { display: none; }
  acidify-patch-view .sequence-step {
    height: 54px; border-radius: 7px; color: #cdd4dc;
    background:
      linear-gradient(145deg, rgba(255, 255, 255, .045), transparent 42%),
      linear-gradient(180deg, #2a323d, #20262e);
    border-color: #3a4552;
    box-shadow: 0 4px 8px rgba(0, 0, 0, .28), inset 0 1px rgba(255, 255, 255, .045);
  }
  acidify-patch-view .sequence-step:hover {
    border-color: #566474; background: linear-gradient(180deg, #303946, #242b34);
  }
  acidify-patch-view .sequence-step:active,
  acidify-patch-view .sequence-step.selected {
    transform: translateY(1px); color: #fff;
    background: linear-gradient(180deg, #402824, #251916);
    border-color: #d34a3e;
    box-shadow: 0 0 0 1px rgba(255, 78, 62, .14), 0 0 14px rgba(255, 78, 62, .11), inset 0 1px rgba(255, 255, 255, .045);
  }
  acidify-patch-view .sequence-step.multi-selected {
    outline: 1px solid var(--acid-hot); outline-offset: -3px;
  }
  acidify-patch-view .step-led {
    top: 6px; width: 8px; height: 8px; margin-left: -4px;
    border-color: #35100d;
    background: radial-gradient(circle, #6c211b, #260a07 67%, #100302);
    box-shadow: 0 0 0 2px rgba(255, 255, 255, .025);
  }
  acidify-patch-view .sequence-step.playing .step-led {
    background: radial-gradient(circle at 34% 28%, #fff7dc 0 8%, #ff796b 16%, #ff3e31 48%, #8c120c 76%);
    box-shadow: 0 0 6px var(--acid), 0 0 13px rgba(255, 78, 62, .4);
  }
  acidify-patch-view .sequence-step.accented::before {
    color: #fff8f2; background: linear-gradient(180deg, #ff6858, #b9231a);
    border-color: #7b1711; box-shadow: 0 0 0 1px rgba(255,255,255,.08), 0 0 9px rgba(255,78,62,.34);
  }
  acidify-patch-view .sequence-step.sliding::after {
    color: #221500; background: linear-gradient(180deg, #ffd96b, #bf821a);
    border-color: #75500d; box-shadow: 0 0 0 1px rgba(255,255,255,.08), 0 0 8px rgba(226,166,48,.27);
  }
  acidify-patch-view .step-note { color: var(--acid-hot); }
  acidify-patch-view .sequence-step.rest { opacity: .42; }

  acidify-patch-view .editor,
  acidify-patch-view.studio-mode .studio-editor {
    height: 128px; padding-top: 10px; gap: 13px;
    border-top: 1px solid var(--line-soft); box-shadow: none;
  }
  acidify-patch-view .editor { grid-template-columns: 160px minmax(0, 1fr) 288px; }
  acidify-patch-view.studio-mode .studio-editor { grid-template-columns: 404px 1fr; }
  acidify-patch-view .edit-status,
  acidify-patch-view .keyboard,
  acidify-patch-view .time-controls,
  acidify-patch-view .studio-tools {
    height: 114px; border-radius: 9px; border: 1px solid var(--line);
    background:
      linear-gradient(145deg, rgba(255, 255, 255, .025), transparent 45%),
      linear-gradient(180deg, #202630, #191e25);
    box-shadow: inset 0 1px rgba(255, 255, 255, .035), 0 5px 10px rgba(0, 0, 0, .16);
  }
  acidify-patch-view .edit-status { padding: 10px 12px; }
  acidify-patch-view .edit-caption { color: var(--muted); font-size: 6px; letter-spacing: 1.2px; }
  acidify-patch-view .edit-readout {
    margin-top: 7px; height: 38px; border-radius: 6px;
    color: var(--acid-hot); background: #0b0e12; border-color: #2a1715;
    box-shadow: inset 0 3px 8px rgba(0, 0, 0, .72), 0 1px rgba(255, 255, 255, .025);
    font: 16px ui-monospace, SFMono-Regular, Menlo, monospace;
    text-shadow: 0 0 8px rgba(255, 78, 62, .45);
  }
  acidify-patch-view .octave-indicator { color: var(--faint); }
  acidify-patch-view .octave-indicator.high::after { color: var(--acid-hot); }
  acidify-patch-view .keyboard { padding: 9px; }
  acidify-patch-view .pitch-key {
    border-color: #6f7882; border-radius: 3px 3px 6px 6px;
    color: #20252b;
    background: linear-gradient(180deg, #f4f5f4, #d9dddf 68%, #aeb5ba 100%);
    box-shadow: 0 4px 3px rgba(0, 0, 0, .4), inset 0 1px #fff, inset -1px 0 rgba(0, 0, 0, .08);
  }
  acidify-patch-view .pitch-key.black-key {
    color: #d7dde2; border-color: #050608;
    background: linear-gradient(180deg, #343b44, #171b20 62%, #07090b 100%);
    box-shadow: 0 5px 4px rgba(0, 0, 0, .54), inset 0 1px rgba(255, 255, 255, .08);
  }
  acidify-patch-view .pitch-key.active,
  acidify-patch-view .pitch-key.midi {
    color: #9f241c; box-shadow: 0 1px 1px rgba(0, 0, 0, .4), inset 0 4px 6px rgba(0, 0, 0, .25);
  }
  acidify-patch-view .pitch-key.midi { background: linear-gradient(#ffc1b8, #e96759); }
  acidify-patch-view .time-controls { padding: 9px; gap: 8px; }
  acidify-patch-view .function-button {
    height: 41px; border-radius: 7px;
    color: #dbe1e6; background: linear-gradient(180deg, #313a46, #242a33);
    border-color: #414c5a;
    box-shadow: 0 3px 5px rgba(0, 0, 0, .33), inset 0 1px rgba(255, 255, 255, .045);
    text-shadow: none;
  }
  acidify-patch-view .function-button strong { color: #edf1f4; }
  acidify-patch-view .function-button small { color: var(--muted); }
  acidify-patch-view .function-button:active,
  acidify-patch-view .function-button.active {
    transform: translateY(1px); color: var(--acid-hot);
    background: linear-gradient(180deg, #432a25, #271a17); border-color: #bd4035;
    box-shadow: 0 0 11px rgba(255, 78, 62, .1), inset 0 1px rgba(255, 255, 255, .04);
  }
  acidify-patch-view .function-button.active strong { color: var(--acid-hot); }

  acidify-patch-view .studio-tools { padding: 8px; }
  acidify-patch-view .studio-tool-head { color: var(--muted); }
  acidify-patch-view .studio-selection { color: var(--acid-hot); }
  acidify-patch-view .studio-actions { gap: 5px; }
  acidify-patch-view .studio-actions button {
    height: 35px; border-radius: 7px; color: #e5eaee;
    background: linear-gradient(180deg, #303945, #222831);
    border-color: #404b59;
    box-shadow: 0 3px 5px rgba(0, 0, 0, .3), inset 0 1px rgba(255, 255, 255, .045);
  }
  acidify-patch-view .studio-actions button small { color: var(--muted); }
  acidify-patch-view .studio-actions button:hover:not(:disabled) { color: var(--acid-hot); border-color: #8f3932; }
  acidify-patch-view .studio-actions button:active:not(:disabled) {
    transform: translateY(1px); background: #1b2027; box-shadow: inset 0 2px 5px rgba(0, 0, 0, .45);
  }
  acidify-patch-view .studio-toast {
    color: var(--acid-hot); background: rgba(8, 10, 13, .94); border: 1px solid #313944;
  }
  acidify-patch-view .studio-matrix {
    height: 114px; padding: 7px 9px 13px; border-radius: 9px;
    background:
      linear-gradient(90deg, rgba(255, 255, 255, .018) 1px, transparent 1px),
      linear-gradient(rgba(255, 255, 255, .012) 1px, transparent 1px),
      #0c1014;
    background-size: 12px 12px;
    border-color: #2d3540;
    box-shadow: inset 0 3px 10px rgba(0, 0, 0, .62), 0 1px rgba(255, 255, 255, .025);
  }
  acidify-patch-view .studio-ruler { height: 13px; }
  acidify-patch-view .studio-lane { height: 20px; }
  acidify-patch-view .studio-lane-label { color: var(--muted); }
  acidify-patch-view .studio-ruler-group span { color: #586473; }
  acidify-patch-view .studio-ruler-group:not(:last-child)::after { background: rgba(126, 145, 166, .14); }
  acidify-patch-view .studio-cell {
    height: 16px; border-radius: 4px; color: #6f7b89;
    background: linear-gradient(180deg, #202730, #171c22);
    border-color: #2c3540;
  }
  acidify-patch-view .studio-cell.selected { border-color: #a13b32; }
  acidify-patch-view .studio-cell[data-kind="pitch"].active {
    color: var(--acid-hot); background: linear-gradient(180deg, #3d2723, #241815);
  }
  acidify-patch-view .studio-lane[data-lane="gate"] .studio-cell.active {
    background: linear-gradient(180deg, #dce2e5, #8d99a3); border-color: #e8edef;
    box-shadow: 0 0 7px rgba(219, 228, 234, .16);
  }
  acidify-patch-view .studio-lane[data-lane="accent"] .studio-cell.active {
    background: linear-gradient(180deg, #ff695b, #b92d23); border-color: #ff8277;
    box-shadow: 0 0 8px rgba(255, 78, 62, .34);
  }
  acidify-patch-view .studio-lane[data-lane="slide"] .studio-cell.active {
    background: linear-gradient(180deg, #ffc06f, #9c5c22); border-color: #ffd096;
    box-shadow: 0 0 7px rgba(255, 180, 84, .25);
  }
  acidify-patch-view .studio-cell.playing::after {
    border-color: var(--acid-hot); box-shadow: 0 0 7px rgba(255, 78, 62, .5);
  }
  acidify-patch-view .studio-hint { color: #4f5b68; }
  acidify-patch-view.studio-mode .value-label {
    color: var(--acid-hot); background: linear-gradient(#252c35, #11151a);
    border-color: #050608; box-shadow: 0 8px 18px rgba(0, 0, 0, .5);
  }
  acidify-patch-view .footer-mark {
    right: 28px; bottom: 7px; color: #4f5a67; font-size: 5.5px; letter-spacing: 1.35px; text-shadow: none;
  }

  /* Reconciled hardware surface.
     Keeps the safer 0.4 geometry while restoring the established ACIDIFY
     material language instead of inventing a different product identity. */
  acidify-patch-view {
    --line: #777a74;
    --line-soft: rgba(55, 55, 49, .2);
    --ink: #20211d;
    --muted: #5d5f59;
    --faint: #74766f;
    --acid: #b52921;
    --acid-hot: #d33a2f;
    --amber: #bb712d;
    color: var(--ink);
    font-family: "Arial Narrow", "Helvetica Neue", Arial, sans-serif;
  }
  acidify-patch-view .chassis {
    border: 1px solid #777268;
    border-radius: 33px 33px 27px 27px;
    background:
      radial-gradient(ellipse at 50% -18%, rgba(255,255,255,.9) 0 12%, transparent 54%),
      linear-gradient(90deg, rgba(255,255,255,.4) 0, transparent 2.4%, transparent 97%, rgba(40,38,31,.33) 100%),
      repeating-linear-gradient(7deg, rgba(255,255,255,.025) 0 1px, rgba(57,54,45,.025) 1px 3px),
      linear-gradient(180deg, #e5e1d2 0%, #d1ccbb 48%, #b5ae9c 84%, #969082 100%);
    box-shadow:
      0 30px 46px rgba(0,0,0,.46),
      0 7px 12px rgba(0,0,0,.32),
      inset 0 3px 1px rgba(255,255,255,.82),
      inset 0 -8px 12px rgba(61,56,44,.34),
      inset 4px 0 5px rgba(255,255,255,.22),
      inset -4px 0 6px rgba(60,56,48,.16);
  }
  acidify-patch-view .chassis::before {
    left: 9px; right: 9px; top: 9px; bottom: 10px;
    border-radius: 24px 24px 18px 18px;
    border-color: rgba(73,70,62,.42);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.74), 0 1px 0 rgba(255,255,255,.35);
  }
  acidify-patch-view .chassis::after {
    background: linear-gradient(180deg, rgba(72,68,57,.04), rgba(47,43,36,.28));
  }
  acidify-patch-view .panel {
    border-color: #77776f;
    background:
      radial-gradient(ellipse at 34% -12%, rgba(255,255,255,.38), transparent 47%),
      repeating-linear-gradient(90deg, rgba(255,255,255,.035) 0 1px, rgba(49,50,48,.025) 1px 2px, transparent 2px 5px),
      linear-gradient(164deg, #dddeda 0%, #cacbc7 45%, #b7b8b4 100%);
    box-shadow:
      inset 0 1px 0 #f8f8f3,
      inset 0 -2px 4px rgba(0,0,0,.25),
      inset 1px 0 1px rgba(255,255,255,.48),
      0 3px 4px rgba(0,0,0,.34);
  }
  acidify-patch-view .panel::before {
    opacity: .17;
    mix-blend-mode: multiply;
    background:
      radial-gradient(circle at 16% 26%, rgba(36,34,30,.16) 0 .45px, transparent .8px),
      radial-gradient(circle at 77% 64%, rgba(255,255,255,.32) 0 .45px, transparent .85px);
    background-size: 13px 17px, 17px 13px;
    -webkit-mask: none;
            mask: none;
  }
  acidify-patch-view .panel::after {
    left: 24px; right: 24px; top: 0; height: 2px;
    background: linear-gradient(90deg, transparent, rgba(181, 41, 33, .76) 25% 48%, rgba(183, 113, 45, .54) 65%, transparent);
    opacity: .52;
  }
  acidify-patch-view .screw { display: block; }

  acidify-patch-view .transport-bank,
  acidify-patch-view .tone-bank,
  acidify-patch-view .volume-bank {
    border-color: rgba(58,58,53,.72);
    background:
      linear-gradient(135deg, rgba(255,255,255,.18), transparent 42%),
      linear-gradient(180deg, rgba(250,250,244,.12), rgba(102,102,95,.035));
    box-shadow:
      inset 0 1px rgba(255,255,255,.58),
      inset 1px 0 rgba(255,255,255,.22),
      0 1px rgba(255,255,255,.32),
      0 5px 12px rgba(62,61,55,.08);
  }
  acidify-patch-view .brand {
    color: #1c1c19;
    font-family: Impact, "Arial Black", sans-serif;
    font-size: 29px;
    line-height: 29px;
    font-weight: 900;
    letter-spacing: .6px;
  }
  acidify-patch-view .brand .acid { color: #aa211b; }
  acidify-patch-view .model { color: #252520; font-size: 8px; letter-spacing: 1.65px; }
  acidify-patch-view .computer { color: #62635c; }
  acidify-patch-view .bank-title,
  acidify-patch-view .master-head {
    color: #55574f;
    text-shadow: 0 .5px rgba(255,255,255,.52);
  }
  acidify-patch-view .mini-title { color: #292a25; }
  acidify-patch-view .mode-box {
    gap: 3px;
    border-left-color: rgba(68,68,63,.45);
    box-shadow: inset 1px 0 rgba(255,255,255,.42);
  }
  acidify-patch-view .clock-mode {
    display: grid; grid-template-columns: 1fr 1fr; width: 108px; height: 19px;
    padding: 2px; border: 1px solid #2a2a26; border-radius: 4px;
    background: linear-gradient(#2b2b27, #151512);
    box-shadow: inset 0 1px 2px #090908, 0 1px rgba(255,255,255,.52);
  }
  acidify-patch-view .clock-mode button {
    min-width: 0; cursor: pointer; border-radius: 2px;
    color: #aaa99f; background: transparent;
    font-size: 6px; line-height: 13px; font-weight: 900; letter-spacing: .75px;
  }
  acidify-patch-view .clock-mode button.active {
    color: #fff2ee;
    background: linear-gradient(#b72b22, #6e1712);
    box-shadow: inset 0 1px rgba(255,255,255,.18), 0 0 6px rgba(174,32,25,.24);
  }
  acidify-patch-view .clock-mode button:focus-visible {
    outline: 2px solid rgba(169,32,26,.72); outline-offset: 2px;
  }
  acidify-patch-view .clock-readout {
    height: 9px; color: #575850; font: 700 6px/9px "Courier New", monospace;
    letter-spacing: .25px; white-space: nowrap;
  }
  acidify-patch-view .clock-readout.locked { color: #8d1d17; }
  acidify-patch-view .clock-readout.waiting { color: #776d51; }
  acidify-patch-view .mode-box > .run-switch { height: 35px; }
  acidify-patch-view .run-switch.daw-controlled,
  acidify-patch-view .tempo-box.daw-locked .knob-control {
    cursor: default;
  }
  acidify-patch-view .run-switch.daw-controlled button { cursor: default; }
  acidify-patch-view .tempo-box.daw-locked .dial {
    pointer-events: none; opacity: .52; filter: saturate(.35);
  }
  acidify-patch-view .tempo-box.daw-locked .value-label { color: #77776f; }
  acidify-patch-view .master-output { color: #666861; }

  acidify-patch-view .run-switch {
    background: linear-gradient(180deg, #171714, #33332e 14%, #1c1c19 100%);
    border-color: #10100e;
    box-shadow: inset 0 3px 5px #050504, inset 0 -1px rgba(255,255,255,.14), 0 1px 0 rgba(255,255,255,.66);
  }
  acidify-patch-view .run-switch button {
    color: #e8e7dd;
    background:
      linear-gradient(100deg, rgba(255,255,255,.13), transparent 30% 72%, rgba(0,0,0,.25)),
      linear-gradient(180deg, #6a6961 0%, #4b4a44 43%, #292925 100%);
    border-color: #1d1d1a;
    box-shadow: 0 3px 2px rgba(0,0,0,.7), inset 0 1px 0 rgba(255,255,255,.25);
  }
  acidify-patch-view .run-switch.is-on button {
    color: #ffb3a9;
    border-color: #641811;
    background: linear-gradient(#49332d, #211916);
    box-shadow: 0 1px 1px #050504, inset 0 2px 4px rgba(0,0,0,.45), 0 0 10px rgba(181,41,33,.18);
  }
  acidify-patch-view .run-lamp,
  acidify-patch-view .output-lamp {
    border-color: #4f1a15;
    background:
      radial-gradient(circle at 34% 25%, rgba(255,255,255,.38) 0 5%, transparent 8%),
      radial-gradient(circle at 45% 42%, #7f241c, #4a1511 48%, #210906 78%);
  }

  acidify-patch-view .wave-buttons button {
    color: #deddd3;
    background:
      linear-gradient(105deg, rgba(255,255,255,.16), transparent 35% 75%, rgba(0,0,0,.25)),
      linear-gradient(#67665f, #353530 62%, #252521);
    border-color: #171714;
    box-shadow: 0 3px 2px rgba(0,0,0,.52), inset 0 1px rgba(255,255,255,.25), 0 0 0 2px rgba(78,78,72,.12);
  }
  acidify-patch-view .wave-buttons button.active {
    color: #ff5545;
    border-color: #5f1812;
    background: linear-gradient(#383530, #1b1a17);
    box-shadow: 0 1px 1px rgba(0,0,0,.6), inset 0 2px 5px #0b0b09, 0 0 8px rgba(181,41,33,.18);
  }
  acidify-patch-view .wave-title { color: #292a25; font-size: 8px; }
  acidify-patch-view .dial {
    border-color: #11110f;
    background:
      radial-gradient(circle, transparent 0 62%, rgba(255,255,255,.09) 63%, transparent 67%),
      repeating-conic-gradient(from 1deg, #0c0c0a 0 5deg, #3a3934 5deg 8deg, #11110f 8deg 13deg);
    box-shadow:
      0 8px 9px rgba(0,0,0,.38),
      0 2px 2px rgba(0,0,0,.6),
      inset 0 2px 2px rgba(255,255,255,.12),
      inset 0 -4px 4px #050504;
  }
  acidify-patch-view .dial::before {
    border-color: #11110f;
    background:
      radial-gradient(circle at 34% 24%, rgba(255,255,255,.28) 0 2%, rgba(255,255,255,.07) 16%, transparent 36%),
      radial-gradient(circle at 50% 48%, #56564f 0%, #272723 58%, #0b0b09 84%);
    box-shadow: inset 0 2px 2px rgba(255,255,255,.1), inset -3px -6px 9px rgba(0,0,0,.64);
  }
  acidify-patch-view .dial::after { border-top-color: rgba(255,255,255,.09); }
  acidify-patch-view .dial-pointer {
    background: linear-gradient(90deg, #d6d3c6, #fffdf1 48%, #aba99f);
    box-shadow: 0 1px 1px #050504;
  }
  acidify-patch-view .tick-ring {
    background: repeating-conic-gradient(from 222deg, #34342f 0 1.3deg, transparent 1.3deg 13.5deg);
    opacity: .82;
  }
  acidify-patch-view .tick-ring::after { background: #a7211a; box-shadow: 0 0 3px rgba(167,33,26,.22); }
  acidify-patch-view .control-label {
    color: #282923;
    font-size: 8px;
    letter-spacing: .72px;
    text-shadow: 0 .5px rgba(255,255,255,.46);
  }
  acidify-patch-view .value-label {
    color: #741812;
    font-size: 7.5px;
    font-family: "Courier New", monospace;
  }

  acidify-patch-view .program-strip {
    border-color: rgba(67,67,61,.68);
    background:
      linear-gradient(145deg, rgba(255,255,255,.13), transparent 42%),
      linear-gradient(180deg, rgba(236,236,230,.32), rgba(133,134,128,.08));
    box-shadow: inset 0 1px rgba(255,255,255,.5), 0 8px 16px rgba(63,62,56,.08);
  }
  acidify-patch-view .program-header {
    border-bottom-color: rgba(75,75,69,.58);
    box-shadow: 0 1px rgba(255,255,255,.5);
  }
  acidify-patch-view .program-title { color: #292a25; }
  acidify-patch-view .program-title b { color: #a51d17; }
  acidify-patch-view .program-context { color: #666861; }
  acidify-patch-view .studio-toggle {
    color: #5e5e58;
    background:
      linear-gradient(180deg, rgba(255,255,255,.2), transparent 34%),
      linear-gradient(#aaa9a1, #d5d4cb 48%, #9b9a92);
    border-color: #66665f;
    box-shadow: inset 0 1px #f3f2eb, inset 0 -1px rgba(43,43,39,.18), 0 1px rgba(255,255,255,.42), 0 2px 2px rgba(0,0,0,.2);
  }
  acidify-patch-view .studio-toggle i {
    background:
      linear-gradient(105deg, rgba(255,255,255,.17), transparent 35% 78%, rgba(0,0,0,.25)),
      linear-gradient(#5a5953, #2c2c28);
    border-color: #20201d;
  }
  acidify-patch-view .studio-toggle .classic-label { color: #f2f0e7; text-shadow: 0 1px #171714; }
  acidify-patch-view .studio-toggle[aria-pressed="true"] i {
    background:
      linear-gradient(105deg, rgba(255,255,255,.16), transparent 38% 78%, rgba(63,0,0,.18)),
      linear-gradient(#b63329, #72150f);
    border-color: #68130e;
  }
  acidify-patch-view .studio-toggle[aria-pressed="true"] .classic-label { color: #5e5e58; }
  acidify-patch-view .studio-toggle[aria-pressed="true"] .studio-label { color: #fff1e9; text-shadow: 0 1px #5b0c08; }
  acidify-patch-view .stepper {
    background: #262622;
    border-color: #121210;
    box-shadow: inset 0 2px 4px rgba(0,0,0,.62), 0 1px 0 rgba(255,255,255,.55);
  }
  acidify-patch-view .stepper button {
    color: #e5e4da;
    background: linear-gradient(#64635c, #383833);
  }
  acidify-patch-view .stepper-value {
    color: #ff6756;
    background: #17120f;
    border-inline-color: #080807;
    text-shadow: 0 0 4px rgba(255,57,37,.58);
  }
  acidify-patch-view .stepper-label { color: #3f403a; }

  acidify-patch-view .step-group:not(:last-child)::after { display: block; }
  acidify-patch-view .sequence-step {
    color: #24251f;
    background:
      linear-gradient(105deg, rgba(255,255,255,.42) 0, transparent 20% 77%, rgba(67,66,60,.18) 100%),
      linear-gradient(180deg, #ebeae1 0%, #d3d2c8 46%, #b2b1a8 82%, #96968f 100%);
    border-color: #777770;
    box-shadow: 0 4px 2px rgba(0,0,0,.34), 0 1px 1px rgba(0,0,0,.26), inset 0 1px #fff;
  }
  acidify-patch-view .sequence-step:hover {
    border-color: #66665f;
    background: linear-gradient(180deg, #f0efe6, #c4c3b9 78%, #a5a49c);
  }
  acidify-patch-view .sequence-step:active,
  acidify-patch-view .sequence-step.selected {
    color: #1e1f1a;
    background: linear-gradient(#aaa9a0, #d4d3ca 36%, #c4c3ba);
    border-color: #a92720;
    box-shadow: 0 1px 1px rgba(0,0,0,.3), inset 0 3px 5px rgba(0,0,0,.28);
  }
  acidify-patch-view .sequence-step.multi-selected { outline-color: rgba(165,29,23,.72); }
  acidify-patch-view .step-led {
    border-color: #2b0806;
    background: radial-gradient(circle at 34% 27%, rgba(255,255,255,.22) 0 5%, transparent 9%), radial-gradient(circle, #651b15, #3c0e0b 60%, #1e0705);
  }
  acidify-patch-view .step-note { color: #8b1b15; }
  acidify-patch-view .sequence-step.accented::before {
    color: #fff8f2; background: linear-gradient(180deg, #d94336, #8b1711);
    border-color: #6d100b; box-shadow: 0 0 0 1px rgba(255,255,255,.3), 0 1px 3px rgba(60,4,2,.42);
  }
  acidify-patch-view .sequence-step.sliding::after {
    color: #261800; background: linear-gradient(180deg, #ffe17a, #d89d22);
    border-color: #70520b; box-shadow: 0 0 0 1px rgba(255,255,255,.34), 0 1px 3px rgba(51,36,0,.38);
  }
  acidify-patch-view .step-octave {
    position: absolute; right: 4px; top: 4px;
    color: #5c5d56; font: 6px "Courier New", monospace; font-weight: 900;
  }

  acidify-patch-view .editor,
  acidify-patch-view.studio-mode .studio-editor {
    border-top-color: rgba(255,255,255,.6);
    box-shadow: inset 0 1px rgba(61,61,57,.18);
  }
  acidify-patch-view .edit-status,
  acidify-patch-view .keyboard,
  acidify-patch-view .time-controls,
  acidify-patch-view .studio-tools {
    border-color: rgba(74,74,68,.72);
    background:
      linear-gradient(135deg, rgba(255,255,255,.16), transparent 46%),
      linear-gradient(180deg, rgba(245,245,238,.12), rgba(112,112,105,.025));
    box-shadow: inset 0 1px rgba(255,255,255,.58), inset 1px 0 rgba(255,255,255,.22), 0 1px rgba(255,255,255,.3);
  }
  acidify-patch-view .edit-caption { color: #55574f; }
  acidify-patch-view .edit-readout {
    color: #ff513b;
    background: repeating-linear-gradient(90deg, transparent 0 3px, rgba(0,0,0,.05) 3px 4px), #1c100d;
    border-color: #0a0706;
    text-shadow: 0 0 4px #e32418, 0 0 8px rgba(227,36,24,.38);
  }
  acidify-patch-view .octave-indicator {
    color: #555750; min-height: 9px;
    font-family: "Courier New", monospace; font-weight: 900; letter-spacing: .3px;
  }
  acidify-patch-view .octave-indicator::after { content: none; }
  acidify-patch-view .pitch-key {
    color: #252620;
    border-color: #73736d;
    background:
      linear-gradient(100deg, rgba(119,117,107,.2), transparent 15% 77%, rgba(75,74,69,.22)),
      linear-gradient(180deg, #f2f0e7 0%, #e2e0d6 55%, #c0beb4 84%, #9f9e96 100%);
  }
  acidify-patch-view .pitch-key.black-key {
    color: #e9e7dc;
    border-color: #050505;
    background:
      linear-gradient(100deg, rgba(255,255,255,.09), transparent 24% 74%, rgba(0,0,0,.4)),
      linear-gradient(180deg, #393934 0%, #272723 57%, #11110f 84%, #070706 100%);
  }
  acidify-patch-view .pitch-key.active,
  acidify-patch-view .pitch-key.midi { color: #b42018; }
  acidify-patch-view .function-button {
    color: #252521;
    background:
      linear-gradient(105deg, rgba(255,255,255,.38), transparent 22% 78%, rgba(68,67,62,.16)),
      linear-gradient(180deg, #e5e3da 0%, #cbc9c0 55%, #a5a49c 100%);
    border-color: #74736c;
    box-shadow: 0 4px 2px rgba(0,0,0,.35), inset 0 1px #fff;
  }
  acidify-patch-view .function-button strong { color: #252521; }
  acidify-patch-view .function-button small { color: #66675f; }
  acidify-patch-view .function-button:active,
  acidify-patch-view .function-button.active {
    color: #a51d17;
    background: linear-gradient(#aaa89f, #d4d2c8 44%, #c1bfb6);
    border-color: #a42a22;
    box-shadow: 0 1px 1px rgba(0,0,0,.25), inset 0 3px 5px rgba(0,0,0,.28);
  }
  acidify-patch-view .function-button.active strong { color: #a51d17; }

  acidify-patch-view .studio-tool-head { color: #65675f; }
  acidify-patch-view .studio-selection { color: #9b2019; }
  acidify-patch-view .studio-actions button {
    color: #e9e8df;
    background:
      linear-gradient(105deg, rgba(255,255,255,.12), transparent 32% 78%, rgba(0,0,0,.28)),
      linear-gradient(#52524c, #292925);
    border-color: #191916;
    box-shadow: 0 2px 2px rgba(0,0,0,.32), inset 0 1px rgba(255,255,255,.18);
  }
  acidify-patch-view .studio-actions button small { color: #aaa9a1; }
  acidify-patch-view .studio-matrix {
    background:
      linear-gradient(110deg, rgba(255,255,255,.035), transparent 27% 75%, rgba(0,0,0,.22)),
      linear-gradient(#242520, #151613);
    border-color: #090a08;
    box-shadow: inset 0 2px 7px rgba(0,0,0,.58), 0 1px rgba(255,255,255,.52);
  }
  acidify-patch-view .studio-lane-label { color: #85867d; }
  acidify-patch-view .studio-ruler-group span { color: #575851; }
  acidify-patch-view .studio-ruler-group:not(:last-child)::after { background: rgba(125,126,116,.2); }
  acidify-patch-view .studio-cell {
    color: #6d6e67;
    background: linear-gradient(#30312d, #22231f);
    border-color: #11120f;
  }
  acidify-patch-view .studio-cell.selected { border-color: #77302a; }
  acidify-patch-view .studio-cell[data-kind="pitch"].active {
    color: #ff8b79;
    background: linear-gradient(#44312c, #2c1d19);
  }
  acidify-patch-view .studio-lane[data-lane="gate"] .studio-cell.active {
    background: linear-gradient(#d4d3c9, #85867e);
    border-color: #e0dfd5;
  }
  acidify-patch-view .studio-lane[data-lane="accent"] .studio-cell.active {
    background: linear-gradient(#ed5b49, #971c13);
    border-color: #ff7666;
  }
  acidify-patch-view .studio-lane[data-lane="slide"] .studio-cell.active {
    background: linear-gradient(#d09252, #71431e);
    border-color: #dba05c;
  }
  acidify-patch-view .studio-hint { color: #55564f; }
  acidify-patch-view.studio-mode .value-label {
    color: #ff7768;
    background: linear-gradient(#282a27, #121311);
    border-color: #080907;
  }
  acidify-patch-view .footer-mark {
    color: #55574f;
    text-shadow: 0 .5px rgba(255,255,255,.38);
  }
  acidify-patch-view .tooltip-toggle {
    position: absolute; z-index: 8; left: 37px; bottom: 3px;
    width: 76px; height: 16px; padding: 1px 4px; border-radius: 4px; cursor: pointer;
    display: grid; grid-template-columns: 12px 1fr 22px; align-items: center; gap: 2px;
    color: #4d4f49; background: linear-gradient(#d7d8d2, #aeb0a9);
    border: 1px solid #6c6e68;
    box-shadow: inset 0 1px rgba(255,255,255,.66), 0 1px rgba(255,255,255,.24);
    font-size: 6px; line-height: 11px; font-weight: 900; letter-spacing: .75px;
  }
  acidify-patch-view .tooltip-toggle > i {
    width: 10px; height: 10px; border-radius: 50%; font-style: normal;
    display: grid; place-items: center; color: #f6f3e8; background: #55564f;
    font-size: 7px; line-height: 10px; letter-spacing: 0;
  }
  acidify-patch-view .tooltip-toggle-state {
    height: 11px; border-radius: 2px; color: #fff2ed; background: linear-gradient(#b92e24, #74150f);
    box-shadow: inset 0 1px rgba(255,255,255,.15); text-align: center;
  }
  acidify-patch-view .tooltip-toggle[aria-pressed="false"] .tooltip-toggle-state {
    color: #a9aaa4; background: linear-gradient(#4b4c47, #292a27);
  }
  acidify-patch-view .tooltip-toggle:focus-visible {
    outline: 2px solid rgba(169,32,26,.82); outline-offset: 2px;
  }
  acidify-patch-view .tooltip-bubble[hidden] { display: none; }
  acidify-patch-view .tooltip-bubble {
    position: absolute; z-index: 140; width: max-content; max-width: 260px;
    padding: 8px 10px; border-radius: 5px; pointer-events: none;
    color: #f1efe5; background: rgba(27, 28, 25, .96);
    border: 1px solid rgba(228, 225, 211, .28);
    box-shadow: 0 8px 18px rgba(0,0,0,.38), inset 0 1px rgba(255,255,255,.06);
    font: 700 9px/1.35 "Helvetica Neue", Arial, sans-serif;
    letter-spacing: .12px; text-align: left; white-space: normal;
  }
  acidify-patch-view .pitch-menu[hidden] { display: none; }
  acidify-patch-view .pitch-menu {
    position: absolute; z-index: 95; width: 394px; height: 278px; overflow: hidden;
    color: #24251f; border: 1px solid #565750; border-radius: 8px;
    background:
      radial-gradient(ellipse at 36% -10%, rgba(255,255,255,.58), transparent 52%),
      repeating-linear-gradient(90deg, rgba(255,255,255,.035) 0 1px, rgba(49,50,48,.025) 1px 2px, transparent 2px 5px),
      linear-gradient(155deg, #dedfd9, #b7b8b2);
    box-shadow:
      0 16px 30px rgba(35,32,25,.46),
      0 5px 10px rgba(35,32,25,.35),
      inset 0 1px #fafaf5,
      inset 0 -2px 4px rgba(0,0,0,.2);
    animation: pitch-menu-enter 110ms ease-out both;
  }
  @keyframes pitch-menu-enter {
    from { opacity: 0; transform: translateY(-3px); }
    to { opacity: 1; transform: translateY(0); }
  }
  acidify-patch-view .pitch-menu-head {
    height: 42px; padding: 7px 8px 5px 11px;
    display: flex; align-items: center; justify-content: space-between;
    border-bottom: 1px solid rgba(69,69,64,.55);
    box-shadow: 0 1px rgba(255,255,255,.55);
  }
  acidify-patch-view .pitch-menu-head > div {
    min-width: 0; display: flex; flex-direction: column; gap: 2px;
  }
  acidify-patch-view .pitch-menu-title {
    overflow: hidden; color: #9f1e18; font-size: 10px; letter-spacing: 1.2px;
    text-overflow: ellipsis; white-space: nowrap;
  }
  acidify-patch-view .pitch-menu-head span {
    color: #62635c; font-size: 5.5px; font-weight: 900; letter-spacing: .85px;
  }
  acidify-patch-view .pitch-menu-close {
    flex: 0 0 auto; width: 23px; height: 21px; border-radius: 3px; cursor: pointer;
    color: #e8e6dd; font: 18px/17px Arial, sans-serif;
    background: linear-gradient(#57564f, #292925);
    border: 1px solid #1b1b18;
    box-shadow: inset 0 1px rgba(255,255,255,.18), 0 1px rgba(255,255,255,.42);
  }
  acidify-patch-view .pitch-menu-grid {
    height: 211px; padding: 7px 8px;
    display: grid; grid-template-columns: repeat(5, 1fr); grid-template-rows: repeat(5, 1fr); gap: 4px;
  }
  acidify-patch-view .pitch-menu-choice {
    min-width: 0; cursor: pointer; border-radius: 4px;
    display: flex; align-items: center; justify-content: center; gap: 5px;
    color: #e9e8df;
    background:
      linear-gradient(105deg, rgba(255,255,255,.13), transparent 34% 77%, rgba(0,0,0,.25)),
      linear-gradient(#5a5953, #292925);
    border: 1px solid #1a1a17;
    box-shadow: 0 2px 2px rgba(0,0,0,.3), inset 0 1px rgba(255,255,255,.18);
  }
  acidify-patch-view .pitch-menu-choice strong {
    font: 10px "Courier New", monospace; letter-spacing: .3px;
  }
  acidify-patch-view .pitch-menu-choice small {
    color: #aaa9a1; font: 5px "Courier New", monospace; font-weight: 900;
  }
  acidify-patch-view .pitch-menu-choice:hover,
  acidify-patch-view .pitch-menu-choice:focus-visible {
    color: #ff9a87; border-color: #8f3932;
  }
  acidify-patch-view .pitch-menu-choice:focus-visible,
  acidify-patch-view .pitch-menu-close:focus-visible {
    outline: 2px solid rgba(169,32,26,.78); outline-offset: 1px;
  }
  acidify-patch-view .pitch-menu-choice.active {
    color: #fff0e9; border-color: #75160f;
    background: linear-gradient(#ae3026, #67140f);
    box-shadow: inset 0 2px 4px rgba(52,5,2,.4), 0 0 5px rgba(181,41,33,.24);
  }
  acidify-patch-view .pitch-menu-choice.active small { color: #ffc0b5; }
  acidify-patch-view .pitch-menu-foot {
    height: 25px; padding: 5px 9px 0; border-top: 1px solid rgba(69,69,64,.35);
    color: #666760; font-size: 5px; font-weight: 900; letter-spacing: .85px;
    text-align: right;
  }
  acidify-patch-view .distortion-trigger {
    display: inline-flex; align-items: center; justify-content: center; gap: 3px;
    width: 40px; height: 15px; padding: 0 4px; border-radius: 3px; cursor: pointer;
    color: #4f5049; font-size: 5.5px; line-height: 1; font-weight: 900; letter-spacing: .65px;
    background: linear-gradient(#d9d8cf, #a6a69e);
    border: 1px solid #77776f;
    box-shadow: inset 0 1px rgba(255,255,255,.75), 0 1px rgba(255,255,255,.38);
  }
  acidify-patch-view .distortion-trigger:hover { color: #272823; }
  acidify-patch-view .distortion-trigger:active,
  acidify-patch-view .distortion-trigger.active {
    transform: translateY(1px);
    color: #fff0e8; border-color: #751911;
    background: linear-gradient(#a72a21, #64130e);
    box-shadow: inset 0 2px 3px rgba(41,3,1,.52), 0 0 6px rgba(181,41,33,.22);
  }
  acidify-patch-view .distortion-trigger:focus-visible,
  acidify-patch-view .distortion-close:focus-visible,
  acidify-patch-view .distortion-types button:focus-visible,
  acidify-patch-view .distortion-power button:focus-visible {
    outline: 2px solid rgba(169,32,26,.72); outline-offset: 2px;
  }
  acidify-patch-view .distortion-led {
    display: block; width: 5px; height: 5px; border-radius: 50%;
    background: #3d1612; border: 1px solid #2b0a07;
    box-shadow: inset 0 1px 1px rgba(255,255,255,.16);
  }
  acidify-patch-view .distortion-led.lit {
    background: #ff4f3c;
    box-shadow: 0 0 4px #ff3826, inset 0 0 1px #fff;
  }
  acidify-patch-view .distortion-scrim[hidden] { display: none; }
  acidify-patch-view .distortion-scrim {
    position: absolute; z-index: 80; inset: 0; border-radius: 15px;
    background: rgba(25,24,20,.2);
  }
  acidify-patch-view .distortion-overlay {
    position: absolute; right: 22px; top: 20px; width: 514px; height: 198px;
    overflow: hidden; border: 1px solid #595a54; border-radius: 8px;
    color: #24251f;
    background:
      radial-gradient(ellipse at 36% -10%, rgba(255,255,255,.58), transparent 52%),
      repeating-linear-gradient(90deg, rgba(255,255,255,.035) 0 1px, rgba(49,50,48,.025) 1px 2px, transparent 2px 5px),
      linear-gradient(155deg, #dedfd9, #b7b8b2);
    box-shadow:
      0 14px 28px rgba(35,32,25,.42),
      0 4px 9px rgba(35,32,25,.34),
      inset 0 1px #fafaf5,
      inset 0 -2px 4px rgba(0,0,0,.2);
    animation: distortion-enter 130ms ease-out both;
  }
  @keyframes distortion-enter {
    from { opacity: 0; transform: translateY(-5px); }
    to { opacity: 1; transform: translateY(0); }
  }
  acidify-patch-view .distortion-overlay-head {
    height: 35px; padding: 7px 9px 5px 12px;
    display: flex; align-items: center; justify-content: space-between;
    border-bottom: 1px solid rgba(69,69,64,.55);
    box-shadow: 0 1px rgba(255,255,255,.55);
  }
  acidify-patch-view .distortion-overlay-head > div {
    display: flex; align-items: baseline; gap: 11px;
  }
  acidify-patch-view .distortion-overlay-head strong {
    color: #9f1e18; font-size: 10px; letter-spacing: 1.8px;
  }
  acidify-patch-view .distortion-status {
    color: #62635c; font: 7px "Courier New", monospace; letter-spacing: .75px;
  }
  acidify-patch-view .distortion-close {
    width: 23px; height: 21px; border-radius: 3px; cursor: pointer;
    color: #e8e6dd; font: 18px/17px Arial, sans-serif;
    background: linear-gradient(#57564f, #292925);
    border: 1px solid #1b1b18;
    box-shadow: inset 0 1px rgba(255,255,255,.18), 0 1px rgba(255,255,255,.42);
  }
  acidify-patch-view .distortion-overlay-body {
    height: 137px; padding: 9px 10px 6px;
    display: grid; grid-template-columns: 76px 190px 96px 96px; gap: 8px;
    align-items: stretch;
  }
  acidify-patch-view .distortion-power-cell,
  acidify-patch-view .distortion-type-cell,
  acidify-patch-view .distortion-knob-cell {
    position: relative; min-width: 0; border: 1px solid rgba(72,72,66,.52); border-radius: 5px;
    background: linear-gradient(135deg, rgba(255,255,255,.22), rgba(98,98,91,.035));
    box-shadow: inset 0 1px rgba(255,255,255,.52);
  }
  acidify-patch-view .distortion-cell-label {
    display: block; margin-top: 7px; text-align: center;
    color: #55574f; font-size: 6px; font-weight: 900; letter-spacing: 1.15px;
  }
  acidify-patch-view .distortion-power-cell {
    display: flex; flex-direction: column; align-items: center;
  }
  acidify-patch-view .distortion-power-cell > small {
    margin-top: 8px; color: #696a63; font-size: 5px; font-weight: 900; letter-spacing: .55px;
  }
  acidify-patch-view .distortion-power.run-switch {
    width: 54px; height: 42px; margin-top: 11px; padding: 4px;
  }
  acidify-patch-view .distortion-power.run-switch button {
    display: flex; align-items: center; justify-content: center; gap: 5px;
    font-size: 7px; letter-spacing: .8px;
  }
  acidify-patch-view .distortion-power button i {
    width: 7px; height: 7px; border-radius: 50%; background: #48140f;
    box-shadow: inset 0 1px rgba(255,255,255,.18);
  }
  acidify-patch-view .distortion-power.is-on button i {
    background: #ff503d; box-shadow: 0 0 5px rgba(255,50,32,.9), inset 0 0 1px #fff;
  }
  acidify-patch-view .distortion-type-cell { padding: 0 7px; }
  acidify-patch-view .distortion-types {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px;
    margin-top: 13px;
  }
  acidify-patch-view .distortion-types button {
    height: 59px; border-radius: 4px; cursor: pointer;
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 7px;
    color: #dddcd3; font-size: 7px; font-weight: 900; letter-spacing: .6px;
    background: linear-gradient(105deg, rgba(255,255,255,.13), transparent 34% 77%, rgba(0,0,0,.25)),
                linear-gradient(#5a5953, #292925);
    border: 1px solid #1a1a17;
    box-shadow: 0 3px 2px rgba(0,0,0,.33), inset 0 1px rgba(255,255,255,.2);
  }
  acidify-patch-view .distortion-types button small {
    color: #aaa9a1; font-size: 5px; letter-spacing: .8px;
  }
  acidify-patch-view .distortion-types button.active {
    transform: translateY(2px); color: #fff0e9; border-color: #75160f;
    background: linear-gradient(#ae3026, #67140f);
    box-shadow: 0 1px 1px rgba(0,0,0,.52), inset 0 2px 4px rgba(52,5,2,.4);
  }
  acidify-patch-view .distortion-types button.active small { color: #ffc0b5; }
  acidify-patch-view .distortion-knob-cell {
    display: flex; align-items: flex-start; justify-content: center; padding-top: 13px;
  }
  acidify-patch-view .distortion-overlay .knob-control { width: 82px; height: 112px; }
  acidify-patch-view .distortion-overlay .dial { width: 61px; height: 61px; }
  acidify-patch-view .distortion-overlay .dial::before,
  acidify-patch-view .distortion-overlay .dial-cap { inset: 6px; }
  acidify-patch-view .distortion-overlay .dial-pointer { top: 3px; height: 16px; }
  acidify-patch-view .distortion-overlay .tick-ring {
    top: -8px; width: 78px; height: 78px;
  }
  acidify-patch-view .distortion-overlay .tick-ring::after {
    left: 37px; transform-origin: 2px 38px;
  }
  acidify-patch-view .distortion-overlay .control-label {
    margin-top: 10px; font-size: 7px; letter-spacing: .8px;
  }
  acidify-patch-view .distortion-overlay .value-label {
    margin-top: 2px; font-size: 7px;
  }
  acidify-patch-view .distortion-overlay footer {
    height: 25px; padding: 4px 12px 0; border-top: 1px solid rgba(69,69,64,.35);
    color: #666760; font-size: 5px; font-weight: 900; letter-spacing: 1.1px;
    text-align: right;
  }
  @media (max-width: 700px), (max-height: 360px) {
    acidify-patch-view .model { font-size: 10px; letter-spacing: 1.35px; }
    acidify-patch-view .computer { font-size: 8px; letter-spacing: 1.45px; }
    acidify-patch-view .bank-title,
    acidify-patch-view .master-head { font-size: 8px; }
    acidify-patch-view .mini-title { font-size: 9px; }
    acidify-patch-view .clock-mode button { font-size: 8px; }
    acidify-patch-view .clock-readout { font-size: 7px; }
    acidify-patch-view .wave-title,
    acidify-patch-view .control-label { font-size: 10px; letter-spacing: .55px; }
    acidify-patch-view .value-label { font-size: 9px; }
    acidify-patch-view .program-title { font-size: 13px; }
    acidify-patch-view .program-context { font-size: 7px; }
    acidify-patch-view .studio-toggle { font-size: 8px; }
    acidify-patch-view .stepper-label { font-size: 8px; }
    acidify-patch-view .step-index,
    acidify-patch-view .step-note { font-size: 10px; }
    acidify-patch-view .edit-caption { font-size: 8px; }
    acidify-patch-view .octave-indicator { font-size: 8px; }
    acidify-patch-view .function-button strong { font-size: 9px; }
    acidify-patch-view .function-button small { font-size: 6.5px; }
    acidify-patch-view .studio-tool-head { font-size: 7px; }
    acidify-patch-view .studio-selection { font-size: 9px; }
    acidify-patch-view .studio-actions button { font-size: 11px; }
    acidify-patch-view .studio-actions button small { font-size: 6.5px; }
    acidify-patch-view .studio-lane-label { font-size: 7px; }
    acidify-patch-view .studio-ruler-group span { font-size: 6px; }
    acidify-patch-view .studio-cell { font-size: 8px; }
    acidify-patch-view .studio-hint { font-size: 6px; }
    acidify-patch-view .distortion-trigger { font-size: 6.5px; }
    acidify-patch-view .distortion-overlay-head strong { font-size: 11px; }
    acidify-patch-view .distortion-status { font-size: 8px; }
    acidify-patch-view .distortion-cell-label { font-size: 7px; }
    acidify-patch-view .distortion-types button { font-size: 8px; }
    acidify-patch-view .distortion-types button small { font-size: 6px; }
  }
</style>
<div class="chassis">
  <div class="panel">
    <i class="screw s1"></i><i class="screw s2"></i><i class="screw s3"></i><i class="screw s4"></i>
    <section class="top-strip">
      <header class="branding">
        <div class="brand"><span class="acid">ACID</span>IFY</div>
        <div class="model">AC-303 PERFORMANCE BASSLINE</div>
        <div class="computer">MONOPHONIC · 4× MODELLED CORE</div>
      </header>
      <div class="transport-bank">
        <div class="bank-title">TRANSPORT</div>
        <div class="tempo-box">
          <div class="mini-title">TEMPO</div>
          ${dial("param9")}
        </div>
        <div class="mode-box">
          <div class="mini-title">PATTERN PLAY</div>
          <div class="control clock-mode" data-param="param49" data-endpoint-id="param49"
            data-min="0" data-max="1" data-step="1" data-init="0" data-control="buttons"
            aria-label="Clock source">
            <button data-value="0" type="button">INT</button>
            <button data-value="1" type="button">DAW</button>
          </div>
          <span class="clock-readout" role="status">INT · 128 BPM</span>
          <span class="run-lamp"></span>
          <div class="control run-switch" data-param="param10" data-endpoint-id="param10" data-min="0" data-max="1" data-step="1" data-init="0" data-control="toggle">
            <button data-value="0">RUN / STOP</button>
            <button data-value="1" hidden>RUN</button>
          </div>
        </div>
      </div>
      <div class="tone-bank">
        <div class="bank-title">SYNTHESIS</div>
        <div class="tone-controls">
          <div class="control waveform" data-param="param7" data-endpoint-id="param7" data-min="0" data-max="1" data-step="1" data-init="0" data-control="buttons">
            <div class="wave-buttons">
              <button data-value="0" aria-label="Saw"><svg viewBox="0 0 28 20" aria-hidden="true"><path d="M2 16L9 4v12l7-12v12l7-12"/></svg></button>
              <button data-value="1" aria-label="Square"><svg viewBox="0 0 28 20" aria-hidden="true"><path d="M2 16V4h10v12h10V4h4"/></svg></button>
            </div>
            <div class="wave-title">WAVEFORM</div>
          </div>
          ${dial("param1")}${dial("param2")}${dial("param3")}${dial("param4")}${dial("param5")}${dial("param6")}
        </div>
      </div>
      <div class="volume-bank">
        <div class="master-head">
          <span>MASTER</span>
          <button class="distortion-trigger" type="button" aria-expanded="false"
            aria-controls="distortion-overlay" aria-label="Distortion disabled; open controls"
            title="Distortion · OFF"><i class="distortion-led"></i><span>DIST</span></button>
          <span class="master-output"><span class="output-lamp"></span>OUT</span>
        </div>
        ${dial("param8")}
      </div>
    </section>

    <div class="distortion-scrim" hidden aria-hidden="true">
      <section class="distortion-overlay" id="distortion-overlay" role="dialog" aria-modal="true"
        aria-labelledby="distortion-title">
        <header class="distortion-overlay-head">
          <div>
            <strong id="distortion-title">DISTORTION STAGE</strong>
            <span class="distortion-status" role="status">TRUE BYPASS</span>
          </div>
          <button class="distortion-close" type="button" aria-label="Close distortion controls">×</button>
        </header>
        <div class="distortion-overlay-body">
          <div class="distortion-power-cell">
            <span class="distortion-cell-label">POWER</span>
            <div class="control run-switch distortion-power" data-param="param45" data-endpoint-id="param45"
              data-min="0" data-max="1" data-step="1" data-init="0" data-control="toggle">
              <button data-value="1" type="button"><i></i><span>ON</span></button>
            </div>
            <small>CLEAN BYPASS</small>
          </div>
          <div class="distortion-type-cell">
            <span class="distortion-cell-label">CHARACTER</span>
            <div class="control distortion-types" data-param="param46" data-endpoint-id="param46"
              data-min="0" data-max="2" data-step="1" data-init="0" data-control="buttons">
              <button data-value="0" type="button">PURE<small>SUBTLE</small></button>
              <button data-value="1" type="button">MACKIE<small>1202</small></button>
              <button data-value="2" type="button">PHONO<small>RIAA</small></button>
            </div>
          </div>
          <div class="distortion-knob-cell">${dial("param47")}</div>
          <div class="distortion-knob-cell">${dial("param48")}</div>
        </div>
        <footer>POST OUTPUT · 4× OVERSAMPLED · TYPE CHANGES CROSSFADED</footer>
      </section>
    </div>

    <section class="program-strip">
      <div class="program-header">
        <div class="program-title">
          <b>16 STEP</b><span>PATTERN PROGRAMMER</span>
          <small class="program-context">CLASSIC PROGRAMMING</small>
        </div>
        <div class="bassline-visual" role="img" aria-label="Live 16-step bassline pitch contour"
          data-tooltip="Live pitch contour for all 16 steps. Red nodes are accented, amber links are slides, dim nodes are rests, and the bright ring follows playback.">
          <span>PITCH MAP</span>
          <svg viewBox="0 0 240 30" aria-hidden="true" focusable="false">
            <path class="bassline-path"></path>
            <path class="bassline-slide-path"></path>
            ${basslineNodes}
          </svg>
        </div>
        <div class="utility">
          <button class="studio-toggle" aria-pressed="false" aria-label="Open Studio edit mode" aria-keyshortcuts="M"
            title="Switch editor · keyboard shortcut M">
            <i></i><span class="classic-label">CLASSIC</span><span class="studio-label">STUDIO</span>
          </button>
          <div class="control swing-control" data-param="param50" data-endpoint-id="param50" data-min="0" data-max="100" data-step="1" data-init="0" data-control="stepper">
            <div class="stepper"><button data-step="-1">−</button><span class="stepper-value">--</span><button data-step="1">+</button></div>
            <div class="stepper-label">SWING</div>
          </div>
          <div class="control" data-param="param11" data-endpoint-id="param11" data-min="1" data-max="16" data-step="1" data-init="16" data-control="stepper">
            <div class="stepper"><button data-step="-1">−</button><span class="stepper-value">--</span><button data-step="1">+</button></div>
            <div class="stepper-label">LENGTH</div>
          </div>
          <div class="control" data-param="param12" data-endpoint-id="param12" data-min="24" data-max="60" data-step="1" data-init="36" data-control="stepper">
            <div class="stepper"><button data-step="-1">−</button><span class="stepper-value">--</span><button data-step="1">+</button></div>
            <div class="stepper-label">ROOT</div>
          </div>
        </div>
      </div>
      <div class="step-row">${steps}</div>
      <div class="editor classic-editor" aria-hidden="false">
        <div class="edit-status">
          <span class="edit-caption">SELECT STEP · CHOOSE KEY</span>
          <strong class="edit-readout">--</strong>
          <span class="octave-indicator"></span>
        </div>
        <div class="keyboard"><div class="keyboard-keys">${pitchKeys}</div></div>
        <div class="time-controls">
          <button class="function-button" data-transpose="-12" title="Transpose the selected step down one octave."><strong>OCT −</strong><small>TRANSPOSE</small></button>
          <button class="function-button" data-transpose="12" title="Transpose the selected step up one octave."><strong>OCT +</strong><small>TRANSPOSE</small></button>
          <button class="function-button" data-flag="1" title="Toggle the selected step between Gate and Rest."><strong>GATE</strong><small>REST / ON</small></button>
          <button class="function-button" data-flag="2" title="Toggle Accent for the selected step."><strong>ACCENT</strong><small>DYNAMICS</small></button>
          <button class="function-button" data-flag="4" title="Toggle Slide into the next active step."><strong>SLIDE</strong><small>LEGATO</small></button>
          <button class="function-button" data-classic-action="clear-step" title="Reset the selected step to its default pitch and timing state."><strong>CLEAR</strong><small>THIS STEP</small></button>
        </div>
      </div>
      <div class="studio-editor" aria-hidden="true">
        <div class="studio-tools">
          <div class="studio-tool-head">
            <strong class="studio-selection">STEP 01</strong>
            <button class="studio-scale" type="button" aria-label="Generation scale Minor Pentatonic; click for next scale"
              data-tooltip="Generate and Mutate currently use the root-relative Minor Pentatonic scale. Click to choose the next scale.">
              <span>SCALE</span><strong>MIN PENTA</strong>
            </button>
          </div>
          <div class="studio-actions">
            <button data-studio-action="undo" title="Undo (Ctrl/Cmd+Z)">↶<small>UNDO</small></button>
            <button data-studio-action="redo" title="Redo (Ctrl/Cmd+Shift+Z)">↷<small>REDO</small></button>
            <button data-studio-action="copy" title="Copy selected steps">⧉<small>COPY</small></button>
            <button data-studio-action="paste" title="Paste steps">▣<small>PASTE</small></button>
            <button data-studio-action="rotate-left" title="Rotate selection left">◀<small>ROTATE</small></button>
            <button data-studio-action="rotate-right" title="Rotate selection right">▶<small>ROTATE</small></button>
            <button data-studio-action="reverse" title="Reverse the selected step order">⇄<small>REVERSE</small></button>
            <button data-studio-action="pitch-mirror" title="Mirror pitches inside their current range">◇<small>MIRROR</small></button>
            <button data-studio-action="transpose-down" title="Transpose octave down">−12<small>OCT</small></button>
            <button data-studio-action="transpose-up" title="Transpose octave up">+12<small>OCT</small></button>
            <button data-studio-action="select-all" title="Select all steps">16<small>ALL</small></button>
            <button data-studio-action="generate" title="Generate a new scale-aware phrase">✣<small>GENERATE</small></button>
            <button data-studio-action="mutate" title="Mutate the phrase gently within the selected scale">≈<small>MUTATE</small></button>
            <button data-studio-action="rest" title="Toggle gate/rest for selection">—<small>REST</small></button>
            <button data-studio-action="choose-note" aria-haspopup="dialog"
              title="Choose an exact note for the selected steps">♪<small>NOTE</small></button>
          </div>
          <span class="studio-toast" role="status"></span>
        </div>
        <div class="studio-matrix" aria-label="Studio step editor">
          <div class="studio-ruler"><span></span><div class="studio-lane-cells">${studioRuler}</div></div>
          ${studioLanes}
          <span class="studio-hint">RIGHT/DOUBLE CLICK NOTE · WHEEL ±1 · SHIFT SELECT · M VIEW</span>
        </div>
      </div>
    </section>
    <button class="tooltip-toggle" type="button" aria-pressed="true"
      data-tooltip="Turn the English control tooltips on or off.">
      <i>?</i><span>TIPS</span><strong class="tooltip-toggle-state">ON</strong>
    </button>
    <div class="footer-mark">ACIDIFY 0.7.0 · ANALOG-MODELLED BASSLINE · AMORPH EDITION</div>
  </div>
  <section class="pitch-menu" role="dialog" aria-modal="false" aria-hidden="true"
    aria-labelledby="pitch-menu-title" hidden>
    <header class="pitch-menu-head">
      <div>
        <strong class="pitch-menu-title" id="pitch-menu-title">CHOOSE NOTE</strong>
        <span>DIRECT STEP PITCH · ROOT-RELATIVE RANGE</span>
      </div>
      <button class="pitch-menu-close" type="button" aria-label="Close note chooser">×</button>
    </header>
    <div class="pitch-menu-grid" role="radiogroup" aria-label="Available notes">
      ${pitchChoices}
    </div>
    <footer class="pitch-menu-foot">25 SEMITONES · THREE VISIBLE OCTAVE LEVELS</footer>
  </section>
  <div class="tooltip-bubble" role="tooltip" hidden></div>
</div>`;
  }
}

const ACIDIFY_TAG = "acidify-patch-view";
if (!customElements.get(ACIDIFY_TAG)) customElements.define(ACIDIFY_TAG, AcidifyPatchView);

export default function createPatchView(patchConnection) {
  return new AcidifyPatchView(patchConnection);
}
