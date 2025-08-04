// ✅ flipbook_logic.js (Photopea-side logic for exporting anim_preview frame-by-frame)

// 🔁 Step through each frame from anim_preview and export to OE
window.stepAndExportNextFrame = function () {
  const script = `
    (function () {
      try {
        var doc = app.activeDocument;
        var group = null;

        // 🔍 Find the anim_preview group
        for (var i = 0; i < doc.layers.length; i++) {
          var layer = doc.layers[i];
          if (layer.typename === "LayerSet" && layer.name === "anim_preview") {
            group = layer;
            break;
          }
        }

        if (!group) {
          app.echoToOE("[flipbook] ❌ anim_preview group missing during step");
          return;
        }

        // 🧮 Init index if needed
        if (typeof window._flipbookIndex === "undefined") {
          window._flipbookIndex = 0;
        }

        // ✅ All frames sent
        if (window._flipbookIndex >= group.layers.length) {
          app.echoToOE("[flipbook] ✅ Exported all frames to OE.");
          delete window._flipbookIndex;
          return;
        }

        // 🫥 Hide all frames
        for (var j = 0; j < group.layers.length; j++) {
          group.layers[j].visible = false;
        }

        // 👁️ Show the current frame
        var layer = group.layers[window._flipbookIndex];
        layer.visible = true;
        app.refresh();

        app.echoToOE("[flipbook] 🔁 Ready to export frame " + window._flipbookIndex + ": " + layer.name);
        doc.saveToOE("png");

        // ➕ Move to next
        window._flipbookIndex++;
      } catch (e) {
        app.echoToOE("[flipbook] ❌ JS ERROR: " + e.message);
      }
    })();
  `;
  parent.postMessage(script, "*");
};

// 🚀 Start export loop after anim_preview is ready
window.exportPreviewFramesToFlipbook = function () {
  console.log("🚀 [flipbook] Starting coordinated frame export");

  const script = `
    (function () {
      try {
        var doc = app.activeDocument;
        var previewGroup = null;

        // 🔍 Find anim_preview
        for (var i = 0; i < doc.layers.length; i++) {
          var layer = doc.layers[i];
          if (layer.typename === "LayerSet" && layer.name === "anim_preview") {
            previewGroup = layer;
            break;
          }
        }

        if (!previewGroup) {
          app.echoToOE("[flipbook] ❌ anim_preview not found");
          return;
        }

        // 🫥 Hide all except anim_preview
        for (var i = 0; i < doc.layers.length; i++) {
          doc.layers[i].visible = (doc.layers[i] === previewGroup);
        }
        previewGroup.visible = true;
        app.refresh();

        app.echoToOE("[flipbook] 📦 anim_preview contains " + previewGroup.layers.length + " frames.");

        // ✅ Start export
        window._flipbookIndex = 0;
        app.echoToOE("[flipbook] ✅ anim_preview created - done");
      } catch (e) {
        app.echoToOE("[flipbook] ❌ JS ERROR: " + e.message);
      }
    })();
  `;

  parent.postMessage(script, "*");

  // ✅ Immediately trigger first frame export
  setTimeout(() => {
    window.stepAndExportNextFrame();
  }, 100);
};

// 📨 Listen for plugin message to continue export
window.addEventListener("message", (event) => {
  if (
    typeof event.data === "string" &&
    event.data.trim() === "[flipbook] ✅ frame received"
  ) {
    console.log("📬 [flipbook] Frame ACK received — stepping next");
    window.stepAndExportNextFrame();
  }
});
