function exportGif() {
  const script = `
  (function () {
    var doc = app.activeDocument;
    if (!doc) {
      alert("❌ No active document.");
      return;
    }

    // 🔍 Collect all anim_* folders
    var animFolders = [];
    for (var i = 0; i < doc.layerSets.length; i++) {
      var g = doc.layerSets[i];
      if (g && g.name.startsWith("anim_") && !g.locked) {
        animFolders.push(g);
      }
    }

    if (animFolders.length === 0) {
      alert("❌ No anim_* folders found.");
      return;
    }

    // 🚫 Check if anim_preview exists
    for (var i = 0; i < doc.layerSets.length; i++) {
      if (doc.layerSets[i].name === "anim_preview") {
        alert("⚠️ 'anim_preview' already exists. Please delete it first.");
        return;
      }
    }

    // ✅ Create anim_preview folder
    var makeDesc = new ActionDescriptor();
    var makeRef = new ActionReference();
    makeRef.putClass(stringIDToTypeID("layerSection"));
    makeDesc.putReference(charIDToTypeID("null"), makeRef);
    var nameDesc = new ActionDescriptor();
    nameDesc.putString(charIDToTypeID("Nm  "), "anim_preview");
    makeDesc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("layerSection"), nameDesc);
    executeAction(charIDToTypeID("Mk  "), makeDesc, DialogModes.NO);

    // 📌 Get reference to anim_preview
    var previewFolder = doc.layerSets.getByName("anim_preview");

    // 🔁 Prepare reversed (top-to-bottom) layers from each folder
    var maxFrames = 0;
    var reversedLayersMap = [];

    for (var i = 0; i < animFolders.length; i++) {
      var group = animFolders[i];
      var layers = [];
      for (var j = group.layers.length - 1; j >= 0; j--) {
        var l = group.layers[j];
        if (l && !l.locked) layers.push(l);
      }
      reversedLayersMap.push(layers);
      if (layers.length > maxFrames) maxFrames = layers.length;
    }

    // 🔁 For each frame index
    for (var frameIndex = 0; frameIndex < maxFrames; frameIndex++) {
      var duplicatedLayers = [];

      for (var f = 0; f < reversedLayersMap.length; f++) {
        var layers = reversedLayersMap[f];
        if (frameIndex >= layers.length) continue;

        var layer = layers[frameIndex];
        if (layer && !layer.locked && layer.visible) {
          var dup = layer.duplicate();
          duplicatedLayers.push(dup);
        }
      }

      if (duplicatedLayers.length > 0) {
        // ✅ Select all duplicated layers via ActionReference
        var selList = new ActionList();
        for (var i = 0; i < duplicatedLayers.length; i++) {
          var lyrRef = new ActionReference();
          lyrRef.putIdentifier(charIDToTypeID("Lyr "), duplicatedLayers[i].id);
          selList.putReference(lyrRef);
        }

        var selDesc = new ActionDescriptor();
        selDesc.putList(charIDToTypeID("null"), selList);
        selDesc.putBoolean(charIDToTypeID("MkVs"), false);
        executeAction(charIDToTypeID("slct"), selDesc, DialogModes.NO);

        // ✅ Merge them
        var merged = app.activeDocument.mergeLayers();
        merged.name = "_a_Frame " + (frameIndex + 1);

        // ✅ Move merged into anim_preview using ActionDescriptor
        var moveRef = new ActionReference();
        moveRef.putIdentifier(charIDToTypeID("Lyr "), merged.id);

        var moveDesc = new ActionDescriptor();
        moveDesc.putReference(charIDToTypeID("null"), moveRef);

        var toRef = new ActionReference();
        toRef.putIndex(charIDToTypeID("Lyr "), previewFolder.layers[0].itemIndex); // move above first layer
        moveDesc.putReference(charIDToTypeID("T   "), toRef);

        moveDesc.putBoolean(charIDToTypeID("Adjs"), false);
        executeAction(charIDToTypeID("move"), moveDesc, DialogModes.NO);
      }
    }

    alert("✅ All frames merged into 'anim_preview'.");
  })();
  `;

  window.parent.postMessage(script.trim(), "*");
}
