function exportGif() {
  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) {
        alert("No active document.");
        return;
      }

      // Step 1: Create new folder "anim_e" at top of root
      var tempFolder = doc.layerSets.add();
      tempFolder.name = "TEMP_insert";
      tempFolder.move(doc.layers[0], ElementPlacement.PLACEBEFORE); // Insert at top
      tempFolder.name = "anim_e"; // Rename after positioning

      // Step 2: Find "Layer 1" and "Layer 2"
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

      // Step 4: Move duplicates to top to make merging reliable
      dup1.move(doc.layers[0], ElementPlacement.PLACEBEFORE);
      dup2.move(doc.layers[0], ElementPlacement.PLACEBEFORE);

      // Step 5: Select both duplicates
      for (var i = 0; i < doc.artLayers.length; i++) {
        doc.artLayers[i].selected = false;
      }
      dup1.selected = true;
      dup2.selected = true;

      // Step 6: Merge selected (duplicated) layers
      executeAction(charIDToTypeID("Mrg2"), undefined, DialogModes.NO);
      var merged = doc.activeLayer;
      merged.name = "Merged Layer";

      // Step 7: Move merged result into "anim_e"
      for (var i = 0; i < doc.layerSets.length; i++) {
        if (doc.layerSets[i].name === "anim_e") {
          merged.move(doc.layerSets[i], ElementPlacement.INSIDE);
          break;
        }
      }

      console.log("✅ Merged duplicates of 'Layer 1' and 'Layer 2' into 'anim_e'");
    })();
  `;

  window.parent.postMessage(script, "*");
}
