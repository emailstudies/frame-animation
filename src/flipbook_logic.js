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

        // 🫥 Hide all other root layers
        for (var i = 0; i < doc.layers.length; i++) {
          doc.layers[i].visible = (doc.layers[i] === previewGroup);
        }
        previewGroup.visible = true;
        app.refresh();

        var frameCount = previewGroup.layers.length;
        app.echoToOE("[flipbook] 📦 anim_preview contains " + frameCount + " frames.");

        // 🧠 Setup global export context
        window._flipbook = {
          doc: doc,
          group: previewGroup,
          total: frameCount,
          index: frameCount - 1
        };

        // ✅ Start loop
        exportNextFlipbookFrame();

      } catch (e) {
        app.echoToOE("[flipbook] ❌ ERROR: " + e.message);
      }
    })();

    function exportNextFlipbookFrame() {
      var ctx = window._flipbook;
      if (!ctx || ctx.index < 0) {
        delete window._flipbook;
        app.echoToOE("[flipbook] ✅ Exported all frames to OE.");
        return;
      }

      // 🔁 Hide all layers
      for (var j = 0; j < ctx.total; j++) {
        ctx.group.layers[j].visible = false;
      }

      var layer = ctx.group.layers[ctx.index];
      layer.visible = true;
      app.refresh();

      app.echoToOE("[flipbook] 🔁 Ready to export frame " + (ctx.total - ctx.index - 1) + ": " + layer.name);
    }

    // 📩 Listen for plugin "continue" message
    window.addEventListener("message", function (event) {
      if (typeof event.data === "string" && event.data.trim() === "[flipbook] ✅ frame received") {
        if (window._flipbook) {
          var ctx = window._flipbook;
          ctx.doc.saveToOE("png");
          ctx.index--;
          exportNextFlipbookFrame();
        }
      }
    });
  `;

  setTimeout(() => {
    parent.postMessage(script, "*");
  }, 50);
}

window.exportPreviewFramesToFlipbook = exportPreviewFramesToFlipbook;
