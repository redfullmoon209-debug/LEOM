extends Node2D
## Lumen Vale: original offline action game, no uploaded game assets.
const SIZE = Vector2(1152, 720)
const FIELD = Rect2(44, 128, 1064, 440)
const HOME = Vector2(140, 350)
const EXIT = Vector2(1040, 350)
const INK = Color("101e29")
const GOLD = Color("f2cf86")
const MINT = Color("7ae6c6")
const PAPER = Color("e7efe6")
var font: Font = ThemeDB.fallback_font
var player = HOME
var facing = Vector2.RIGHT
var hp = 100.0
var kills = 0
var crystals = 0
var elapsed = 0.0
var attack_cd = 0.0
var slash = 0.0
var invulnerable = 0.0
var dash_cd = 0.0
var dash_left = 0.0
var potions = 3
var state = "title"
var previous_state = "playing"
var enemies: Array[Dictionary] = []
var drops: Array[Vector2] = []
var particles: Array[Dictionary] = []
var obstacles: Array[Rect2] = [Rect2(300, 210, 84, 66), Rect2(300, 425, 84, 64), Rect2(590, 290, 82, 112), Rect2(830, 180, 84, 60), Rect2(830, 460, 84, 58)]
var touch_keys: Dictionary = {}
var touches: Dictionary = {}
var best = 0.0
var status_text = "Defeat the sentinels. Collect 8 light shards. Reach the gate."
var buttons = {
 "left": Rect2(38, 627, 64, 64), "right": Rect2(178, 627, 64, 64),
 "up": Rect2(108, 590, 64, 48), "down": Rect2(108, 645, 64, 48),
 "attack": Rect2(944, 602, 158, 70), "dash": Rect2(812, 602, 118, 70),
 "heal": Rect2(680, 602, 118, 70), "pause": Rect2(1000, 30, 104, 40)
}

func _ready() -> void:
 var save = ConfigFile.new()
 if save.load("user://lumen.cfg") == OK:
  best = float(save.get_value("record", "seconds", 0.0))
 spawn_enemies()
 if OS.has_feature("web"):
  JavaScriptBridge.eval("window.lumenReady=true;")

func spawn_enemies() -> void:
 enemies.clear()
 var points = [Vector2(245, 185), Vector2(460, 180), Vector2(540, 470), Vector2(760, 240), Vector2(940, 420), Vector2(470, 370), Vector2(750, 500), Vector2(1000, 180)]
 for i in range(points.size()):
  enemies.append({"pos": points[i], "home": points[i], "hp": 3, "hit": 0.0, "phase": i * 0.8})

func restart() -> void:
 player = HOME
 facing = Vector2.RIGHT
 hp = 100.0
 kills = 0
 crystals = 0
 elapsed = 0.0
 potions = 3
 attack_cd = 0.0
 dash_cd = 0.0
 dash_left = 0.0
 invulnerable = 0.0
 slash = 0.0
 drops.clear()
 particles.clear()
 touch_keys.clear()
 touches.clear()
 status_text = "Defeat the sentinels. Collect 8 light shards. Reach the gate."
 spawn_enemies()
 state = "playing"

func _notification(what: int) -> void:
 if what == NOTIFICATION_APPLICATION_FOCUS_OUT:
  touch_keys.clear()
  touches.clear()
  if state == "playing":
   state = "paused"

func toggle_pause() -> void:
 if state == "playing":
  state = "paused"
 elif state == "paused":
  state = "playing"
 touch_keys.clear()
 touches.clear()

func point_action(pos: Vector2) -> String:
 for action in buttons:
  if buttons[action].has_point(pos):
   return action
 return ""

