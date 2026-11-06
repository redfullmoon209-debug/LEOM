# LEOM Pearl Character Screen (Unity 6.3)

This branch replaces the **Gear** and **Stats [C]** test windows with a dedicated responsive Unity uGUI character equipment panel. It does not change other game tabs, inventory items, or original save data.

## Layout

- **Left (equipment):** hat, shirt, gloves, pants, shoes.
- **Center:** live 3D preview cloned from the player's existing visual; no fake/cropped character PNG.
- **Right (fashion):** fashion hat, shirt, gloves, pants, shoes.
- **Under character:** ring, bracelet, necklace, bracelet, ring (five independent slots).
- **Bottom row:** buff pet, collector/loot pet, mount.

Real equipped item IDs are read from `LeomRpgService.Equipped(...)`. Selecting an occupied slot calls the existing `UnequipItem` service so the item returns to the bag. Equip items through the existing Bag [B] screen. **Collector/loot pet is visually reserved only; no gameplay or save mapping has been invented.**

## Original standalone PNG parts

Image sources were generated **individually**, not cropped from the UI reference atlas:
- `Assets/LEOM/Resources/LEOM/UI/pearl_character_window.png` — empty pearl/ivory and champagne-gold character window background.
- `Assets/LEOM/Resources/LEOM/UI/pearl_equipment_slot.png` — single empty square item slot reused for all slot placements.

See `ArtSource/pearl-character-assets.json` and `tools/import_pearl_character_art.py`. The GitHub Action imports and commits the two assets to this feature branch. It validates real transparency and original 2K dimensions; if the source fails validation, the image is not falsely marked as ready.

The frame and equipment slot are each a **separate full PNG**, not extracted from a collage. Section headings, dynamic item names, and player values are Unity text, not baked into the image, so localization remains possible.

## How to test locally

1. Check out this feature branch of `redfullmoon209-debug/LEOM`.
2. Open the repository root (which contains `Assets`, `Packages`, and `ProjectSettings`) in Unity 6.3. Use `Tools → LEOM → Build Prototype Scene` if no scene exists.
3. Click Play. Press **C** or the **Gear** tab to open the pearl character panel. Close with **X**, Escape, or C.
4. Check equipment and fashion slot order, five jewelry slots, three pet slots, live player preview, bag-to-equipment link, and that other game tabs still work.

**Testing status:** Source committed to GitHub. This change is not claimed to be compiled or visually verified inside Unity Editor until a Unity run confirms it. The repository's GitHub core tests do **not** compile Unity scripts.

Important: Other game windows and the original 3D placeholder world remain unchanged.
