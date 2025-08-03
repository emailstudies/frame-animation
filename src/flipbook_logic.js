function exportPreviewFramesToFlipbook() {
  console.log("🚀 Running exportPreviewFramesToFlipbook()");

  const script = `
    (function () {
      try {
        var doc = app.activeDocument;
        var previewGroup = null;

        // Locate anim_preview folder
        for (var i = 0; i < doc.layers.length; i++) {
          var layer = doc.layers[i];
          if (layer.typename === "LayerSet" && layer.name === "anim_preview") {
            previewGroup = layer;
          } else {
            // Turn off visibility for all other LayerSets and Layers at root
            layer.visible = false;
          }
        }

        if (!previewGroup) {
          app.echoToOE("[flipbook] ❌ anim_preview not found");
          return;
        }

        // Ensure anim_preview itself is visible
        previewGroup.visible = true;

        // Count how many frames are inside
        var frameCount = previewGroup.layers.length;
        app.echoToOE("[flipbook] 📦 anim_preview contains " + frameCount + " frames.");
        app.refresh();
      } catch (e) {
        app.echoToOE("[flipbook] ❌ Error checking anim_preview: " + e.toString());
      }
    })();
  `;

  setTimeout(() => {
    window.parent.postMessage(script, "*");
  }, 50);
}
