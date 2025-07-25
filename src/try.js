function exportGif() {
  const script = `
    (function () {
      var doc = app.activeDocument;

      // Step 1: Define the list of layer names to merge
      var layerNames = ["Layer 1", "Layer 2", "Layer 3"];

      var foundLayers = [];

      // Step 2: Find the actual layer objects from the names
      for (var i = 0; i < layerNames.length; i++) {
        var name = layerNames[i];
        for (var j = 0; j < doc.layers.length; j++) {
          var layer = doc.layers[j];
          if (layer && layer.name === name && layer.typename !== "LayerSet" && !layer.locked) {
            foundLayers.push(layer);
            break;
          }
        }
      }

      if (foundLayers.length < 2) {
        alert("Need at least 2 layers for merging. Found: " + foundLayers.length);
        return;
      }

      // Step 3: Create a new document
      var newDoc = app.documents.add(doc.width, doc.height, doc.resolution, "merged_output", NewDocumentMode.RGB);

      // Step 4: Duplicate layers in reverse to preserve stacking order
      for (var i = foundLayers.length - 1; i >= 0; i--) {
        var layer = foundLayers[i];
        app.activeDocument = doc;
        doc.activeLayer = layer;
        layer.duplicate(newDoc, ElementPlacement.PLACEATEND);
      }

      // Step 5: Merge all layers
      app.activeDocument = newDoc;

      while (newDoc.layers.length > 1) {
        newDoc.layers[newDoc.layers.length - 1].merge(); // merges top into bottom
      }

      // Step 6: Rename merged result
      newDoc.activeLayer.name = "Merged_Layer_1_2_3";

      alert("✅ Layers merged in new document.");
    })();
  `;

  window.parent.postMessage(script, "*");
}
