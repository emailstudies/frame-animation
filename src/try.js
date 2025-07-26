function exportGif() {
  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) {
        alert("No active document.");
        return;
      }

      // Step 0: Deselect all layers to avoid nesting
      try {
        var desc01 = new ActionDescriptor();
        var ref01 = new ActionReference();
        ref01.putEnumerated(charIDToTypeID('Lyr '), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
        desc01.putReference(charIDToTypeID('null'), ref01);
        executeAction(stringIDToTypeID('selectNoLayers'), desc01, DialogModes.NO);
        console.log("✅ Deselect all successful.");
      } catch (e) {
        console.log("⚠️ Deselect failed:", e);
      }

      console.log("📁 Document found: " + doc.name);

      // Step 1: Check for existing anim_e
      for (var i = 0; i < doc.layers.length; i++) {
        var layer = doc.layers[i];
        if (layer.typename === "LayerSet" && layer.name === "anim_e") {
          alert("❌ Folder 'anim_e' already exists. Please delete it before running this.");
          return;
        }
      }
      console.log("✅ No existing 'anim_e' folder found.");

      // Step 2: Create anim_e folder
      var groupDesc = new ActionDescriptor();
      var ref = new ActionReference();
      ref.putClass(stringIDToTypeID("layerSection"));
      groupDesc.putReference(charIDToTypeID("null"), ref);

      var props = new ActionDescriptor();
      props.putString(charIDToTypeID("Nm  "), "anim_e");
      groupDesc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("layerSection"), props);

      executeAction(charIDToTypeID("Mk  "), groupDesc, DialogModes.NO);

      // Step 3: Move anim_e to top
      var animFolder = doc.activeLayer;
      var topLayer = doc.layers[0];
      animFolder.move(topLayer, ElementPlacement.PLACEBEFORE);
      console.log("✅ 'anim_e' folder created and moved to top.");

      // Step 4: Find first visible layers in anim_* folders
      var duplicatedLayers = [];

      for (var i = 0; i < doc.layers.length; i++) {
        var group = doc.layers[i];
        if (group.typename === "LayerSet" && group.name.indexOf("anim_") === 0 && group.name !== "anim_e") {
          for (var j = 0; j < group.layers.length; j++) {
            var layer = group.layers[j];
            if (!layer.locked && layer.visible && layer.typename !== "LayerSet") {
              app.activeDocument.activeLayer = layer;
              var dup = layer.duplicate();
              dup.name = "_a_" + layer.name;
              duplicatedLayers.push(dup);
              console.log("✅ Duplicated from: " + group.name + " → " + layer.name);
              break;
            }
          }
        }
      }

      if (duplicatedLayers.length < 2) {
        alert("❌ Not enough layers to merge. Need at least 2.");
        return;
      }

      console.log("✅ Total layers to merge: " + duplicatedLayers.length);

      // Step 5: Move all to top before merge
      for (var i = duplicatedLayers.length - 1; i >= 0; i--) {
        duplicatedLayers[i].move(doc, ElementPlacement.PLACEATBEGINNING);
        console.log("📌 Moved to top: " + duplicatedLayers[i].name);
      }

      // Step 6: Merge topmost layer with layers below
      var mergedLayer = duplicatedLayers[0];
      for (var i = 1; i < duplicatedLayers.length; i++) {
        app.activeDocument.activeLayer = duplicatedLayers[i];
        mergedLayer = duplicatedLayers[i].merge();
      }
      mergedLayer.name = "_a_Merged_Frame_1";
      console.log("✅ Layers merged successfully: " + mergedLayer.name);

      // Step 7: Move merged into anim_e
      mergedLayer.move(animFolder, ElementPlacement.INSIDE);
      console.log("✅ Merged layer moved inside 'anim_e'");

      alert("✅ Merged first layers from all anim_* folders into 'anim_e'. Check console for details.");
    })();
  `;

  window.parent.postMessage(script, "*");
}
