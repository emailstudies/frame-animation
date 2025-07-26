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

      // Step 2: Find all layers named "Layer 1" at root
      var layer1s = [];
      for (var i = 0; i < doc.layers.length; i++) {
        var layer = doc.layers[i];
        if (layer.name === "Layer 1" && layer.typename !== "LayerSet") {
          layer1s.push(layer);
        }
      }

      if (layer1s.length === 0) {
        alert("No layers named 'Layer 1' found.");
        return;
      }

      // Step 3: Duplicate each Layer 1 and move duplicate into anim_e
      for (var i = 0; i < layer1s.length; i++) {
        var original = layer1s[i];
        app.activeDocument.activeLayer = original;
        var dup = original.duplicate();
        dup.name = "Layer 1 copy " + (i + 1);
        dup.move(animFolder, ElementPlacement.INSIDE);
      }

      console.log("✅ Duplicated 'Layer 1' into new folder 'anim_e'");
    })();
  `;

  window.parent.postMessage(script, "*");
}
