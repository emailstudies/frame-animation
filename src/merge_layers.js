function previewGif() {
  const script = `
(function () {
  var doc = app.activeDocument;
  if (!doc) return alert("❌ No active document.");

  // STEP 1: Get all anim_* folders
  var animFolders = [];
  for (var i = 0; i < doc.layerSets.length; i++) {
    var group = doc.layerSets[i];
    if (group.name.startsWith("anim_") && group.name !== "anim_preview") {
      animFolders.push(group);
    }
  }

  if (animFolders.length === 0) {
    alert("❌ No anim_* folders found.");
    return;
  }

  // STEP 2: Get max number of frames
  var maxFrames = 0;
  for (var i = 0; i < animFolders.length; i++) {
    maxFrames = Math.max(maxFrames, animFolders[i].layers.length);
  }

  // STEP 3: Check for existing preview folder
  var previewGroup = null;
  for (var i = 0; i < doc.layerSets.length; i++) {
    if (doc.layerSets[i].name === "anim_preview") {
      alert("⚠️ 'anim_preview' already exists. Delete it before running again.");
      return;
    }
  }

  // STEP 4: Create 'anim_preview' group
  var desc = new ActionDescriptor();
  var ref = new ActionReference();
  ref.putClass(stringIDToTypeID("layerSection"));
  desc.putReference(charIDToTypeID("null"), ref);
  var nameDesc = new ActionDescriptor();
  nameDesc.putString(charIDToTypeID("Nm  "), "anim_preview");
  desc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("layerSection"), nameDesc);
  executeAction(charIDToTypeID("Mk  "), desc, DialogModes.NO);

  // Find the newly created group
  previewGroup = doc.layerSets[0]; // Newly made folders go to top

  // STEP 5: Loop through each frame index
  for (var frameIndex = 0; frameIndex < maxFrames; frameIndex++) {
    var tempDuplicates = [];

    // STEP 6: Collect this frame from all anim folders
    for (var j = 0; j < animFolders.length; j++) {
      var folder = animFolders[j];
      var layerIndex = folder.layers.length - 1 - frameIndex; // bottom = Frame 1

      if (layerIndex >= 0) {
        var original = folder.layers[layerIndex];
        var dup = original.duplicate();
        tempDuplicates.push(dup);
      }
    }

    // STEP 7: Merge all collected layers into one
    if (tempDuplicates.length > 0) {
      app.activeDocument.activeLayer = tempDuplicates[tempDuplicates.length - 1];
      for (var k = tempDuplicates.length - 2; k >= 0; k--) {
        app.activeDocument.activeLayer = app.activeDocument.activeLayer.merge(tempDuplicates[k]);
      }

      var merged = app.activeDocument.activeLayer;
      merged.name = "_a_Frame " + (frameIndex + 1);
      merged.move(previewGroup, ElementPlacement.INSIDE);
    }
  }

  alert("✅ Merged " + maxFrames + " frames into 'anim_preview'!");
})();
  `;

  window.parent.postMessage(script, "*");
}
