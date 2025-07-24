function previewGif() {
  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) {
        alert("❌ No active document.");
        return;
      }

      var animFolders = doc.layers.filter(layer =>
        layer.kind === "group" &&
        layer.name.startsWith("anim_") &&
        !layer.locked
      );

      if (animFolders.length === 0) {
        alert("❌ No anim_* folders found.");
        return;
      }

      var maxFrames = Math.max(...animFolders.map(f => f.layers.length));
      var existingPreview = doc.layers.find(l => l.name === "anim_preview");
      if (existingPreview) {
        alert("⚠️ 'anim_preview' already exists. Delete it to re-run.");
        return;
      }

      var previewGroup = doc.createLayerGroup("anim_preview");

      for (var i = 0; i < maxFrames; i++) {
        var layersToMerge = [];

        for (var j = 0; j < animFolders.length; j++) {
          var folder = animFolders[j];
          var frameLayer = folder.layers[i];
          if (frameLayer && !frameLayer.locked) {
            layersToMerge.push(frameLayer.duplicate());
          }
        }

        if (layersToMerge.length > 0) {
          var merged = app.activeDocument.mergeLayers(layersToMerge);
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
