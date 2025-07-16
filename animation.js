function exportGif() {
  const script = `
(function () {
  var doc = app.activeDocument;

  // Check if preview already exists
  for (var i = 0; i < doc.layerSets.length; i++) {
    if (doc.layerSets[i].name === "anim_preview") {
      alert("⚠️ 'anim_preview' already exists. Please delete it manually before generating preview.");
      return;
    }
  }

  // Collect anim folders
  var animFolders = [];
  for (var i = 0; i < doc.layerSets.length; i++) {
    var group = doc.layerSets[i];
    if (group.name.startsWith("anim") && !group.allLocked) {
      animFolders.push(group);
    }
  }

  if (animFolders.length === 0) {
    alert("⚠️ No anim_* folders found.");
    return;
  }

  // Find max frame count
  var maxFrames = 0;
  for (var i = 0; i < animFolders.length; i++) {
    var frameCount = 0;
    for (var j = 0; j < animFolders[i].layers.length; j++) {
      if (!animFolders[i].layers[j].allLocked) frameCount++;
    }
    if (frameCount > maxFrames) maxFrames = frameCount;
  }

  if (maxFrames === 0) {
    alert("⚠️ No unlocked layers found to merge.");
    return;
  }

  // Create preview folder
  var previewGroup = doc.layerSets.add();
  previewGroup.name = "anim_preview";

  // Merge frames by index
  for (var f = 0; f < maxFrames; f++) {
    // Hide all layers
    for (var i = 0; i < doc.layers.length; i++) {
      doc.layers[i].visible = false;
    }

    // Show matching layers by index in anim folders
    for (var a = 0; a < animFolders.length; a++) {
      var group = animFolders[a];
      var index = group.layers.length - 1 - f;
      if (index >= 0) {
        var layer = group.layers[index];
        if (!layer.allLocked) layer.visible = true;
      }
    }

    // Merge visible
    var merged = doc.mergeVisibleLayers();
    merged.name = "_a_Frame " + (f + 1);
    merged.move(previewGroup, ElementPlacement.INSIDE);
  }

  alert("✅ anim_preview ready! You can now export GIF via File > Export As > GIF.");
})();`.trim();

  window.parent.postMessage(script, "*");
}
