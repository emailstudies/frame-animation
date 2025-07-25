function exportGif() {
  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) {
        alert("No active document.");
        return;
      }

      // Find Layer 1 and Layer 2
      var layer1 = null;
      var layer2 = null;
      for (var i = 0; i < doc.layers.length; i++) {
        var layer = doc.layers[i];
        if (!layer1 && layer.name === "Layer 1" && layer.typename !== "LayerSet") {
          layer1 = layer;
        } else if (!layer2 && layer.name === "Layer 2" && layer.typename !== "LayerSet") {
          layer2 = layer;
        }
      }

      if (!layer1 || !layer2) {
        alert("Layer 1 or Layer 2 not found.");
        return;
      }

      // Duplicate both layers
      var dup1 = layer1.duplicate();
      var dup2 = layer2.duplicate();

      // Move to top for consistent merge
      dup1.move(doc.layers[0], ElementPlacement.PLACEBEFORE);
      dup2.move(doc.layers[0], ElementPlacement.PLACEBEFORE);

      // Select both
      dup1.selected = true;
      dup2.selected = true;

      // Merge them
      executeAction(charIDToTypeID("Mrg2"), undefined, DialogModes.NO);

      console.log("✅ Merged 'Layer 1' and 'Layer 2' (copies only)");
    })();
  `;

  window.parent.postMessage(script, "*");
}
