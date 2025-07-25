function exportGif() {
  const script = `
    (function () {
      var original = app.activeDocument;

      // Step 1: Create a new document with same dimensions
      var dupDoc = app.documents.add(original.width, original.height, original.resolution, "anim_preview", NewDocumentMode.RGB);

      // Step 2: Duplicate top-level layers in REVERSE to preserve stacking order
      for (var i = original.layers.length - 1; i >= 0; i--) {
        var layer = original.layers[i];
        if (layer.locked) continue;

        app.activeDocument = original;
        original.activeLayer = layer;
        layer.duplicate(dupDoc, ElementPlacement.PLACEATEND);
      }

      // Step 3: Focus on duplicated document
      app.activeDocument = dupDoc;

      // Step 4: Prefix all layers inside anim_* folders with "_a_"
      for (var i = 0; i < dupDoc.layers.length; i++) {
        var group = dupDoc.layers[i];
        if (group.typename === "LayerSet" && group.name.indexOf("anim_") === 0) {
          for (var j = 0; j < group.layers.length; j++) {
            var child = group.layers[j];
            if (child && !child.name.startsWith("_a_")) {
              child.name = "_a_" + child.name;
            }
          }
        }
      }

      alert("✅ Duplicated with _a_ prefixing inside anim_* folders.");
    })();
  `;

  window.parent.postMessage(script, "*");
}