func pointer_down(pos: Vector2, id: int) -> void:
 if state in ["title", "won", "lost"]:
  if Rect2(410, 432, 332, 62).has_point(pos):
   restart()
  return
 if state == "paused":
  if Rect2(410, 432, 332, 62).has_point(pos) or buttons.pause.has_point(pos):
   toggle_pause()
  return
 var action = point_action(pos)
 touches[id] = action
 if not action.is_empty():
  touch_keys[action] = true
  if action == "pause": toggle_pause()
  if action == "dash": dash()
  if action == "heal": heal()
 elif FIELD.has_point(pos):
  facing = (pos - player).normalized()
  attack()

func pointer_up(id: int) -> void:
 touches.erase(id)
 touch_keys.clear()
 for action in touches.values():
  touch_keys[action] = true

func _input(event: InputEvent) -> void:
 if event is InputEventKey and event.pressed and not event.echo:
  if event.keycode == KEY_ENTER and state in ["title", "won", "lost"]:
   restart()
  elif event.keycode in [KEY_P, KEY_ESCAPE]: toggle_pause()
  elif event.keycode == KEY_SPACE: attack()
  elif event.keycode == KEY_SHIFT: dash()
  elif event.keycode == KEY_E: heal()
  elif event.keycode == KEY_R and state in ["won", "lost"]: restart()
 if event is InputEventScreenTouch:
  if event.pressed: pointer_down(event.position, event.index)
  else: pointer_up(event.index)
 if event is InputEventScreenDrag:
  pointer_up(event.index)
  pointer_down(event.position, event.index)
 if event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_LEFT:
  if event.pressed: pointer_down(event.position, -1)
  else: pointer_up(-1)

func key(action: String, a: int, b: int) -> float:
 return 1.0 if Input.is_physical_key_pressed(a) or Input.is_physical_key_pressed(b) or touch_keys.get(action, false) else 0.0

func allowed(pos: Vector2, radius: float = 15.0) -> bool:
 if not FIELD.grow(-radius).has_point(pos): return false
 for obstacle in obstacles:
  if obstacle.grow(radius).has_point(pos): return false
 return true

func slide_move(pos: Vector2, motion: Vector2, radius: float = 15.0) -> Vector2:
 # Substeps prevent tunneling through the pillars during dash or frame drops.
 var steps = maxi(1, int(ceil(motion.length() / 7.0)))
 var step = motion / steps
 for i in range(steps):
  if allowed(pos + Vector2(step.x, 0), radius): pos.x += step.x
  if allowed(pos + Vector2(0, step.y), radius): pos.y += step.y
 return pos

func attack() -> void:
 if state != "playing" or attack_cd > 0: return
 attack_cd = 0.36
 slash = 0.19
 for e in enemies:
  if e.hp <= 0: continue
  var offset: Vector2 = e.pos - player
  if offset.length() < 92.0 and (offset.length() < 32 or facing.dot(offset.normalized()) > 0.1):
   e.hp -= 1
   e.hit = 0.16
   e.pos = slide_move(e.pos, offset.normalized() * 20.0)
   burst(e.pos, GOLD, 7)
   if e.hp <= 0:
    kills += 1
    drops.append(e.pos)
    burst(e.pos, MINT, 12)

func dash() -> void:
 if state != "playing" or dash_cd > 0: return
 dash_left = 0.16
 dash_cd = 1.8
 invulnerable = maxf(invulnerable, 0.28)

func heal() -> void:
 if state != "playing" or potions <= 0 or hp >= 100: return
 potions -= 1
 hp = minf(100, hp + 45)
 burst(player, MINT, 16)

func burst(pos: Vector2, color: Color, amount: int) -> void:
 for i in range(amount):
  particles.append({"pos": pos, "vel": Vector2.from_angle(randf() * TAU) * randf_range(30, 100), "life": 0.5, "color": color})

func win() -> void:
 state = "won"
 if best == 0 or elapsed < best:
  best = elapsed
  var save = ConfigFile.new()
  save.set_value("record", "seconds", best)
  save.save("user://lumen.cfg")

