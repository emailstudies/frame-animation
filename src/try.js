function exportGif() {
  const script = `
  (function () {
    var doc = app.activeDocument;
    if (!doc) {
      alert("❌ No active document.");
      return;
    }

    // 1. Collect anim_* folders
    var animFolders = [];
    for (var i = 0; i < doc.layerSets.length; i++) {
      var g = doc.layerSets[i];
      if (!g.locked && g.name.startsWith("anim_")) {
        animFolders.push(g);
      }
    }

    if (animFolders.length === 0) {
      alert("❌ No animation folders (anim_*) found.");
      return;
    }

    console.log("📁 Found anim folders:");
    animFolders.forEach(f => console.log("—", f.name));

    // 2. Determine max frame count
    var maxFrames = 0;
    var folderFrames = [];

    for (var i = 0; i < animFolders.length; i++) {
      var folder = animFolders[i];
      var layers = [];

      for (var j = folder.layers.length - 1; j >= 0; j--) {
        var layer = folder.layers[j];
        if (layer && layer.visible && !layer.locked) {
          console.log("🔎 Layer candidate:", layer.name, "| locked:", layer.locked, "| visible:", layer.visible);
          layers.push(layer);
        }
      }

      console.log("📄", folder.name + ":", layers.length, "layers");
      if (layers.length > maxFrames) maxFrames = layers.length;
      folderFrames.push(layers);
    }

    // 3. Build frameMap: array of arrays [ [f1 layers], [f2 layers], ... ]
    var frameMap = [];
    for (var f = 0; f < maxFrames; f++) {
      var frame = [];
      for (var i = 0; i < folderFrames.length; i++) {
        var layer = folderFrames[i][f];
        if (layer) frame.push(layer);
      }
      frameMap.push(frame);
      console.log("🧩 Frame", f + 1 + ":", frame.map(l => l.name).join(", "));
    }

    // 4. Create new doc for anim_preview
    var newDoc = app.documents.add(doc.width, doc.height, doc.resolution, "anim_preview", NewDocumentMode.RGB);
    app.activeDocument = newDoc;

    // 5. For each frame, duplicate and merge layers into _a_Frame N
    for (var f = 0; f < frameMap.length; f++) {
      var layerSet = frameMap[f];
      var dupLayers = [];

      for (var i = 0; i < layerSet.length; i++) {
        var l = layerSet[i];
        try {
          var dup = l.duplicate(newDoc);
          dupLayers.push(dup);
          console.log("🔁 Duplicated to new doc:", l.name, "→", dup.id);
        } catch (e) {
          console.log("❌ Duplication failed:", l.name);
        }
      }

      if (dupLayers.length > 0) {
        // Select all duplicated layers
        newDoc.activeLayer = dupLayers[0];
        for (var i = 1; i < dupLayers.length; i++) {
          dupLayers[i].selected = true;
        }

        // Use Action Descriptor to merge
        var idMrg2 = charIDToTypeID("Mrg2");
        executeAction(idMrg2, undefined, DialogModes.NO);

        var merged = newDoc.activeLayer;
        if (merged && merged.id !== undefined) {
          merged.name = "_a_Frame " + (f + 1);
          console.log("🎞️ Merged Layer Created:", merged.name);

          // Make sure it's selected before move
          newDoc.activeLayer = merged;

          // Move to top (we're in a clean doc)
          var desc = new ActionDescriptor();
          var ref = new ActionReference();
          ref.putIdentifier(charIDToTypeID("Lyr "), merged.id);
          desc.putReference(charIDToTypeID("null"), ref);

          var toRef = new ActionReference();
          toRef.putIndex(charIDToTypeID("Lyr "), 1);
          desc.putReference(charIDToTypeID("T   "), toRef);
          desc.putBoolean(charIDToTypeID("Adjs"), false);
          desc.putInteger(charIDToTypeID("Vrsn"), 5);

          executeAction(charIDToTypeID("move"), desc, DialogModes.NO);
        }
      }
    }

    alert("✅ Merged " + frameMap.length + " frames into new PSD 'anim_preview'.");
  })();
  `;
  window.parent.postMessage(script.trim(), "*");
}
