function exportGif() {
  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) {
        alert("No active document.");
        return;
      }

      // Step 1: Check if anim_e exists
      for (var i = 0; i < doc.layers.length; i++) {
        var layer = doc.layers[i];
        if (layer.typename === "LayerSet" && layer.name === "anim_e") {
          alert("❌ Folder 'anim_e' already exists. Please delete it before running this.");
          return;
        }
      }

      // Step 2: Ensure no nesting
      var tempFolder = doc.layerSets.add();
      tempFolder.name = "temp_check_folder";
      var parent = tempFolder.parent;
      var atRoot = (parent && parent.name === doc.name);
      tempFolder.remove();

      if (!atRoot) {
        alert("❌ Cannot create 'anim_e' as a nested folder. Please deselect all or select nothing.");
        return;
      }

      // Step 3: Create anim_e via ActionDescriptor
      var groupDesc = new ActionDescriptor();
      var ref = new ActionReference();
      ref.putClass(stringIDToTypeID("layerSection"));
      groupDesc.putReference(charIDToTypeID("null"), ref);

      var props = new ActionDescriptor();
      props.putString(charIDToTypeID("Nm  "), "anim_e");
      groupDesc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("layerSection"), props);

      executeAction(charIDToTypeID("Mk  "), groupDesc, DialogModes.NO);

      // Step 4: Move anim_e to top
      var animFolder = doc.activeLayer;
      var topLayer = doc.layers[0];
      animFolder.move(topLayer, ElementPlacement.PLACEBEFORE);

      // Step 5: Collect all root-level non-folder layers to duplicate
      var duplicates = [];
      for (var i = 0; i < doc.layers.length; i++) {
        var layer = doc.layers[i];
        if (layer.typename !== "LayerSet") {
          app.activeDocument.activeLayer = layer;
          var dup = layer.duplicate();
          dup.name = layer.name + " copy";
          dup.move(animFolder, ElementPlacement.INSIDE);
          duplicates.push(dup);
        }
      }

      // Step 6: Merge all duplicates if more than 1
      if (duplicates.length >= 2) {
        app.activeDocument.activeLayer = duplicates[0];
        for (var i = 1; i < duplicates.length; i++) {
          duplicates[i].move(duplicates[0], ElementPlacement.PLACEAFTER);
        }
        var merged = duplicates[0].merge();
        merged.name = "Merged_Layer";
        merged.move(animFolder, ElementPlacement.INSIDE);
        console.log("✅ Merged", duplicates.length, "layers into 'Merged_Layer'.");
      } else if (duplicates.length === 1) {
        console.log("ℹ️ Only one layer duplicated. No merge needed.");
      } else {
        alert("❌ No eligible layers found to duplicate.");
      }
    })();
  `;

  window.parent.postMessage(script, "*");
}
