function exportGif() {
  const script = `
(function () {
  var doc = app.activeDocument;

  // Check if preview already exists
  for (var i = 0; i < doc.layerSets.length; i++) {
    if (doc.layerSets[i].name === "anim_preview") {
      alert("⚠️ 'anim_preview' already exists. Please delete it before previewing again.");
      return;
    }
  }

  // Collect anim folders (not locked)
  var animGroups = [];
  for (var i = 0; i < doc.layerSets.length; i++) {
    var group = doc.layerSets[i];
    if (group.name.startsWith("anim") && !group.allLocked) {
      animGroups.push(group);
    }
  }

  if (animGroups.length === 0) {
    alert("⚠️ No folders starting with 'anim' found.");
    return;
  }

  // Determine max number of frames
  var maxFrames = 0;
  for (var i = 0; i < animGroups.length; i++) {
    var count = 0;
    for (var j = 0; j < animGroups[i].layers.length; j++) {
      var layer = animGroups[i].layers[j];
      if (!layer.allLocked) count++;
    }
    if (count > maxFrames) maxFrames = count;
  }

  if (maxFrames === 0) {
    alert("⚠️ No visible, unlocked layers to merge.");
    return;
  }

  // Create anim_preview folder
  var previewFolder = doc.layerSets.add();
  previewFolder.name = "anim_preview";

  // Build frame-by-frame merged layers
  for (var frame = 0; frame < maxFrames; frame++) {
    // Hide all layers
    for (var i = 0; i < doc.layers.length; i++) {
      doc.layers[i].visible = false;
    }

    // Show matching layer index in all anim folders
    for (var g = 0; g < animGroups.length; g++) {
      var group = animGroups[g];
      var idx = group.layers.length - 1 - frame;
      if (idx >= 0) {
        var layer = group.layers[idx];
        if (!layer.allLocked) layer.visible = true;
      }
    }

    // Merge visible layers
    var merged = doc.mergeVisibleLayers();
    merged.name = "_a_Frame " + (frame + 1);
    merged.move(previewFolder, ElementPlacement.INSIDE);
  }

  alert("✅ Preview created as 'anim_preview'. Export GIF manually.");
})();
`.trim();

  window.parent.postMessage(script, "*");
}
