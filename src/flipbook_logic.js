function exportPreviewFramesToFlipbook() {
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

        // 🫥 Hide everything else
        for (var i = 0; i < doc.layers.length; i++) {
          doc.layers[i].visible = (doc.layers[i] === previewGroup);
        }
        previewGroup.visible = true;
        app.refresh();

        var frameCount = previewGroup.layers.length;
        app.echoToOE("[flipbook] 📦 anim_preview contains " + frameCount + " frames.");

        // 👉 Store in temp global for stepping
        window._flipbook = {
          group: previewGroup,
          count: frameCount,
          current: 0,
          doc: doc
        };

        // 👣 Define export step function
        window.stepAndExportNextFrame = function () {
          var ctx = window._flipbook;

          if (!ctx || ctx.current >= ctx.count) {
            delete window._flipbook;
            app.echoToOE("[flipbook] ✅ Exported all frames to OE.");
            return;
          }

          // 🧼 Hide all
          for (var j = 0; j < ctx.count; j++) {
            ctx.group.layers[j].visible = false;
          }

          var layer = ctx.group.layers[ctx.count - 1 - ctx.current]; // Reverse order
          layer.visible = true;
          app.refresh();

          app.echoToOE("[flipbook] 🔁 Ready to export frame " + ctx.current + ": " + layer.name);
          ctx.doc.saveToOE("png");

          ctx.current++;
        };

        // ▶️ Start with first frame
        window.stepAndExportNextFrame();

      } catch (e) {
        app.echoToOE("[flipbook] ❌ ERROR: " + e.message);
      }
    })();
  `;

  setTimeout(() => {
    parent.postMessage(script, "*");
  }, 50);
}

// 👂 Listen for plugin confirmation and step
window.addEventListener("message", function (event) {
  if (typeof event.data === "string" && event.data.trim() === "[flipbook] ✅ frame received") {
    if (typeof stepAndExportNextFrame === "function") {
      stepAndExportNextFrame();
    } else {
      console.warn("⚠️ stepAndExportNextFrame not defined");
    }
  }
});
