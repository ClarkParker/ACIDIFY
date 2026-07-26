# Claude-Design-Export — ACIDIFY GUI

Export der Design-Session (Mod-Overlay-Entwurf). `ACIDIFY GUI.dc.html` läuft
auf `support.js` (dc-runtime) mit `acidify-host.js` als simulierter
Amorph-Verbindung. `github.md` enthält die Portierungsnotizen der Session.

**Portiert nach `ACIDIFYUI.js`:** das CIRCUIT-MODS-Overlay (param51–59,
MODS-Trigger neben DIST, Lampe, Statuszeile, Escape/Scrim-Schließen) — geprüft
in `tools/ui_smoke_test.mjs`. Noch nicht portiert: die Spiegel-Slider unter
CUTOFF/ACCENT (`data-mirrors`, siehe github.md) und die Feinoptik des Entwurfs.

Die Session-Screenshots (`uploads/`, ~14 MB) sind bewusst nicht eingecheckt.
