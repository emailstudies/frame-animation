function exportGif() {
  const script = `
(function () {
  if (!app || !app.activeDocument) {
    alert("No active document.");
    return;
  }

  var doc = app.activeDocument;

  function mergeVisible() {
    app.batchPlay(
      [{
        _obj: "mergeVisible",
        _options: { dialogOptions: "dontDisplay" }
      }],
      {}
    );
  }

  // 1. Find all folders starting with "anim" (ignore locked ones)
  var animFolders = [];
  for (var i = 0; i < doc.layerSets.length; i++) {
    var folder = doc.layerSets[i];
    if (folder.name.toLowerCase().startsWith("anim") && !folder.allLocked) {
      animFolders.push(folder);
    }
  }

  if (animFolders.length === 0) {
    alert("❌ No folders starting with 'anim' found.");
    return;
  }

  // 2. Get max number of frames
  var maxFrames = 0;
  for (var i = 0; i < animFolders.length; i++) {
    maxFrames = Math.max(maxFrames, animFolders[i].artLayers.length);
  }

  // 3. For each frame index, collect corresponding layers and merge
  for (var frame = 0; frame < maxFrames; frame++) {
    var visibleLayers = [];

    for (var f = 0; f < animFolders.length; f++) {
      var folder = animFolders[f];
      var frameIndex = folder.artLayers.length - 1 - frame; // top-down

      if (frameIndex >= 0) {
        var layer = folder.artLayers[frameIndex];
        if (!layer.allLocked) {
          layer.visible = true;
          visibleLayers.push(layer);
        }
      }
    }

    if (visibleLayers.length > 0) {
      mergeVisible();
      if (doc.activeLayer) {
        doc.activeLayer.name = "_a_Frame " + (frame + 1);
      }
    }

    // Hide again
    for (var v = 0; v < visibleLayers.length; v++) {
      visibleLayers[v].visible = false;
    }
  }

  alert("✅ Animation preview layers (_a_Frame) created without modifying original folders.");
})();`.trim();

  window.parent.postMessage(script, "*");
}
