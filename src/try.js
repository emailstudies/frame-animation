function exportGif() {
  const script = `
    (function () {
      var original = app.activeDocument;

      // Step 1: Create a new document with same dimensions
      var dupDoc = app.documents.add(original.width, original.height, original.resolution, "anim_preview", NewDocumentMode.RGB);

      // Step 2: Duplicate each top-level layer or folder
      for (var i = 0; i < original.layers.length; i++) {
        var layer = original.layers[i];

        // Skip locked layers/folders
        if (layer.locked) continue;

        // Select the layer
        app.activeDocument = original;
        original.activeLayer = layer;

        // Duplicate to new doc
        layer.duplicate(dupDoc, ElementPlacement.PLACEATEND);
      }

      // Step 3: Focus the duplicated document
      app.activeDocument = dupDoc;

      alert("✅ Document duplicated as 'anim_preview'.");
    })();
  `;

  window.parent.postMessage(script, "*");
}
