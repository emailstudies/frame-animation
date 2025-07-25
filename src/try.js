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

      // Step 2: Move Layer 1 and Layer 2 to top using placement = 1 (PLACEBEFORE)
      layer1.move(doc, 1); // Move Layer 1 to top
      layer2.move(doc, 1); // Then Layer 2 above Layer 1

      console.log("✅ Layers moved to top. Ready to merge or proceed.");
    })();
  `;

  window.parent.postMessage(script, "*");
}
