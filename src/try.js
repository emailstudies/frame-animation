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
    var animNames = [];
    for (var i = 0; i < doc.layerSets.length; i++) {
      var g = doc.layerSets[i];
      if (g && typeof g.name === "string" && g.name.indexOf("anim_") === 0 && !g.locked) {
        animFolders.push(g);
        animNames.push(g.name);
      }
    }
    console.log("📁 Found anim folders:");
    for (var i = 0; i < animNames.length; i++) {
      console.log("—", animNames[i]);
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

    // 4️⃣ Build reversed layer map (top-to-bottom = index 0 = Frame 1)
    var reversedMap = [];
    var maxFrames = 0;

    for (var f = 0; f < animFolders.length; f++) {
      var group = animFolders[f];
      var layers = [];

      for (var j = group.layers.length - 1; j >= 0; j--) {
        var l = group.layers[j];
        if (!l) continue;

        console.log("🔎 Layer candidate:", l.name, "| locked:", l.locked, "| visible:", l.visible);

        if (
          typeof l === "object" &&
          !l.locked &&
          l.visible !== false
        ) {
          layers.push(l);
        }
      }

      reversedMap.push(layers);
      if (layers.length > maxFrames) maxFrames = layers.length;

      console.log("📄 " + group.name + ":", layers.length, "layers");
      for (var n = 0; n < layers.length; n++) {
        console.log("   •", layers[n].name);
      }
    }

    // 5️⃣ Create frameMap (array of [frameIndex] = [layer1, layer2, ...])
    var frameMap = [];
    for (var i = 0; i < maxFrames; i++) {
      var frame = [];
      for (var j = 0; j < reversedMap.length; j++) {
        var l = reversedMap[j][i];
        if (
          l &&
          typeof l === "object" &&
          l.visible !== false &&
          !l.locked
        ) {
          frame.push(l);
        }
      }

      var names = [];
      for (var k = 0; k < frame.length; k++) {
        names.push(frame[k].name);
      }
      console.log("🧩 Frame " + (i + 1) + ":", names.join(", "));
      frameMap.push(frame);
    }

    // 6️⃣ Merge and move each frame
    for (var frameIndex = 0; frameIndex < frameMap.length; frameIndex++) {
      var originals = frameMap[frameIndex];
      var duplicatedIDs = [];

      for (var i = 0; i < originals.length; i++) {
        try {
          var dup = originals[i].duplicate();
          duplicatedIDs.push(dup.id);
          console.log("🔁 Duplicated:", originals[i].name, "→", dup.id);
        } catch (err) {
          console.log("⚠️ Duplicate failed for", originals[i] ? originals[i].name : "Unknown", err);
        }
      }

      if (duplicatedIDs.length === 0) {
        console.log("⚠️ No layers to merge in Frame " + (frameIndex + 1));
        continue;
      }

      // ✅ Merge via Action Descriptor
      try {
        var mergeList = new ActionList();
        for (var m = 0; m < duplicatedIDs.length; m++) {
          var ref = new ActionReference();
          ref.putIdentifier(charIDToTypeID("Lyr "), duplicatedIDs[m]);
          mergeList.putReference(ref);
        }

        var mergeDesc = new ActionDescriptor();
        mergeDesc.putList(charIDToTypeID("null"), mergeList);
        executeAction(stringIDToTypeID("mergeLayersNew"), mergeDesc, DialogModes.NO);

        var merged = doc.activeLayer;
        merged.name = "_a_Frame " + (frameIndex + 1);
        console.log("🎞️ Merged Layer Created:", merged.name);
      } catch (err) {
        console.log("⚠️ Merge failed:", err);
        continue;
      }

      // ✅ Move merged layer into anim_preview
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

    alert("✅ Merged " + frameMap.length + " frames into 'anim_preview'. Check console for details.");
  })();
  `;

  window.parent.postMessage(script.trim(), "*");
}
