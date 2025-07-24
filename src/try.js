function exportGif() {
  const script = `
(function () {
  if (!app || !app.activeDocument) {
    alert("No active document.");
    return;
  }

  var doc = app.activeDocument;

  // Check if anim_preview exists
  var exists = false;
  for (var i = 0; i < doc.layers.length; i++) {
    if (doc.layers[i].name === "anim_preview" && doc.layers[i].layers) {
      exists = true;
      break;
    }
  }

  if (exists) {
    alert("⚠️ 'anim_preview' already exists. Delete it before rerunning.");
    return;
  }

  // Collect anim_* folders
  var animFolders = [];
  for (var i = 0; i < doc.layers.length; i++) {
    var group = doc.layers[i];
    if (group.name.indexOf("anim_") === 0 && group.layers && !group.locked) {
      animFolders.push(group);
    }
  }

  if (animFolders.length === 0) {
    alert("❌ No 'anim_*' folders found.");
    return;
  }

  // Get max frame count
  var maxFrames = 0;
  for (var i = 0; i < animFolders.length; i++) {
    if (animFolders[i].layers.length > maxFrames) {
      maxFrames = animFolders[i].layers.length;
    }
  }

  // Create preview folder
  var desc = new ActionDescriptor();
  var ref = new ActionReference();
  ref.putClass(stringIDToTypeID("layerSection"));
  desc.putReference(charIDToTypeID("null"), ref);
  var nameDesc = new ActionDescriptor();
  nameDesc.putString(charIDToTypeID("Nm  "), "anim_preview");
  desc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("layerSection"), nameDesc);
  executeAction(charIDToTypeID("Mk  "), desc, DialogModes.NO);
  var previewGroup = doc.layers[0];

  // Duplicate and rename _a_ layers per frame
  for (var frame = 0; frame < maxFrames; frame++) {
    for (var f = 0; f < animFolders.length; f++) {
      var folder = animFolders[f];
      var layer = folder.layers[frame] || folder.layers[0]; // fallback to first if missing
      if (!layer || layer.locked) continue;

      var dup = layer.duplicate();
      dup.name = "_a_Frame " + (frame + 1);
      
      // Move to anim_preview
      var moveDesc = new ActionDescriptor();
      var moveRef = new ActionReference();
      moveRef.putIdentifier(charIDToTypeID("Lyr "), dup.id);
      moveDesc.putReference(charIDToTypeID("null"), moveRef);
      var toRef = new ActionReference();
      toRef.putIdentifier(charIDToTypeID("Lyr "), previewGroup.id);
      moveDesc.putReference(charIDToTypeID("T   "), toRef);
      moveDesc.putBoolean(charIDToTypeID("Adjs"), false);
      moveDesc.putInteger(charIDToTypeID("Vrsn"), 5);
      executeAction(charIDToTypeID("move"), moveDesc, DialogModes.NO);
    }
  }

  alert("✅ Duplicated _a_ layers into 'anim_preview'. Use Layer > Animation > Merge to flatten.");
})();`;

  window.parent.postMessage(script, "*");
}
