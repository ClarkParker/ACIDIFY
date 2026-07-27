#!/usr/bin/env python3
"""Bereichs-Crops (Soll oben / Ist unten) für die Analyse-Agenten."""
import os
from PIL import Image

SP = "/tmp/claude-0/-home-user/0aabc4bd-199f-5b28-a7c3-419feec50919/scratchpad"
OUT = os.path.join(SP, "areas")
os.makedirs(OUT, exist_ok=True)

AREAS = {
    "brand":     ("classic", 0, 0, 230, 180),
    "osc":       ("classic", 230, 0, 400, 180),
    "toneknobs": ("classic", 395, 0, 950, 180),
    "master":    ("classic", 940, 0, 1180, 180),
    "tempo":     ("classic", 0, 180, 530, 292),
    "steppers":  ("classic", 525, 180, 840, 292),
    "filterresp":("classic", 835, 180, 1180, 292),
    "progheader":("classic", 0, 292, 1180, 340),
    "steprow":   ("classic", 0, 335, 1180, 445),
    "editor":    ("classic", 0, 440, 1180, 580),
    "studioleft":("studio", 0, 330, 850, 580),
    "studioright":("studio", 840, 330, 1180, 580),
    "distov":    ("dist", 580, 0, 1180, 200),
    "modsov":    ("mods", 380, 0, 1180, 320),
}
for name, (state, x0, y0, x1, y1) in AREAS.items():
    ref = Image.open(f"{SP}/shots/ref_{state}.png").crop((x0, y0, x1, y1))
    act = Image.open(f"{SP}/shots/act_{state}.png").crop((x0, y0, x1, y1))
    w, h = ref.size
    pair = Image.new("RGB", (w, h * 2 + 6), (30, 120, 30))
    pair.paste(ref, (0, 0))
    pair.paste(act, (0, h + 6))
    pair.save(f"{OUT}/{name}.png")
    print(name, w, h)
