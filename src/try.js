function exportGif() {
  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) {
        alert("No active document.");
        return;
      }

      // Step 1: Find Layer 1 and Layer 2
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

      // Step 2: Duplicate both
      var dup1 = layer1.duplicate();
      var dup2 = layer2.duplicate();

      // Step 3: Move both to top
      dup1.move(doc, ElementPlacement.PLACEATBEGINNING);
      dup2.move(doc, ElementPlacement.PLACEATBEGINNING);

      // Step 4: Deselect all layers
      for (var i = 0; i < doc.artLayers.length; i++) {
        doc.artLayers[i].selected = false;
      }

      // Step 5: Select only dup1 and dup2
      dup1.selected = true;
      dup2.selected = true;

      // Step 6: Merge selected
      executeAction(charIDToTypeID("Mrg2"), undefined, DialogModes.NO);

      var merged = doc.activeLayer;
      merged.name = "Merged Layer";

      console.log("✅ Merged copies of 'Layer 1' and 'Layer 2'");
    })();
  `;

  window.parent.postMessage(script, "*");
}
