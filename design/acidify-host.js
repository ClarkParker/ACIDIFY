// Mount adapter: runs the real ACIDIFYUI.js patch view (from the repo) against a
// simulated Amorph patchConnection so the recreation is the actual product UI.
(function () {
  function createMockConnection() {
    const params = new Map();
    const paramListeners = new Set();
    const endpointListeners = new Map();
    const inits = {
      param1: 0, param2: 0.45, param3: 0.72, param4: 0.68, param5: 0.45, param6: 0.65,
      param7: 0, param8: -6, param9: 128, param10: 0, param11: 16, param12: 36,
      param45: 0, param46: 0, param47: 0.35, param48: 1, param49: 0, param50: 0,
    };
    const pitchDefaults = [0, 0, 7, 0, 12, 10, 7, 3, 0, 0, 12, 7, 10, 5, 3, 7];
    const flagDefaults = [3, 5, 1, 1, 3, 5, 1, 1, 0, 1, 3, 5, 1, 1, 1, 5];
    for (let i = 0; i < 16; i += 1) {
      inits[`param${13 + i}`] = pitchDefaults[i];
      inits[`param${29 + i}`] = flagDefaults[i];
    }
    Object.entries(inits).forEach(([k, v]) => params.set(k, v));

    const emit = (name, value) => {
      (endpointListeners.get(name) || []).forEach(fn => fn(value));
    };

    let step = -1;
    let running = false;
    let timer = null;
    let meter = 0;
    let meterTimer = null;

    const stepDurationMs = () => 60000 / (Number(params.get("param9")) || 128) / 4;

    const tick = () => {
      const length = Math.max(1, Math.round(Number(params.get("param11")) || 16));
      step = (step + 1) % length;
      emit("currentStep", step);
      const flags = Number(params.get(`param${29 + step}`)) || 0;
      if (flags & 1) meter = flags & 2 ? 0.95 : 0.6;
      timer = window.setTimeout(tick, stepDurationMs());
    };

    const startMeter = () => {
      if (meterTimer) return;
      meterTimer = window.setInterval(() => {
        meter = Math.max(0, meter * 0.86);
        emit("meterOut", running ? meter : 0);
      }, 40);
    };

    const setRunning = next => {
      running = Boolean(next);
      if (timer) window.clearTimeout(timer);
      timer = null;
      if (running) {
        step = -1;
        tick();
        startMeter();
      } else {
        step = -1;
        emit("currentStep", -1);
        meter = 0;
        emit("meterOut", 0);
      }
    };

    return {
      addAllParameterListener(fn) { paramListeners.add(fn); },
      removeAllParameterListener(fn) { paramListeners.delete(fn); },
      requestParameterValue(id) {
        const value = params.get(id);
        if (value === undefined) return;
        paramListeners.forEach(fn => fn({ endpointID: id, value }));
      },
      addEndpointListener(name, fn) {
        if (!endpointListeners.has(name)) endpointListeners.set(name, []);
        endpointListeners.get(name).push(fn);
      },
      removeEndpointListener(name, fn) {
        const list = endpointListeners.get(name) || [];
        const index = list.indexOf(fn);
        if (index >= 0) list.splice(index, 1);
      },
      sendEventOrValue(id, value) {
        params.set(id, Number(value));
        if (id === "param10") setRunning(Number(value) >= 0.5);
      },
      sendParameterGestureStart() {},
      sendParameterGestureEnd() {},
      dispose() {
        if (timer) window.clearTimeout(timer);
        if (meterTimer) window.clearInterval(meterTimer);
      },
    };
  }

  class AcidifyClassicHost extends HTMLElement {
    connectedCallback() {
      if (this._mounted) return;
      this._mounted = true;
      this.style.display = "block";
      this.style.width = "1180px";
      this.style.height = "580px";
      this.style.overflow = "hidden";
      // Mount inside a shadow root: the shipped view walks its ancestor chain up to
      // <body> and forces overflow/margin/padding to 0 on every node. The shadow
      // boundary stops that walk (parentElement is null inside the root) so the
      // surrounding document keeps its own layout.
      const root = this.attachShadow({ mode: "open" });
      import("./ACIDIFYUI.js").then(module => {
        const pc = createMockConnection();
        const view = module.default(pc);
        // The shipped view sizes itself to the browser window; pin it to the
        // documented 1180x580 plugin window instead.
        view._doScale = function () {
          this.style.width = "1180px";
          this.style.height = "580px";
          const chassis = this.querySelector(".chassis");
          if (chassis) chassis.style.zoom = 1;
        };
        this._pc = pc;
        this._view = view;
        root.appendChild(view);
      });
    }

    disconnectedCallback() {
      this._pc?.dispose?.();
      this._mounted = false;
    }
  }

  if (!customElements.get("acidify-classic-host")) {
    customElements.define("acidify-classic-host", AcidifyClassicHost);
  }
})();
