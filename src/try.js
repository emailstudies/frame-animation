function exportGif() {
  const script = `
  (function () {
    var doc = app.activeDocument;
    if (!doc) {
      alert("❌ No active document.");
      return;
    }

    // 🔍 Collect all folders starting with 'anim_'
    var animFolders = [];
    for (var i = 0; i < doc.layerSets.length; i++) {
      var g = doc.layerSets[i];
      if (g && g.name && g.name.startsWith("anim_") && !g.locked) {
        animFolders.push(g);
      }
    }

    if (animFolders.length === 0) {
      alert("❌ No folders starting with 'anim_' found.");
      return;
    }

    // 🚫 Check if anim_preview already exists
    for (var i = 0; i < doc.layerSets.length; i++) {
      var g = doc.layerSets[i];
      if (g && g.name === "anim_preview") {
        alert("⚠️ 'anim_preview' already exists. Delete it first.");
        return;
      }
    }

    // 🆕 Create anim_preview folder
    var desc = new ActionDescriptor();
    var ref = new ActionReference();
    ref.putClass(stringIDToTypeID("layerSection"));
    desc.putReference(charIDToTypeID("null"), ref);
    var nameDesc = new ActionDescriptor();
    nameDesc.putString(charIDToTypeID("Nm  "), "anim_preview");
    desc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("layerSection"), nameDesc);
    executeAction(charIDToTypeID("Mk  "), desc, DialogModes.NO);

    var previewFolder = doc.layerSets.getByName("anim_preview");

    // 🧮 Get max frame count
    var maxFrames = 0;
    var reversedLayersMap = [];

    for (var i = 0; i < animFolders.length; i++) {
      var folder = animFolders[i];
      var layers = folder.layers;
      if (!layers) continue;

      var unlocked = [];
      for (var j = 0; j < layers.length; j++) {
        var lyr = layers[j];
        if (lyr && !lyr.locked) unlocked.push(lyr);
      }

      var reversed = unlocked.slice().reverse(); // Top to bottom
      reversedLayersMap.push(reversed);

      if (reversed.length > maxFrames) maxFrames = reversed.length;
    }

    // 🔁 Merge corresponding frames
    for (var frameIndex = 0; frameIndex < maxFrames; frameIndex++) {
      var layersToMerge = [];

      for (var j = 0; j < reversedLayersMap.length; j++) {
        var layerList = reversedLayersMap[j];
        if (frameIndex >= layerList.length) continue;

        var layer = layerList[frameIndex];
        if (layer && layer.visible && !layer.locked) {
          var dup = layer.duplicate();
          layersToMerge.push(dup);
        }
      }

      if (layersToMerge.length > 0) {
        // ✅ Select each layer using ActionDescriptor
        var selRef = new ActionReference();
        for (var i = 0; i < layersToMerge.length; i++) {
          selRef.putIdentifier(charIDToTypeID("Lyr "), layersToMerge[i].id);
        }
        var selDesc = new ActionDescriptor();
        selDesc.putReference(charIDToTypeID("null"), selRef);
        selDesc.putBoolean(charIDToTypeID("MkVs"), false); // don't make visible
        executeAction(charIDToTypeID("slct"), selDesc, DialogModes.NO);

        // ✅ Merge and rename
        var merged = app.activeDocument.mergeLayers();
        merged.name = "_a_Frame " + (frameIndex + 1);
        merged.move(previewFolder, ElementPlacement.PLACEATEND);
      }
    }

    alert("✅ Merged " + maxFrames + " frame(s) into 'anim_preview'.");
  })();
  `;

  window.parent.postMessage(script.trim(), "*");
}
