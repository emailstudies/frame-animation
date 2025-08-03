export function exportPreviewFramesToFlipbook() {
  console.log("🚀 Running exportPreviewFramesToFlipbook()");

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

        var frameCount = previewGroup.layers.length;
        app.echoToOE("📦 anim_preview contains " + frameCount + " frames.");
        app.refresh();
      } catch (e) {
        app.echoToOE("❌ Error checking anim_preview: " + e.toString());
      }
    })();
  `;

  // Add slight delay to allow Photopea to finalize frame structure
  setTimeout(() => {
    window.parent.postMessage(script, "*");
  }, 50); // 200ms is a safe bet
}
