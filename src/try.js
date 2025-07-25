function exportGif() {
  const script = `
    (function () {
      var doc = app.activeDocument;

      for (var i = 0; i < doc.layers.length; i++) {
        var group = doc.layers[i];

        // Step 1: Check for folders starting with "anim_"
        if (group.typename !== "LayerSet" || !group.name.startsWith("anim_")) continue;

        // Step 2: Process layers inside the folder
        var layersToMerge = [];

        for (var j = 0; j < group.layers.length; j++) {
          var layer = group.layers[j];

          if (layer.typename === "ArtLayer" && !layer.locked) {
            layer.name = "_a_" + layer.name;
            layersToMerge.push(layer);
          }
        }

        // Step 3: Only merge if there are at least 2 layers
        if (layersToMerge.length >= 2) {
          // Sort top to bottom (Photopea order is topmost last)
          layersToMerge.reverse();

          // Move all layers to top of group
          group.layers = layersToMerge;

          // Merge top two layers
          var merged = layersToMerge[1].merge();
          merged.name = "_a_Merged";
        } else if (layersToMerge.length === 1) {
          layersToMerge[0].name = "_a_Merged";
        }
      }

      alert("✅ All anim_* folders processed and merged.");
    })();
  `;

  window.parent.postMessage(script, "*");
}
