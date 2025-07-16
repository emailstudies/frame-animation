function exportGif() {
  const script = `
(function () {
  var doc = app.activeDocument;

  // Check for existing preview folder
  for (var i = 0; i < doc.layerSets.length; i++) {
    if (doc.layerSets[i].name === "anim_preview") {
      alert("⚠️ 'anim_preview' folder already exists. Please delete it before re-running.");
      return;
    }
  }

  // Find all unlocked 'anim' folders
  var animGroups = [];
  for (var i = 0; i < doc.layerSets.length; i++) {
    var group = doc.layerSets[i];
    if (group.name.startsWith("anim") && !group.allLocked) {
      animGroups.push(group);
    }
  }

  if (animGroups.length === 0) {
    alert("⚠️ No 'anim_*' folders found.");
    return;
  }

  // Find max number of layers (frames)
  var maxFrames = 0;
  for (var i = 0; i < animGroups.length; i++) {
    var group = animGroups[i];
    var count = 0;
    for (var j = 0; j < group.layers.length; j++) {
      if (!group.layers[j].allLocked) count++;
    }
    if (count > maxFrames) maxFrames = count;
  }

  if (maxFrames === 0) {
    alert("⚠️ No unlocked animation frames found.");
    return;
  }

  // Create preview folder
  var previewFolder = doc.layerSets.add();
  previewFolder.name = "anim_preview";

  // Build each _a_Frame X by merging copies of corresponding index from each group
  for (var f = 0; f < maxFrames; f++) {
    var duplicates = [];

    for (var g = 0; g < animGroups.length; g++) {
      var group = animGroups[g];
      var index = group.layers.length - 1 - f;  // Reverse index
      if (index >= 0) {
        var layer = group.layers[index];
        if (!layer.allLocked) {
          var dup = layer.duplicate();
          dup.visible = true;
          duplicates.push(dup);
        }
      }
    }

    if (duplicates.length === 0) continue;

    // Merge all visible duplicates
    var merged = doc.mergeVisibleLayers();
    merged.name = "_a_Frame " + (f + 1);
    merged.move(previewFolder, ElementPlacement.INSIDE);
  }

  alert("✅ Animation preview created in 'anim_preview'. Export via File > Export As > GIF.");
})();`.trim();

  window.parent.postMessage(script, "*");
}
