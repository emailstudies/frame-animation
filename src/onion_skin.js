function toggleOnionSkinMode() {
  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) return;

      var selectedLayers = [];

      // Step 1: Collect selected layers inside anim_* folders
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

      if (selectedLayers.length === 0) return;

      // Step 2: Reset previous onion skin state
      if (window.onionSkinLog && Array.isArray(window.onionSkinLog)) {
        for (var r = 0; r < window.onionSkinLog.length; r++) {
          var entry = window.onionSkinLog[r];

          if (entry.affected) {
            for (var x = 0; x < entry.affected.length; x++) {
              try {
                var rec = entry.affected[x];
                if (rec.layer) rec.layer.opacity = rec.originalOpacity;
              } catch (e) {}
            }
          }

          if (entry.hiddenGroups) {
            for (var g = 0; g < entry.hiddenGroups.length; g++) {
              try {
                var gEntry = entry.hiddenGroups[g];
                if (gEntry.group) gEntry.group.visible = gEntry.wasVisible;
              } catch (e) {}
            }
          }
        }
      }

      // Step 3: Apply onion skin effect and log it
      var newLog = [];

      for (var i = 0; i < doc.layers.length; i++) {
        var group = doc.layers[i];
        if (group.typename !== "LayerSet") continue;

        var isRelevantGroup = false;
        for (var a = 0; a < selectedLayers.length; a++) {
          if (selectedLayers[a].parent === group) {
            isRelevantGroup = true;
            break;
          }
        }

        // Case A: A group with selected layers
        if (isRelevantGroup) {
          var groupLog = { parentName: group.name, affected: [] };

          for (var j = 0; j < group.layers.length; j++) {
            var layer = group.layers[j];
            if (layer.typename === "LayerSet") continue;

            var isSelected = false;
            var isSibling = false;

            // Check if this layer is selected
            for (var k = 0; k < selectedLayers.length; k++) {
              if (selectedLayers[k].layer === layer) {
                isSelected = true;
                break;
              }
            }

            // Check if this layer is a sibling of any selected layer
            for (var k = 0; k < selectedLayers.length; k++) {
              if (selectedLayers[k].parent !== group) continue;

              var siblings = group.layers;
              for (var s = 0; s < siblings.length; s++) {
                if (siblings[s] === selectedLayers[k].layer) {
                  if (siblings[s - 1] === layer || siblings[s + 1] === layer) {
                    isSibling = true;
                    break;
                  }
                }
              }
            }

            // Store original opacity for reset
            groupLog.affected.push({
              layer: layer,
              originalOpacity: layer.opacity
            });

            if (isSelected) {
              layer.opacity = 100;
            } else if (isSibling) {
              layer.opacity = 40;
            } else {
              layer.opacity = 0;
            }
          }

          newLog.push(groupLog);
        }

        // Case B: Irrelevant anim_* folders are hidden
        else if (group.name.indexOf("anim_") === 0) {
          newLog.push({
            hiddenGroups: [{ group: group, wasVisible: group.visible }]
          });
          group.visible = false;
        }
      }

      window.onionSkinLog = newLog;
      // 🐞 DEBUG
      console.log("🧅 Updated Onion Skin Log:", window.onionSkinLog);
    })();
  `;

  window.parent.postMessage(script, "*");
}
