function exportGif() {
  const script = `
    (function () {
      var original = app.activeDocument;

      // Step 1: Create a new document with same dimensions
      var dupDoc = app.documents.add(original.width, original.height, original.resolution, "anim_preview", NewDocumentMode.RGB);

      // Step 2: Duplicate layers in REVERSE to preserve order
      for (var i = original.layers.length - 1; i >= 0; i--) {
        var layer = original.layers[i];

        if (layer.locked) continue;

        app.activeDocument = original;
        original.activeLayer = layer;

        layer.duplicate(dupDoc, ElementPlacement.PLACEATEND);
      }

      // Step 3: Focus the duplicated document
      app.activeDocument = dupDoc;

      alert("✅ Document duplicated with correct order as 'anim_preview'.");
    })();
  `;

  window.parent.postMessage(script, "*");
}
