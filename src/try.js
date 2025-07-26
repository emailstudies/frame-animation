function exportGif() {
  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) {
        alert("No active document.");
        return;
      }

      // Step 1: Delete existing anim_e if any
      for (var i = doc.layers.length - 1; i >= 0; i--) {
        var layer = doc.layers[i];
        if (layer.name === "anim_e" && layer.typename === "LayerSet") {
          layer.remove();
        }
      }

      // Step 2: Create new anim_e folder
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

      // Step 3: Collect and duplicate root layers (non-folders only)
      var duplicates = [];
      var originalLayers = [];
      for (var i = 0; i < doc.layers.length; i++) {
        var layer = doc.layers[i];
        if (layer.typename !== "LayerSet" && layer.name !== "Merged_Layer") {
          originalLayers.push(layer);
        }
      }

      if (originalLayers.length === 0) {
        alert("No eligible root layers to duplicate.");
        return;
      }

      for (var i = 0; i < originalLayers.length; i++) {
        var layer = originalLayers[i];
        app.activeDocument.activeLayer = layer;
        var dup = layer.duplicate();
        dup.name = "_a_" + layer.name;
        dup.move(animFolder, ElementPlacement.INSIDE);
        duplicates.push(dup);
      }

      if (duplicates.length >= 2) {
        // Reorder for stacking before merge
        for (var i = duplicates.length - 1; i >= 0; i--) {
          duplicates[i].move(duplicates[0], ElementPlacement.PLACEBEFORE);
        }

        // Merge from the top of the stack
        app.activeDocument.activeLayer = duplicates[0];
        var merged = duplicates[0].merge();
        merged.name = "Merged_Layer";
        merged.move(animFolder, ElementPlacement.INSIDE);
        console.log("✅ Merged", duplicates.length, "layers into 'Merged_Layer'");
      } else {
        console.log("ℹ️ Only one duplicate layer, no need to merge.");
      }
    })();
  `;

  window.parent.postMessage(script, "*");
}
