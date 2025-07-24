function exportGif() {
  const script = `
(function () {
  if (!app || !app.activeDocument) {
    alert("No active document.");
    return;
  }

  var doc = app.activeDocument;

  // Step 1: Check for anim_preview folder
  var previewExists = false;
  for (var i = 0; i < doc.layers.length; i++) {
    var l = doc.layers[i];
    if (l.name === "anim_preview" && typeof l.layers !== "undefined") {
      previewExists = true;
      break;
    }
  }

  if (previewExists) {
    alert("⚠️ 'anim_preview' already exists. Please delete or rename it.");
    return;
  }

  // Step 2: Find all anim_* folders
  var animFolders = [];
  for (var i = 0; i < doc.layers.length; i++) {
    var l = doc.layers[i];
    if (
      typeof l.layers !== "undefined" &&
      l.name.indexOf("anim_") === 0 &&
      !l.locked
    ) {
      animFolders.push(l);
    }
  }

  if (animFolders.length === 0) {
    alert("❌ No anim_* folders found.");
    return;
  }

  // Step 3: Find max number of frames
  var maxFrames = 0;
  for (var i = 0; i < animFolders.length; i++) {
    var count = animFolders[i].layers.length;
    if (count > maxFrames) maxFrames = count;
  }

  // Step 4: Create anim_preview folder
  var desc = new ActionDescriptor();
  var ref = new ActionReference();
  ref.putClass(stringIDToTypeID("layerSection"));
  desc.putReference(charIDToTypeID("null"), ref);
  var nameDesc = new ActionDescriptor();
  nameDesc.putString(charIDToTypeID("Nm  "), "anim_preview");
  desc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("layerSection"), nameDesc);
  executeAction(charIDToTypeID("Mk  "), desc, DialogModes.NO);
  var previewGroup = doc.layers[0];

  // Step 5: Merge frames
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

    // Merge
    executeAction(charIDToTypeID("Mrg2"), undefined, DialogModes.NO);
    var merged = doc.activeLayer;
    merged.name = "_a_Frame " + (frame + 1);

    // Move merged to preview group
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

  alert("✅ Frames merged into 'anim_preview'. Ready for GIF export.");
})();`;

  window.parent.postMessage(script, "*");
}
