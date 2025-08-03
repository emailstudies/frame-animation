function exportPreviewFramesToFlipbook() {
  console.log("🚀 Running exportPreviewFramesToFlipbook()");

  const script = `
    (function () {
      try {
        var doc = app.activeDocument;
        var previewGroup = null;

        // 1. Find anim_preview group
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

        // 2. Hide all other layer groups and root layers
        for (var i = 0; i < doc.layers.length; i++) {
          var layer = doc.layers[i];
          if (layer !== previewGroup) {
            layer.visible = false;
          }
        }

        // 3. Make anim_preview group visible
        previewGroup.visible = true;

        var frameCount = previewGroup.layers.length;
        app.echoToOE("[flipbook] 📦 anim_preview contains " + frameCount + " frames.");

        // 4. Export each visible frame
        for (var i = frameCount - 1; i >= 0; i--) {
          // Hide all preview layers first
          for (var j = 0; j < frameCount; j++) {
            previewGroup.layers[j].visible = false;
          }

          // Show current frame layer
          var currentLayer = previewGroup.layers[i];
          currentLayer.visible = true;
          app.refresh();

          // Save visible state as PNG
          doc.saveToOE("png");
        }

        app.echoToOE("[flipbook] ✅ Exported all frames to OE.");
      } catch (e) {
        app.echoToOE("[flipbook] ❌ ERROR: " + e.message);
      }
    })();
  `;

  setTimeout(() => {
    parent.postMessage(script, "*");
  }, 50);
}
