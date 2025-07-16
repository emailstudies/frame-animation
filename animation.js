function exportGif() {
  const script = `
(function () {
  var doc = app.activeDocument;
  var visibleLayer = null;

  // Step 1: Find currently visible Frame_ layer
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

  // Step 2: Duplicate the visible layer
  var tempLayer = visibleLayer.duplicate();
  tempLayer.name = "Merged_Frame_Preview";

  // Step 3: Hide all layers except the duplicate
  for (var j = 0; j < doc.layers.length; j++) {
    doc.layers[j].visible = (doc.layers[j] === tempLayer);
  }

  // Step 4: Copy Merged Layer to New Document
  app.runMenuItem(stringIDToTypeID("copy"));
  var width = tempLayer.bounds[2] - tempLayer.bounds[0];
  var height = tempLayer.bounds[3] - tempLayer.bounds[1];
  app.documents.add(width, height, 72, "Frame Preview", NewDocumentMode.RGB);
  app.runMenuItem(stringIDToTypeID("paste"));

  // Step 5: Clean up tempLayer in original doc
  app.activeDocument = doc;
  tempLayer.remove();

})();`.trim();

  window.parent.postMessage(script, "*");
}
