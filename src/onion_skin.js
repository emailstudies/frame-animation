function toggleOnionSkinMode() {
  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) {
        console.log("❌ No active document.");
        return;
      }

      var selectedLayers = [];

      // Step 1: Find selected layers inside anim_* folders
      for (var i = 0; i < doc.layers.length; i++) {
        var group = doc.layers[i];
        if (group.typename === "LayerSet" && group.name.indexOf("anim_") === 0) {
          for (var j = 0; j < group.layers.length; j++) {
            var layer = group.layers[j];
            if (layer.selected && layer.typename !== "LayerSet") {
              selectedLayers.push({ layer: layer, parent: group });
            }
          }
        }
      }

      if (selectedLayers.length === 0) {
        console.log("❌ No selected layers found inside anim_* folders.");
        return;
      }

      // Step 2: For each selected layer, apply onion skin logic
      for (var k = 0; k < selectedLayers.length; k++) {
        var selLayer = selectedLayers[k].layer;
        var parent = selectedLayers[k].parent;
        var siblings = parent.layers;

        for (var m = 0; m < siblings.length; m++) {
          var current = siblings[m];
          if (current.typename === "LayerSet" || current.locked) continue;

          if (current.name === selLayer.name) {
            current.opacity = 100; // Selected layer
          } else {
            // Check if it's a sibling (adjacent)
            var idxSel = -1;
            for (var s = 0; s < siblings.length; s++) {
              if (siblings[s].name === selLayer.name) {
                idxSel = s;
                break;
              }
            }

            if (m === idxSel - 1 || m === idxSel + 1) {
              current.opacity = 40; // Sibling
            } else {
              current.opacity = 0; // Non-sibling
            }
          }
        }
      }

      console.log("🧅 Onion Skin applied.");
    })();
  `;
  window.parent.postMessage(script, "*");
}
