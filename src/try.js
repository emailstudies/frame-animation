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

    // Step 2: Determine max number of frames
    var maxFrames = 0;
    var frameMap = []; // array of arrays: one per frame

    for (var i = 0; i < animFolders.length; i++) {
      var group = animFolders[i];
      var layers = [];
      for (var j = 0; j < group.layers.length; j++) {
        var l = group.layers[j];
        if (!l.locked && l.visible) {
          layers.push(l);
          console.log("🔎 Layer candidate:", l.name, "| locked:", l.locked, "| visible:", l.visible);
        }
      }
      if (layers.length > maxFrames) maxFrames = layers.length;

      for (var f = 0; f < layers.length; f++) {
        if (!frameMap[f]) frameMap[f] = [];
        frameMap[f].push(layers[f]);
      }
    }

    if (maxFrames === 0) {
      alert("❌ No visible layers found inside anim_* folders.");
      return;
    }

    // Step 3: Create new doc for anim_preview
    var width = doc.width;
    var height = doc.height;
    var res = doc.resolution;
    var mode = NewDocumentMode.RGB;
    var newDoc = app.documents.add(width, height, res, "anim_preview", mode);
    app.activeDocument = newDoc;

    // Step 4: For each frame, duplicate matching layers from all anim folders
    for (var f = 0; f < frameMap.length; f++) {
      var layerIDs = [];

      for (var i = 0; i < frameMap[f].length; i++) {
        var original = frameMap[f][i];
        app.activeDocument = doc;

        // Duplicate using ActionDescriptor
        var dupDesc = new ActionDescriptor();
        var ref = new ActionReference();
        ref.putIdentifier(charIDToTypeID("Lyr "), original.id);
        dupDesc.putReference(charIDToTypeID("null"), ref);
        dupDesc.putReference(charIDToTypeID("T   "), new ActionReference());
        executeAction(charIDToTypeID("Dplc"), dupDesc, DialogModes.NO);

        // Grab duplicated layer ID
        app.activeDocument = newDoc;
        var dup = app.activeDocument.activeLayer;
        if (dup) {
          layerIDs.push(dup.id);
          console.log("🔁 Duplicated to new doc:", dup.name, "→", dup.id);
        }
      }

      if (layerIDs.length > 0) {
        // Select duplicated layers
        var selectDesc = new ActionDescriptor();
        var list = new ActionList();
        for (var k = 0; k < layerIDs.length; k++) {
          var ref = new ActionReference();
          ref.putIdentifier(charIDToTypeID("Lyr "), layerIDs[k]);
          list.putReference(ref);
        }
        selectDesc.putList(charIDToTypeID("null"), list);
        selectDesc.putBoolean(charIDToTypeID("MkVs"), false);
        executeAction(charIDToTypeID("slct"), selectDesc, DialogModes.NO);

        // Merge selected layers
        executeAction(charIDToTypeID("Mrg2"), undefined, DialogModes.NO);

        // Rename merged layer
        var merged = app.activeDocument.activeLayer;
        merged.name = "_a_Frame " + (f + 1);
        console.log("🎞️ Merged Layer Created:", merged.name);
      }
    }

    alert("✅ All frames merged into 'anim_preview' document.");
  })();
  `;

  window.parent.postMessage(script.trim(), "*");
}
