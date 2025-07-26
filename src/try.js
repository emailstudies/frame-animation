function exportGif() {
  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) {
        alert("No active document.");
        return;
      }

      // Step 1: Delete existing anim_e folder if it exists
      for (var i = doc.layers.length - 1; i >= 0; i--) {
        var layer = doc.layers[i];
        if (layer.name === "anim_e" && layer.typename === "LayerSet") {
          layer.remove();
        }
      }

      // Step 2: Create new anim_e folder at top
      var groupDesc = new ActionDescriptor();
      var ref = new ActionReference();
      ref.putClass(stringIDToTypeID("layerSection"));
      groupDesc.putReference(charIDToTypeID("null"), ref);

      var props = new ActionDescriptor();
      props.putString(charIDToTypeID("Nm  "), "anim_e");
      groupDesc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("layerSection"), props);

      executeAction(charIDToTypeID("Mk  "), groupDesc, DialogModes.NO);
      var animFolder = doc.activeLayer;
      var topLayer = doc.layers[0];
      animFolder.move(topLayer, ElementPlacement.PLACEBEFORE);

      // Step 3: Collect selected layers (non-folder only)
      var selectedLayers = [];
      for (var i = 0; i < doc.layers.length; i++) {
        var layer = doc.layers[i];
        if (layer && layer.selected && layer.typename !== "LayerSet") {
          selectedLayers.push(layer);
        }
      }

      if (selectedLayers.length === 0) {
        alert("❌ No layers selected. Please select layers to merge.");
        return;
      }

      // Step 4: Duplicate selected layers and move into anim_e
      var duplicates = [];
      for (var i = 0; i < selectedLayers.length; i++) {
        var layer = selectedLayers[i];
        app.activeDocument.activeLayer = layer;
        var dup = layer.duplicate();
        dup.name = "_a_" + layer.name;
        dup.move(animFolder, ElementPlacement.INSIDE);
        duplicates.push(dup);
      }

      // Step 5: Reorder duplicates to be stacked
      for (var i = duplicates.length - 1; i >= 0; i--) {
        duplicates[i].move(duplicates[0], ElementPlacement.PLACEBEFORE);
      }

      // Step 6: Merge and move merged result into anim_e
      if (duplicates.length >= 2) {
        app.activeDocument.activeLayer = duplicates[0];
        var merged = duplicates[0].merge();
        merged.name = "Merged_Layer";
        merged.move(animFolder, ElementPlacement.INSIDE);
        console.log("✅ Merged selected layers into anim_e");
      } else {
        console.log("ℹ️ Only one layer selected, skipping merge.");
      }
    })();
  `;

  window.parent.postMessage(script, "*");
}
