repo: ClarkParker/ACIDIFY
branch: claude/acidify-303-dsp-b765ij

## Last sync

date: 2026-07-27T09:40:00Z

### Updated in this project

- MOD overlay built out with the nine real circuit-mod parameters from `docs/MODS.md` (param51–param59).
- All 27 controls now carry the Amorph contract: `.control[data-param][data-endpoint-id][data-min][data-max][data-step][data-init][data-control]`.
- Dial nodes restructured to `.dial` + `.value-label` + `.control-label` so `_buildControls` can attach without markup changes.
- Waveform, transport, clock and distortion toggles carry `[data-value]` children as `ToggleControl` expects.
- Mod amount mirrors: engraved slot sliders under CUTOFF and ACCENT, shown while Overdrive / Soft Attack are on.

## Screen map

| Screen / area | Repo source |
|---|---|
| Deck A tone knobs, waveform, master, output | `ACIDIFYUI.js` → `ACIDIFY_GLOBALS` param1–param8 |
| Tempo, clock, transport, swing, length, root | `ACIDIFYUI.js` → param9–param12, param49, param50 |
| Distortion overlay | `ACIDIFYUI.js` → param45–param48, `getHTML()` distortion section |
| Circuit mods overlay | `docs/MODS.md` + `ACIDIFY_GLOBALS` param51–param59 |
| Step programmer, studio matrix | `ACIDIFYUI.js` → `_renderStepStrip`, `_renderStudio` (step state is not a global param) |

## Notes for the port

- `DialControl` writes `--norm` / `--default-norm` on the `.control` node and fills `.value-label` itself. The design rotates its pointer with an inline `rotate(...)` value instead — when porting, drive the pointer from `var(--norm)` and drop the design's own value binding.
- Step pitch, gate, accent and slide are outside `ACIDIFY_GLOBALS`; the stable step-parameter contract is not documented in the repo. Needed before the step grid can be wired.
- **Mirror nodes.** The slot sliders under CUTOFF and ACCENT edit `param52` / `param59` but deliberately carry NO `data-param` — only `data-mirrors="param52"` / `"param59"` plus `data-knob`. The endpoint owner is the Amount dial inside the CIRCUIT MODS overlay, so `_buildControls`' single-`querySelector` lookup resolves unambiguously. In the port, wire the mirror by reading the owning control's value and pushing gestures through the same endpoint — do not register it as a second control.
- The classic view shares `scale` with studio but never applies it — deliberate, so no notes are locked in classic.
