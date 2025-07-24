function previewGif() {
  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) {
        alert("❌ No active document.");
        return;
      }

      // Step 1: Collect all anim_* folders manually
      var animFolders = [];
      for (var i = 0; i < doc.layers.length; i++) {
        var layer = doc.layers[i];
        if (
          layer.kind === "group" &&
          layer.name.startsWith("anim_") &&
          !layer.locked &&
          layer.visible
        ) {
          animFolders.push(layer);
        }
      }

      if (animFolders.length === 0) {
        alert("❌ No anim_* folders found.");
        return;
      }

      // Step 2: Check for existing anim_preview
      var existingPreview = null;
      for (var i = 0; i < doc.layers.length; i++) {
        if (doc.layers[i].name === "anim_preview") {
          existingPreview = doc.layers[i];
          break;
        }
      }

      if (existingPreview) {
        alert("⚠️ 'anim_preview' already exists. Delete it to re-run.");
        return;
      }

      // Step 3: Find max number of frames
      var maxFrames = 0;
      for (var i = 0; i < animFolders.length; i++) {
        var count = animFolders[i].layers.length;
        if (count > maxFrames) maxFrames = count;
      }

      // Step 4: Create anim_preview folder
      var previewGroup = doc.createLayerGroup("anim_preview");

      // Step 5: Merge corresponding frame layers
      for (var i = 0; i < maxFrames; i++) {
        var layersToMerge = [];

        for (var j = 0; j < animFolders.length; j++) {
          var folder = animFolders[j];
          var frameLayer = folder.layers[i];

          if (frameLayer && !frameLayer.locked && frameLayer.visible) {
            layersToMerge.push(frameLayer.duplicate());
          }
        }

        if (layersToMerge.length > 0) {
          doc.activeLayers = layersToMerge;
          var merged = doc.activeLayer.merge();
          merged.name = "_a_Frame " + (i + 1);
          merged.moveTo(previewGroup);
        }
      }

      alert("✅ Merged " + maxFrames + " frames into 'anim_preview'");
    })();
  `;

  // ✅ Send to Photopea
  window.parent.postMessage(script, "*");
}
