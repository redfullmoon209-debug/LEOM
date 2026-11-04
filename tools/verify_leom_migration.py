#!/usr/bin/env python3
"""Sanity-check LEOM's source-only migration independent of its legacy Godot repository.
This does not compile Unity or prove a browser playtest.
"""
from pathlib import Path
import json
repo = Path(__file__).resolve().parents[1]
data = json.loads((repo/"Assets/LEOM/Resources/LeomLegacyCatalog.json").read_text(encoding="utf-8"))
items, offers, jobs, skills = [data[k] for k in ("items","offers","jobs","skills")]
assert len(items) == 31, "Expected 31 original item IDs"
assert len(offers) == 21, "Expected 21 original offers"
assert len(jobs) == 13, "Expected 13 original classes"
assert len(skills) == 171, "Expected 171 original skills"
for category, entries in (("items", items),("offers",offers),("jobs",jobs),("skills",skills)):
    ids=[v["id"] for v in entries]
    assert len(ids)==len(set(ids)), "Duplicate "+category+" IDs"
item_ids={v["id"] for v in items}
for offer in offers:
    assert offer["id"] in item_ids
    assert offer["currency"] in {"gold","blue","purple","green"}
    assert offer["price"].isdigit() and offer["sell"].isdigit()
    assert int(offer["price"]) >= int(offer["sell"])
job_ids={v["id"] for v in jobs}
assert {j["id"] for j in jobs if j["tier"]==0}=={"Novice"}
assert sum(j["tier"]==1 for j in jobs)==6
assert sum(j["tier"]==2 for j in jobs)==6
skills_by_id={s["id"]:s for s in skills}
assert {"novice_slash","novice_rush","novice_guard"} <= skills_by_id.keys()
assert sum(s["implemented"] for s in skills) == 3
for skill in skills:
    assert skill["job"] in job_ids
    assert skill["kind"] in {"active","passive","timed_buff"}
    assert len(skill["nameTh"]) and len(skill["nameEn"])
    if skill["kind"] == "passive":
        assert skill["statKey"] in {"strength","vitality","agility","intelligence","dexterity","luck"}
        assert skill["statAmount"] > 0
assert sum(s["job"]=="Novice" for s in skills)==3
assert sum(s["job"]!="Novice" for s in skills)==168
for job in job_ids-{"Novice"}:
    assert sum(s["job"]==job for s in skills)==14
required=[
    "Assets/LEOM/Scripts/Runtime/LeomRpgService.cs",
    "Assets/LEOM/Scripts/Runtime/LeomAmount.cs",
    "Assets/LEOM/Scripts/Runtime/LeomRpgSave.cs",
    "Assets/LEOM/Scripts/Runtime/LeomGameHUD.cs",
    "Assets/LEOM/Scripts/Runtime/LeomTouchGamepad.cs",
    "Assets/LEOM/Scripts/Editor/LeomProceduralScene.cs",
    "Assets/LEOM/Scripts/Editor/BuildPrototypeScene.cs",
    "Assets/LEOM/Scripts/Editor/UnityCloudPreExport.cs",
    "ProjectSettings/ProjectVersion.txt",
    "Packages/manifest.json",
]
assert all((repo/p).is_file() for p in required)
builder=(repo/required[6]).read_text(encoding="utf-8")
assert "LeomProceduralScene.Build()" in builder
assert "LeomProceduralScene.CreateHumanoid" in builder
assert "AddComponent<LeomRpgService>" in builder
assert "AddComponent<LeomGameHUD>" in builder
assert "AddComponent<LeomTouchGamepad>" in builder
assert all(p.suffix.lower() not in {".fbx",".glb",".gltf",".blend"} for p in (repo/"Assets").rglob("*") if p.is_file())
print("PASS: 31 item IDs, 21 original shop offers, 13 jobs, 171 skills, temp world and test HUD.")
print("NOTE: this test does NOT prove an actual Unity WebGL build.")