func _process(delta: float) -> void:
 var dt = minf(delta, 0.05)
 if state == "playing":
  elapsed += dt
  attack_cd = maxf(0, attack_cd - dt)
  slash = maxf(0, slash - dt)
  invulnerable = maxf(0, invulnerable - dt)
  dash_cd = maxf(0, dash_cd - dt)
  dash_left = maxf(0, dash_left - dt)
  var direction = Vector2(key("right", KEY_D, KEY_RIGHT) - key("left", KEY_A, KEY_LEFT), key("down", KEY_S, KEY_DOWN) - key("up", KEY_W, KEY_UP)).normalized()
  if direction != Vector2.ZERO: facing = direction
  player = slide_move(player, (facing * 680 if dash_left > 0 else direction * 205) * dt)
  if Input.is_physical_key_pressed(KEY_SPACE) or touch_keys.get("attack", false): attack()
  for e in enemies:
   if e.hp <= 0: continue
   e.hit = maxf(0, e.hit - dt)
   var offset: Vector2 = player - e.pos
   if offset.length() < 250 and offset.length() > 26:
    e.pos = slide_move(e.pos, offset.normalized() * 69.0 * dt)
   if e.pos.distance_to(player) < 31 and invulnerable <= 0:
    hp = maxf(0, hp - 16)
    invulnerable = 0.85
    burst(player, Color("f58b81"), 9)
    if hp <= 0:
     state = "lost"
     break
  if state == "playing":
   for i in range(drops.size() - 1, -1, -1):
    if drops[i].distance_to(player) < 30:
     crystals += 1
     burst(drops[i], MINT, 9)
     drops.remove_at(i)
   if crystals == 8:
    status_text = "The gate is awake. Follow the light to the east!"
    if player.distance_to(EXIT) < 39: win()
  for i in range(particles.size() - 1, -1, -1):
   particles[i].life -= dt
   particles[i].pos += particles[i].vel * dt
   if particles[i].life <= 0: particles.remove_at(i)
 if OS.has_feature("web"):
  # Read-only telemetry for browser verification; no test commands or cheats.
  var data = {"state": state, "x": player.x, "y": player.y, "hp": hp, "kills": kills, "crystals": crystals, "potions": potions, "elapsed": elapsed, "dash_cd": dash_cd, "attack_cd": attack_cd}
  JavaScriptBridge.eval("window.lumenState=" + JSON.stringify(data) + ";")
 queue_redraw()

func label_at(pos: Vector2, text: String, size: int = 18, color: Color = PAPER) -> void:
 draw_string(font, pos, text, HORIZONTAL_ALIGNMENT_LEFT, -1, size, color)

func centered(pos: Vector2, text: String, size: int = 18, color: Color = PAPER) -> void:
 label_at(pos - Vector2(font.get_string_size(text, HORIZONTAL_ALIGNMENT_LEFT, -1, size).x / 2, 0), text, size, color)

func panel(rect: Rect2, color: Color, border: Color = Color("30434c")) -> void:
 draw_style_box(style(color, border), rect)

func style(color: Color, border: Color) -> StyleBoxFlat:
 var s = StyleBoxFlat.new()
 s.bg_color = color
 s.border_color = border
 s.set_border_width_all(1)
 s.set_corner_radius_all(12)
 return s

func diamond(pos: Vector2, r: float, color: Color) -> void:
 draw_colored_polygon(PackedVector2Array([pos + Vector2(0, -r), pos + Vector2(r * 0.65, 0), pos + Vector2(0, r), pos + Vector2(-r * 0.65, 0)]), color)

