function previewGif() {
  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) {
        alert("No active document.");
        return;
      }

      // Step 1: Deselect all
      app.activeDocument.activeLayer = doc.layers[0];
      for (var i = 0; i < doc.layers.length; i++) doc.layers[i].selected = false;

      // Step 2: Select two top layers
      if (doc.layers.length < 2) {
        alert("❌ Need at least 2 layers.");
        return;
      }

      var top = doc.layers[0];
      var below = doc.layers[1];
      top.selected = true;
      below.selected = true;

      // Step 3: Duplicate selection to a new document
      app.runMenuItem("newDocFromLayers"); // This opens new doc with merged selection

      // Step 4: Flatten it and rename
      var newDoc = app.activeDocument;
      if (newDoc) {
        newDoc.flatten();
        newDoc.layers[0].name = "Merged_Layer_Descriptor_Test";
        alert("✅ Successfully merged two layers in a new document.");
      }
    })();
  `;

  window.parent.postMessage(script, "*");
}
