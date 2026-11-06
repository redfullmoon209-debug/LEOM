// LEOM pearl/ivory character equipment window (Unity UI).
// Every art element loads an independent PNG. Never crops sprites from a reference sheet.
using System;
using System.Collections.Generic;
using Leom.Gameplay;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.UI;

namespace Leom.Prototype
{
    [DisallowMultipleComponent]
    public sealed class LeomPearlCharacterUI : MonoBehaviour
    {
        private const int PortraitLayer = 29;
        private const float WindowWidth = 1150f;
        private const float WindowHeight = 830f;
        private static readonly Color Ink = new Color(.20f, .17f, .13f, 1f);
        private static readonly Color Gold = new Color(.57f, .43f, .21f, 1f);
        private static readonly Color Pearl = new Color(.96f, .95f, .89f, 1f);

        private sealed class SlotView
        {
            public string id;
            public Text value;
        }

        private readonly List<SlotView> slots = new List<SlotView>();
        private readonly Dictionary<string, Sprite> art = new Dictionary<string, Sprite>();
        private LeomGameHUD hud;
        private GameObject canvasObject;
        private Canvas canvas;
        private RectTransform window;
        private Text identity;
        private Text attributes;
        private Text hint;
        private Font font;
        private RawImage portraitImage;
        private RenderTexture portraitTexture;
        private Camera portraitCamera;
        private GameObject portraitModel;

        private void Awake()
        {
            hud = GetComponent<LeomGameHUD>();
            font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
            BuildUi();
        }

        private Sprite Art(string filename)
        {
            if (art.TryGetValue(filename, out Sprite found)) return found;
            Texture2D texture = Resources.Load<Texture2D>("LEOM/UI/" + filename);
            Sprite sprite = texture
                ? Sprite.Create(texture, new Rect(0, 0, texture.width, texture.height),
                    new Vector2(.5f, .5f), 100f, 0, SpriteMeshType.FullRect)
                : null;
            art.Add(filename, sprite);
            return sprite;
        }

        private RectTransform Rect(string name, Transform parent, float x, float y, float width, float height)
        {
            GameObject child = new GameObject(name, typeof(RectTransform));
            child.transform.SetParent(parent, false);
            RectTransform r = child.GetComponent<RectTransform>();
            r.anchorMin = new Vector2(.5f, .5f);
            r.anchorMax = new Vector2(.5f, .5f);
            r.pivot = new Vector2(.5f, .5f);
            r.anchoredPosition = new Vector2(x, y);
            r.sizeDelta = new Vector2(width, height);
            return r;
        }

        private Image Picture(string name, Transform parent, string spriteName,
            float x, float y, float width, float height, Color fallback)
        {
            RectTransform r = Rect(name, parent, x, y, width, height);
            Image img = r.gameObject.AddComponent<Image>();
            img.sprite = Art(spriteName);
            img.color = img.sprite ? Color.white : fallback;
            img.raycastTarget = true;
            return img;
        }

        private Text Caption(string name, Transform parent, string value,
            float x, float y, float width, float height, int size, TextAnchor anchor, Color color)
        {
            RectTransform r = Rect(name, parent, x, y, width, height);
            Text text = r.gameObject.AddComponent<Text>();
            text.text = value;
            text.font = font;
            text.fontSize = size;
            text.color = color;
            text.alignment = anchor;
            text.resizeTextForBestFit = true;
            text.resizeTextMinSize = 10;
            text.resizeTextMaxSize = size;
            text.horizontalOverflow = HorizontalWrapMode.Wrap;
            text.verticalOverflow = VerticalWrapMode.Truncate;
            text.raycastTarget = false;
            return text;
        }

