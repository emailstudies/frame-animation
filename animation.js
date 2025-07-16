function exportGif() {
  const script = `
(function () {
  var originalDoc = app.activeDocument;
  var frameLayers = [];
  var lockedStatus = [];
  var visibilityStatus = [];

  // Step 1: Collect all Frame_ layers (top-down)
  for (var i = originalDoc.layers.length - 1; i >= 0; i--) {
    var layer = originalDoc.layers[i];
    if (layer.name.startsWith("Frame_")) {
      frameLayers.push(layer);
      lockedStatus.push(layer.allLocked);
      visibilityStatus.push(layer.visible);
    }
  }

  if (frameLayers.length === 0) {
    alert("⚠️ No layers starting with 'Frame_' found.");
    return;
  }

  // Step 2: Make all Frame_ layers visible for duplication
  for (var i = 0; i < frameLayers.length; i++) {
    if (!frameLayers[i].allLocked) {
      frameLayers[i].visible = true;
    }
  }

  // Step 3: Duplicate each frame and store references
  var duplicatedLayers = [];
  for (var i = 0; i < frameLayers.length; i++) {
    var dup = frameLayers[i].duplicate();
    duplicatedLayers.push(dup);
  }

  // Step 4: Get bounds from top frame (assumes same size)
  var refLayer = duplicatedLayers[0];
  var width = refLayer.bounds[2] - refLayer.bounds[0];
  var height = refLayer.bounds[3] - refLayer.bounds[1];

  // Step 5: Create new doc for preview
  var previewDoc = app.documents.add(width, height, 72, "Animation Preview", NewDocumentMode.RGB);

  // Step 6: Paste each duplicated layer into new doc
  for (var i = duplicatedLayers.length - 1; i >= 0; i--) {
    app.activeDocument = originalDoc;
    duplicatedLayers[i].visible = true;
    app.activeDocument.activeLayer = duplicatedLayers[i];
    app.runMenuItem(stringIDToTypeID("copy"));

    app.activeDocument = previewDoc;
    app.runMenuItem(stringIDToTypeID("paste"));

    var pasted = previewDoc.activeLayer;
    pasted.name = "_a_" + frameLayers[i].name;
    pasted.visible = visibilityStatus[i];
    if (lockedStatus[i]) pasted.allLocked = true;
  }

  // Step 7: Return to original doc and clean up temp layers
  app.activeDocument = originalDoc;
  for (var i = 0; i < duplicatedLayers.length; i++) {
    duplicatedLayers[i].remove();
  }

})();`.trim();

  window.parent.postMessage(script, "*");
}
