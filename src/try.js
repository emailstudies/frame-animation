function exportGif() {
  const script = `
  (function () {
    var doc = app.activeDocument;
    if (!doc) {
      alert("❌ No active document.");
      return;
    }

    // 1️⃣ Collect anim_* folders
    var animFolders = [];
    for (var i = 0; i < doc.layerSets.length; i++) {
      var group = doc.layerSets[i];
      if (group && group.name.startsWith("anim_") && !group.locked) {
        animFolders.push(group);
      }
    }

    if (animFolders.length === 0) {
      alert("❌ No anim_* folders found.");
      return;
    }

    // 2️⃣ Check for existing anim_preview
    for (var i = 0; i < doc.layerSets.length; i++) {
      if (doc.layerSets[i].name === "anim_preview") {
        alert("⚠️ 'anim_preview' already exists. Please delete it first.");
        return;
      }
    }

    // 3️⃣ Create anim_preview
    var desc = new ActionDescriptor();
    var ref = new ActionReference();
    ref.putClass(stringIDToTypeID("layerSection"));
    desc.putReference(charIDToTypeID("null"), ref);
    var nameDesc = new ActionDescriptor();
    nameDesc.putString(charIDToTypeID("Nm  "), "anim_preview");
    desc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("layerSection"), nameDesc);
    executeAction(charIDToTypeID("Mk  "), desc, DialogModes.NO);
    var previewFolder = doc.layerSets.getByName("anim_preview");

    // 4️⃣ Build frameMap
    var frameMap = []; // [[L1, L2], [L1b, L2b] ...]
    var maxFrames = 0;
    var reversed = [];

    for (var i = 0; i < animFolders.length; i++) {
      var folder = animFolders[i];
      var layers = folder.layers;
      var vis = [];
      for (var j = layers.length - 1; j >= 0; j--) {
        var lyr = layers[j];
        if (lyr && !lyr.locked) vis.push(lyr);
      }
      reversed.push(vis);
      if (vis.length > maxFrames) maxFrames = vis.length;
    }

    for (var f = 0; f < maxFrames; f++) {
      var frame = [];
      for (var a = 0; a < reversed.length; a++) {
        var layer = reversed[a][f];
        if (layer && layer.visible && !layer.locked) frame.push(layer);
      }
      frameMap.push(frame);
    }

    // 5️⃣ Loop over frameMap
    for (var i = 0; i < frameMap.length; i++) {
      var originalLayers = frameMap[i];
      var duplicatedIDs = [];

      for (var j = 0; j < originalLayers.length; j++) {
        var dup = originalLayers[j].duplicate();
        duplicatedIDs.push(dup.id);
      }

      // 🔍 Select via ActionList
      var selList = new ActionList();
      for (var k = 0; k < duplicatedIDs.length; k++) {
        var r = new ActionReference();
        r.putIdentifier(charIDToTypeID("Lyr "), duplicatedIDs[k]);
        selList.putReference(r);
      }

      var selDesc = new ActionDescriptor();
      selDesc.putList(charIDToTypeID("null"), selList);
      selDesc.putBoolean(charIDToTypeID("MkVs"), false);
      executeAction(charIDToTypeID("slct"), selDesc, DialogModes.NO);

      // ✅ Merge selected
      var merged = app.activeDocument.mergeLayers();
      merged.name = "_a_Frame " + (i + 1);

      // 🧲 Move into anim_preview
      var moveRef = new ActionReference();
      moveRef.putIdentifier(charIDToTypeID("Lyr "), merged.id);

      var moveDesc = new ActionDescriptor();
      moveDesc.putReference(charIDToTypeID("null"), moveRef);

      var targetRef = new ActionReference();
      targetRef.putIndex(charIDToTypeID("Lyr "), previewFolder.itemIndex);
      moveDesc.putReference(charIDToTypeID("T   "), targetRef);

      moveDesc.putBoolean(charIDToTypeID("Adjs"), false);
      executeAction(charIDToTypeID("move"), moveDesc, DialogModes.NO);
    }

    alert("✅ Merged all frames into 'anim_preview'.");
  })();
  `;

  window.parent.postMessage(script.trim(), "*");
}