        private void BuildUi()
        {
            canvasObject = new GameObject("LEOM Pearl Character Canvas",
                typeof(RectTransform), typeof(Canvas), typeof(CanvasScaler), typeof(GraphicRaycaster));
            canvasObject.transform.SetParent(transform, false);
            canvas = canvasObject.GetComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            canvas.overrideSorting = true;
            canvas.sortingOrder = 150;
            CanvasScaler scaler = canvasObject.GetComponent<CanvasScaler>();
            scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            scaler.referenceResolution = new Vector2(1600, 1000);
            scaler.screenMatchMode = CanvasScaler.ScreenMatchMode.MatchWidthOrHeight;
            scaler.matchWidthOrHeight = .5f;

            RectTransform background = Rect("Dimmer", canvasObject.transform, 0, 0, 0, 0);
            background.anchorMin = Vector2.zero;
            background.anchorMax = Vector2.one;
            background.offsetMin = Vector2.zero;
            background.offsetMax = Vector2.zero;
            background.gameObject.AddComponent<Image>().color = new Color(0, 0, 0, .58f);

            window = Rect("Pearl Character Window", canvasObject.transform, 0, 0, WindowWidth, WindowHeight);
            Picture("Independent pearl window PNG", window, "pearl_character_window",
                0, 0, WindowWidth, WindowHeight, Pearl);

            identity = Caption("Character identity", window, "", 0, 347, 625, 42, 26,
                TextAnchor.MiddleCenter, Ink);
            Caption("Left section", window, "EQUIPMENT", -445, 327, 170, 35, 20,
                TextAnchor.MiddleCenter, Gold);
            Caption("Right section", window, "FASHION", 445, 327, 170, 35, 20,
                TextAnchor.MiddleCenter, Gold);
            Caption("Jewelry section", window, "ACCESSORIES", 0, -215, 405, 26, 17,
                TextAnchor.MiddleCenter, Gold);
            Caption("Pets section", window, "PETS & MOUNT", 0, -311, 330, 25, 17,
                TextAnchor.MiddleCenter, Gold);

            string[] left = { "hat", "shirt", "gloves", "pants", "shoes" };
            string[] leftCaptions = { "Hat", "Armor", "Gloves", "Pants", "Shoes" };
            string[] right = { "fashion_hat", "fashion_shirt", "fashion_gloves",
                "fashion_pants", "fashion_shoes" };
            string[] rightCaptions = { "Hat", "Top", "Gloves", "Pants", "Shoes" };
            for (int i = 0; i < 5; i++)
            {
                AddSlot(left[i], leftCaptions[i], -445, 235 - i * 101, 82, 20);
                AddSlot(right[i], rightCaptions[i], 445, 235 - i * 101, 82, 20);
            }

            string[] jewelry = { "ring_left", "bracelet_left", "necklace",
                "bracelet_right", "ring_right" };
            string[] jewelryCaptions = { "Ring", "Bracelet", "Necklace", "Bracelet", "Ring" };
            for (int i = 0; i < jewelry.Length; i++)
                AddSlot(jewelry[i], jewelryCaptions[i], (i - 2) * 100, -258, 65, 16);

            AddSlot("pet", "Buff Pet", -126, -365, 60, 17);
            AddSlot("collector_pet", "Loot Pet", 0, -365, 60, 17);
            AddSlot("mount", "Mount", 126, -365, 60, 17);

            Image close = Picture("Close", window, "pearl_close_button",
                527, 365, 49, 49, new Color(.82f, .74f, .56f, 1f));
            Button closeButton = close.gameObject.AddComponent<Button>();
            closeButton.onClick.AddListener(() => { if (hud) hud.CloseCharacterWindow(); });
            Caption("Close label", close.transform, "X", 0, 0, 35, 35, 25,
                TextAnchor.MiddleCenter, Ink);

            portraitImage = Rect("Live 3D character", window, 0, 30, 340, 470)
                .gameObject.AddComponent<RawImage>();
            portraitImage.color = Color.white;
            portraitImage.raycastTarget = false;

            attributes = Caption("Character stats", window, "", 0, -197, 555, 30, 17,
                TextAnchor.MiddleCenter, Ink);
            hint = Caption("Equipment hint", window, "Select an equipped item to unequip",
                0, 285, 540, 34, 15, TextAnchor.MiddleCenter, Gold);

            // Build an EventSystem only if the scene doesn't already have one.
            if (FindFirstObjectByType<EventSystem>() == null)
                new GameObject("LEOM UI EventSystem",
                    typeof(EventSystem), typeof(StandaloneInputModule));

            canvasObject.SetActive(false);
        }

        private void AddSlot(string id, string caption, float x, float y, float size, int fontSize)
        {
            Image img = Picture("Slot " + id, window, "pearl_equipment_slot",
                x, y, size, size, new Color(.84f, .80f, .70f, 1f));
            Button button = img.gameObject.AddComponent<Button>();
            button.targetGraphic = img;
            string selectedSlot = id;
            button.onClick.AddListener(() => SlotClicked(selectedSlot));
            Text value = Caption("Item " + id, img.transform, "", 0, 0, size - 12, 30, 13,
                TextAnchor.MiddleCenter, Ink);
            Caption("Label " + id, window, caption, x, y - size / 2f - 12, size + 30, 24,
                fontSize, TextAnchor.MiddleCenter, Ink);
            slots.Add(new SlotView { id = id, value = value });
        }

