// ACIDIFY — hardware-inspired Amorph instrument UI.
// WINDOW SIZE: 1180x580
//
// Single-file light-DOM Web Component. No imports, fonts, images or CDN assets.

const ACIDIFY_GLOBALS = [
  { id: "param1",  type: "dial",    label: "TUNING",       min: -1, max: 1,   step: 0.01, init: 0,    format: v => `${v >= 0 ? "+" : ""}${v.toFixed(2)}` },
  { id: "param2",  type: "dial",    label: "CUT OFF FREQ", min: 0,  max: 1,   step: 0.001, init: 0.45, format: v => `${Math.round(v * 100)}` },
  { id: "param3",  type: "dial",    label: "RESONANCE",    min: 0,  max: 1,   step: 0.001, init: 0.72, format: v => `${Math.round(v * 100)}` },
  { id: "param4",  type: "dial",    label: "ENV MOD",      min: 0,  max: 1,   step: 0.001, init: 0.68, format: v => `${Math.round(v * 100)}` },
  { id: "param5",  type: "dial",    label: "DECAY",        min: 0,  max: 1,   step: 0.001, init: 0.45, format: v => `${Math.round(v * 100)}` },
  { id: "param6",  type: "dial",    label: "ACCENT",       min: 0,  max: 1,   step: 0.001, init: 0.65, format: v => `${Math.round(v * 100)}` },
  { id: "param7",  type: "toggle",  label: "WAVEFORM",     min: 0,  max: 1,   step: 1, init: 0 },
  { id: "param8",  type: "dial",    label: "VOLUME",       min: -36, max: 0,  step: 0.1, init: -6,    format: v => `${v.toFixed(1)} dB` },
  { id: "param9",  type: "dial",    label: "TEMPO",        min: 40, max: 300, step: 1, init: 128,     format: v => `${Math.round(v)}` },
  { id: "param10", type: "toggle",  label: "RUN",          min: 0,  max: 1,   step: 1, init: 0 },
  { id: "param11", type: "stepper", label: "LENGTH",       min: 1,  max: 16,  step: 1, init: 16,      format: v => `${Math.round(v)}` },
  { id: "param12", type: "stepper", label: "ROOT",         min: 24, max: 60,  step: 1, init: 36,      format: v => noteName(Math.round(v)) },
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

function noteName(note) {
  const n = Math.max(0, Math.min(127, Math.round(Number(note) || 0)));
  return `${NOTE_NAMES[n % 12]}${Math.floor(n / 12) - 1}`;
}

function clamp(value, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

class DialControl {
  constructor({ patchConnection, node, config }) {
    this.pc = patchConnection;
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

    this.onPointerDown = e => {
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
      this.pc.sendParameterGestureStart?.(this.config.id);
      this.showFeedback();
      this.setValue(this.config.init, true);
      this.pc.sendParameterGestureEnd?.(this.config.id);
    };
    this.onWheel = e => {
      e.preventDefault();
      const increment = this.config.step || (this.config.max - this.config.min) / 100;
      this.pc.sendParameterGestureStart?.(this.config.id);
      this.showFeedback();
      this.setValue(this.value + (e.deltaY < 0 ? increment : -increment) * (e.shiftKey ? 0.2 : 1), true);
      this.pc.sendParameterGestureEnd?.(this.config.id);
    };
    this.onKeyDown = e => {
      const increment = this.config.step || (this.config.max - this.config.min) / 100;
      let next = null;
      if (e.key === "ArrowUp" || e.key === "ArrowRight") next = this.value + increment * (e.shiftKey ? 0.2 : 1);
      if (e.key === "ArrowDown" || e.key === "ArrowLeft") next = this.value - increment * (e.shiftKey ? 0.2 : 1);
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

  setValue(raw, notify) {
    if (this.dragging && !notify) return;
    const { min, max, step } = this.config;
    let value = clamp(raw, min, max);
    if (step > 0) value = Math.round(value / step) * step;
    value = clamp(value, min, max);
    this.value = value;
    const norm = (value - min) / (max - min || 1);
    this.node.style.setProperty("--norm", norm);
    this.dial.setAttribute("aria-valuenow", `${value}`);
    const formatted = this.config.format(value);
    this.dial.setAttribute("aria-valuetext", formatted);
    this.valueLabel.textContent = formatted;
    if (notify) this.pc.sendEventOrValue(this.config.id, value);
  }
}

class ToggleControl {
  constructor({ patchConnection, node, config, onChange }) {
    this.pc = patchConnection;
    this.node = node;
    this.config = config;
    this.onChange = onChange;
    this.value = config.init;
    this.buttons = [...node.querySelectorAll("[data-value]")];
    this.onClick = e => {
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
    if (notify) this.pc.sendEventOrValue(this.config.id, value);
  }
}

class StepperControl {
  constructor({ patchConnection, node, config, onChange }) {
    this.pc = patchConnection;
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
    this.onChange?.(value);
    if (notify) this.pc.sendEventOrValue(this.config.id, value);
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
    this._history = [];
    this._future = [];
    this._clipboard = null;
    this._paintState = null;
    this._paramListener = null;
    this._stepListener = null;
    this._meterListener = null;
    this._resizeFn = null;
    this._resizeObserver = null;
    this._scaleTimer = null;
    this._meter = 0;
    this._studioPointerEnd = null;
    this._studioKeyDown = null;
    this.innerHTML = this.getHTML();
  }

  connectedCallback() {
    this._buildControls();
    this._wireSteps();
    this._wireKeyboard();
    this._wireStudio();
    this._renderStepEditor();
    this._renderStudio();

    this._paramListener = ({ endpointID, value }) => {
      this._values.set(endpointID, Number(value));
      const control = this._controls.get(endpointID);
      if (control) control.setValue(value, false);
      if (this._isStepParam(endpointID)) {
        this._renderStepStrip();
        this._renderStepEditor();
        this._renderStudio();
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

    window.__amorphProcessMidi = messages => {
      messages.forEach(({ s, d1, d2 }) => {
        const kind = s & 0xf0;
        if (kind === 0x90 && d2 > 0) this._showMidiNote(d1, true);
        else if (kind === 0x80 || (kind === 0x90 && d2 === 0)) this._showMidiNote(d1, false);
      });
    };

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
  }

  disconnectedCallback() {
    if (this._paramListener) this.pc.removeAllParameterListener(this._paramListener);
    if (this._stepListener) this.pc.removeEndpointListener("currentStep", this._stepListener);
    if (this._meterListener) this.pc.removeEndpointListener("meterOut", this._meterListener);
    window.removeEventListener("resize", this._resizeFn);
    this._resizeObserver?.disconnect();
    if (this._scaleTimer) window.clearInterval(this._scaleTimer);
    if (this._toastTimer) window.clearTimeout(this._toastTimer);
    if (this._studioKeyDown) this.removeEventListener("keydown", this._studioKeyDown);
    delete window.__amorphProcessMidi;
  }

  _buildControls() {
    ACIDIFY_GLOBALS.forEach(config => {
      const node = this.querySelector(`.control[data-param="${config.id}"]`);
      if (!node) return;
      let control;
      if (config.type === "dial") {
        control = new DialControl({ patchConnection: this.pc, node, config });
      } else if (config.type === "toggle") {
        control = new ToggleControl({
          patchConnection: this.pc,
          node,
          config,
          onChange: value => {
            if (config.id === "param10") {
              this.querySelector(".run-lamp")?.classList.toggle("lit", value >= 0.5);
            }
          },
        });
      } else {
        control = new StepperControl({
          patchConnection: this.pc,
          node,
          config,
          onChange: () => {
            if (config.id === "param12") this._renderStepEditor();
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

    this.querySelectorAll("[data-studio-action]").forEach(button => {
      button.addEventListener("click", () => this._runStudioAction(button.dataset.studioAction));
    });

    this.querySelectorAll(".studio-cell").forEach(cell => {
      const index = Number(cell.dataset.step);
      const kind = cell.dataset.kind;
      cell.addEventListener("pointerdown", event => {
        if (!this._studioMode) return;
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

  _setStudioMode(enabled) {
    this._studioMode = Boolean(enabled);
    this.classList.toggle("studio-mode", this._studioMode);
    const toggle = this.querySelector(".studio-toggle");
    toggle?.setAttribute("aria-pressed", `${this._studioMode}`);
    toggle?.setAttribute("aria-label", this._studioMode ? "Return to Classic mode" : "Open Studio edit mode");
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
        if (notify) this.pc.sendEventOrValue(pitchID, pitch);
      }
      if (flags !== this._stepFlags(index)) {
        this._values.set(flagsID, flags);
        if (notify) this.pc.sendEventOrValue(flagsID, flags);
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
    } else if (action === "randomize") {
      this._mutatePattern("Smart randomize", draft => {
        selected.forEach(index => {
          draft[index].pitch = Math.floor(Math.random() * 25);
          draft[index].flags = 1 | (Math.random() < .28 ? 2 : 0) | (Math.random() < .2 ? 4 : 0);
        });
      });
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
    const selection = this.querySelector(".studio-selection");
    if (selection) {
      selection.textContent = selected.length === 1
        ? `STEP ${String(selected[0] + 1).padStart(2, "0")}`
        : `${selected.length} STEPS`;
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
    if (notify) this.pc.sendEventOrValue(id, value);
    this._renderStepStrip();
    this._renderStepEditor();
    this._renderStudio();
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
      node.querySelector(".step-note").textContent = NOTE_NAMES[this._stepPitch(index) % 12];
    });
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
    this.querySelector(".octave-indicator")?.classList.toggle("high", pitch >= 12);
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
      if (kind === "pitch") cell.textContent = NOTE_NAMES[this._stepPitch(index) % 12].replace("#", "♯");
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
        <div class="control knob-control" data-param="${c.id}" data-min="${c.min}" data-max="${c.max}" data-step="${c.step}" data-init="${c.init}" data-control="dial">
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
            <button class="sequence-step" data-step="${index}" aria-label="Step ${index + 1}">
              <span class="step-led"></span><span class="step-index">${index + 1}</span><span class="step-note">--</span>
            </button>`;
        }).join("")}
      </div>`).join("");
    const pitchKeys = NOTE_NAMES.map((name, index) => `
      <button class="pitch-key ${name.includes("#") ? "black-key" : "white-key"}" data-pitch="${index}">
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
  acidify-patch-view .utility {
    display: flex; align-items: center; gap: 13px; height: 100%;
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
    content: "A"; position: absolute; left: 5px; bottom: 4px; color: #a91e17; font-size: 7px; font-weight: 900;
  }
  acidify-patch-view .sequence-step.sliding::after {
    content: "↗"; position: absolute; right: 5px; bottom: 3px; color: #222; font-size: 10px; font-weight: 900;
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
    display: grid; grid-template-columns: 292px 1fr; gap: 13px;
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
  acidify-patch-view .studio-actions {
    display: grid; grid-template-columns: repeat(6, 1fr); gap: 5px; align-content: start;
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
</style>
<div class="chassis">
  <div class="panel">
    <i class="screw s1"></i><i class="screw s2"></i><i class="screw s3"></i><i class="screw s4"></i>
    <section class="top-strip">
      <header class="branding">
        <div class="brand"><span class="acid">ACID</span>IFY</div>
        <div class="model">AC-303 BASS LINE</div>
        <div class="computer">COMPUTER CONTROLLED</div>
      </header>
      <div class="transport-bank">
        <div class="bank-title">TRANSPORT</div>
        <div class="tempo-box">
          <div class="mini-title">TEMPO</div>
          ${dial("param9")}
        </div>
        <div class="mode-box">
          <div class="mini-title">PATTERN PLAY</div>
          <span class="run-lamp"></span>
          <div class="control run-switch" data-param="param10" data-min="0" data-max="1" data-step="1" data-init="0" data-control="toggle">
            <button data-value="0">RUN / STOP</button>
            <button data-value="1" hidden>RUN</button>
          </div>
        </div>
      </div>
      <div class="tone-bank">
        <div class="bank-title">SYNTHESIS</div>
        <div class="tone-controls">
          <div class="control waveform" data-param="param7" data-min="0" data-max="1" data-step="1" data-init="0" data-control="buttons">
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
          <span class="master-output"><span class="output-lamp"></span>OUT</span>
        </div>
        ${dial("param8")}
      </div>
    </section>

    <section class="program-strip">
      <div class="program-header">
        <div class="program-title">
          <b>16 STEP</b><span>PATTERN PROGRAMMER</span>
          <small class="program-context">CLASSIC PROGRAMMING</small>
        </div>
        <div class="utility">
          <button class="studio-toggle" aria-pressed="false" aria-label="Open Studio edit mode" aria-keyshortcuts="M"
            title="Switch editor · keyboard shortcut M">
            <i></i><span class="classic-label">CLASSIC</span><span class="studio-label">STUDIO</span>
          </button>
          <div class="control" data-param="param11" data-min="1" data-max="16" data-step="1" data-init="16" data-control="stepper">
            <div class="stepper"><button data-step="-1">−</button><span class="stepper-value">--</span><button data-step="1">+</button></div>
            <div class="stepper-label">LENGTH</div>
          </div>
          <div class="control" data-param="param12" data-min="24" data-max="60" data-step="1" data-init="36" data-control="stepper">
            <div class="stepper"><button data-step="-1">−</button><span class="stepper-value">--</span><button data-step="1">+</button></div>
            <div class="stepper-label">ROOT</div>
          </div>
        </div>
      </div>
      <div class="step-row">${steps}</div>
      <div class="editor classic-editor" aria-hidden="false">
        <div class="edit-status">
          <span class="edit-caption">STEP / PITCH</span>
          <strong class="edit-readout">--</strong>
          <span class="octave-indicator"></span>
        </div>
        <div class="keyboard"><div class="keyboard-keys">${pitchKeys}</div></div>
        <div class="time-controls">
          <button class="function-button" data-transpose="-12"><strong>OCT −</strong><small>TRANSPOSE</small></button>
          <button class="function-button" data-transpose="12"><strong>OCT +</strong><small>TRANSPOSE</small></button>
          <button class="function-button" data-flag="1"><strong>GATE</strong><small>REST / ON</small></button>
          <button class="function-button" data-flag="2"><strong>ACCENT</strong><small>DYNAMICS</small></button>
          <button class="function-button" data-flag="4"><strong>SLIDE</strong><small>LEGATO</small></button>
          <button class="function-button" data-classic-action="clear-step"><strong>CLEAR</strong><small>THIS STEP</small></button>
        </div>
      </div>
      <div class="studio-editor" aria-hidden="true">
        <div class="studio-tools">
          <div class="studio-tool-head">
            <strong class="studio-selection">STEP 01</strong>
            <span>SMART EDIT</span>
          </div>
          <div class="studio-actions">
            <button data-studio-action="undo" title="Undo (Ctrl/Cmd+Z)">↶<small>UNDO</small></button>
            <button data-studio-action="redo" title="Redo (Ctrl/Cmd+Shift+Z)">↷<small>REDO</small></button>
            <button data-studio-action="copy" title="Copy selected steps">⧉<small>COPY</small></button>
            <button data-studio-action="paste" title="Paste steps">▣<small>PASTE</small></button>
            <button data-studio-action="rotate-left" title="Rotate selection left">◀<small>ROTATE</small></button>
            <button data-studio-action="rotate-right" title="Rotate selection right">▶<small>ROTATE</small></button>
            <button data-studio-action="transpose-down" title="Transpose octave down">−12<small>OCT</small></button>
            <button data-studio-action="transpose-up" title="Transpose octave up">+12<small>OCT</small></button>
            <button data-studio-action="select-all" title="Select all steps">16<small>ALL</small></button>
            <button data-studio-action="randomize" title="Smart-randomize selection">✣<small>RAND</small></button>
            <button data-studio-action="rest" title="Toggle gate/rest for selection">—<small>REST</small></button>
          </div>
          <span class="studio-toast" role="status"></span>
        </div>
        <div class="studio-matrix" aria-label="Studio step editor">
          <div class="studio-ruler"><span></span><div class="studio-lane-cells">${studioRuler}</div></div>
          ${studioLanes}
          <span class="studio-hint">DRAG PAINT · SHIFT SELECT · WHEEL NOTE · M VIEW</span>
        </div>
      </div>
    </section>
    <div class="footer-mark">ANALOG-MODELLED BASSLINE · AMORPH EDITION</div>
  </div>
</div>`;
  }
}

const ACIDIFY_TAG = "acidify-patch-view";
if (!customElements.get(ACIDIFY_TAG)) customElements.define(ACIDIFY_TAG, AcidifyPatchView);

export default function createPatchView(patchConnection) {
  return new AcidifyPatchView(patchConnection);
}
