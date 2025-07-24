function exportGif() {
  const script = `
  (function () {
    var doc = app.activeDocument;
    if (!doc) {
      alert("❌ No active document.");
      return;
    }

    // Step 1: Find all anim_* folders
    var animFolders = [];
    for (var i = 0; i < doc.layerSets.length; i++) {
      var g = doc.layerSets[i];
      if (!g.locked && g.name.startsWith("anim_")) {
        animFolders.push(g);
        console.log("📁 Found anim folder:", g.name);
      }
    }
    if (animFolders.length === 0) {
      alert("❌ No anim_* folders found.");
      return;
    }

    // Step 2: Determine max frame count and build frame map
    var frameMap = []; // Array of arrays, one per frame
    var maxFrames = 0;

    for (var i = 0; i < animFolders.length; i++) {
      var group = animFolders[i];
      var visibleLayers = group.layers.filter(l => l && !l.locked && l.visible);

      for (var f = 0; f < visibleLayers.length; f++) {
        if (!frameMap[f]) frameMap[f] = [];
        frameMap[f].push(visibleLayers[f]);
      }
      if (visibleLayers.length > maxFrames) maxFrames = visibleLayers.length;
      console.log("📄", group.name + ":", visibleLayers.length, "layers");
    }

    if (maxFrames === 0) {
      alert("❌ No visible layers found inside anim_* folders.");
      return;
    }

    // Step 3: Create new document
    var newDoc = app.documents.add(doc.width, doc.height, doc.resolution, "anim_preview", NewDocumentMode.RGB);
    app.activeDocument = newDoc;

    // Step 4: For each frame, duplicate & merge corresponding layers
    for (var f = 0; f < frameMap.length; f++) {
      var layerIDs = [];

      for (var j = 0; j < frameMap[f].length; j++) {
        var originalLayer = frameMap[f][j];
        if (!originalLayer) continue;

        // Switch to original doc
        app.activeDocument = doc;
        originalLayer.visible = true;

        // Duplicate to new document
        var dup = originalLayer.duplicate(app.documents["anim_preview"], ElementPlacement.PLACEATBEGINNING);

        if (dup) {
          app.activeDocument = newDoc;
          layerIDs.push(dup.id);
          console.log("🔁 Duplicated:", dup.name, "→ ID", dup.id);
        }
      }

      // Merge the layers for this frame
      if (layerIDs.length > 0) {
        var desc = new ActionDescriptor();
        var list = new ActionList();
        for (var i = 0; i < layerIDs.length; i++) {
          var ref = new ActionReference();
          ref.putIdentifier(charIDToTypeID("Lyr "), layerIDs[i]);
          list.putReference(ref);
        }
        desc.putList(charIDToTypeID("null"), list);
        desc.putBoolean(charIDToTypeID("MkVs"), false);
        executeAction(charIDToTypeID("slct"), desc, DialogModes.NO);

        // Merge selected layers
        executeAction(charIDToTypeID("Mrg2"), undefined, DialogModes.NO);
        var merged = app.activeDocument.activeLayer;
        merged.name = "_a_Frame " + (f + 1);
        console.log("🎞️ Merged Frame:", merged.name);
      }
    }

    alert("✅ All frames merged into 'anim_preview' document.");
  })();
  `;

  window.parent.postMessage(script.trim(), "*");
}
