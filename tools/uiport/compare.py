#!/usr/bin/env python3
"""Zonenvergleich Soll (ref_*) gegen Ist (act_*): 4x4-Raster, Metriken, Tripel-Bilder."""
import json
import os
import sys

import numpy as np
from PIL import Image

SP = os.environ.get("ACIDIFY_UIPORT_SP",
                    "/tmp/claude-0/-home-user/0aabc4bd-199f-5b28-a7c3-419feec50919/scratchpad")
SHOTS = os.path.join(SP, "shots")
OUT = os.path.join(SP, "cmp")
os.makedirs(OUT, exist_ok=True)

STATES = sys.argv[1:] or ["classic", "studio", "dist", "mods"]
GRID = (4, 4)  # cols x rows -> 16 zones, 295x145 each

report = {}
for state in STATES:
    ref = np.asarray(Image.open(f"{SHOTS}/ref_{state}.png").convert("RGB"), dtype=np.int16)
    act = np.asarray(Image.open(f"{SHOTS}/act_{state}.png").convert("RGB"), dtype=np.int16)
    assert ref.shape == act.shape == (580, 1180, 3), (ref.shape, act.shape)
    diff = np.abs(ref - act).max(axis=2)  # max channel delta per pixel
    zones = []
    zw, zh = 1180 // GRID[0], 580 // GRID[1]
    for row in range(GRID[1]):
        for col in range(GRID[0]):
            n = row * GRID[0] + col + 1
            y0, y1 = row * zh, (row + 1) * zh
            x0, x1 = col * zw, (col + 1) * zw
            zd = diff[y0:y1, x0:x1]
            pct = float((zd > 24).mean() * 100)   # % Pixel mit sichtbarem Delta
            mean = float(zd.mean())
            zones.append({"zone": n, "box": [x0, y0, x1, y1],
                          "pctVisible": round(pct, 2), "meanDelta": round(mean, 2)})
            # Tripel: Soll | Ist | Heatmap
            r = Image.fromarray(ref[y0:y1, x0:x1].astype(np.uint8))
            a = Image.fromarray(act[y0:y1, x0:x1].astype(np.uint8))
            heat = np.zeros((zh, zw, 3), dtype=np.uint8)
            heat[..., 0] = np.clip(zd * 3, 0, 255)
            h = Image.fromarray(heat)
            trip = Image.new("RGB", (zw * 3 + 8, zh), (40, 40, 40))
            trip.paste(r, (0, 0)); trip.paste(a, (zw + 4, 0)); trip.paste(h, (2 * zw + 8, 0))
            trip.save(f"{OUT}/{state}_z{n:02d}.png")
    # Ganzbild-Overlay
    full = Image.new("RGB", (1180, 580 * 2 + 4), (40, 40, 40))
    full.paste(Image.fromarray(ref.astype(np.uint8)), (0, 0))
    full.paste(Image.fromarray(act.astype(np.uint8)), (0, 584))
    full.save(f"{OUT}/{state}_full.png")
    report[state] = sorted(zones, key=lambda z: -z["pctVisible"])

with open(f"{OUT}/report.json", "w") as fh:
    json.dump(report, fh, indent=1)
for state, zones in report.items():
    worst = ["z%02d %.1f%%" % (z["zone"], z["pctVisible"]) for z in zones[:8]]
    print(state, " ".join(worst))
