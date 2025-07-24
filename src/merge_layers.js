function previewGif() {
  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) {
        alert("❌ No active document.");
        return;
      }

      // Step 1: Get all anim_* folders except anim_preview
      var animFolders = [];
      for (var i = 0; i < doc.layerSets.length; i++) {
        var group = doc.layerSets[i];
        if (group.name.startsWith("anim_") && group.name !== "anim_preview" && !group.allLocked) {
          animFolders.push(group);
        }
      }

      if (animFolders.length === 0) {
        alert("❌ No animation folders found.");
        return;
      }

      // Step 2: Determine max number of frames
      var maxFrames = 0;
      for (var i = 0; i < animFolders.length; i++) {
        maxFrames = Math.max(maxFrames, animFolders[i].layers.length);
      }

      // Step 3: Create new document for preview
      app.runMenuItem("newDocument");
      var newDoc = app.activeDocument;

      // Step 4: Create anim_preview folder
      var desc = new ActionDescriptor();
      var ref = new ActionReference();
      ref.putClass(stringIDToTypeID("layerSection"));
      desc.putReference(charIDToTypeID("null"), ref);
      var nameDesc = new ActionDescriptor();
      nameDesc.putString(charIDToTypeID("Nm  "), "anim_preview");
      desc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("layerSection"), nameDesc);
      executeAction(charIDToTypeID("Mk  "), desc, DialogModes.NO);

      var previewGroup = newDoc.layerSets[0];

      // Step 5: For each frame index
      for (var f = 0; f < maxFrames; f++) {
        var tempDuplicates = [];

        // Step 6: Grab corresponding frame from each anim folder
        for (var j = 0; j < animFolders.length; j++) {
          var folder = animFolders[j];
          var layerCount = folder.layers.length;
          var frameIndex = layerCount - 1 - f; // Top-down (UI order)

          var frameLayer = folder.layers[frameIndex >= 0 ? frameIndex : 0]; // fallback
          if (frameLayer) {
            var dup = frameLayer.duplicate();
            tempDuplicates.push(dup);
          }
        }

        // Step 7: Deselect everything in newDoc
        for (var k = 0; k < newDoc.layers.length; k++) {
          newDoc.layers[k].selected = false;
        }

        // Step 8: Select all duplicates
        for (var m = 0; m < tempDuplicates.length; m++) {
          tempDuplicates[m].selected = true;
        }

        // Step 9: Merge and name
        newDoc.mergeLayers();
        var merged = newDoc.activeLayer;
        merged.name = "_a_Frame " + (f + 1);
        merged.move(previewGroup, ElementPlacement.INSIDE);
      }

      alert("✅ Preview frames merged into 'anim_preview' in new tab.");
    })();
  `.trim();

  window.parent.postMessage(script, "*");
}
