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
        if (layer.name === "Layer 1" && !layer1 && layer.typename !== "LayerSet") {
          layer1 = layer;
        }
        if (layer.name === "Layer 2" && !layer2 && layer.typename !== "LayerSet") {
          layer2 = layer;
        }
      }

      if (!layer1 || !layer2) {
        alert("Layer 1 and/or Layer 2 not found.");
        return;
      }

      // Duplicate both
      var dup1 = layer1.duplicate();
      var dup2 = layer2.duplicate();

      // Move both to top
      dup1.move(doc.layers[0], ElementPlacement.PLACEBEFORE);
      dup2.move(doc.layers[0], ElementPlacement.PLACEBEFORE);

      // Select dup2, then dup1 (order matters — top layer remains selected after merge)
      doc.activeLayer = dup2;
      dup1.selected = true;

      // Merge
      executeAction(charIDToTypeID("Mrg2"), undefined, DialogModes.NO);

      doc.activeDocument.activeLayer.name = "Merged Layer";

      console.log("✅ Merged copies of Layer 1 and Layer 2");
    })();
  `;

  window.parent.postMessage(script, "*");
}
