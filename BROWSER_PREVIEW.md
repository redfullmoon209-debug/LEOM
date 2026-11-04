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

## Publishing status and link reliability

**Do not use the `cdn.statically.io` HTML URL as the play link.** Its response is rendered as **plain HTML source text** in a real Chromium browser (proved by Chrome QA screenshot). The local development gameplay/browser test passes, but that CDN does not serve a working game entrypoint.

GitHub Pages must be enabled once by a repository admin at:
https://github.com/redfullmoon209-debug/LEOM/settings/pages

Choose **Build and deployment > Source: Deploy from a branch > Branch: main / (root) > Save**. After GitHub publishes the site, use the verified canonical URL **https://redfullmoon209-debug.github.io/LEOM/**. The repository root `index.html` redirects to `preview/` where the 3D game files live. This is a free public repo feature, not a subscription. The repository also contains a Pages deploy workflow for the alternate Actions-based publishing mode.

This page should only be called publicly playable after a real HTTP and browser check succeeds at the GitHub Pages URL.
