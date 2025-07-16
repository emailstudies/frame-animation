function exportGif() {
  const script = `
(function () {
  var doc = app.activeDocument;

  // Check if anim_preview already exists
  for (var i = 0; i < doc.layerSets.length; i++) {
    if (doc.layerSets[i].name === "anim_preview") {
      alert("⚠️ 'anim_preview' already exists. Please delete it manually.");
      return;
    }
  }

  // Get all anim_* folders
  var animGroups = [];
  for (var i = 0; i < doc.layerSets.length; i++) {
    var group = doc.layerSets[i];
    if (group.name.startsWith("anim") && !group.allLocked) {
      animGroups.push(group);
    }
  }

  if (animGroups.length === 0) {
    alert("⚠️ No unlocked folders starting with 'anim' found.");
    return;
  }

  // Find max number of frames
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
    alert("⚠️ No unlocked layers found in anim folders.");
    return;
  }

  // Create final preview folder
  var previewFolder = doc.layerSets.add();
  previewFolder.name = "anim_preview";

  // For each frame index
  for (var f = 0; f < maxFrames; f++) {
    var tempGroup = doc.layerSets.add();
    tempGroup.name = "anim_temp_" + (f + 1);

    var addedLayer = false;

    for (var g = 0; g < animGroups.length; g++) {
      var group = animGroups[g];
      var index = group.layers.length - 1 - f;
      if (index >= 0) {
        var layer = group.layers[index];
        if (!layer.allLocked) {
          var dup = layer.duplicate();
          dup.move(tempGroup, ElementPlacement.INSIDE);
          dup.visible = true;
          addedLayer = true;
        }
      }
    }

    if (!addedLayer) {
      tempGroup.remove();
      continue;
    }

    // Merge and move
    var merged = doc.mergeVisibleLayers();
    merged.name = "_a_Frame " + (f + 1);
    merged.move(previewFolder, ElementPlacement.INSIDE);

    // Clean up temp group
    try {
      tempGroup.remove();
    } catch (e) {
      // ignore
    }
  }

  alert("✅ anim_preview created. Use File > Export As > GIF to export.");
})();`.trim();

  window.parent.postMessage(script, "*");
}
