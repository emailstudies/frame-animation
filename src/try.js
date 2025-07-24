function exportGif() {
  const script = `
(function () {
  if (!app || !app.activeDocument) {
    alert("No active document.");
    return;
  }

  var doc = app.activeDocument;

  // Check if anim_preview already exists
  var existing = doc.layers.find(l => l.name === "anim_preview" && l.layers);
  if (existing) {
    alert("⚠️ 'anim_preview' already exists. Delete it first.");
    return;
  }

  // Find anim_* folders
  var animFolders = doc.layers.filter(f => f.name.startsWith("anim") && f.layers && !f.locked);
  if (animFolders.length === 0) {
    alert("❌ No 'anim_*' folders found.");
    return;
  }

  // Find max frame count
  var maxFrames = Math.max(...animFolders.map(f => f.layers.length));

  // Create anim_preview folder
  var desc = new ActionDescriptor();
  var ref = new ActionReference();
  ref.putClass(stringIDToTypeID("layerSection"));
  desc.putReference(charIDToTypeID("null"), ref);
  var nameDesc = new ActionDescriptor();
  nameDesc.putString(charIDToTypeID("Nm  "), "anim_preview");
  desc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("layerSection"), nameDesc);
  executeAction(charIDToTypeID("Mk  "), desc, DialogModes.NO);
  var previewGroup = doc.layers[0];

  // For each frame index
  for (var frame = 0; frame < maxFrames; frame++) {
    var dupIds = [];

    for (var i = 0; i < animFolders.length; i++) {
      var folder = animFolders[i];
      var layer = folder.layers[frame] || folder.layers[0];
      if (!layer || layer.locked) continue;

      var dup = layer.duplicate();
      dupIds.push(dup.id);
    }

    if (dupIds.length === 0) continue;

    // Select all duplicated layers
    var selDesc = new ActionDescriptor();
    var selList = new ActionList();
    for (var j = 0; j < dupIds.length; j++) {
      var ref = new ActionReference();
      ref.putIdentifier(charIDToTypeID("Lyr "), dupIds[j]);
      selList.putReference(ref);
    }
    selDesc.putList(charIDToTypeID("null"), selList);
    selDesc.putBoolean(charIDToTypeID("MkVs"), false);
    executeAction(charIDToTypeID("slct"), selDesc, DialogModes.NO);

    // Merge selected
    executeAction(charIDToTypeID("Mrg2"), undefined, DialogModes.NO);

    var merged = doc.activeLayer;
    merged.name = "_a_Frame " + (frame + 1);

    // Move to preview folder
    var moveDesc = new ActionDescriptor();
    var moveRef = new ActionReference();
    moveRef.putIdentifier(charIDToTypeID("Lyr "), merged.id);
    moveDesc.putReference(charIDToTypeID("null"), moveRef);
    var toRef = new ActionReference();
    toRef.putIdentifier(charIDToTypeID("Lyr "), previewGroup.id);
    moveDesc.putReference(charIDToTypeID("T   "), toRef);
    moveDesc.putBoolean(charIDToTypeID("Adjs"), false);
    moveDesc.putInteger(charIDToTypeID("Vrsn"), 5);
    executeAction(charIDToTypeID("move"), moveDesc, DialogModes.NO);
  }

  alert("✅ Merged preview created in 'anim_preview'");

})();`.trim();

  window.parent.postMessage(script, "*");
}
