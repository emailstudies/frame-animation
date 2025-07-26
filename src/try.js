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

      // ✅ Step 2: Deselect all layers (to prevent nesting)
      try {
        var desc = new ActionDescriptor();
        var ref = new ActionReference();
        desc.putReference(charIDToTypeID("null"), ref);
        executeAction(charIDToTypeID("selectNoLayers"), desc, DialogModes.NO);
      } catch (e) {
        // Ignore errors from deselect (e.g., nothing was selected)
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
      var animE = doc.activeLayer;
      var topLayer = doc.layers[0];
      animE.move(topLayer, ElementPlacement.PLACEBEFORE);

      // Step 5: Loop over all anim_* folders (except anim_e) and duplicate their first layer
      var duplicated = [];
      for (var i = 0; i < doc.layers.length; i++) {
        var folder = doc.layers[i];
        if (
          folder.typename !== "LayerSet" ||
          folder.name === "anim_e" ||
          folder.name.indexOf("anim_") !== 0
        ) continue;

        if (folder.layers.length === 0) continue;

        var firstFrame = folder.layers[folder.layers.length - 1]; // topmost layer
        if (!firstFrame || firstFrame.typename === "LayerSet" || firstFrame.locked) continue;

        doc.activeLayer = firstFrame;
        var dup = firstFrame.duplicate();
        dup.name = "_a_" + firstFrame.name;
        dup.move(animE, ElementPlacement.INSIDE);
        duplicated.push(dup.name);
      }

      if (duplicated.length < 2) {
        alert("❌ Need at least 2 anim_* folders with visible layers.");
        return;
      }

      // Step 6: Merge all layers inside anim_e
      while (animE.layers.length > 1) {
        var top = animE.layers[0];
        var next = animE.layers[1];
        doc.activeLayer = next;
        next.merge();
      }

      animE.layers[0].name = "_a_merged_1";

      console.log("📦 Duplicated from folders:", duplicated);
      console.log("✅ Merged into anim_e/_a_merged_1");
    })();
  `;

  window.parent.postMessage(script, "*");
}
