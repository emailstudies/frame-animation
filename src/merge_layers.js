function previewGif() {
  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) {
        alert("❌ No active document.");
        return;
      }

      // Step 1: Get all anim_* folders
      var animFolders = doc.layers.filter(function(layer) {
        return (
          layer.kind === "group" &&
          layer.name.startsWith("anim_") &&
          !layer.locked &&
          layer.visible
        );
      });

      if (animFolders.length === 0) {
        alert("❌ No anim_* folders found.");
        return;
      }

      // Step 2: Determine max frames
      var maxFrames = 0;
      for (var i = 0; i < animFolders.length; i++) {
        if (animFolders[i].layers.length > maxFrames) {
          maxFrames = animFolders[i].layers.length;
        }
      }

      // Step 3: Check if anim_preview already exists
      var existingPreview = doc.layers.find(function(layer) {
        return layer.name === "anim_preview";
      });
      if (existingPreview) {
        alert("⚠️ 'anim_preview' already exists. Delete it to re-run.");
        return;
      }

      // Step 4: Create anim_preview folder
      var previewGroup = doc.createLayerGroup("anim_preview");

      // Step 5: Loop through each frame index
      for (var i = 0; i < maxFrames; i++) {
        var layersToMerge = [];

        for (var j = 0; j < animFolders.length; j++) {
          var folder = animFolders[j];
          var frameLayer = folder.layers[i];

          if (frameLayer && !frameLayer.locked && frameLayer.visible) {
            layersToMerge.push(frameLayer.duplicate());
          }
        }

        // Step 6: Merge this frame's layers
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

  // ✅ CORRECT POSTMESSAGE CALL
  window.parent.postMessage(script, "*");
}
