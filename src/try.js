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

      // Step 3: Create real anim_e folder via ActionDescriptor
      var groupDesc = new ActionDescriptor();
      var ref = new ActionReference();
      ref.putClass(stringIDToTypeID("layerSection"));
      groupDesc.putReference(charIDToTypeID("null"), ref);

      var props = new ActionDescriptor();
      props.putString(charIDToTypeID("Nm  "), "anim_e");
      groupDesc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("layerSection"), props);

      executeAction(charIDToTypeID("Mk  "), groupDesc, DialogModes.NO);

      // Step 4: Move anim_e to top of root
      var animFolder = doc.activeLayer;
      var topLayer = doc.layers[0];
      animFolder.move(topLayer, ElementPlacement.PLACEBEFORE);

      // Step 5: Find "Layer 1" and "Layer 2" at root
      var targets = ["Layer 1", "Layer 2"];
      var matched = [];

      for (var i = 0; i < doc.layers.length; i++) {
        var layer = doc.layers[i];
        if (layer.typename !== "LayerSet" && targets.includes(layer.name)) {
          matched.push(layer);
        }
      }

      if (matched.length === 0) {
        alert("No layers named 'Layer 1' or 'Layer 2' found at root.");
        return;
      }

      // Step 6: Duplicate matched layers into anim_e
      for (var i = 0; i < matched.length; i++) {
        var original = matched[i];
        app.activeDocument.activeLayer = original;
        var dup = original.duplicate();
        dup.name = original.name + " copy";
        dup.move(animFolder, ElementPlacement.INSIDE);
      }

      console.log("✅ anim_e created at top, and Layer 1 / 2 duplicated inside.");
    })();
  `;

  window.parent.postMessage(script, "*");
}
