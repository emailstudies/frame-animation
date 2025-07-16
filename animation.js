function exportGif() {
  const script = `
(async function () {
  var doc = app.activeDocument;

  // Check if anim_preview already exists
  for (var i = 0; i < doc.layerSets.length; i++) {
    if (doc.layerSets[i].name === "anim_preview") {
      alert("⚠️ 'anim_preview' already exists. Delete it before generating preview.");
      return;
    }
  }

  // Get all top-level folders starting with 'anim', skip locked ones
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

  // Determine maximum number of frames
  var maxFrames = 0;
  for (var i = 0; i < animFolders.length; i++) {
    var count = 0;
    for (var j = 0; j < animFolders[i].layers.length; j++) {
      if (!animFolders[i].layers[j].allLocked) count++;
    }
    if (count > maxFrames) maxFrames = count;
  }

  if (maxFrames === 0) {
    alert("⚠️ No unlocked layers found to merge.");
    return;
  }

  // Create preview folder
  var previewGroup = doc.layerSets.add();
  previewGroup.name = "anim_preview";

  // For each frame index, collect same index layers and merge
  for (var f = 0; f < maxFrames; f++) {
    var frameLayers = [];

    for (var a = 0; a < animFolders.length; a++) {
      var group = animFolders[a];
      var idx = group.layers.length - 1 - f; // topmost = index 0

      if (idx >= 0) {
        var candidate = group.layers[idx];
        if (!candidate.allLocked) {
          var dup = candidate.duplicate();
          dup.visible = true;
          frameLayers.push(dup);
        }
      }
    }

    if (frameLayers.length === 0) continue;

    // Merge the collected layers
    var merged = doc.mergeVisibleLayers();
    merged.name = "_a_Frame " + (f + 1);
    merged.move(previewGroup, ElementPlacement.INSIDE);
  }

  alert("✅ anim_preview ready. Export GIF from File > Export As > GIF.");
})();`.trim();

  window.parent.postMessage(script, "*");
}
