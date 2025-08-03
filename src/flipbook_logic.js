function exportPreviewFramesToFlipbook() {
  const script = `
    (function () {
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

      var frameCount = previewGroup.layers.length;
      app.echoToOE("📦 anim_preview contains " + frameCount + " frames.");
    })();
  `;

  parent.postMessage(script, "*");
}
