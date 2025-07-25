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

      // Step 2: Merge Layers
      var merged = layer2.merge();
      merged.name = "Merged_Layer_1_2";

      console.log("✅ Merged original Layer 1 and Layer 2");
    })();
  `;

  window.parent.postMessage(script, "*");
}
