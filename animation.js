function exportGif() {
  const script = `
(function () {
  var doc = app.activeDocument;

  // Check if preview already exists
  for (var i = 0; i < doc.layerSets.length; i++) {
    if (doc.layerSets[i].name === "anim_preview") {
      alert("⚠️ 'anim_preview' folder already exists. Please delete it manually.");
      return;
    }
  }

  // Gather all unlocked anim_* folders
  var animGroups = [];
  for (var i = 0; i < doc.layerSets.length; i++) {
    var group = doc.layerSets[i];
    if (group.name.startsWith("anim") && !group.allLocked) {
      animGroups.push(group);
    }
  }

  if (animGroups.length === 0) {
    alert("⚠️ No unlocked 'anim_' folders found.");
    return;
  }

  // Determine max frame count
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
    alert("⚠️ No unlocked layers found in animation folders.");
    return;
  }

  // Create preview folder
  var previewFolder = doc.layerSets.add();
  previewFolder.name = "anim_preview";

  // Loop through each frame index
  for (var f = 0; f < maxFrames; f++) {
    var tempGroup = doc.layerSets.add();
    tempGroup.name = "anim_temp_" + (f + 1);

    // Duplicate the f-th layer from each anim group into tempGroup
    for (var g = 0; g < animGroups.length; g++) {
      var group = animGroups[g];
      if (f < group.layers.length) {
        var layer = group.layers[f];
        if (!layer.allLocked) {
          var dup = layer.duplicate();
          dup.move(tempGroup, ElementPlacement.INSIDE);
          dup.visible = true;
        }
      }
    }

    // Merge tempGroup into one layer
    var merged = doc.mergeVisibleLayers();
    merged.name = "_a_Frame " + (f + 1);
    merged.move(previewFolder, ElementPlacement.INSIDE);

    // Delete tempGroup
    try {
      tempGroup.remove();
    } catch (e) {}
  }

  alert("✅ Merged animation frames ready in 'anim_preview'. Export manually via File > Export As > GIF.");
})();`.trim();

  window.parent.postMessage(script, "*");
}
