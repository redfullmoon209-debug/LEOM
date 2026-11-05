extends SceneTree
var failures = 0
func check(condition: bool, message: String) -> void:
 if not condition:
  failures += 1
  push_error(message)
func _initialize() -> void:
 call_deferred("run")
func run() -> void:
 var game = load("res://main.tscn").instantiate()
 root.add_child(game)
 game.set_process(false)
 game.restart()
 check(game.enemies.size() == 8, "Eight enemies must spawn")
 check(game.hp == 100 and game.state == "playing", "Start state")
 var blocked = game.slide_move(Vector2(270, 240), Vector2(180, 0))
 check(blocked.x < 286, "Dash must not tunnel through pillar")
 check(game.slide_move(Vector2(70, 350), Vector2(-200, 0)).x >= 59, "World boundary")
 game.player = Vector2(200, 350)
 game.facing = Vector2.RIGHT
 for e in game.enemies: e.pos = Vector2(1000, 180)
 game.enemies[0].pos = Vector2(240, 350)
 game.attack()
 check(game.enemies[0].hp == 2, "Melee deals damage")
 game.attack()
 check(game.enemies[0].hp == 2, "Attack cooldown prevents repeated damage")
 game.attack_cd = 0
 game.enemies[0].pos = Vector2(160, 350)
 game.attack()
 check(game.enemies[0].hp == 2, "Facing away prevents hit")
 game.enemies[0].pos = Vector2(240, 350)
 game.enemies[0].hp = 1
 game.attack_cd = 0
 game.attack()
 check(game.kills == 1 and game.drops.size() == 1, "Death produces exactly one shard")
 game.attack_cd = 0
 game.attack()
 check(game.kills == 1, "Dead enemies cannot be killed twice")
 game.player = game.drops[0]
 game._process(0.01)
 check(game.crystals == 1 and game.drops.is_empty(), "Pickup consumes shard")
 game.hp = 40
 game.heal()
 check(game.hp == 85 and game.potions == 2, "Healing consumes one potion")
 game.hp = 100
 game.heal()
 check(game.potions == 2, "Full health does not waste potion")
 game.toggle_pause()
 var before: Vector2 = game.player
 var clock: float = game.elapsed
 game._process(0.05)
 check(game.player == before and game.elapsed == clock, "Pause freezes simulation")
 game.toggle_pause()
 game.dash()
 check(game.dash_cd > 0 and game.invulnerable > 0, "Dash grants temporary invulnerability")
 game.restart()
 game.player = game.EXIT
 game.crystals = 7
 game._process(0.01)
 check(game.state == "playing", "Gate remains locked with seven shards")
 game.crystals = 8
 game._process(0.01)
 check(game.state == "won", "Eight shards unlock victory")
 game.restart()
 game.hp = 1
 game.enemies[0].pos = game.player
 game._process(0.01)
 check(game.state == "lost", "Lethal contact ends round")
 game.restart()
 check(game.hp == 100 and game.crystals == 0 and game.kills == 0 and game.potions == 3, "Restart resets round")
 print("LUMEN_CORE_TESTS failures=", failures)
 quit(1 if failures else 0)
