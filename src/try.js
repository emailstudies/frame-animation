function exportGif() {
  const script = `
    (function () {
      var doc = app.activeDocument;

      var layer1 = null;
      var layer2 = null;

      // Step 1: Locate Layer 1 and Layer 2
      for (var i = 0; i < doc.layers.length; i++) {
        var layer = doc.layers[i];
        if (!layer || layer.typename === "LayerSet") continue;
        if (layer.name === "Layer 1" && !layer1) layer1 = layer;
        if (layer.name === "Layer 2" && !layer2) layer2 = layer;
      }

      if (!layer1 || !layer2) {
        alert("Layer 1 and/or Layer 2 not found.");
        return;
      }

      // Step 2: Make sure Layer 2 is directly above Layer 1
      layer1.move(doc, ElementPlacement.PLACEATBEGINNING);
      layer2.move(doc, ElementPlacement.PLACEATBEGINNING); // Layer 2 is now above Layer 1

      // Step 3: Merge Layer 2 with the one below (Layer 1)
      var merged = layer2.merge();
      merged.name = "Merged_Layer_1_2";

      console.log("✅ Merged original Layer 1 and Layer 2");
    })();
  `;

  window.parent.postMessage(script, "*");
}
