// LEOM visual theme: only loads separately generated PNG art from Resources.
// Does NOT procedurally draw or crop any sprite-sheet atlas.
using UnityEngine;

namespace Leom.Prototype
{
    internal static class LeomRoyalPngSkin
    {
        private static bool attempted;
        private static Texture2D basePanel;
        private static Texture2D goldTrim;
        private static Texture2D button;
        private static Texture2D slot;
        private static GUIStyle slotStyle;

        private static Texture2D Load(string file)
        {
            return Resources.Load<Texture2D>("LEOM/UI/" + file);
        }

        public static void Apply()
        {
            if (!attempted)
            {
                attempted = true;
                basePanel = Load("window_base");
                goldTrim = Load("window_gold_trim");
                button = Load("action_button");
                slot = Load("inventory_slot");
            }
            if (!basePanel || !button) return; // Legacy skin remains until PNG import succeeds.
            GUIStyle boxes = GUI.skin.box;
            boxes.normal.background = basePanel;
            boxes.normal.textColor = Color.white;
            boxes.border = new RectOffset(34, 34, 28, 28);
            boxes.padding = new RectOffset(12, 12, 12, 12);
            GUIStyle buttons = GUI.skin.button;
            buttons.normal.background = button;
            buttons.hover.background = button;
            buttons.active.background = button;
            buttons.focused.background = button;
            buttons.normal.textColor = Color.white;
            buttons.hover.textColor = Color.white;
            buttons.active.textColor = Color.white;
            buttons.border = new RectOffset(32, 32, 14, 14);
            buttons.fontStyle = FontStyle.Bold;
            buttons.fontSize = Mathf.Clamp(Screen.height / 70, 12, 19);
            GUI.skin.label.normal.textColor = new Color(1f, 0.96f, 0.9f);
            GUI.skin.label.fontSize = Mathf.Clamp(Screen.height / 75, 12, 18);
        }

        public static GUIStyle Slot()
        {
            if (!slot) return GUI.skin.button;
            if (slotStyle == null)
            {
                slotStyle = new GUIStyle(GUI.skin.button);
                slotStyle.normal.background = slot;
                slotStyle.hover.background = slot;
                slotStyle.active.background = slot;
                slotStyle.border = new RectOffset(18, 18, 18, 18);
            }
            return slotStyle;
        }

        public static void DrawWindowTrim(Rect rect)
        {
            if (goldTrim && Event.current.type == EventType.Repaint)
                GUI.DrawTexture(rect, goldTrim, ScaleMode.StretchToFill, true);
        }
    }
}
