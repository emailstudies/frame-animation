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

        // 2. Hide all other top-level layers except anim_preview
        for (var i = 0; i < doc.layers.length; i++) {
          var layer = doc.layers[i];
          layer.visible = (layer === previewGroup);
        }

        // 3. Show the group
        previewGroup.visible = true;

        var frameCount = previewGroup.layers.length;
        app.echoToOE("[flipbook] 📦 anim_preview contains " + frameCount + " frames.");

        // 4. Export frames in order (0 to N-1)
        for (var i = 0; i < frameCount; i++) {
          // Hide all
          for (var j = 0; j < frameCount; j++) {
            previewGroup.layers[j].visible = false;
          }

          // Show this one
          var currentLayer = previewGroup.layers[i];
          currentLayer.visible = true;
          app.refresh();

          app.echoToOE("[flipbook] 🔁 Exporting frame " + i + ": " + currentLayer.name);
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
