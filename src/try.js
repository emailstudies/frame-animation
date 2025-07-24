function exportGif() {
  const script = `
    (function () {
      try {
        var doc = app.activeDocument;
        if (!doc || doc.layers.length < 2) {
          alert("❌ Need at least two layers.");
          return;
        }

        var layersToMerge = [];

        for (var i = 0; i < doc.layers.length; i++) {
          var layer = doc.layers[i];
          if (
            !layer.locked &&
            layer.visible &&
            layer.typename !== "LayerSet"
          ) {
            layersToMerge.push(layer);
            if (layersToMerge.length === 2) break;
          }
        }

        if (layersToMerge.length < 2) {
          alert("❌ Could not find two unlocked, visible layers to merge.");
          return;
        }

        console.log("🧪 Found layers to merge:", layersToMerge[0].name, layersToMerge[1].name);

        // Select using putIndex (safer than putIdentifier for this case)
        var selDesc = new ActionDescriptor();
        var selList = new ActionList();

        for (var j = 0; j < layersToMerge.length; j++) {
          var ref = new ActionReference();
          ref.putIndex(charIDToTypeID("Lyr "), layersToMerge[j].itemIndex);
          selList.putReference(ref);
        }

        selDesc.putList(charIDToTypeID("null"), selList);
        selDesc.putBoolean(charIDToTypeID("MkVs"), false);
        executeAction(charIDToTypeID("slct"), selDesc, DialogModes.NO);

        // Merge selected layers
        executeAction(charIDToTypeID("Mrg2"), undefined, DialogModes.NO);

        // Rename the merged result
        if (doc.activeLayer) {
          doc.activeLayer.name = "_a_MergedLayer";
        }

        alert("✅ Merged: " + doc.activeLayer.name);
      } catch (e) {
        alert("❌ Error: " + e);
        console.log(e);
      }
    })();
  `;
  window.parent.postMessage(script, "*");
}
