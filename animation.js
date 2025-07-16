function exportGif() {
  const script = `
(function () {
  var doc = app.activeDocument;
  var visibleLayer = null;

  // Step 1: Find the visible Frame_ layer
  for (var i = 0; i < doc.layers.length; i++) {
    var layer = doc.layers[i];
    if (layer.name.startsWith("Frame_") && layer.visible) {
      visibleLayer = layer;
      break;
    }
  }

  if (!visibleLayer) {
    alert("⚠️ No visible Frame_ layer found.");
    return;
  }

  // Step 2: Duplicate visible layer
  var duplicated = visibleLayer.duplicate();
  duplicated.name = "Merged_Frame_For_Export";

  // Step 3: Merge it (make sure only it is visible)
  for (var j = 0; j < doc.layers.length; j++) {
    doc.layers[j].visible = (doc.layers[j] === duplicated);
  }

  // Step 4: Open Save for Web
  app.runMenuItem(stringIDToTypeID("exportSaveForWeb"));

})();`.trim();

  window.parent.postMessage(script, "*");
}
