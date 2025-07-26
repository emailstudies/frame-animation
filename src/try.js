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

      // Step 2: Ensure no nesting by creating temp folder to test root access
      try {
        var tempFolder = doc.layerSets.add();
        tempFolder.name = "temp_check_folder";
        var parent = tempFolder.parent;
        var atRoot = (parent && parent.name === doc.name);
        tempFolder.remove();

        if (!atRoot) {
          alert("❌ Cannot create 'anim_e' as a nested folder. Please deselect all or select nothing.");
          return;
        }
      } catch (e) {
        alert("Error verifying root-level access: " + e);
        return;
      }

      // Step 3: Create anim_e folder via ActionDescriptor
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

      // Step 5: Duplicate topmost layer from each anim_* folder into anim_e
      var duplicated = [];

      for (var i = 0; i < doc.layers.length; i++) {
        var folder = doc.layers[i];
        if (
          folder.typename !== "LayerSet" ||
          folder.name === "anim_e" ||
          folder.name.indexOf("anim_") !== 0
        ) continue;

        if (folder.layers.length === 0) continue;

        var firstFrame = folder.layers[folder.layers.length - 1]; // topmost frame
        if (!firstFrame || firstFrame.typename === "LayerSet" || firstFrame.locked) continue;

        doc.activeLayer = firstFrame;
        var dup = firstFrame.duplicate();
        dup.name = "_a_" + firstFrame.name;
        dup.move(animE, ElementPlacement.INSIDE);
        duplicated.push(dup.name);
      }

      if (duplicated.length < 2) {
        alert("❌ Need at least 2 anim_* folders with layers.");
        return;
      }

      // Step 6: Merge all layers inside anim_e
      while (animE.layers.length > 1) {
        var top = animE.layers[0];
        var below = animE.layers[1];
        doc.activeLayer = below;
        below.merge();
      }

      animE.layers[0].name = "_a_merged_1";

      alert("✅ Merged: " + duplicated.join(", "));
      console.log("✅ Merged into anim_e/_a_merged_1");
    })();
  `;

  window.parent.postMessage(script, "*");
}
