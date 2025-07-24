function exportGif() {
  const script = `
  (function () {
    var doc = app.activeDocument;
    if (!doc) {
      alert("❌ No active document.");
      return;
    }

    // 1. Collect anim_* folders
    var animFolders = [];
    for (var i = 0; i < doc.layerSets.length; i++) {
      var g = doc.layerSets[i];
      if (g.name.startsWith("anim_")) {
        animFolders.push(g);
      }
    }

    if (animFolders.length === 0) {
      alert("❌ No folders found starting with 'anim_'.");
      return;
    }

    // 2. Map each folder's visible layers (top-to-bottom UI order)
    var folderFrames = [];
    var maxFrames = 0;

    for (var i = 0; i < animFolders.length; i++) {
      var folder = animFolders[i];
      var frames = [];

      for (var j = folder.layers.length - 1; j >= 0; j--) {
        var layer = folder.layers[j];
        if (layer && layer.visible) {
          frames.push(layer);
        }
      }

      folderFrames.push(frames);
      if (frames.length > maxFrames) maxFrames = frames.length;
    }

    // 3. Frame map → array of arrays per frame index
    var frameMap = [];
    for (var f = 0; f < maxFrames; f++) {
      var frame = [];
      for (var i = 0; i < folderFrames.length; i++) {
        var layer = folderFrames[i][f];
        if (layer) frame.push(layer);
      }
      frameMap.push(frame);
    }

    // 4. Create new PSD for preview
    var newDoc = app.documents.add(doc.width, doc.height, doc.resolution, "anim_preview", NewDocumentMode.RGB);
    app.activeDocument = newDoc;

    // 5. Loop over frameMap and duplicate+merge
    for (var f = 0; f < frameMap.length; f++) {
      var layerIDs = [];

      for (var i = 0; i < frameMap[f].length; i++) {
        var original = frameMap[f][i];
        try {
          // Duplicate using ActionDescriptor
          var dupDesc = new ActionDescriptor();
          var ref = new ActionReference();
          ref.putIdentifier(charIDToTypeID("Lyr "), original.id);
          dupDesc.putReference(charIDToTypeID("null"), ref);
          dupDesc.putInteger(charIDToTypeID("Vrsn"), 5);
          executeAction(charIDToTypeID("Dplc"), dupDesc, DialogModes.NO);

          var duplicated = app.activeDocument.activeLayer;
          layerIDs.push(duplicated.id);
        } catch (e) {
          alert("❌ Failed to duplicate: " + original.name);
        }
      }

      // Select and merge layers
      if (layerIDs.length > 0) {
        var selectDesc = new ActionDescriptor();
        var list = new ActionList();
        for (var i = 0; i < layerIDs.length; i++) {
          var ref = new ActionReference();
          ref.putIdentifier(charIDToTypeID("Lyr "), layerIDs[i]);
          list.putReference(ref);
        }
        selectDesc.putList(charIDToTypeID("null"), list);
        executeAction(charIDToTypeID("slct"), selectDesc, DialogModes.NO);

        // Merge
        executeAction(charIDToTypeID("Mrg2"), undefined, DialogModes.NO);

        // Rename
        var merged = app.activeDocument.activeLayer;
        if (merged && merged.name) {
          merged.name = "_a_Frame " + (f + 1);
        }
      }
    }

    alert("✅ Preview created with " + frameMap.length + " frames.");
  })();
  `;
  window.parent.postMessage(script.trim(), "*");
}
