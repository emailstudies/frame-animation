function exportPreviewFramesToFlipbook() {
  console.log("🚀 Running exportPreviewFramesToFlipbook()");

  const script = `
    (function () {
      try {
        var doc = app.activeDocument;
        var animGroup = null;

        // Step 1: Find 'anim_preview'
        for (var i = 0; i < doc.layers.length; i++) {
          var layer = doc.layers[i];
          if (layer.typename === "LayerSet" && layer.name === "anim_preview") {
            animGroup = layer;
            break;
          }
        }

        if (!animGroup) {
          app.echoToOE("[flipbook] ❌ anim_preview not found.");
          return;
        }

        // Step 2: Hide all other folders and root-level layers
        for (var i = 0; i < doc.layers.length; i++) {
          var layer = doc.layers[i];
          if (layer !== animGroup) {
            layer.visible = false;
          }
        }

        var frames = animGroup.layers;
        app.echoToOE("[flipbook] 📦 anim_preview contains " + frames.length + " frames.");

        // Step 3: Export each layer one at a time
        for (var i = frames.length - 1; i >= 0; i--) {
          // Hide all layers first
          for (var j = 0; j < frames.length; j++) {
            frames[j].visible = false;
          }

          // Show only current frame
          frames[i].visible = true;

          app.refresh();
          app.saveToOE("png");
        }

        app.echoToOE("[flipbook] ✅ Exported all frames to OE.");
      } catch (err) {
        app.echoToOE("[flipbook] ❌ Error: " + err.toString());
      }
    })();
  `;

  
// Post to Photopea
  window.parent.postMessage(script, "*");
}
