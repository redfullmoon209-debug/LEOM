# LEOM Royal Red/Gold PNG art — individually generated layers

The user's chosen visual reference is the original glossy crimson + **hairline gold trim** UI (not a new color or redesigned layout).

- Images are generated individually from descriptions of this established style; **no crops of the atlas are used**.
- `ArtSource/leom-single-assets.json` lists **10 original one-piece generations**, not a sprite sheet.
- The import workflow downloads those **separate source images** and removes their white background using an alpha mask only. It does not create UI graphics by drawing code.
- Each output remains one real RGBA PNG at the original source dimensions (no crops) and is committed to `Assets/LEOM/Resources/LEOM/UI/`.
- Unity automatically treats these files as assets under Resources. The `LeomRoyalPngSkin` runtime adapter uses the actual downloaded textures for the current prototype IMGUI visual backgrounds, preserving RPG logic.
- The import workflow also offers a `LEOM-royal-red-gold-individual-PNG` artifact, for copying into an existing local Unity project instead of re-downloading the entire repository.
- The remaining artistic work (custom 9-slice pixel-perfect tuning, menu icons, animation states, fully authored prefabs/canvas) is not yet finished. The included stage is a **first integrated real-PNG skin**, not a claim that the whole UI design is finished.

Avoid posting future source asset URLs publicly after expiry. The generated PNG files in the repository are the canonical offline sources.
