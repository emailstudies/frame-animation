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

      // Step 2: Create temp marker to get "top" index
      var tempGroup = doc.layerSets.add();
      tempGroup.name = "temp_marker";

      var topIndex = doc.layers.findIndex(function (l) {
        return l.name === "temp_marker";
      });

      tempGroup.remove();

      // Step 3: Move Layer 1 and Layer 2 to top using splice
      doc.layers.splice(topIndex, 0, doc.layers.splice(doc.layers.indexOf(layer1), 1)[0]);
      doc.layers.splice(topIndex, 0, doc.layers.splice(doc.layers.indexOf(layer2), 1)[0]);

      alert("✅ Layer 1 and Layer 2 moved to top.");
    })();
  `;

  window.parent.postMessage(script, "*");
}
