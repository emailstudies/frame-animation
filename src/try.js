function exportGif() {
  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) {
        alert("No active document.");
        return;
      }

      // Step 1: Create a new folder named "anim_e"
      var animFolder = doc.layerSets.add();
      animFolder.name = "anim_e";

      // Step 2: Names of layers to find
      var targetNames = ["Layer 1", "Layer 2"];
      var matchedLayers = [];

      // Step 3: Loop through root layers and collect matches
      for (var i = 0; i < doc.layers.length; i++) {
        var layer = doc.layers[i];
        if (layer.typename !== "LayerSet" && targetNames.includes(layer.name)) {
          matchedLayers.push(layer);
        }
      }

      if (matchedLayers.length === 0) {
        alert("No target layers found.");
        return;
      }

      // Step 4: Duplicate each into the anim_e folder
      for (var i = 0; i < matchedLayers.length; i++) {
        var original = matchedLayers[i];
        app.activeDocument.activeLayer = original;
        var dup = original.duplicate();
        dup.name = original.name + " copy";
        dup.move(animFolder, ElementPlacement.INSIDE);
      }

      console.log("✅ Duplicated Layer 1 and Layer 2 into anim_e.");
    })();
  `;

  window.parent.postMessage(script, "*");
}
