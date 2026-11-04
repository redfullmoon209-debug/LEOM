// Optional Unity Build Automation (UBA) pre-export hook.
// Configure "Leom.EditorTools.UnityCloudPreExport.PreExport" in UBA
// Advanced Settings -> Pre-export method. No local Editor install needed for the owner.
#if UNITY_EDITOR
using UnityEditor;
using UnityEngine;

namespace Leom.EditorTools
{
    public static class UnityCloudPreExport
    {
        public static void PreExport()
        {
            BuildPrototypeScene.BuildHeadless();
            PlayerSettings.companyName = "LEOM";
            PlayerSettings.productName = "LEOM Offline PvE Playtest";
            PlayerSettings.WebGL.compressionFormat = WebGLCompressionFormat.Disabled;
            // Unity's generated framework attempted automatic IndexedDB sync and
            // threw ReferenceError: IDBFS is not defined on LEOM Build #1.
            // Opt out of the auto-sync hook via our custom HTML build template.
            PlayerSettings.WebGL.template = "PROJECT:LEOMSafe";
            Debug.Log("[LEOM] Cloud build pre-export prepared the prototype scene.");
        }
    }
}
#endif
