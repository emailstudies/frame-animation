function exportGif() {
  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) {
        alert("❌ No active document.");
        return;
      }

      // Step 1: Collect anim_* folders (unlocked, visible groups)
      var animFolders = [];
      for (var i = 0; i < doc.layers.length; i++) {
        var layer = doc.layers[i];
        if (
          layer.name.indexOf("anim_") === 0 &&
          layer.typename === "LayerSet" &&
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

      // Step 2: Check if anim_preview already exists
      for (var i = 0; i < doc.layers.length; i++) {
        if (
          doc.layers[i].typename === "LayerSet" &&
          doc.layers[i].name === "anim_preview"
        ) {
          alert("⚠️ 'anim_preview' already exists. Delete it to re-run.");
          return;
        }
      }

      // Step 3: Get max frame count
      var maxFrames = 0;
      for (var i = 0; i < animFolders.length; i++) {
        if (animFolders[i].layers.length > maxFrames) {
          maxFrames = animFolders[i].layers.length;
        }
      }

      // Step 4: Create anim_preview folder
      var desc = new ActionDescriptor();
      var ref = new ActionReference();
      ref.putClass(stringIDToTypeID("layerSection"));
      desc.putReference(charIDToTypeID("null"), ref);

      var nameDesc = new ActionDescriptor();
      nameDesc.putString(charIDToTypeID("Nm  "), "anim_preview");
      desc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("layerSection"), nameDesc);

      executeAction(charIDToTypeID("Mk  "), desc, DialogModes.NO);
      var previewGroup = doc.layers[0];

      // Step 5: Merge frame layers
      for (var frameIndex = 0; frameIndex < maxFrames; frameIndex++) {
        var dupIds = [];

        for (var j = 0; j < animFolders.length; j++) {
          var folder = animFolders[j];
          var layer = folder.layers[frameIndex] || folder.layers[0];

          if (!layer || layer.locked || !layer.visible) continue;

          // Duplicate layer by ID
          var dupDesc = new ActionDescriptor();
          var dupRef = new ActionReference();
          dupRef.putIdentifier(charIDToTypeID("Lyr "), layer.id);
          dupDesc.putReference(charIDToTypeID("null"), dupRef);
          executeAction(charIDToTypeID("Dplc"), dupDesc, DialogModes.NO);
          dupIds.push(doc.activeLayer.id);
        }

        if (dupIds.length === 0) continue;

        // Select all duplicated layers
        var selDesc = new ActionDescriptor();
        var selList = new ActionList();
        for (var s = 0; s < dupIds.length; s++) {
          var selRef = new ActionReference();
          selRef.putIdentifier(charIDToTypeID("Lyr "), dupIds[s]);
          selList.putReference(selRef);
        }
        selDesc.putList(charIDToTypeID("null"), selList);
        selDesc.putBoolean(charIDToTypeID("MkVs"), false);
        executeAction(charIDToTypeID("slct"), selDesc, DialogModes.NO);

        // Merge selected layers
        executeAction(charIDToTypeID("Mrg2"), undefined, DialogModes.NO);
        var merged = doc.activeLayer;
        merged.name = "_a_Frame " + (frameIndex + 1);

        // Move merged layer into previewGroup
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
