function exportGif() {
  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) {
        alert("No active document.");
        return;
      }

      // Step 1: Delete old anim_e if exists
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

      // Step 3: Get selected layer indices
      function getSelectedLayerIndices() {
        var selected = [];
        try {
          var ref = new ActionReference();
          ref.putProperty(charIDToTypeID("Prpr"), stringIDToTypeID("targetLayers"));
          ref.putEnumerated(charIDToTypeID("Dcmn"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
          var desc = executeActionGet(ref);
          if (desc.hasKey(stringIDToTypeID("targetLayers"))) {
            var list = desc.getList(stringIDToTypeID("targetLayers"));
            for (var i = 0; i < list.count; i++) {
              var idx = list.getReference(i).getIndex();
              selected.push(idx - 1); // adjust to 0-based
            }
          }
        } catch (e) {
          alert("❌ Could not read selected layers.");
        }
        return selected;
      }

      var selectedIndices = getSelectedLayerIndices();
      var selectedLayers = [];
      for (var i = 0; i < selectedIndices.length; i++) {
        var index = selectedIndices[i];
        if (index >= 0 && index < doc.layers.length) {
          var layer = doc.layers[index];
          if (layer.typename !== "LayerSet") {
            selectedLayers.push(layer);
            console.log("📌 Selected:", layer.name);
          }
        }
      }

      if (selectedLayers.length === 0) {
        alert("❌ No usable layers selected.");
        return;
      }

      // Step 4: Duplicate into anim_e
      var duplicates = [];
      for (var i = 0; i < selectedLayers.length; i++) {
        var src = selectedLayers[i];
        app.activeDocument.activeLayer = src;
        var dup = src.duplicate();
        dup.name = "_a_" + src.name;
        dup.move(animFolder, ElementPlacement.INSIDE);
        duplicates.push(dup);
        console.log("📎 Duplicated:", src.name, "→", dup.name);
      }

      // Step 5: Reorder duplicates
      for (var i = duplicates.length - 1; i >= 0; i--) {
        duplicates[i].move(duplicates[0], ElementPlacement.PLACEBEFORE);
      }

      // Step 6: Merge
      if (duplicates.length >= 2) {
        app.activeDocument.activeLayer = duplicates[0];
        var merged = duplicates[0].merge();
        merged.name = "Merged_Layer";
        merged.move(animFolder, ElementPlacement.INSIDE);
        console.log("✅ Merged layer created as:", merged.name);
      } else {
        alert("ℹ️ Only one layer selected, skipped merging.");
      }

    })();
  `;

  window.parent.postMessage(script, "*");
}
