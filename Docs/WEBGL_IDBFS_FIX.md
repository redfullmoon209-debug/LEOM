# LEOM WebGL loading fix (Build #1)

Owner-reported error on Unity Cloud Play:
```
ReferenceError: IDBFS is not defined
  at injectIndexedDBToAutomaticallyPersist
  (.../Build/LEOM-WebGL-Test.framework.js:2:2364)
```
The Unity-generated WebGL runtime attempted to enable automatic IndexedDB persistence while the `IDBFS` object was not available. The build had completed successfully, but the game did not initialize; a successful build alone is not proof that Play works.

## Corrective change

1. `Assets/WebGLTemplates/LEOMSafe/index.html` explicitly passes **`autoSyncPersistentDataPath: false`** to `createUnityInstance()`. Unity's docs describe this option, and recommend false/unset when automatic filesystem syncing causes runtime errors. The user should no longer be blocked by `injectIndexedDBToAutomaticallyPersist` if the template is used by the WebGL player.
2. Both `Leom.EditorTools.UnityCloudPreExport.PreExport` and `Leom.EditorTools.UnityWebGLBuild.Build` select `PlayerSettings.WebGL.template = "PROJECT:LEOMSafe"` before building. Neither touches other Unity projects.
3. Continue using uncompressed WebGL assets for static HTTPS Pages compatibility.
4. Match the Unity Cloud target editor version with `ProjectSettings/ProjectVersion.txt` (`6000.3.0f1`). Build #1 was made using the `Always Use Latest 6000.x` setting (reported `6000.6.8f1`), creating a known version mismatch.

## Limitations

- This patch deliberately disables **automatic sync of raw files in `Application.persistentDataPath`**; an app writing raw files must call `JS_FileSystem_Sync()` manually. LEOM's migrated RPG uses `PlayerPrefs.SetString` / `PlayerPrefs.Save` for its local test data.
- It does not generate a playable WebGL binary until a **new Unity Cloud Build** is run; existing Build #1 is immutable and will continue to show its original error.
- Verify actual Unity WebGL Play loads the 3D game and HUD before calling the repair complete.

## Reference documentation
- https://docs.unity.com/en-us/engine/6000.3/manual/platform-specific/webgl/building-distribution/templates/web-templates-build-configuration
- https://issuetracker.unity.com/issues/17003
