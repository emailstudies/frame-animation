function previewGif() {
  duplicateBeforeMerge(); // Step 1: duplicate 1-layer folders to max length

  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) {
        alert("No active document.");
        return;
      }

      // Step 2: Collect all anim_* folders
      var animFolders = [];
      for (var i = 0; i < doc.layers.length; i++) {
        var layer = doc.layers[i];
        if (layer.typename === "LayerSet" && layer.name.startsWith("anim")) {
          animFolders.push(layer);
        }
      }

      if (animFolders.length === 0) {
        alert("❌ No anim_* folders found.");
        return;
      }

      // Step 3: Find max number of layers (frames)
      var maxFrames = 0;
      for (var i = 0; i < animFolders.length; i++) {
        var count = animFolders[i].layers.length;
        if (count > maxFrames) {
          maxFrames = count;
        }
      }

      // Step 4: Create new document for preview
      var width = doc.width;
      var height = doc.height;
      var res = doc.resolution;
      var previewDoc = app.documents.add(width, height, res, "Animation Preview", NewDocumentMode.RGB);
      app.activeDocument = previewDoc;

      // Step 5: Create 'anim_preview' folder
      var previewFolder = previewDoc.layerSets.add();
      previewFolder.name = "anim_preview";

      // Step 6: Loop through each frame index
      for (var frameIndex = 0; frameIndex < maxFrames; frameIndex++) {
        var layersToMerge = [];

        for (var j = 0; j < animFolders.length; j++) {
          var folder = animFolders[j];
          if (frameIndex < folder.layers.length) {
            var srcLayer = folder.layers[frameIndex];
            if (srcLayer) {
              var dup = srcLayer.duplicate(previewDoc);
              layersToMerge.push(dup);
            }
          }
        }

        if (layersToMerge.length > 0) {
          // Make sure layers are active and merged in correct order (bottom to top)
          previewDoc.activeLayer = layersToMerge[layersToMerge.length - 1];
          for (var k = layersToMerge.length - 2; k >= 0; k--) {
            previewDoc.activeLayer = previewDoc.activeLayer.merge(layersToMerge[k]);
          }

          var merged = previewDoc.activeLayer;
          merged.name = "_a_Frame " + (frameIndex + 1);

          // Move merged layer into anim_preview folder
          previewFolder.artLayers.add(merged);
        }
      }

      alert("✅ Merged preview created in new tab with " + maxFrames + " frames.");
    })();
  `;

  window.parent.postMessage(script, "*");
}

