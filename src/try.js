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
      if (group && typeof group.name === "string" && group.name.startsWith("anim_")) {
        if (!group.locked) animFolders.push(group);
      }
    }

    if (animFolders.length === 0) {
      alert("❌ No anim_* folders found.");
      return;
    }

    console.log("📁 Found anim folders:");
    for (var i = 0; i < animFolders.length; i++) {
      console.log("—", animFolders[i].name);
    }

    // 2️⃣ Build reversed layer map (bottom to top)
    var reversedMap = [];
    var maxFrames = 0;

    for (var f = 0; f < animFolders.length; f++) {
      var group = animFolders[f];
      var layers = [];

      for (var j = group.layers.length - 1; j >= 0; j--) {
        var l = group.layers[j];
        if (
          typeof l === "object" &&
          l !== null &&
          (typeof l.locked === "undefined" || l.locked === false) &&
          l.visible !== false
        ) {
          console.log("🔎 Layer candidate:", l.name, "| locked:", l.locked, "| visible:", l.visible);
          layers.push(l);
        }
      }

      reversedMap.push(layers);
      if (layers.length > maxFrames) maxFrames = layers.length;

      console.log("📄 " + group.name + ": " + layers.length + " layers");
    }

    // 3️⃣ Frame-wise mapping
    var frameMap = [];

    for (var i = 0; i < maxFrames; i++) {
      var frame = [];
      for (var j = 0; j < reversedMap.length; j++) {
        var layer = reversedMap[j][i];
        if (layer) frame.push(layer);
      }
      frameMap.push(frame);
      console.log("🧩 Frame " + (i + 1) + ":", frame.map(l => l.name).join(", "));
    }

    if (frameMap.length === 0) {
      alert("❌ No valid frames to export.");
      return;
    }

    // 4️⃣ Create new document
    var newDocDesc = new ActionDescriptor();
    var docRef = new ActionReference();
    docRef.putClass(charIDToTypeID("Dcmn"));
    newDocDesc.putReference(charIDToTypeID("null"), docRef);

    var newDocOptions = new ActionDescriptor();
    newDocOptions.putString(charIDToTypeID("Nm  "), "Animation Preview");
    newDocOptions.putUnitDouble(charIDToTypeID("Wdth"), charIDToTypeID("#Rlt"), app.activeDocument.width);
    newDocOptions.putUnitDouble(charIDToTypeID("Hght"), charIDToTypeID("#Rlt"), app.activeDocument.height);
    newDocOptions.putUnitDouble(charIDToTypeID("Rslt"), charIDToTypeID("#Rsl"), 72);
    newDocOptions.putEnumerated(charIDToTypeID("Md  "), charIDToTypeID("Md  "), charIDToTypeID("RGBM"));
    newDocOptions.putInteger(charIDToTypeID("Dpth"), 8);
    newDocDesc.putObject(charIDToTypeID("Usng"), charIDToTypeID("Dcmn"), newDocOptions);
    executeAction(charIDToTypeID("Mk  "), newDocDesc, DialogModes.NO);

    var newDoc = app.activeDocument;

    // 5️⃣ Create anim_preview folder
    var desc = new ActionDescriptor();
    var ref = new ActionReference();
    ref.putClass(stringIDToTypeID("layerSection"));
    desc.putReference(charIDToTypeID("null"), ref);

    var nameDesc = new ActionDescriptor();
    nameDesc.putString(charIDToTypeID("Nm  "), "anim_preview");
    desc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("layerSection"), nameDesc);
    executeAction(charIDToTypeID("Mk  "), desc, DialogModes.NO);

    var previewFolder = newDoc.layerSets.getByName("anim_preview");

    // 6️⃣ Duplicate → Merge → Move
    for (var frameIndex = 0; frameIndex < frameMap.length; frameIndex++) {
      var originals = frameMap[frameIndex];
      var duplicatedIDs = [];

      for (var i = 0; i < originals.length; i++) {
        try {
          var dup = originals[i].duplicate(newDoc);
          duplicatedIDs.push(dup.id);
          console.log("🔁 Duplicated:", originals[i].name, "→", dup.id);
        } catch (err) {
          console.log("⚠️ Duplicate failed:", err);
        }
      }

      if (duplicatedIDs.length === 0) {
        console.log("⚠️ Frame " + (frameIndex + 1) + " has no valid layers.");
        continue;
      }

      // ✅ Merge via ActionDescriptor
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

        var merged = newDoc.activeLayer;
        if (merged) {
          merged.name = "_a_Frame " + (frameIndex + 1);
          console.log("🎞️ Merged Layer:", merged.name);

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
            console.log("📦 Moved:", merged.name, "→ anim_preview");
          } catch (err) {
            console.log("⚠️ Move failed:", err);
          }
        }
      } catch (err) {
        console.log("⚠️ Merge failed:", err);
      }
    }

    alert("✅ Animation preview ready in new document.");
  })();
  `;

  window.parent.postMessage(script.trim(), "*");
}