func _draw() -> void:
 draw_rect(Rect2(Vector2.ZERO, SIZE), Color("0b151e"))
 label_at(Vector2(44, 34), "L U M E N   V A L E", 16, GOLD)
 label_at(Vector2(44, 72), "The last lightkeeper", 30)
 label_at(Vector2(46, 105), "01 / THE SUNKEN GARDEN", 12, Color("8da5a8"))
 panel(Rect2(414, 24, 242, 72), INK)
 label_at(Vector2(430, 49), "VITALITY", 11, Color("8da5a8"))
 draw_rect(Rect2(430, 65, 176, 8), Color("293d44"))
 draw_rect(Rect2(430, 65, 176 * hp / 100, 8), MINT if hp > 32 else Color("f58b81"))
 label_at(Vector2(612, 75), str(int(hp)), 15)
 diamond(Vector2(700, 58), 13, MINT)
 label_at(Vector2(724, 65), "%d / 8" % crystals, 24)
 label_at(Vector2(838, 48), "TIME", 11, Color("8da5a8"))
 label_at(Vector2(838, 76), "%02d:%02d" % [int(elapsed) / 60, int(elapsed) % 60], 22)
 panel(FIELD, Color("152c32"), Color("425a57"))
 # Hand-authored geometry and deterministic decoration, no external art.
 for x in range(70, 1090, 46):
  for y in range(151, 560, 38):
   var k = (x * 17 + y * 13) % 11
   draw_circle(Vector2(x + k, y), 1.4, Color("284343"))
 draw_line(HOME, EXIT, Color("213c3e"), 64)
 for i in range(19):
  draw_line(Vector2(170 + i * 45, 326), Vector2(160 + i * 45, 374), Color("35504d"), 1)
 for o in obstacles:
  draw_rect(Rect2(o.position + Vector2(8, 10), o.size), Color(0.02, 0.05, 0.07, 0.5))
  panel(o, Color("314847"), Color("50665d"))
  draw_rect(Rect2(o.position + Vector2(8, 8), Vector2(o.size.x - 16, 7)), Color("607568"))
  draw_line(o.position + Vector2(20, 28), o.end - Vector2(20, 10), Color("243d3c"), 3)
  draw_circle(o.position + Vector2(8, o.size.y - 3), 12, Color("385d47"))
 for p in [Vector2(100, 175), Vector2(110, 510), Vector2(690, 170), Vector2(990, 520)]:
  draw_circle(p, 18, Color("1e4240"))
  draw_line(p + Vector2(0, 11), p - Vector2(0, 9), Color("6a9a78"), 3)
  diamond(p - Vector2(0, 12), 7, GOLD)
 var portal_color = MINT if crystals == 8 else Color("62787a")
 draw_circle(EXIT, 34, Color("0c202b"))
 draw_arc(EXIT, 34, 0, TAU, 48, portal_color, 3, true)
 draw_arc(EXIT, 25, elapsed, elapsed + 4.6, 32, portal_color, 2, true)
 diamond(EXIT, 17, portal_color)
 centered(EXIT + Vector2(0, 56), "GATE" if crystals == 8 else "8 SHARDS", 11, portal_color)
 for p in drops:
  draw_circle(p, 16, Color(0.3, 0.9, 0.7, 0.08))
  diamond(p + Vector2(0, sin(elapsed * 4) * 3), 11, MINT)
 for e in enemies:
  if e.hp <= 0: continue
  var p: Vector2 = e.pos
  draw_set_transform(p + Vector2(0, 14), 0, Vector2(1, 0.35))
  draw_circle(Vector2.ZERO, 20, Color(0, 0, 0, 0.25))
  draw_set_transform(Vector2.ZERO)
  var c = Color("f1bf98") if e.hit > 0 else Color("bb7c79")
  draw_circle(p, 17 + sin(elapsed * 3 + e.phase), c)
  draw_colored_polygon(PackedVector2Array([p + Vector2(-15, -7), p + Vector2(-14, -25), p + Vector2(-3, -13)]), c)
  draw_colored_polygon(PackedVector2Array([p + Vector2(15, -7), p + Vector2(14, -25), p + Vector2(3, -13)]), c)
  draw_line(p + Vector2(-8, -3), p + Vector2(-3, -1), INK, 3)
  draw_line(p + Vector2(3, -1), p + Vector2(8, -3), INK, 3)
  for j in range(e.hp): draw_circle(p + Vector2(-8 + j * 8, -31), 2.4, GOLD)
 draw_set_transform(player + Vector2(0, 17), 0, Vector2(1, 0.3))
 draw_circle(Vector2.ZERO, 21, Color(0, 0, 0, 0.35))
 draw_set_transform(Vector2.ZERO)
 var hero_color = Color("ffffff") if invulnerable > 0 and int(invulnerable * 16) % 2 == 0 else MINT
 draw_colored_polygon(PackedVector2Array([player + Vector2(-15, 14), player + Vector2(-10, -8), player + Vector2(10, -8), player + Vector2(15, 14)]), Color("3f8d89"))
 draw_circle(player + Vector2(0, -8), 12, hero_color)
 draw_arc(player + Vector2(0, -8), 12, PI, TAU, 20, GOLD, 3, true)
 draw_line(player + Vector2(5, -9), player + Vector2(10, -9), INK, 2)
 var sword = player + facing * 22
 draw_line(sword - facing * 8, sword + facing * 16, GOLD, 4)
 if slash > 0:
  draw_arc(player, 70, facing.angle() - 1.4, facing.angle() + 1.4, 24, Color(0.95, 0.85, 0.6, slash / 0.19), 6, true)
 for p in particles:
  var c: Color = p.color
  c.a = p.life * 2
  draw_circle(p.pos, 2.6, c)
 centered(Vector2(576, 552), status_text, 14, GOLD)
 for action in buttons:
  var rect: Rect2 = buttons[action]
  panel(rect, Color("284640") if touch_keys.get(action, false) else INK)
  var caption: String = {"left":"A / <", "right":"D / >", "up":"W / ^", "down":"S / v", "attack":"STRIKE", "dash":"DASH", "heal":"HEAL x%d" % potions, "pause":"PAUSE"}[action]
  if action == "dash" and dash_cd > 0: caption = "%.1fs" % dash_cd
  centered(rect.get_center() + Vector2(0, 6), caption, 16, GOLD if action == "attack" else PAPER)
 label_at(Vector2(282, 620), "WASD / arrows  Move", 13, Color("91a7ac"))
 label_at(Vector2(282, 644), "Space  Strike    Shift  Dash    E  Heal", 13, Color("91a7ac"))
 label_at(Vector2(282, 668), "P  Pause    •    Touch controls supported", 13, Color("91a7ac"))
 if state != "playing": draw_overlay()

