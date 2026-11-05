# Lumen Vale — Godot 4 web game

Original single-player action game built as a feasible replacement after inspecting the supplied Android game archive. This is **not a port or reconstruction of the original game**. No APK binaries, SDKs, art, music, private configuration or protocol schemas are redistributed.

## Play
Published destination (only valid after successful deployment): https://redfullmoon209-debug.github.io/LEOM/godot-web/

Defeat eight sentinels, collect their light shards by walking over them, then reach the gate on the right. Three healing potions restore 45 HP each. Dash grants brief invulnerability. Your fastest victory is saved locally in the browser when storage is available.

- Enter / tap Begin: start or restart
- WASD / arrow keys / on-screen directional pad: move
- Space (hold) / Strike: melee attack in facing direction
- Click the arena: aim and strike
- Shift / Dash: dash, with cooldown
- E / Heal: use a potion
- P / Escape / Pause: pause; losing focus pauses automatically

## Source and export
Open `godot-web/project.godot` in **Godot 4.4.1 standard (GDScript)**. Run F6/F5. No plugins or imported assets required. All visuals are authored using Godot drawing primitives.

Install matching 4.4.1 export templates, then:

```sh
godot --headless --path godot-web --editor --import
godot --headless --path godot-web --script res://tests/core.gd
mkdir -p site/godot-web
godot --headless --path godot-web --export-release Web "$PWD/site/godot-web/index.html"
python3 -m http.server 8765 --directory site
```

Serve via HTTP(S), not file://. WebGL 2 is required. The Compatibility renderer and single-thread export avoid requiring cross-origin-isolation headers on GitHub Pages. See https://docs.godotengine.org/en/4.4/tutorials/export/exporting_for_web.html.

## CI and publication
`.github/workflows/deploy-pages.yml` imports, runs GDScript tests, exports actual WebAssembly, and boots the build in Chromium with keyboard, pointer and mobile touch tests. Branch `godot-web-rebuild` runs build/test only. Main publishes only after those checks pass and then repeats tests on the public URL. Existing LEOM browser files remain at the site root; the Godot game lives under `/godot-web/`.

See Actions artifacts `godot-test-evidence` and `godot-live-test-evidence` for logs, screenshots and machine-readable test results. Check actual run status before claiming tests passed. `window.lumenState` exposes read-only gameplay telemetry for automation and contains no commands to alter gameplay.

## Scope
One complete small arena, eight enemies, collision, directional melee, dash, damage, healing, pickups, victory, defeat, restart, pause and local best time. No multiplayer, original account system, monetization, original content, or server emulation.
