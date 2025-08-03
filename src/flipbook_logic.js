function exportPreviewFramesToFlipbook() {
  const script = `
    (function () {
      try {
        var doc = app.activeDocument;

        // 🔍 Try to locate anim_preview group
        var previewGroup = null;
        for (var i = 0; i < doc.layers.length; i++) {
          var layer = doc.layers[i];
          if (layer.typename === "LayerSet" && layer.name === "anim_preview") {
            previewGroup = layer;
            break;
          }
        }

        if (!previewGroup) {
          app.echoToOE("❌ anim_preview not found");
          return;
        }

        // ✅ Count layers inside anim_preview
        var frameCount = 0;
        for (var i = 0; i < previewGroup.layers.length; i++) {
          var l = previewGroup.layers[i];
          if (l.kind !== undefined) frameCount++;
        }

        app.echoToOE("✅ anim_preview has " + frameCount + " visible frame(s)");
      } catch (e) {
        app.echoToOE("❌ JS error: " + e.message);
      }
    })();
  `;

  window.parent.postMessage(script, "*");
}
