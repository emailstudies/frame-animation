function exportGif() {
  const script = `
    (function () {
      var doc = app.activeDocument;

      var layer1 = null;
      var layer2 = null;

      // Step 1: Find Layer 1 and Layer 2
      for (var i = 0; i < doc.layers.length; i++) {
        var layer = doc.layers[i];
        if (!layer || layer.typename === "LayerSet") continue;
        if (layer.name === "Layer 1") layer1 = layer;
        if (layer.name === "Layer 2") layer2 = layer;
      }

      if (!layer1 || !layer2) {
        alert("Layer 1 and/or Layer 2 not found.");
        return;
      }

      // Step 2: Move Layer 1 and Layer 2 to top (Layer 2 should be above Layer 1)
      var index1 = doc.layers.indexOf(layer1);
      var index2 = doc.layers.indexOf(layer2);
      var top = doc.layers.length;

      // Remove and re-add in order: Layer 1 first, Layer 2 above it
      var layers = doc.layers.slice();
      layers.splice(index1, 1);
      if (index2 > index1) index2--; // because layer1 was removed
      layers.splice(index2, 1);
      layers.push(layer1, layer2);
      doc.layers = layers;

      // Step 3: Merge (layer2 is now above layer1)
      var merged = layer2.merge();
      merged.name = "Merged_Layer_1_2";

      alert("✅ Layers merged using .merge()");
    })();
  `;

  window.parent.postMessage(script, "*");
}
