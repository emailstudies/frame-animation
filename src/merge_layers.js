function previewGif() {
  const script = `
(function () {
  var originalDoc = app.activeDocument;
  var frameLayers = [];
  var lockedStatus = [];
  var visibilityStatus = [];

  // Step 1: Collect all Frame_ layers
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

  // Step 2: Create new doc with same dimensions
  var width = originalDoc.width;
  var height = originalDoc.height;
  var previewDoc = app.documents.add(width, height, 72, "Animation Preview", NewDocumentMode.RGB);

  // Step 3: Duplicate each layer into preview doc with _a_ prefix
  for (var i = 0; i < frameLayers.length; i++) {
    var originalLayer = frameLayers[i];
    app.activeDocument = originalDoc;
    app.activeDocument.activeLayer = originalLayer;

    var duplicated = originalLayer.duplicate(previewDoc);

    // Clean name: strip _a_ if already present
    var cleanName = originalLayer.name.replace(/^_a_/, "");
    duplicated.name = "_a_" + cleanName;

    duplicated.visible = visibilityStatus[i];
    if (lockedStatus[i]) duplicated.allLocked = true;
  }

  // Step 4: Switch to preview doc
  app.activeDocument = previewDoc;
})();`.trim();

  window.parent.postMessage(script, "*");
}
