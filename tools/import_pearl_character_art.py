"""Import independently generated pearl character UI parts. Never crop source sprites."""
from __future__ import annotations

import io
import json
import pathlib
import urllib.request
from PIL import Image, ImageDraw

ROOT = pathlib.Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "ArtSource" / "pearl-character-assets.json"
TARGET = ROOT / "Assets" / "LEOM" / "Resources" / "LEOM" / "UI"
TARGET.mkdir(parents=True, exist_ok=True)

art = json.loads(MANIFEST.read_text(encoding="utf-8"))
allowed = {"pearl_character_window", "pearl_equipment_slot"}
assert len(art) == len(allowed) and {x["name"] for x in art} == allowed
for part in art:
    name = part["name"]
    request = urllib.request.Request(part["url"], headers={"User-Agent": "LEOM-PearlUI-Importer/1.0"})
    with urllib.request.urlopen(request, timeout=70) as response:
        raw = response.read(22 * 1024 * 1024)
    assert 5000 < len(raw) < 22 * 1024 * 1024, f"{name}: invalid download size"
    image = Image.open(io.BytesIO(raw)).convert("RGBA")
    assert image.width >= 900 and image.height >= 900, f"{name}: image too small"
    if image.getchannel("A").getextrema()[0] == 255:
        # An occasional image generator produces a solid white matte instead of real alpha.
        # Remove only the background touching a canvas corner (never cut or tile artwork).
        corner = image.getpixel((0, 0))
        other = [image.getpixel((image.width - 1, 0)),
                 image.getpixel((0, image.height - 1)),
                 image.getpixel((image.width - 1, image.height - 1))]
        if any(sum(abs(c[i] - corner[i]) for i in range(3)) > 60 for c in other):
            raise ValueError(name + ": no alpha and irregular corner background; manual review required")
        for point in [(0, 0), (image.width-1, 0),
                      (0, image.height-1), (image.width-1, image.height-1)]:
            ImageDraw.floodfill(image, point, (0, 0, 0, 0), thresh=22)
    low, high = image.getchannel("A").getextrema()
    assert low == 0 and high >= 190, f"{name}: no real transparency"
    path = TARGET / (name + ".png")
    image.save(path, "PNG", optimize=True)
    print(f"OK {path.relative_to(ROOT)} {image.width}x{image.height} alpha={low}..{high}")
print("PASS: two independently generated pearl UI PNGs; no reference atlas cropping")
