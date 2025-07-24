function exportGif() {
  const script = `
  (function () {
    var doc = app.activeDocument;
    if (!doc) {
      alert("❌ No active document.");
      return;
    }

    // 1️⃣ Collect all anim_* folders
    var animFolders = [];
    for (var i = 0; i < doc.layerSets.length; i++) {
      var folder = doc.layerSets[i];
      if (folder && folder.name.startsWith("anim_") && !folder.locked) {
        animFolders.push(folder);
      }
    }

    if (animFolders.length === 0) {
      alert("❌ No anim_* folders found.");
      return;
    }

    // 2️⃣ Check if anim_preview already exists
    for (var i = 0; i < doc.layerSets.length; i++) {
      if (doc.layerSets[i].name === "anim_preview") {
        alert("⚠️ 'anim_preview' already exists. Please delete it first.");
        return;
      }
    }

    // 3️⃣ Create anim_preview folder
    var desc = new ActionDescriptor();
    var ref = new ActionReference();
    ref.putClass(stringIDToTypeID("layerSection"));
    desc.putReference(charIDToTypeID("null"), ref);
    var nameDesc = new ActionDescriptor();
    nameDesc.putString(charIDToTypeID("Nm  "), "anim_preview");
    desc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("layerSection"), nameDesc);
    executeAction(charIDToTypeID("Mk  "), desc, DialogModes.NO);

    var previewFolder = doc.layerSets.getByName("anim_preview");

    // 4️⃣ Build the frame map (indexed by frame number)
    var frameMap = []; // Array of arrays

    var maxFrames = 0;
    var reversedMap = animFolders.map(f => {
      return f.layers.filter(l => !l.locked).slice().reverse(); // top-down
    });

    for (var i = 0; i < reversedMap.length; i++) {
      if (reversedMap[i].length > maxFrames) maxFrames = reversedMap[i].length;
    }

    for (var i = 0; i < maxFrames; i++) {
      var frameLayers = [];
      for (var j = 0; j < reversedMap.length; j++) {
        var layer = reversedMap[j][i];
        if (layer && layer.visible && !layer.locked) {
          frameLayers.push(layer);
        }
      }
      frameMap.push(frameLayers);
    }

    // 5️⃣ Merge each frame's layers and move to anim_preview
    for (var frameIndex = 0; frameIndex < frameMap.length; frameIndex++) {
      var originals = frameMap[frameIndex];
      var dups = [];

      // Duplicate each layer in frame
      for (var i = 0; i < originals.length; i++) {
        var dup = originals[i].duplicate();
        dups.push(dup);
      }

      // Select all duplicates
      if (dups.length === 0) continue;

      var selList = new ActionList();
      for (var i = 0; i < dups.length; i++) {
        var ref = new ActionReference();
        ref.putIdentifier(charIDToTypeID("Lyr "), dups[i].id);
        selList.putReference(ref);
      }

      var selDesc = new ActionDescriptor();
      selDesc.putList(charIDToTypeID("null"), selList);
      selDesc.putBoolean(charIDToTypeID("MkVs"), false);
      executeAction(charIDToTypeID("slct"), selDesc, DialogModes.NO);

      // Merge and rename
      var merged = app.activeDocument.mergeLayers();
      merged.name = "_a_Frame " + (frameIndex + 1);

      // Move merged into anim_preview using ActionDescriptor
      var moveRef = new ActionReference();
      moveRef.putIdentifier(charIDToTypeID("Lyr "), merged.id);

      var moveDesc = new ActionDescriptor();
      moveDesc.putReference(charIDToTypeID("null"), moveRef);

      var targetRef = new ActionReference();
      targetRef.putIndex(charIDToTypeID("Lyr "), previewFolder.layers.length > 0 ? previewFolder.layers[0].itemIndex : 1);
      moveDesc.putReference(charIDToTypeID("T   "), targetRef);

      moveDesc.putBoolean(charIDToTypeID("Adjs"), false);
      executeAction(charIDToTypeID("move"), moveDesc, DialogModes.NO);
    }

    alert("✅ All frames merged and added to 'anim_preview'.");
  })();
  `;

  window.parent.postMessage(script.trim(), "*");
}
