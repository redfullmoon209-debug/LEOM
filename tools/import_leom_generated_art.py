"""Import separately AI-generated art into the LEOM Unity project as real alpha PNGs.
This never crops a sprite sheet: each source URL is a single independently generated image.
Python only removes the solid white matte behind the artwork; it does not draw UI art.
"""
from __future__ import annotations
import io
import json
import pathlib
import urllib.request
import numpy as np
from PIL import Image, ImageStat

ROOT = pathlib.Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "ArtSource" / "leom-single-assets.json"
OUT = ROOT / "Assets" / "LEOM" / "Resources" / "LEOM" / "UI"
OUT.mkdir(parents=True, exist_ok=True)
assets = json.loads(MANIFEST.read_text(encoding="utf8"))
assert len(assets) >= 8, "Expected multiple independently generated assets"
for entry in assets:
    name = entry["name"]
    assert name.replace("_", "").isalnum(), name
    print("Downloading independent image for", name, flush=True)
    request = urllib.request.Request(entry["url"], headers={"User-Agent": "LEOM-AssetImporter/1.0"})
    with urllib.request.urlopen(request, timeout=65) as resp:
        raw = resp.read(12 * 1024 * 1024)
    assert len(raw) > 5000 and len(raw) < 12 * 1024 * 1024, "Unexpected source image size"
    img = Image.open(io.BytesIO(raw))
    img.load()
    rgb = np.asarray(img.convert("RGB"), dtype=np.uint8)
    # White matte removal for a *single independently generated object*.
    # White and nearly-white pixels become transparent, including the interior
    # of an empty gold outline. Never crop, tile, collage, or re-draw content.
    f = rgb.astype(np.float32)
    distance = np.sqrt(np.sum((255.0 - f) ** 2, axis=2))
    alpha = np.clip((distance - 22.0) / 60.0 * 255.0, 0.0, 255.0).astype(np.uint8)
    # Prevent white JPEG fringe from becoming a visible white halo.
    alpha[distance < 18.0] = 0
    result = np.dstack((rgb, alpha))
    outpath = OUT / (name + ".png")
    Image.fromarray(result, "RGBA").save(outpath, optimize=True)
    opaque = float(np.count_nonzero(alpha > 190)) / float(alpha.size)
    clear = float(np.count_nonzero(alpha < 40)) / float(alpha.size)
    assert 0.01 < opaque < 0.98, "Expected a single object isolated on white background: " + name
    assert clear > 0.02, "Output PNG has no transparent area: " + name
    print("READY", outpath.relative_to(ROOT), img.size, "opaque", round(opaque, 3), "clear", round(clear, 3), flush=True)
print("PASS: independent image inputs, RGBA PNG outputs; original atlas never cropped")
