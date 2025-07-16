function exportGif() {
  const script = `
(async function () {
  if (!app || !app.activeDocument) {
    alert("No active document.");
    return;
  }

  var doc = app.activeDocument;

  // Gather anim folders
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

  // Determine number of frames
  var maxFrames = 0;
  for (var i = 0; i < animFolders.length; i++) {
    maxFrames = Math.max(maxFrames, animFolders[i].artLayers.length);
  }

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

    // Merge visible using Action Descriptor
    if (visibleLayers.length > 0) {
      await app.batchPlay([
        {
          _obj: "mergeVisible",
          _options: { dialogOptions: "dontDisplay" }
        }
      ], {});

      var mergedLayer = doc.activeLayer;
      mergedLayer.name = "_a_Frame " + (frame + 1);
    }

    for (var v = 0; v < visibleLayers.length; v++) {
      visibleLayers[v].visible = false;
    }
  }

  alert("✅ Merged frames created using descriptors as _a_Frame 1, _a_Frame 2, etc.");
})();
`.trim();

  window.parent.postMessage(script, "*");
}
