function exportGif() {
  const script = `
(function () {
  if (!app || !app.activeDocument) {
    alert("No active document.");
    return;
  }

  var doc = app.activeDocument;

  // Check for existing preview folder
  var existingPreview = doc.layerSets.find(f => f.name === "anim_preview");
  if (existingPreview) {
    alert("⚠️ 'anim_preview' folder already exists. Please delete or rename it before running this again.");
    return;
  }

  // Get all folders starting with "anim" and not locked
  var animFolders = doc.layerSets.filter(f => f.name.toLowerCase().startsWith("anim") && !f.allLocked);

  if (animFolders.length === 0) {
    alert("❌ No 'anim' folders found.");
    return;
  }

  // Determine the max number of layers across all anim folders
  var maxFrames = Math.max(...animFolders.map(f => f.artLayers.length));

  // Create preview folder
  var previewFolder = doc.layerSets.add();
  previewFolder.name = "anim_preview";

  for (var i = 0; i < maxFrames; i++) {
    var layersToMerge = [];

    for (var j = 0; j < animFolders.length; j++) {
      var folder = animFolders[j];

      if (folder.artLayers.length > i) {
        var frameLayer = folder.artLayers[folder.artLayers.length - 1 - i]; // layers in reverse order
        if (!frameLayer.allLocked) {
          var dup = frameLayer.duplicate();
          dup.visible = true;
          layersToMerge.push(dup);
        }
      }
    }

    if (layersToMerge.length > 0) {
      app.activeDocument.activeLayer = layersToMerge[0];
      for (var k = 1; k < layersToMerge.length; k++) {
        layersToMerge[k].move(layersToMerge[0], ElementPlacement.PLACEAFTER);
      }

      var merged = app.activeDocument.mergeVisibleLayers();
      merged.name = "_a_Frame " + (i + 1);
      merged.move(previewFolder, ElementPlacement.INSIDE);
    }
  }

  alert("✅ Preview ready in 'anim_preview'. Use File > Export As > GIF to export.");
})();`.trim();

  window.parent.postMessage(script, "*");
}
