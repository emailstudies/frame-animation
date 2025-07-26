function exportGif() {
  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) {
        alert("❌ No active document.");
        return;
      }

      // STEP 0: Check if anim_e already exists
      for (var i = 0; i < doc.layers.length; i++) {
        var layer = doc.layers[i];
        if (layer.name === "anim_e" && layer.typename === "LayerSet") {
          alert("❌ Folder 'anim_e' already exists. Please delete it before running this.");
          return;
        }
      }

      // STEP 1: Find all anim_* folders
      var animFolders = [];
      for (var i = 0; i < doc.layers.length; i++) {
        var layer = doc.layers[i];
        if (layer.typename === "LayerSet" && layer.name.indexOf("anim_") === 0) {
          animFolders.push(layer);
        }
      }

      if (animFolders.length === 0) {
        alert("❌ No anim_* folders found.");
        return;
      }

      // STEP 2: Create anim_e at root and move to top
      var animE = doc.layerSets.add();
      animE.name = "anim_e";

      var topLayer = doc.layers[0];
      animE.move(topLayer, ElementPlacement.PLACEBEFORE);

      // STEP 3: Duplicate first unlocked+visible layer from each anim folder into anim_e
      var duplicates = [];

      for (var i = 0; i < animFolders.length; i++) {
        var group = animFolders[i];
        var layerToDuplicate = null;

        for (var j = 0; j < group.layers.length; j++) {
          var candidate = group.layers[j];
          if (candidate.typename !== "LayerSet" && !candidate.locked && candidate.visible) {
            layerToDuplicate = candidate;
            break;
          }
        }

        if (layerToDuplicate) {
          doc.activeLayer = layerToDuplicate;
          var dup = layerToDuplicate.duplicate();
          dup.name = "_a_" + layerToDuplicate.name;
          dup.move(animE, ElementPlacement.INSIDE);
          duplicates.push(dup);
        }
      }

      if (duplicates.length < 2) {
        alert("❌ Need at least two eligible layers to merge.");
        return;
      }

      // STEP 4: Merge all duplicates in anim_e
      doc.activeLayer = duplicates[0];
      for (var i = 1; i < duplicates.length; i++) {
        doc.activeLayer = duplicates[i];
        executeAction(charIDToTypeID("Mrg2"), undefined, DialogModes.NO);
      }

      // STEP 5: Rename merged layer
      doc.activeLayer.name = "_a_merged_1";

      alert("✅ Merged first layers from anim_* folders into 'anim_e'.");
    })();
  `;

  window.parent.postMessage(script, "*");
}
