function exportGif() {
  const script = `
(async function () {
  var doc = app.activeDocument;

  // Check if preview folder already exists
  for (var i = 0; i < doc.layers.length; i++) {
    if (doc.layers[i].name === "anim_preview" && doc.layers[i].typename === "LayerSet") {
      alert("⚠️ 'anim_preview' folder already exists. Please delete it manually before exporting again.");
      return;
    }
  }

  // Collect all 'anim' folders that are not locked
  var animGroups = [];
  for (var i = 0; i < doc.layers.length; i++) {
    var group = doc.layers[i];
    if (
      group.typename === "LayerSet" &&
      group.name.startsWith("anim") &&
      !group.allLocked
    ) {
      animGroups.push(group);
    }
  }

  if (animGroups.length === 0) {
    alert("⚠️ No unlocked 'anim' folders found.");
    return;
  }

  // Determine max frame count
  var frameCount = 0;
  for (var g = 0; g < animGroups.length; g++) {
    var group = animGroups[g];
    var count = 0;
    for (var j = 0; j < group.layers.length; j++) {
      var layer = group.layers[j];
      if (!layer.allLocked) count++;
    }
    if (count > frameCount) frameCount = count;
  }

  if (frameCount === 0) {
    alert("⚠️ No unlocked layers found in anim folders.");
    return;
  }

  // Create preview folder
  var previewGroup = doc.layerSets.add();
  previewGroup.name = "anim_preview";

  for (var f = 0; f < frameCount; f++) {
    var visibleLayers = [];

    for (var g = 0; g < animGroups.length; g++) {
      var group = animGroups[g];
      var layer = group.layers[f];
      if (layer && !layer.allLocked) {
        layer.visible = true;
        visibleLayers.push(layer);
      }
    }

    // Merge visible layers
    var merged = doc.mergeVisibleLayers();
    merged.name = "_a_Frame " + (f + 1);
    merged.move(previewGroup, ElementPlacement.INSIDE);

    // Re-hide source layers
    for (var v = 0; v < visibleLayers.length; v++) {
      visibleLayers[v].visible = false;
    }
  }

  alert("✅ Animation preview created in 'anim_preview'. Export manually via File > Export As > GIF.");
})();`.trim();

  window.parent.postMessage(script, "*");
}
