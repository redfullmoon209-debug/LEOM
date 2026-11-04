#!/usr/bin/env python3
"""LEOM WebGL boot regression checks. Source checks, not a Unity WebGL play test."""
from pathlib import Path
root=Path(__file__).resolve().parents[1]
tpl=(root/"Assets/WebGLTemplates/LEOMSafe/index.html").read_text(encoding="utf-8")
pre=(root/"Assets/LEOM/Scripts/Editor/UnityCloudPreExport.cs").read_text(encoding="utf-8")
local=(root/"Assets/LEOM/Scripts/Editor/UnityWebGLBuild.cs").read_text(encoding="utf-8")
version=(root/"ProjectSettings/ProjectVersion.txt").read_text(encoding="utf-8")
assert 'autoSyncPersistentDataPath: false' in tpl
assert 'createUnityInstance(' in tpl
for key in ["DATA_FILENAME","FRAMEWORK_FILENAME","CODE_FILENAME","LOADER_FILENAME"]:
    assert "{{{ "+key+" }}}" in tpl,key
for c in [pre,local]:
    assert 'PlayerSettings.WebGL.template = "PROJECT:LEOMSafe"' in c
    assert 'WebGLCompressionFormat.Disabled' in c
assert "6000.3.0f1" in version
print("PASS LEOM custom WebGL template and explicit IndexedDB auto-sync opt-out")
print("Note: compile + WebGL browser playback must still be verified after cloud build")
