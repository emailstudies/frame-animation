function toggleOnionSkinMode() {
  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) return;

      var selectedLayers = [];

      // Step 1: Gather selected layers inside anim_ folders
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

          // Restore opacities
          if (entry.affected) {
            for (var x = 0; x < entry.affected.length; x++) {
              try {
                var rec = entry.affected[x];
                if (rec.layer) rec.layer.opacity = rec.originalOpacity;
              } catch (e) {}
            }
          }

          // Restore visibility
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

      // Step 3: Apply onion skin effect and create new log
      var newLog = [];

      // Get list of selected parent groups
      var selectedParents = [];
      for (var p = 0; p < selectedLayers.length; p++) {
        selectedParents.push(selectedLayers[p].parent);
      }

      for (var i = 0; i < doc.layers.length; i++) {
        var group = doc.layers[i];
        if (group.typename !== "LayerSet") continue;

        var isSelectedGroup = false;
        for (var s = 0; s < selectedParents.length; s++) {
          if (selectedParents[s] === group) {
            isSelectedGroup = true;
            break;
          }
        }

        // Case A: This group has selected layers
        if (isSelectedGroup) {
          var groupLog = { parentName: group.name, affected: [] };

          // Find selected layers within this group
          var groupSelections = [];
          for (var a = 0; a < selectedLayers.length; a++) {
            if (selectedLayers[a].parent === group) {
              groupSelections.push(selectedLayers[a].layer);
            }
          }

          for (var j = 0; j < group.layers.length; j++) {
            var layer = group.layers[j];
            if (layer.typename === "LayerSet") continue;

            var isSelected = false;
            for (var k = 0; k < groupSelections.length; k++) {
              if (groupSelections[k] === layer) {
                isSelected = true;
                break;
              }
            }

            var isSibling = false;
            for (var k = 0; k < groupSelections.length; k++) {
              var selLayer = groupSelections[k];
              var selIndex = -1;
              for (var z = 0; z < group.layers.length; z++) {
                if (group.layers[z] === selLayer) {
                  selIndex = z;
                  break;
                }
              }
              if (group.layers[selIndex - 1] === layer || group.layers[selIndex + 1] === layer) {
                isSibling = true;
                break;
              }
            }

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

        // Case B: Other groups get hidden
        else if (group.name.indexOf("anim_") === 0) {
          newLog.push({
            hiddenGroups: [{ group: group, wasVisible: group.visible }]
          });
          group.visible = false;
        }
      }

      window.onionSkinLog = newLog;
      // 🐞 DEBUG: Print the onion skin log to console
      console.log("🧅 Updated Onion Skin Log:", window.onionSkinLog);
    })();
  `;

  window.parent.postMessage(script, "*");
}
