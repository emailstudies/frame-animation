function exportGif() {
  const script = `
    (function () {
      var doc = app.activeDocument;

      // Step 1: Names of layers you want to merge
      var layerNames = ["Layer 1", "Layer 2", "Layer 3"];
      var foundLayers = [];

      // Step 2: Locate those layers
      for (var i = 0; i < layerNames.length; i++) {
        var name = layerNames[i];
        for (var j = 0; j < doc.layers.length; j++) {
          var layer = doc.layers[j];
          if (layer.name === name && !layer.locked && layer.typename !== "LayerSet") {
            foundLayers.push(layer);
            break;
          }
        }
      }

      if (foundLayers.length < 2) {
        alert("Need at least 2 mergeable layers. Found: " + foundLayers.length);
        return;
      }

      // Step 3: Create new document
      var newDoc = app.documents.add(doc.width, doc.height, doc.resolution, "merged_output", NewDocumentMode.RGB);

      // Step 4: Duplicate layers into new doc in reverse (so Layer 1 ends up on top)
      for (var i = foundLayers.length - 1; i >= 0; i--) {
        doc.activeLayer = foundLayers[i];
        foundLayers[i].duplicate(newDoc, ElementPlacement.PLACEATEND);
      }

      // Step 5: Merge manually from top to bottom
      app.activeDocument = newDoc;

      while (newDoc.layers.length > 1) {
        var topLayer = newDoc.layers[newDoc.layers.length - 1];
        var belowLayer = newDoc.layers[newDoc.layers.length - 2];

        newDoc.activeLayer = topLayer;
        topLayer.merge(); // merges into belowLayer
      }

      newDoc.activeLayer.name = "Merged_Layer_1_2_3";

      alert("✅ Merged layers successfully into one.");
    })();
  `;

  window.parent.postMessage(script, "*");
}
