function previewGif() {
  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) {
        alert("❌ No active document.");
        return;
      }

      // Step 1: Collect all anim_* folders (ignore anim_preview and locked)
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

      // Step 2: Find max frame count
      var maxFrames = 0;
      for (var i = 0; i < animFolders.length; i++) {
        var folder = animFolders[i];
        if (folder.layers.length > maxFrames) maxFrames = folder.layers.length;
      }

      // Step 3: Create array of frameGroups[i] = [frame i from each anim folder]
      var frameGroups = [];
      for (var f = 0; f < maxFrames; f++) {
        var frameSet = [];
        for (var a = 0; a < animFolders.length; a++) {
          var folder = animFolders[a];
          var layerCount = folder.layers.length;
          var index = layerCount - 1 - f; // top-down
          var layer = folder.layers[index >= 0 ? index : 0]; // fallback to first if out of bounds
          frameSet.push(layer);
        }
        frameGroups.push(frameSet);
      }

      // Step 4: Create new document and anim_preview folder
      app.runMenuItem("newDocument");
      var newDoc = app.activeDocument;

      var desc = new ActionDescriptor();
      var ref = new ActionReference();
      ref.putClass(stringIDToTypeID("layerSection"));
      desc.putReference(charIDToTypeID("null"), ref);
      var nameDesc = new ActionDescriptor();
      nameDesc.putString(charIDToTypeID("Nm  "), "anim_preview");
      desc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("layerSection"), nameDesc);
      executeAction(charIDToTypeID("Mk  "), desc, DialogModes.NO);

      var previewGroup = newDoc.layerSets[0];

      // Step 5: For each frame group, duplicate -> merge -> name -> move
      for (var f = 0; f < frameGroups.length; f++) {
        var frameSet = frameGroups[f];
        var dupes = [];

        for (var i = 0; i < frameSet.length; i++) {
          var dup = frameSet[i].duplicate();
          dupes.push(dup);
        }

        // Deselect all in newDoc
        for (var d = 0; d < newDoc.layers.length; d++) {
          newDoc.layers[d].selected = false;
        }

        // Select all dupes
        for (var s = 0; s < dupes.length; s++) {
          dupes[s].selected = true;
        }

        // Merge and rename
        newDoc.mergeLayers();
        var merged = newDoc.activeLayer;
        merged.name = "_a_Frame " + (f + 1);
        merged.move(previewGroup, ElementPlacement.INSIDE);
      }

      alert("✅ Preview created with " + frameGroups.length + " frames.");
    })();
  `.trim();

  window.parent.postMessage(script, "*");
}
