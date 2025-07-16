function exportGif() {
  const script = `
(function () {
  if (!app || !app.activeDocument) {
    alert("No active document.");
    return;
  }

  var doc = app.activeDocument;

  // Check for existing preview folder
  for (var i = 0; i < doc.layerSets.length; i++) {
    if (doc.layerSets[i].name === "anim_preview") {
      alert("⚠️ 'anim_preview' folder already exists. Please delete it manually if you want to regenerate.");
      return;
    }
  }

  // Collect all anim folders
  var animFolders = [];
  for (var i = 0; i < doc.layerSets.length; i++) {
    var folder = doc.layerSets[i];
    if (folder.name.toLowerCase().startsWith("anim") && !folder.allLocked) {
      animFolders.push(folder);
    }
  }

  if (animFolders.length === 0) {
    alert("❌ No 'anim' folders found.");
    return;
  }

  // Determine max number of frames
  var maxFrames = 0;
  for (var i = 0; i < animFolders.length; i++) {
    maxFrames = Math.max(maxFrames, animFolders[i].artLayers.length);
  }

  // Create anim_preview folder
  var previewGroup = doc.layerSets.add();
  previewGroup.name = "anim_preview";

  for (var frame = 0; frame < maxFrames; frame++) {
    var visibleLayers = [];

    for (var f = 0; f < animFolders.length; f++) {
      var folder = animFolders[f];
      var frameIndex = folder.artLayers.length - 1 - frame;

      if (frameIndex >= 0) {
        var layer = folder.artLayers[frameIndex];
        if (!layer.allLocked) {
          layer.visible = true;
          visibleLayers.push(layer);
        }
      }
    }

    // Merge visible layers
    if (visibleLayers.length > 0) {
      var merged = doc.mergeVisibleLayers();
      merged.name = "_a_Frame " + (frame + 1);
      doc.activeLayer.move(previewGroup, ElementPlacement.PLACEATEND);
    }

    // Hide all again
    for (var v = 0; v < visibleLayers.length; v++) {
      visibleLayers[v].visible = false;
    }
  }

  alert("✅ 'anim_preview' created with merged frames for preview.");
})();
`.trim();

  window.parent.postMessage(script, "*");
}
