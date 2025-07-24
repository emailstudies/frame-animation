function previewGif() {
  duplicateBeforeMerge(); // ✅ Pad single-frame folders first

  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) {
        alert("No active document.");
        return;
      }

      // Step 1: Collect anim_* folders
      var animFolders = [];
      for (var i = 0; i < doc.layers.length; i++) {
        var layer = doc.layers[i];
        if (layer.typename === "LayerSet" && layer.name.indexOf("anim") === 0) {
          animFolders.push(layer);
        }
      }

      if (animFolders.length === 0) {
        alert("❌ No anim_* folders found.");
        return;
      }

      // Step 2: Get max number of frames
      var maxFrames = 0;
      for (var i = 0; i < animFolders.length; i++) {
        var count = 0;
        for (var j = 0; j < animFolders[i].layers.length; j++) {
          if (!animFolders[i].layers[j].allLocked) count++;
        }
        if (count > maxFrames) maxFrames = count;
      }

      // Step 3: Create new document
      var width = doc.width;
      var height = doc.height;
      var res = doc.resolution;
      var previewDoc = app.documents.add(width, height, res, "Animation Preview", NewDocumentMode.RGB);
      app.activeDocument = previewDoc;

      // Step 4: Create anim_preview folder
      var previewGroup = previewDoc.layerSets.add();
      previewGroup.name = "anim_preview";

      // Step 5: Merge corresponding frames
      for (var frameIndex = 0; frameIndex < maxFrames; frameIndex++) {
        var layersToMerge = [];

        for (var j = 0; j < animFolders.length; j++) {
          var folder = animFolders[j];
          var frameLayers = [];

          for (var k = 0; k < folder.layers.length; k++) {
            if (!folder.layers[k].allLocked) {
              frameLayers.push(folder.layers[k]);
            }
          }

          if (frameIndex < frameLayers.length) {
            var layerToCopy = frameLayers[frameIndex];
            if (layerToCopy) {
              var dup = layerToCopy.duplicate(previewDoc); // Copy to new doc
              layersToMerge.push(dup);
            }
          }
        }

        // Merge layers
        if (layersToMerge.length > 0) {
          app.activeDocument.activeLayer = layersToMerge[layersToMerge.length - 1];

          for (var m = layersToMerge.length - 2; m >= 0; m--) {
            app.activeDocument.activeLayer = app.activeDocument.activeLayer.merge(layersToMerge[m]);
          }

          var merged = app.activeDocument.activeLayer;
          merged.name = "_a_Frame " + (frameIndex + 1);

          // Move to preview folder
          // NOTE: .add(merged) does not exist in Photopea. No need to move.
          // Just leave it at top-level if needed, or rename it.
        }
      }

      alert("✅ Preview created with " + maxFrames + " merged frames.");
    })();
  `;

  window.parent.postMessage(script, "*");
}
