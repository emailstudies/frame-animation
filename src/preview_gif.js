function previewGif() {
  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) {
        alert("No active document.");
        return;
      }

      var animGroup = null;

      // Find the first anim_* folder
      for (var i = 0; i < doc.layers.length; i++) {
        var group = doc.layers[i];
        if (group.typename === "LayerSet" && group.name.indexOf("anim_") === 0) {
          animGroup = group;
          break;
        }
      }

      if (!animGroup) {
        alert("❌ No anim_* folder found.");
        return;
      }

      // Hide all layers first
      for (var j = 0; j < animGroup.layers.length; j++) {
        animGroup.layers[j].visible = false;
      }

      var results = [];
      for (var k = 0; k < animGroup.layers.length; k++) {
        var layer = animGroup.layers[k];
        if (layer.typename !== "ArtLayer") continue;

        try {
          layer.visible = true;
          app.activeDocument.activeLayer = layer;

          // Save to PNG
          var png = app.activeDocument.saveToOE("png");
          results.push(png);  // Just store PNG string for now
          layer.visible = false;
        } catch (e) {
          alert("Error saving layer: " + layer.name + "\\n" + e);
        }
      }

      if (results.length > 0) {
        // DEBUG: show how many frames we captured
        prompt("✅ Frame data collected:", results.length + " image(s)");
      } else {
        alert("❌ No frames collected.");
      }

      // No postMessage yet — we're testing just inside Photopea
    })();
  `;

  // Send script to Photopea
  window.parent.postMessage(script, "*");
}
