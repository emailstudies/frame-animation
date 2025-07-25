function exportGif() {
  const script = `
    (function () {
      var doc = app.activeDocument;

      if (!doc || doc.layers.length < 2) {
        alert("Document does not have enough layers.");
        return;
      }

      var layer1Index = -1;
      var layer2Index = -1;

      // Find indices of "Layer 1" and "Layer 2"
      for (var i = 0; i < doc.layers.length; i++) {
        var layer = doc.layers[i];
        if (layer.name === "Layer 1" && layer.typename !== "LayerSet" && layer1Index === -1) {
          layer1Index = i;
        }
        if (layer.name === "Layer 2" && layer.typename !== "LayerSet" && layer2Index === -1) {
          layer2Index = i;
        }
      }

      if (layer1Index === -1 || layer2Index === -1) {
        alert("Layer 1 or Layer 2 not found.");
        return;
      }

      // Duplicate both layers
      var dup1 = doc.layers[layer1Index].duplicate();
      var dup2 = doc.layers[layer2Index].duplicate();

      // Move duplicates to top of stack
      dup1.move(doc.layers[0], ElementPlacement.PLACEBEFORE);
      dup2.move(doc.layers[0], ElementPlacement.PLACEBEFORE);

      // Ensure dup2 is on top (active), and select dup1 too
      doc.activeLayer = dup2;
      dup1.selected = true;

      // Merge the top two selected layers
      executeAction(charIDToTypeID("Mrg2"), undefined, DialogModes.NO);

      // Rename merged layer
      doc.activeLayer.name = "Merged_Layer 1_Layer 2";

      console.log("✅ Merged Layer 1 and Layer 2 successfully.");
    })();
  `;

  window.parent.postMessage(script, "*");
}
