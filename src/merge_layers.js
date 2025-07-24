function previewGif() {
  // Plugin-side first: pad layers (async allowed here)
  duplicateBeforeMerge().then(() => {
    // Now send the actual merge script (sync only)
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
          if (layer.typename === "LayerSet" && layer.name.indexOf("anim") === 0) {
            animFolders.push(layer);
          }
        }

        if (animFolders.length === 0) {
          alert("❌ No anim_* folders found.");
          return;
        }

        var maxFrames = 0;
        for (var i = 0; i < animFolders.length; i++) {
          var count = 0;
          for (var j = 0; j < animFolders[i].layers.length; j++) {
            if (!animFolders[i].layers[j].allLocked) count++;
          }
          if (count > maxFrames) maxFrames = count;
        }

        var width = doc.width;
        var height = doc.height;
        var res = doc.resolution;
        var previewDoc = app.documents.add(width, height, res, "Animation Preview", NewDocumentMode.RGB);
        app.activeDocument = previewDoc;

        var previewGroup = previewDoc.layerSets.add();
        previewGroup.name = "anim_preview";

        for (var frameIndex = 0; frameIndex < maxFrames; frameIndex++) {
          var tempGroup = previewDoc.layerSets.add();
          tempGroup.name = "temp_merge_" + frameIndex;

          for (var j = 0; j < animFolders.length; j++) {
            var folder = animFolders[j];
            var unlocked = [];
            for (var k = 0; k < folder.layers.length; k++) {
              if (!folder.layers[k].allLocked) unlocked.push(folder.layers[k]);
            }

            if (frameIndex < unlocked.length) {
              var layerToCopy = unlocked[frameIndex];
              if (layerToCopy) {
                var dup = layerToCopy.duplicate(previewDoc);
                dup.move(tempGroup, ElementPlacement.INSIDE);
              }
            }
          }

          previewDoc.activeLayer = tempGroup;
          tempGroup.merge();

          previewDoc.activeLayer.name = "_a_Frame " + (frameIndex + 1);
          previewDoc.activeLayer.move(previewGroup, ElementPlacement.INSIDE);
        }

        alert("✅ Preview created with " + maxFrames + " merged frames.");
      })();
    `;
    window.parent.postMessage(script, "*");
  });
}
