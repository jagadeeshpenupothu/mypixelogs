#!/usr/bin/env python3
"""Prepares one of our logos (public/logos/<slug>/<slug>.png) for a stationery design.

  python3 scripts/designs/logo_asset.py <logo-slug> public/flyers/<name>.webp [--mark-only]

Trims empty space; --mark-only also cuts everything below the first empty band under the main mark (small
taglines and ground shadows that disappear on dark backgrounds)."""
import sys

import numpy as np
from PIL import Image

slug, out = sys.argv[1], sys.argv[2]
im = Image.open(f"public/logos/{slug}/{slug}.png").convert("RGBA")
im = im.crop(im.getbbox())
if "--mark-only" in sys.argv:
    rows = (np.array(im)[:, :, 3] > 40).sum(1)
    start = int(len(rows) * 0.55)
    blank = [y for y in range(start, len(rows)) if rows[y] == 0]
    if blank:
        im = im.crop((0, 0, im.width, blank[0]))
        im = im.crop(im.getbbox())
im.thumbnail((1400, 1400))
im.save(out, quality=92, method=6)
print(f"{out} {im.width}x{im.height} (aspect {im.width / im.height:.3f})")
