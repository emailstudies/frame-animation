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

    // 2️⃣ Build reversed frame map
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
    }

    // 3️⃣ Build frame map by index
    var frameMap = [];
    for (var i = 0; i < maxFrames; i++) {
      var frame = [];
      for (var j = 0; j < reversedMap.length; j++) {
        var l = reversedMap[j][i];
        if (l && typeof l === "object" && !l.locked && l.visible !== false) {
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

    // 5️⃣ Create anim_preview folder in new doc
    var desc = new ActionDescriptor();
    var ref = new ActionReference();
    ref.putClass(stringIDToTypeID("layerSection"));
    desc.putReference(charIDToTypeID("null"), ref);

    var nameDesc = new ActionDescriptor();
    nameDesc.putString(charIDToTypeID("Nm  "), "anim_preview");
    desc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("layerSection"), nameDesc);
    executeAction(charIDToTypeID("Mk  "), desc, DialogModes.NO);

    var previewFolder = newDoc.layerSets.getByName("anim_preview");

    // 6️⃣ Merge and move each frame
    for (var frameIndex = 0; frameIndex < frameMap.length; frameIndex++) {
      var originals = frameMap[frameIndex];
      var duplicatedIDs = [];

      for (var i = 0; i < originals.length; i++) {
        try {
          var dup = originals[i].duplicate(newDoc);
          duplicatedIDs.push(dup.id);
          console.log("🔁 Duplicated to new doc:", originals[i].name, "→", dup.id);
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

        var merged = newDoc.activeLayer;
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

    alert("✅ Preview exported to new document. Check 'anim_preview' folder.");
  })();
  `;

  window.parent.postMessage(script.trim(), "*");
}
