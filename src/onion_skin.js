function toggleOnionSkinMode() {
  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) return;

      // 🧅 Step 1: Gather selected layers inside anim_ folders
      var selectedLayers = [];
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

      // 🧼 Step 2: Reset old onion skin if exists
      if (window.onionSkinLog && Array.isArray(window.onionSkinLog)) {
        for (var a = 0; a < window.onionSkinLog.length; a++) {
          var entry = window.onionSkinLog[a];
          for (var b = 0; b < entry.affected.length; b++) {
            var rec = entry.affected[b];
            try {
              if (rec.layer) rec.layer.opacity = rec.originalOpacity;
            } catch (e) {}
          }
        }
      }

      var newLog = [];

      // 🔁 Step 3: Apply onion skin and collect log
      for (var s = 0; s < doc.layers.length; s++) {
        var group = doc.layers[s];
        if (group.typename === "LayerSet" && group.name.startsWith("anim_")) {

          var selectedInGroup = [];
          for (var x = 0; x < selectedLayers.length; x++) {
            if (selectedLayers[x].parent === group) {
              selectedInGroup.push(selectedLayers[x]);
            }
          }

          var groupLog = {
            parentName: group.name,
            affected: []
          };

          var siblings = group.layers;

          for (var k = 0; k < siblings.length; k++) {
            var layer = siblings[k];
            var isSibling = false;

            for (var si = 0; si < selectedInGroup.length; si++) {
              var selected = selectedInGroup[si].layer;
              if (layer === selected) {
                isSibling = true;

                // 👈 Previous sibling
                if (k > 0 && siblings[k - 1].typename !== "LayerSet") {
                  groupLog.affected.push({
                    layer: siblings[k - 1],
                    originalOpacity: siblings[k - 1].opacity
                  });
                  siblings[k - 1].opacity = 40;
                }

                // 👉 Next sibling
                if (k < siblings.length - 1 && siblings[k + 1].typename !== "LayerSet") {
                  groupLog.affected.push({
                    layer: siblings[k + 1],
                    originalOpacity: siblings[k + 1].opacity
                  });
                  siblings[k + 1].opacity = 40;
                }
              }
            }

            // 🔅 Make all non-selected/non-sibling layers invisible (opacity 0)
            if (!isSibling && layer.typename !== "LayerSet") {
              groupLog.affected.push({
                layer: layer,
                originalOpacity: layer.opacity
              });
              layer.opacity = 0;
            }
          }

          if (groupLog.affected.length > 0) {
            newLog.push(groupLog);
          }
        }
      }

      // 📝 Store log globally
      window.onionSkinLog = newLog;

      // 🐞 DEBUG: Print the onion skin log to console
      console.log("🧅 Updated Onion Skin Log:", window.onionSkinLog);

    })();
  `;

  window.parent.postMessage(script, "*");
}
