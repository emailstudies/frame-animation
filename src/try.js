function exportGif() {
  const script = `
    (function () {
      var doc = app.activeDocument;

      if (!doc || doc.layers.length < 2) {
        alert("Document does not have enough layers.");
        return;
      }

      var layer1 = null;
      var layer2 = null;

      // Find "Layer 1" and "Layer 2"
      for (var i = 0; i < doc.layers.length; i++) {
        var layer = doc.layers[i];
        if (layer.name === "Layer 1" && layer.typename !== "LayerSet" && !layer1) {
          layer1 = layer;
        }
        if (layer.name === "Layer 2" && layer.typename !== "LayerSet" && !layer2) {
          layer2 = layer;
        }
      }

      if (!layer1 || !layer2) {
        alert("Layer 1 or Layer 2 not found.");
        return;
      }

      // Duplicate both
      var dup1 = layer1.duplicate();
      var dup2 = layer2.duplicate();

      // Move duplicates to top
      dup1.move(doc, ElementPlacement.PLACEATBEGINNING);
      dup2.move(doc, ElementPlacement.PLACEATBEGINNING);

      // Merge using direct .merge()
      var mergedLayer = dup2.merge();

      mergedLayer.name = "Merged_Layer 1_Layer 2";

      console.log("✅ Merged using .merge()");
    })();
  `;

  window.parent.postMessage(script, "*");
}
