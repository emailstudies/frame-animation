function previewGif() {
  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) {
        alert("No active document.");
        return;
      }

      var animFolders = [];
      for (var i = 0; i < doc.layers.length; i++) {
        var layer = doc.layers[i];
        if (layer.typename === "LayerSet" && layer.name.startsWith("anim")) {
          animFolders.push(layer);
        }
      }

      if (animFolders.length === 0) {
        alert("No anim_* folders found.");
        return;
      }

      // Step 1: Find max number of layers across all anim_* folders
      var maxFrames = 0;
      for (var i = 0; i < animFolders.length; i++) {
        var count = animFolders[i].layers.length;
        if (count > maxFrames) {
          maxFrames = count;
        }
      }

      if (maxFrames <= 1) {
        alert("All folders have 1 or fewer layers. No duplication needed.");
        return;
      }

      // Step 2: Duplicate in folders that have exactly 1 layer
      for (var i = 0; i < animFolders.length; i++) {
        var folder = animFolders[i];
        if (folder.layers.length === 1) {
          var baseLayer = folder.layers[0];
          for (var j = 1; j < maxFrames; j++) {
            var dup = baseLayer.duplicate();
            folder.insertLayer(dup); // insert at top
          }
          console.log("Duplicated layer in " + folder.name + " to " + maxFrames + " layers.");
        }
      }

      alert("✅ Single-layer folders duplicated to match max frame count (" + maxFrames + ").");
    })();
  `;

  window.parent.postMessage(script, "*");
}
