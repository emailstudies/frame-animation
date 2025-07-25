function exportGif() {
  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) {
        alert("No active document.");
        return;
      }

      // Step 1: Create new folder "anim_e"
      var animFolder = doc.layerSets.add();
      animFolder.name = "anim_e";

      // Step 2: Find Layer 1 and Layer 2
      var layer1 = null;
      var layer2 = null;

      for (var i = 0; i < doc.layers.length; i++) {
        var layer = doc.layers[i];
        if (layer.name === "Layer 1" && !layer1 && layer.typename !== "LayerSet") {
          layer1 = layer;
        } else if (layer.name === "Layer 2" && !layer2 && layer.typename !== "LayerSet") {
          layer2 = layer;
        }
      }

      if (!layer1 || !layer2) {
        alert("Both 'Layer 1' and 'Layer 2' must exist.");
        return;
      }

      // Step 3: Duplicate both layers
      var dup1 = layer1.duplicate();
      var dup2 = layer2.duplicate();

      // Step 4: Move duplicates to top to be merged easily
      dup1.move(doc, ElementPlacement.PLACEATBEGINNING);
      dup2.move(doc, ElementPlacement.PLACEATBEGINNING);

      // Step 5: Select both duplicated layers
      dup1.selected = true;
      dup2.selected = true;

      // Step 6: Merge selected layers (duplicates)
      executeAction(charIDToTypeID("Mrg2"), undefined, DialogModes.NO);
      var mergedLayer = doc.activeLayer;
      mergedLayer.name = "Merged Layer";

      // Step 7: Move merged layer into "anim_e"
      mergedLayer.move(animFolder, ElementPlacement.INSIDE);

      console.log("✅ Merged copies of 'Layer 1' and 'Layer 2' into 'anim_e'");
    })();
  `;

  window.parent.postMessage(script, "*");
}
