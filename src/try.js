function exportGif() {
  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) {
        alert("No active document.");
        return;
      }

      // Step 1: Check if anim_e already exists at root
      for (var i = 0; i < doc.layers.length; i++) {
        var layer = doc.layers[i];
        if (layer.typename === "LayerSet" && layer.name === "anim_e") {
          alert("❌ Folder 'anim_e' already exists. Please delete it before running this.");
          return;
        }
      }

      // Step 2: Ensure no nesting — use a temp folder check
      var tempFolder = doc.layerSets.add();
      tempFolder.name = "temp_check_folder";
      var parent = tempFolder.parent;
      var atRoot = (parent && parent.name === doc.name);
      tempFolder.remove();

      if (!atRoot) {
        alert("❌ Cannot create 'anim_e' as a nested folder. Please deselect all or select nothing.");
        return;
      }

      // Step 3: Create anim_e at top using ActionDescriptor
      var groupDesc = new ActionDescriptor();
      var ref = new ActionReference();
      ref.putClass(stringIDToTypeID("layerSection"));
      groupDesc.putReference(charIDToTypeID("null"), ref);

      var props = new ActionDescriptor();
      props.putString(charIDToTypeID("Nm  "), "anim_e");
      groupDesc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("layerSection"), props);

      executeAction(charIDToTypeID("Mk  "), groupDesc, DialogModes.NO);

      // Step 4: Move to top of root
      var animFolder = doc.activeLayer;
      var topLayer = doc.layers[0];
      animFolder.move(topLayer, ElementPlacement.PLACEBEFORE);

      // Step 5: Find Layer 1 and Layer 2 at root
      var targets = ["Layer 1", "Layer 2"];
      var matched = [];

      for (var i = 0; i < doc.layers.length; i++) {
        var layer = doc.layers[i];
        if (layer.typename !== "LayerSet" && targets.includes(layer.name)) {
          matched.push(layer);
        }
      }

      if (matched.length === 0) {
        alert("No layers named 'Layer 1' or 'Layer 2' found.");
        return;
      }

      // Step 6: Duplicate into anim_e
      var duplicates = [];
      for (var i = 0; i < matched.length; i++) {
        var original = matched[i];
        app.activeDocument.activeLayer = original;
        var dup = original.duplicate();
        dup.name = original.name + " copy";
        dup.move(animFolder, ElementPlacement.INSIDE);
        duplicates.push(dup);
      }

      // Step 7: Merge duplicated layers inside anim_e
      if (duplicates.length >= 2) {
        app.activeDocument.activeLayer = duplicates[0];
        for (var i = 1; i < duplicates.length; i++) {
          duplicates[i].move(duplicates[0], ElementPlacement.PLACEAFTER);
        }
        var merged = duplicates[0].merge();
        merged.name = "Merged_Layer";
        merged.move(animFolder, ElementPlacement.INSIDE);
        console.log("✅ Duplicates merged into one layer inside anim_e.");
      } else {
        console.log("ℹ️ Only one layer duplicated. No merge performed.");
      }
    })();
  `;

  window.parent.postMessage(script, "*");
}
