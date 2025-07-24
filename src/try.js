function mergeFirstTwoUnlockedLayers() {
  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc || doc.layers.length < 2) {
        alert("❌ Need at least two layers.");
        return;
      }

      // Step 1: Find 2 unlocked, visible, non-folder layers
      var layersToMerge = [];
      for (var i = 0; i < doc.layers.length; i++) {
        var layer = doc.layers[i];
        if (!layer.locked && layer.visible && layer.typename !== "LayerSet") {
          layersToMerge.push(layer);
          if (layersToMerge.length === 2) break;
        }
      }

      if (layersToMerge.length < 2) {
        alert("❌ Couldn't find two unlocked, visible layers.");
        return;
      }

      // Step 2: Select those two layers by ID using ActionDescriptor
      var selDesc = new ActionDescriptor();
      var selList = new ActionList();

      for (var j = 0; j < layersToMerge.length; j++) {
        var ref = new ActionReference();
        ref.putIdentifier(charIDToTypeID("Lyr "), layersToMerge[j].id);
        selList.putReference(ref);
      }

      selDesc.putList(charIDToTypeID("null"), selList);
      selDesc.putBoolean(charIDToTypeID("MkVs"), false);
      executeAction(charIDToTypeID("slct"), selDesc, DialogModes.NO);

      // Step 3: Merge them
      executeAction(charIDToTypeID("Mrg2"), undefined, DialogModes.NO);
      var merged = doc.activeLayer;
      merged.name = "_a_MergedLayer";

      alert("✅ Merged into: " + merged.name);
    })();
  `;

  window.parent.postMessage(script, "*");
}
