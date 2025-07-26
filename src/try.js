function exportGif() {
  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) {
        alert("No active document.");
        return;
      }

      window.console.log("📁 Document found: " + doc.name);

      // Force root-level context
      try {
        app.activeDocument.activeLayer = doc.artLayers.add();
        doc.activeLayer.remove();
        window.console.log("✅ Forced root-level selection using dummy layer.");
      } catch (e) {
        window.console.log("⚠️ Could not reset selection: " + e);
      }

      // Step 1: Check if 'anim_e' already exists
      for (var i = 0; i < doc.layers.length; i++) {
        var layer = doc.layers[i];
        if (layer.typename === "LayerSet" && layer.name === "anim_e") {
          alert("❌ Folder 'anim_e' already exists. Please delete it first.");
          window.console.log("❌ 'anim_e' already exists. Aborting.");
          return;
        }
      }
      window.console.log("✅ No existing 'anim_e' folder found.");

      // Step 2: Create 'anim_e' at root using descriptor
      try {
        var groupDesc = new ActionDescriptor();
        var ref = new ActionReference();
        ref.putClass(stringIDToTypeID("layerSection"));
        groupDesc.putReference(charIDToTypeID("null"), ref);

        var props = new ActionDescriptor();
        props.putString(charIDToTypeID("Nm  "), "anim_e");
        groupDesc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("layerSection"), props);

        executeAction(charIDToTypeID("Mk  "), groupDesc, DialogModes.NO);

        var animEFolder = doc.activeLayer;
        var topLayer = doc.layers[0];
        animEFolder.move(topLayer, ElementPlacement.PLACEBEFORE);

        window.console.log("✅ 'anim_e' folder created and moved to top.");
      } catch (e) {
        window.console.log("❌ Failed to create or move 'anim_e': " + e);
        return;
      }

      // Step 3: Collect first layers from all anim_* folders
      var toMerge = [];
      for (var i = 0; i < doc.layers.length; i++) {
        var layer = doc.layers[i];
        if (layer.typename === "LayerSet" && layer.name.indexOf("anim_") === 0 && layer.name !== "anim_e") {
          if (layer.layers.length > 0) {
            var firstLayer = layer.layers[layer.layers.length - 1]; // reverse stack order
            if (!firstLayer.locked) {
              app.activeDocument.activeLayer = firstLayer;
              var dup = firstLayer.duplicate();
              dup.name = "_a_" + firstLayer.name;
              toMerge.push(dup);
              window.console.log("✅ Duplicated from: " + layer.name + " → " + firstLayer.name);
            } else {
              window.console.log("⚠️ Skipped locked layer: " + firstLayer.name);
            }
          } else {
            window.console.log("⚠️ Folder empty: " + layer.name);
          }
        }
      }

      if (toMerge.length < 2) {
        alert("Need at least two layers to merge. Found: " + toMerge.length);
        window.console.log("❌ Not enough layers to merge. Aborting.");
        return;
      }
      window.console.log("✅ Total layers to merge: " + toMerge.length);

      // Step 4: Reorder all toMerge layers to top
      for (var i = toMerge.length - 1; i >= 0; i--) {
        toMerge[i].move(doc, ElementPlacement.PLACEATBEGINNING);
        window.console.log("📌 Moved to top: " + toMerge[i].name);
      }

      // Step 5: Merge them
      var merged = null;
      try {
        app.activeDocument.activeLayer = toMerge[0];
        merged = toMerge[0];
        for (var i = 1; i < toMerge.length; i++) {
          app.activeDocument.activeLayer = toMerge[i];
          merged = toMerge[i].merge();
        }
        merged.name = "_a_Merged_Frame_1";
        window.console.log("✅ Layers merged successfully: " + merged.name);
      } catch (e) {
        window.console.log("❌ Failed during merge: " + e);
        return;
      }

      // Step 6: Move merged result into anim_e
      try {
        merged.move(animEFolder, ElementPlacement.INSIDE);
        window.console.log("✅ Merged layer moved inside 'anim_e'");
      } catch (e) {
        window.console.log("❌ Failed to move merged layer into 'anim_e': " + e);
      }

      alert("✅ Merged first layers from all anim_* folders into 'anim_e'. Check console for details.");
    })();
  `;

  window.parent.postMessage(script, "*");
}
