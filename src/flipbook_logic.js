function exportPreviewFramesToFlipbook() {
  const script = `
    (function () {
      try {
        var doc = app.activeDocument;
        var previewFolder = null;

        // Find the 'anim_preview' folder
        for (var i = 0; i < doc.layers.length; i++) {
          var layer = doc.layers[i];
          if (layer.typename === "LayerSet" && layer.name === "anim_preview") {
            previewFolder = layer;
            break;
          }
        }

        if (!previewFolder) {
          app.echoToOE("❌ anim_preview not found");
          return;
        }

        var numFrames = previewFolder.layers.length;
        app.echoToOE("✅ anim_preview has " + numFrames + " frame(s)");
      } catch (e) {
        app.echoToOE("❌ Error: " + e.message);
      }
    })();
  `;

  parent.postMessage(script, "*");
}
