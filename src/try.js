function exportGif() {
  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) {
        alert("No active document.");
        return;
      }

      // Step 1: Check if anim_e folder already exists at root
      for (var i = 0; i < doc.layers.length; i++) {
        var layer = doc.layers[i];
        if (layer.typename === "LayerSet" && layer.name === "anim_e") {
          alert("⚠️ 'anim_e' folder already exists. Please delete it before running this again.");
          return;
        }
      }

      // Step 2: Create new folder 'anim_e' at the root level
      var animFolder = doc.layerSets.add();
      animFolder.name = "anim_e";

      // Step 3: Find layers named "Layer 1" and "Layer 2" at root
      var targetNames = ["Layer 1", "Layer 2"];
      var matchedLayers = [];

      for (var i = 0; i < doc.layers.length; i++) {
        var layer = doc.layers[i];
        if (layer.typename !== "LayerSet" && targetNames.includes(layer.name)) {
          matchedLayers.push(layer);
        }
      }

      if (matchedLayers.length === 0) {
        alert("No layers named 'Layer 1' or 'Layer 2' found at root.");
        return;
      }

      // Step 4: Duplicate matched layers into anim_e
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
