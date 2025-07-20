function toggleOnionSkinMode() {
  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) return;

      var selectedLayers = [];

      // 🧅 Step 1: Collect selected layers and their parent anim_* folders
      for (var i = 0; i < doc.layers.length; i++) {
        var group = doc.layers[i];
        if (group.typename === "LayerSet" && group.name.startsWith("anim_")) {
          for (var j = 0; j < group.layers.length; j++) {
            var layer = group.layers[j];
            if (layer.selected && layer.typename !== "LayerSet") {
              selectedLayers.push({ layer: layer, parent: group });
            }
          }
        }
      }

      if (selectedLayers.length === 0) return;

      // 🧼 Step 2: Apply onion skin fresh
      for (var i = 0; i < doc.layers.length; i++) {
        var group = doc.layers[i];
        if (group.typename !== "LayerSet" || !group.name.startsWith("anim_")) continue;

        // Check if any layer is selected in this group
        var groupSelections = selectedLayers.filter(s => s.parent === group);

        if (groupSelections.length > 0) {
          group.visible = true; // ensure visible

          var groupLayers = group.layers;

          for (var j = 0; j < groupLayers.length; j++) {
            var current = groupLayers[j];
            if (current.typename === "LayerSet") continue;

            var isSelected = groupSelections.some(s => s.layer === current);
            var isSibling = groupSelections.some(s => {
              var idx = groupLayers.indexOf(s.layer);
              return groupLayers[idx - 1] === current || groupLayers[idx + 1] === current;
            });

            if (isSelected) {
              current.opacity = 100; // keep as-is
            } else if (isSibling) {
              current.opacity = 40; // onion skin
            } else {
              current.opacity = 0; // fade rest
            }
          }
        } else {
          group.visible = false; // hide unrelated folders
        }
      }

      // 🐞 DEBUG: Print selected layer names
      console.log("🧅 Onion Skin Applied for:", selectedLayers.map(s => s.layer.name));
    })();
  `;

  window.parent.postMessage(script, "*");
}
