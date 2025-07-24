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

    // 🧮 Find max number of unlocked layers (frames)
    var maxFrames = 0;
    for (var i = 0; i < animFolders.length; i++) {
      var folder = animFolders[i];
      var layers = folder.layers;
      if (!layers) continue;

      var unlockedCount = 0;
      for (var j = 0; j < layers.length; j++) {
        var lyr = layers[j];
        if (lyr && !lyr.locked) unlockedCount++;
      }

      if (unlockedCount > maxFrames) maxFrames = unlockedCount;
    }

    // 🔁 Merge frame-wise
    for (var frameIndex = 0; frameIndex < maxFrames; frameIndex++) {
      var layersToMerge = [];

      for (var j = 0; j < animFolders.length; j++) {
        var folder = animFolders[j];
        if (folder.locked) continue;
        var layers = folder.layers;
        if (!layers || frameIndex >= layers.length) continue;

        var layer = layers[frameIndex];
        if (layer && !layer.locked && layer.visible) {
          var dup = layer.duplicate();
          layersToMerge.push(dup);
        }
      }

      if (layersToMerge.length > 0) {
        app.activeDocument.activeLayer = layersToMerge[0];
        for (var i = 1; i < layersToMerge.length; i++) {
          layersToMerge[i].selected = true;
        }

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
