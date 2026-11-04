# LEOM — browser test on GitHub Pages (free)

Source Unity project lives at repository root \`Assets/\`, \`Packages/\`, \`ProjectSettings/\`. Unity Cloud source connection is **not yet working**. This HTML game is a free **temporary Three.js browser prototype**, not Unity WebGL.

## Test now
- Play (after enabling Pages): https://redfullmoon209-debug.github.io/LEOM/
- Alternate direct path: https://redfullmoon209-debug.github.io/LEOM/preview/
- Static files: \`preview/index.html\`, \`preview/game.mjs\`, \`preview/rpg.mjs\`, \`preview/panels.mjs\`, \`preview/style.css\`, \`preview/catalog.json\`.

One-time, free GitHub setting (if site returns 404): Repository → **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: main / (root) → Save**. No billing, no Unity Editor install.

Three.js is imported from a pinned public jsDelivr CDN URL; the CDN and browser must be accessible, and WebGL must be enabled on the device.

**Game scope:** simulated original inventory/bank/shop/currency/job data plus new 3D temp humanoid/world, monsters and Novice combat. State saves to this browser's localStorage. This is **offline single-player**: no login server, Guild War, Arena multiplayer, dedicated MMO server, store publishing or Unity WebGL build. The original Leoonline repo remains untouched.

**Keys:** WASD/Arrows walk, Shift sprint, mouse drag right/touch drag orbit, J/click attack, T lock target, Q auto farm, E pick up, B bag, K skills, C character, Space jump.

Run \`node --check\` on each .mjs and \`python3 tools/verify_leom_migration.py\` for source QA.
