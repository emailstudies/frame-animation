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
      var g = doc.layerSets[i];
      if (g && typeof g.name === "string" && g.name.startsWith("anim_") && !g.locked) {
        animFolders.push(g);
      }
    }

    console.log("📁 Found anim folders:", animFolders.map(f => f.name));

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

    // 4️⃣ Build frameMap[]
    var frameMap = [];
    var maxFrames = 0;
    var reversedMap = animFolders.map(f => {
      var layers = [];
      for (var j = f.layers.length - 1; j >= 0; j--) {
        var l = f.layers[j];
        if (
          l &&
          typeof l === "object" &&
          l.hasOwnProperty("locked") &&
          l.hasOwnProperty("visible") &&
          !l.locked
        ) {
          layers.push(l);
        }
      }
      console.log("📄", f.name, "=>", layers.map(l => l.name));
      if (layers.length > maxFrames) maxFrames = layers.length;
      return layers;
    });

    for (var i = 0; i < maxFrames; i++) {
      var frame = [];
      for (var j = 0; j < reversedMap.length; j++) {
        var l = reversedMap[j][i];
        if (
          l &&
          typeof l === "object" &&
          l.hasOwnProperty("locked") &&
          l.hasOwnProperty("visible") &&
          l.visible &&
          !l.locked
        ) {
          frame.push(l);
        }
      }
      console.log("🧩 Frame", i + 1, "layers:", frame.map(l => l.name));
      frameMap.push(frame);
    }

    // 5️⃣ Merge and move each frame
    for (var frameIndex = 0; frameIndex < frameMap.length; frameIndex++) {
      var originals = frameMap[frameIndex];
      var duplicatedIDs = [];

      for (var i = 0; i < originals.length; i++) {
        try {
          var dup = originals[i].duplicate();
          duplicatedIDs.push(dup.id);
          console.log("🔁 Duplicated:", originals[i].name, "→ ID:", dup.id);
        } catch (err) {
          console.log("⚠️ Duplicate failed for", originals[i]?.name, err);
        }
      }

      if (duplicatedIDs.length === 0) continue;

      // ✅ Select duplicated layers
      try {
        var selList = new ActionList();
        for (var i = 0; i < duplicatedIDs.length; i++) {
          var ref = new ActionReference();
          ref.putIdentifier(charIDToTypeID("Lyr "), duplicatedIDs[i]);
          selList.putReference(ref);
        }

        var selDesc = new ActionDescriptor();
        selDesc.putList(charIDToTypeID("null"), selList);
        selDesc.putBoolean(charIDToTypeID("MkVs"), false);
        executeAction(charIDToTypeID("slct"), selDesc, DialogModes.NO);
        console.log("✅ Selected for merging:", duplicatedIDs);
      } catch (err) {
        console.log("⚠️ Selection failed", err);
        continue;
      }

      // ✅ Merge selected layers
      var merged = app.activeDocument.mergeLayers();
      merged.name = "_a_Frame " + (frameIndex + 1);
      console.log("🎞️ Merged Layer Created:", merged.name);

      // ✅ Move to anim_preview
      try {
        var moveRef = new ActionReference();
        moveRef.putIdentifier(charIDToTypeID("Lyr "), merged.id);

        var moveDesc = new ActionDescriptor();
        moveDesc.putReference(charIDToTypeID("null"), moveRef);

        var targetRef = new ActionReference();
        targetRef.putIndex(charIDToTypeID("Lyr "), previewFolder.itemIndex);
        moveDesc.putReference(charIDToTypeID("T   "), targetRef);
        moveDesc.putBoolean(charIDToTypeID("Adjs"), false);
        executeAction(charIDToTypeID("move"), moveDesc, DialogModes.NO);
        console.log("📦 Moved", merged.name, "into anim_preview");
      } catch (err) {
        console.log("⚠️ Move failed", err);
      }
    }

    alert("✅ All frames merged into 'anim_preview'. Check console for details.");
  })();
  `;

  window.parent.postMessage(script.trim(), "*");
}