        private void SlotClicked(string slot)
        {
            LeomRpgService service = LeomRpgService.Instance;
            if (service == null) return;
            if (slot == "collector_pet")
            {
                service.Tell("Collector pet is reserved; gameplay not implemented yet.");
                return;
            }
            if (!string.IsNullOrEmpty(service.Equipped(slot)))
                service.UnequipItem(slot);
            else
                service.Tell("Open Bag [B] to equip an item in this slot.");
        }

        private void Update()
        {
            if (canvasObject == null) return;
            bool visible = hud != null && hud.CharacterWindowOpen;
            if (canvasObject.activeSelf != visible) canvasObject.SetActive(visible);
            if (!visible) return;

            RectTransform rootRect = canvasObject.GetComponent<RectTransform>();
            if (rootRect.rect.width > 0 && rootRect.rect.height > 0)
            {
                float fit = Mathf.Min(1f,
                    (rootRect.rect.width - 28f) / WindowWidth,
                    (rootRect.rect.height - 28f) / WindowHeight);
                window.localScale = Vector3.one * Mathf.Max(.25f, fit);
            }

            LeomRpgService rpg = LeomRpgService.Instance;
            if (rpg == null || rpg.Character == null) return;
            LeomRpgSave c = rpg.Character;
            identity.text = c.name + "    Lv. " + c.level + "    " + c.job;
            attributes.text = "STR " + rpg.EffectiveAttribute("strength") +
                "   VIT " + rpg.EffectiveAttribute("vitality") +
                "   AGI " + rpg.EffectiveAttribute("agility") +
                "   INT " + rpg.EffectiveAttribute("intelligence") +
                "   DEX " + rpg.EffectiveAttribute("dexterity");
            foreach (SlotView view in slots)
            {
                string item = view.id == "collector_pet" ? "" : rpg.Equipped(view.id);
                ItemDefinition def = string.IsNullOrEmpty(item) ? null : LegacyCatalog.Item(item);
                string label = def == null ? item : def.name;
                view.value.text = string.IsNullOrEmpty(label) ? "" : label;
            }

            if (portraitCamera == null) TryCreatePortrait();
            if (portraitCamera != null) portraitCamera.Render();
        }

        private static void SetLayer(Transform target, int layer)
        {
            target.gameObject.layer = layer;
            foreach (Transform child in target) SetLayer(child, layer);
        }

        private void TryCreatePortrait()
        {
            var game = PrototypeGame.Instance;
            if (game == null || game.Player == null) return;
            Transform player = game.Player.transform;
            if (player.childCount == 0) return;
            // Clone ONLY the already-authored player visual; never generate a fake portrait.
            Transform visual = player.GetChild(0);
            portraitModel = Instantiate(visual.gameObject,
                new Vector3(14000f, 0f, 14000f), Quaternion.identity);
            portraitModel.name = "LEOM Character Window Visual Clone";
            SetLayer(portraitModel.transform, PortraitLayer);
            foreach (Collider collider in portraitModel.GetComponentsInChildren<Collider>())
                collider.enabled = false;

            portraitTexture = new RenderTexture(512, 768, 16, RenderTextureFormat.ARGB32);
            portraitTexture.Create();
            GameObject cameraObj = new GameObject("LEOM Character Window Camera");
            portraitCamera = cameraObj.AddComponent<Camera>();
            portraitCamera.enabled = false;
            portraitCamera.clearFlags = CameraClearFlags.SolidColor;
            portraitCamera.backgroundColor = new Color(0, 0, 0, 0);
            portraitCamera.cullingMask = 1 << PortraitLayer;
            portraitCamera.orthographic = true;
            portraitCamera.orthographicSize = 2.15f;
            portraitCamera.nearClipPlane = .1f;
            portraitCamera.farClipPlane = 30f;
            portraitCamera.targetTexture = portraitTexture;
            cameraObj.transform.position = new Vector3(14000f, 1.75f, 14006f);
            cameraObj.transform.LookAt(new Vector3(14000f, 1.3f, 14000f));
            portraitImage.texture = portraitTexture;
        }

        private void OnDestroy()
        {
            if (portraitModel != null) Destroy(portraitModel);
            if (portraitCamera != null) Destroy(portraitCamera.gameObject);
            if (portraitTexture != null)
            {
                portraitTexture.Release();
                Destroy(portraitTexture);
            }
            foreach (Sprite sprite in art.Values)
                if (sprite != null) Destroy(sprite);
            if (canvasObject != null) Destroy(canvasObject);
        }
    }
}
