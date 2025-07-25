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

  // Step 2: Create new document with same size as original
  var width = originalDoc.width;
  var height = originalDoc.height;
  var previewDoc = app.documents.add(width, height, 72, "Animation Preview", NewDocumentMode.RGB);

  // Step 3: Copy + paste each frame layer (group or normal)
  for (var i = frameLayers.length - 1; i >= 0; i--) {
    var originalLayer = frameLayers[i];

    // Switch to original doc
    app.activeDocument = originalDoc;

    // Make visible if not locked
    if (!originalLayer.allLocked) {
      originalLayer.visible = true;
    }

    app.activeDocument.activeLayer = originalLayer;
    app.runMenuItem(stringIDToTypeID("copy"));

    // Switch to preview doc and paste
    app.activeDocument = previewDoc;
    app.runMenuItem(stringIDToTypeID("paste"));

    var pasted = previewDoc.activeLayer;
    pasted.name = "_a_" + originalLayer.name;
    pasted.visible = visibilityStatus[i];
    if (lockedStatus[i]) pasted.allLocked = true;
  }

  // Step 4: Switch back to original doc
  app.activeDocument = originalDoc;
})();`.trim();

  window.parent.postMessage(script, "*");
}
