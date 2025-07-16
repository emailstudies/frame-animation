function exportGif() {
  const script = `
(function () {
  var doc = app.activeDocument;

  // Check for existing preview folder
  for (var i = 0; i < doc.layerSets.length; i++) {
    if (doc.layerSets[i].name === "anim_preview") {
      alert("⚠️ 'anim_preview' folder already exists. Please delete it manually.");
      return;
    }
  }

  // Gather all anim_* folders
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

  // Find max frame count across folders
  var maxFrames = 0;
  for (var i = 0; i < animGroups.length; i++) {
    var group = animGroups[i];
    var count = 0;
    for (var j = 0; j < group.layers.length; j++) {
      var layer = group.layers[j];
      if (!layer.allLocked) count++;
    }
    if (count > maxFrames) maxFrames = count;
  }

  if (maxFrames === 0) {
    alert("⚠️ No unlocked layers found in anim folders.");
    return;
  }

  // Create anim_preview folder
  var previewFolder = doc.layerSets.add();
  previewFolder.name = "anim_preview";

  for (var frameIndex = 0; frameIndex < maxFrames; frameIndex++) {
    var tempLayers = [];

    // Duplicate matching frame index layer from each anim group
    for (var g = 0; g < animGroups.length; g++) {
      var group = animGroups[g];
      if (frameIndex < group.layers.length) {
        var layer = group.layers[frameIndex];
        if (!layer.allLocked) {
          var copy = layer.duplicate();
          copy.visible = true;
          tempLayers.push(copy);
        }
      }
    }

    // If no valid layers in this frame, skip
    if (tempLayers.length === 0) continue;

    // Merge duplicates
    var merged = doc.mergeVisibleLayers();
    merged.name = "_a_Frame " + (frameIndex + 1);
    merged.move(previewFolder, ElementPlacement.INSIDE);

    // Clean up temp copies if any remain (merged already deletes most)
    for (var k = 0; k < tempLayers.length; k++) {
      try {
        tempLayers[k].remove();
      } catch (e) {}
    }
  }

  alert("✅ Preview created in 'anim_preview'. Export via File > Export As > GIF.");
})();`.trim();

  window.parent.postMessage(script, "*");
}
