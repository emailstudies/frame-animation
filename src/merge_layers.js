function previewGif() {
  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) {
        alert("❌ No active document.");
        return;
      }

      // Step 1: Get all anim_* folders
      var animFolders = [];
      for (var i = 0; i < doc.layerSets.length; i++) {
        var group = doc.layerSets[i];
        if (group.name.startsWith("anim_") && group.name !== "anim_preview") {
          animFolders.push(group);
        }
      }

      if (animFolders.length === 0) {
        alert("❌ No animation folders found.");
        return;
      }

      // Step 2: Get max frame count across folders
      var maxFrames = 0;
      for (var i = 0; i < animFolders.length; i++) {
        maxFrames = Math.max(maxFrames, animFolders[i].layers.length);
      }

      // Step 3: Create new document for anim_preview
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

        // Step 6: From each anim folder, grab frameIndex from bottom
        for (var j = 0; j < animFolders.length; j++) {
          var folder = animFolders[j];
          var frameIndex = folder.layers.length - 1 - f; // bottom-up
          if (frameIndex >= 0) {
            var original = folder.layers[frameIndex];
            var copy = original.duplicate();
            tempDuplicates.push(copy);
          }
        }

        // Step 7: Deselect all
        for (var d = 0; d < newDoc.layers.length; d++) {
          newDoc.layers[d].selected = false;
        }

        // Step 8: Select all duplicates
        for (var s = 0; s < tempDuplicates.length; s++) {
          tempDuplicates[s].selected = true;
        }

        // Step 9: Merge
        newDoc.mergeLayers();
        var merged = newDoc.activeLayer;
        merged.name = "_a_Frame " + (f + 1);
        merged.move(previewGroup, ElementPlacement.INSIDE);
      }

      alert("✅ Preview frames merged into anim_preview in new tab.");
    })();
  `.trim();

  window.parent.postMessage(script, "*");
}
