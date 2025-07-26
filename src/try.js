function exportGif() {
  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) {
        alert("No active document.");
        return;
      }

      // Step 1: Delete old anim_e if it exists
      for (var i = doc.layers.length - 1; i >= 0; i--) {
        var layer = doc.layers[i];
        if (layer.name === "anim_e" && layer.typename === "LayerSet") {
          layer.remove();
        }
      }

      // Step 2: Create anim_e at top
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

      // Step 3: Get real selected layer indices via ActionDescriptor
      function getSelectedLayerIndices() {
        var selected = [];
        var ref = new ActionReference();
        ref.putProperty(charIDToTypeID("Prpr"), stringIDToTypeID("targetLayers"));
        ref.putEnumerated(charIDToTypeID("Dcmn"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
        try {
          var desc = executeActionGet(ref);
          if (desc.hasKey(stringIDToTypeID("targetLayers"))) {
            var list = desc.getList(stringIDToTypeID("targetLayers"));
            for (var i = 0; i < list.count; i++) {
              var idx = list.getReference(i).getIndex();
              selected.push(idx - 1); // Adjust for 0-based index
            }
          }
        } catch (e) {}
        return selected;
      }

      var selectedIndices = getSelectedLayerIndices();
      var selectedLayers = [];
      for (var i = 0; i < selectedIndices.length; i++) {
        var layer = doc.layers[selectedIndices[i]];
        if (layer && layer.typename !== "LayerSet") {
          selectedLayers.push(layer);
        }
      }

      if (selectedLayers.length === 0) {
        alert("❌ No non-folder layers selected.");
        return;
      }

      // Step 4: Duplicate selected layers into anim_e
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

      // Step 6: Merge and move into anim_e
      if (duplicates.length >= 2) {
        app.activeDocument.activeLayer = duplicates[0];
        var merged = duplicates[0].merge();
        merged.name = "Merged_Layer";
        merged.move(animFolder, ElementPlacement.INSIDE);
        alert("✅ Merged " + selectedLayers.length + " selected layers.");
      } else {
        alert("ℹ️ Only one layer selected, skipped merging.");
      }

      // Debug console output
      window.console && console.log("📂 Selected layers:", selectedLayers.map(l => l.name));
    })();
  `;

  window.parent.postMessage(script, "*");
}
