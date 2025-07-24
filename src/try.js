function exportGif() {
  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) {
        alert("❌ No active document.");
        return;
      }

      // Step 1: Find anim_* folders
      var animFolders = doc.layers.filter(l => l.name.indexOf("anim_") === 0 && l.layers && !l.locked);
      if (animFolders.length === 0) {
        alert("❌ No anim_* folders found.");
        return;
      }

      // Step 2: Check if anim_preview exists
      for (var i = 0; i < doc.layers.length; i++) {
        if (doc.layers[i].name === "anim_preview" && doc.layers[i].layers) {
          alert("⚠️ 'anim_preview' already exists. Delete it to re-run.");
          return;
        }
      }

      // Step 3: Create anim_preview folder
      var desc = new ActionDescriptor();
      var ref = new ActionReference();
      ref.putClass(stringIDToTypeID("layerSection"));
      desc.putReference(charIDToTypeID("null"), ref);
      var nameDesc = new ActionDescriptor();
      nameDesc.putString(charIDToTypeID("Nm  "), "anim_preview");
      desc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("layerSection"), nameDesc);
      executeAction(charIDToTypeID("Mk  "), desc, DialogModes.NO);
      var previewGroup = doc.layers[0];

      // Step 4: Get max frame count
      var maxFrames = Math.max(...animFolders.map(f => f.layers.length));

      // Step 5: For each frame, duplicate corresponding layers, merge, and move
      for (var frameIndex = 0; frameIndex < maxFrames; frameIndex++) {
        var dupIds = [];

        for (var i = 0; i < animFolders.length; i++) {
          var folder = animFolders[i];
          var layer = folder.layers[frameIndex] || folder.layers[0]; // fallback
          if (!layer || layer.locked) continue;

          // Duplicate layer by ID
          var dupDesc = new ActionDescriptor();
          var dupRef = new ActionReference();
          dupRef.putIdentifier(charIDToTypeID("Lyr "), layer.id);
          dupDesc.putReference(charIDToTypeID("null"), dupRef);
          executeAction(charIDToTypeID("Dplc"), dupDesc, DialogModes.NO);
          dupIds.push(doc.activeLayer.id);
        }

        if (dupIds.length === 0) continue;

        // Select all duplicates
        var selDesc = new ActionDescriptor();
        var selList = new ActionList();
        for (var j = 0; j < dupIds.length; j++) {
          var selRef = new ActionReference();
          selRef.putIdentifier(charIDToTypeID("Lyr "), dupIds[j]);
          selList.putReference(selRef);
        }
        selDesc.putList(charIDToTypeID("null"), selList);
        selDesc.putBoolean(charIDToTypeID("MkVs"), false);
        executeAction(charIDToTypeID("slct"), selDesc, DialogModes.NO);

        // Merge selected layers
        executeAction(charIDToTypeID("Mrg2"), undefined, DialogModes.NO);
        var merged = doc.activeLayer;
        merged.name = "_a_Frame " + (frameIndex + 1);

        // Move merged layer into anim_preview
        var moveDesc = new ActionDescriptor();
        var moveRef = new ActionReference();
        moveRef.putIdentifier(charIDToTypeID("Lyr "), merged.id);
        moveDesc.putReference(charIDToTypeID("null"), moveRef);
        var toRef = new ActionReference();
        toRef.putIdentifier(charIDToTypeID("Lyr "), previewGroup.id);
        moveDesc.putReference(charIDToTypeID("T   "), toRef);
        moveDesc.putBoolean(charIDToTypeID("Adjs"), false);
        moveDesc.putInteger(charIDToTypeID("Vrsn"), 5);
        executeAction(charIDToTypeID("move"), moveDesc, DialogModes.NO);
      }

      alert("✅ Merged " + maxFrames + " frames into 'anim_preview'");
    })();
  `;

  window.parent.postMessage(script, "*");
}
