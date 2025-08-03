function exportPreviewFramesToFlipbook() {
  const script = `
    (function () {
      try {
        var doc = app.activeDocument;
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

        var count = previewGroup.layers.length;
        app.echoToOE("✅ anim_preview has " + count + " frame(s)");
      } catch (e) {
        app.echoToOE("❌ Error: " + e.message);
      }
    })();
  `;

  window.parent.postMessage(script, "*");
}
