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

      // Step 4: Duplicate layers in REVERSE order to preserve UI stack
      for (var i = foundLayers.length - 1; i >= 0; i--) {
        doc.activeLayer = foundLayers[i];
        foundLayers[i].duplicate(newDoc, ElementPlacement.PLACEATEND);
      }

      // Step 5: Merge layers top-down in new document
      app.activeDocument = newDoc;

      while (newDoc.layers.length > 1) {
        // Make sure the top layer is selected
        newDoc.activeLayer = newDoc.layers[newDoc.layers.length - 1];
        newDoc.activeLayer.merge(); // merge top into layer below
      }

      newDoc.activeLayer.name = "Merged_Layer_1_2_3";

      alert("✅ Successfully merged into new document.");
    })();
  `;

  window.parent.postMessage(script, "*");
}
