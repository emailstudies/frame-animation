function exportGif() {
  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) {
        alert("No active document.");
        return;
      }

      var layerA = null;
      var layerB = null;

      // Step 1: Find "Layer 1" and "Layer 2"
      for (var i = 0; i < doc.layers.length; i++) {
        var layer = doc.layers[i];
        if (layer.name === "Layer 1" && layer.typename !== "LayerSet") {
          layerA = layer;
        }
        if (layer.name === "Layer 2" && layer.typename !== "LayerSet") {
          layerB = layer;
        }
      }

      if (!layerA || !layerB) {
        alert("Layer 1 and/or Layer 2 not found.");
        return;
      }

      // Step 2: Duplicate both layers
      var dupA = layerA.duplicate();
      var dupB = layerB.duplicate();

      // Step 3: Move to top of stack
      dupA.move(doc, ElementPlacement.PLACEATBEGINNING);
      dupB.move(doc, ElementPlacement.PLACEATBEGINNING);

      // Step 4: Select both for merge (order matters)
      doc.activeLayer = dupB;
      dupA.selected = true;

      // Step 5: Merge
      executeAction(charIDToTypeID("Mrg2"), undefined, DialogModes.NO);

      // Step 6: Rename the merged result
      doc.activeLayer.name = "Merged_Layer 1_Layer 2";

      console.log("✅ Successfully merged Layer 1 and Layer 2");
    })();
  `;

  window.parent.postMessage(script, "*");
}
