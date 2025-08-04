function exportPreviewFramesToFlipbook() {
  console.log("🚀 [flipbook] Starting coordinated frame export");

  const script = `
    // 💡 Setup only once
    if (!window._flipbookListenerRegistered) {
      window.addEventListener("message", function (event) {
        if (typeof event.data === "string" && event.data.trim() === "[flipbook] ✅ frame received") {
          if (window._flipbook && window._flipbook.ready) {
            exportNextFlipbookFrame();
          }
        }
      });
      window._flipbookListenerRegistered = true;
    }

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

        // 🧠 Store global
        window._flipbook = {
          doc: doc,
          group: previewGroup,
          total: frameCount,
          index: frameCount - 1,
          ready: true
        };

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

      // 👁️ Hide all
      for (var j = 0; j < ctx.total; j++) {
        ctx.group.layers[j].visible = false;
      }

      var layer = ctx.group.layers[ctx.index];
      layer.visible = true;
      app.refresh();

      app.echoToOE("[flipbook] 🔁 Ready to export frame " + (ctx.total - ctx.index - 1) + ": " + layer.name);

      // Wait a tick before sending the frame
      setTimeout(() => {
        ctx.doc.saveToOE("png");
        ctx.index--;
      }, 20);
    }
  `;

  setTimeout(() => {
    parent.postMessage(script, "*");
  }, 50);
}

window.exportPreviewFramesToFlipbook = exportPreviewFramesToFlipbook;
