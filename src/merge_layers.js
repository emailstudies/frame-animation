function previewGif() {
  duplicateBeforeMerge(); // still runs in browser context

  const script = `
    (function () {
      // Step 1: Get anim_* folders
      var doc = app.activeDocument;
      if (!doc) {
        alert("No active document.");
        return;
      }

      var animFolders = [];
      for (var i = 0; i < doc.layers.length; i++) {
        var l = doc.layers[i];
        if (l.typename === "LayerSet" && l.name.startsWith("anim")) {
          animFolders.push(l);
        }
      }

      if (animFolders.length === 0) {
        alert("❌ No anim_* folders found.");
        return;
      }

      // Step 2: Find max frame count
      var maxFrames = 0;
      for (var i = 0; i < animFolders.length; i++) {
        if (animFolders[i].layers.length > maxFrames) {
          maxFrames = animFolders[i].layers.length;
        }
      }

      // Step 3: Create new document
      var w = doc.width;
      var h = doc.height;
      var r = doc.resolution;
      var previewDoc = app.documents.add(w, h, r, "anim_preview_doc", NewDocumentMode.RGB);
      app.activeDocument = previewDoc;

      // Step 4: Create anim_preview group using action descriptor
      var groupDesc = new ActionDescriptor();
      var ref = new ActionReference();
      ref.putClass(stringIDToTypeID("layerSection"));
      groupDesc.putReference(charIDToTypeID("null"), ref);
      executeAction(charIDToTypeID("Mk  "), groupDesc, DialogModes.NO);

      // Rename the new group
      var newGroup = app.activeDocument.activeLayer;
      newGroup.name = "anim_preview";

      // Step 5: For each frame index
      for (var frameIndex = 0; frameIndex < maxFrames; frameIndex++) {
        var layersToMerge = [];

        for (var j = 0; j < animFolders.length; j++) {
          var folder = animFolders[j];
          if (frameIndex < folder.layers.length) {
            var layer = folder.layers[frameIndex];
            if (layer) {
              var dup = layer.duplicate(previewDoc);
              layersToMerge.push(dup);
            }
          }
        }

        if (layersToMerge.length > 0) {
          // Merge layers from bottom to top
          app.activeDocument.activeLayer = layersToMerge[layersToMerge.length - 1];
          for (var k = layersToMerge.length - 2; k >= 0; k--) {
            app.activeDocument.activeLayer = app.activeDocument.activeLayer.merge(layersToMerge[k]);
          }

          // Rename and move to group
          var merged = app.activeDocument.activeLayer;
          merged.name = "_a_Frame " + (frameIndex + 1);
          merged.move(newGroup, ElementPlacement.PLACEATBEGINNING);
        }
      }

      alert("✅ Preview created in new tab.");
    })();
  `;

  window.parent.postMessage(script, "*");
}
