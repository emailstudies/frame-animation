function oldExportGif() {
  const script = `
  (function () {
    // ✅ Find all anim_* folders
    var doc = app.activeDocument;
    var animFolders = [];
    for (var i = 0; i < doc.layerSets.length; i++) {
      var g = doc.layerSets[i];
      if (!g.locked && g.name.startsWith("anim_") && g.parent === doc) {
        animFolders.push(g);
      }
    }

    if (animFolders.length < 1) {
      alert("❌ No anim_ folders found.");
      return;
    }

    // ✅ Determine max number of frames
    var maxFrames = 0;
    for (var i = 0; i < animFolders.length; i++) {
      var count = animFolders[i].layers.length;
      if (count > maxFrames) maxFrames = count;
    }

    // ✅ Check if anim_preview already exists
    for (var i = 0; i < doc.layerSets.length; i++) {
      var g = doc.layerSets[i];
      if (g.name === "anim_preview" && g.parent === doc) {
        alert("⚠️ anim_preview already exists. Please delete it first.");
        return;
      }
    }

    // ✅ Create anim_preview folder
    var desc = new ActionDescriptor();
    var ref = new ActionReference();
    ref.putClass(stringIDToTypeID("layerSection"));
    desc.putReference(charIDToTypeID("null"), ref);

    var nameDesc = new ActionDescriptor();
    nameDesc.putString(charIDToTypeID("Nm  "), "anim_preview");
    desc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("layerSection"), nameDesc);
    executeAction(charIDToTypeID("Mk  "), desc, DialogModes.NO);

    var previewFolder = doc.layerSets.getByName("anim_preview");

    // ✅ Loop and create merged frames
    for (var frameIndex = 0; frameIndex < maxFrames; frameIndex++) {
      var layersToMerge = [];

      for (var j = 0; j < animFolders.length; j++) {
        var folder = animFolders[j];
        if (folder.locked) continue;

        var layer = folder.layers[frameIndex];
        if (layer && !layer.locked && layer.visible) {
          var dup = layer.duplicate();
          layersToMerge.push(dup);
        }
      }

      if (layersToMerge.length > 0) {
        // Select all merged layers
        app.activeDocument.activeLayer = layersToMerge[0];
        for (var i = 1; i < layersToMerge.length; i++) {
          layersToMerge[i].selected = true;
        }

        // Merge selected
        var merged = app.activeDocument.mergeLayers();
        merged.name = "_a_Frame " + (frameIndex + 1);
        merged.move(previewFolder, ElementPlacement.PLACEATEND);
      }
    }

    alert("✅ Merged " + maxFrames + " frames into 'anim_preview'.");
  })();
  `;

  window.parent.postMessage(script.trim(), "*");
}
