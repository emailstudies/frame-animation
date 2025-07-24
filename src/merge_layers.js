function previewGif() {
  const script = `
(function () {
  if (!app || !app.activeDocument) {
    alert("No active document.");
    return;
  }

  var doc = app.activeDocument;

  // Step 1: Get the first two anim_* folders
  var animFolders = [];
  for (var i = 0; i < doc.layerSets.length; i++) {
    var folder = doc.layerSets[i];
    if (folder.name.toLowerCase().startsWith("anim")) {
      animFolders.push(folder);
    }
  }

  if (animFolders.length < 2) {
    alert("❌ Need at least 2 anim_* folders.");
    return;
  }

  var folder1 = animFolders[0];
  var folder2 = animFolders[1];

  var maxFrames = Math.max(folder1.artLayers.length, folder2.artLayers.length);

  for (var i = 0; i < maxFrames; i++) {
    var layersToMerge = [];

    if (i < folder1.artLayers.length) {
      var l1 = folder1.artLayers[folder1.artLayers.length - 1 - i].duplicate();
      layersToMerge.push(l1);
    }

    if (i < folder2.artLayers.length) {
      var l2 = folder2.artLayers[folder2.artLayers.length - 1 - i].duplicate();
      layersToMerge.push(l2);
    }

    if (layersToMerge.length > 0) {
      app.activeDocument.activeLayer = layersToMerge[layersToMerge.length - 1];
      for (var j = layersToMerge.length - 2; j >= 0; j--) {
        app.activeDocument.activeLayer = app.activeDocument.activeLayer.merge(layersToMerge[j]);
      }

      var merged = app.activeDocument.activeLayer;
      merged.name = "_test_Frame " + (i + 1);
    }
  }

  alert("✅ Test merged " + maxFrames + " frames from two anim folders.");
})();`.trim();

  window.parent.postMessage(script, "*");
}