func draw_overlay() -> void:
 draw_rect(Rect2(Vector2.ZERO, SIZE), Color(0.02, 0.05, 0.08, 0.84))
 panel(Rect2(300, 171, 552, 363), Color("132831"), Color("57716a"))
 centered(Vector2(576, 215), "L U M E N   V A L E", 14, GOLD)
 var title = {"title":"Carry the light.", "paused":"Take a breath.", "won":"The vale is awake.", "lost":"The light will return."}[state]
 centered(Vector2(576, 276), title, 34)
 var line1 = {"title":"Eight sentinels guard the sunken garden.", "paused":"Your journey is paused.", "won":"All eight shards returned. A new dawn begins.", "lost":"The sentinels overwhelmed your light."}[state]
 centered(Vector2(576, 321), line1, 18)
 centered(Vector2(576, 355), "Collect their shards, then reach the eastern gate." if state == "title" else "Time  %02d:%02d    /    Shards  %d of 8" % [int(elapsed) / 60, int(elapsed) % 60, crystals], 16, Color("a1b8b4"))
 centered(Vector2(576, 389), "WASD move • Space strike • Shift dash • E heal", 14, Color("a1b8b4"))
 panel(Rect2(410, 432, 332, 62), GOLD, GOLD)
 centered(Vector2(576, 470), "RESUME" if state == "paused" else "BEGIN JOURNEY  /  ENTER" if state == "title" else "PLAY AGAIN  /  ENTER", 17, INK)
 if best > 0: centered(Vector2(576, 518), "Personal best: %.1f seconds" % best, 13, GOLD)
