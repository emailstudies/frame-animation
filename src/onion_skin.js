function toggleOnionSkinMode() {
  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) return;

      var selectedLayers = [];

      // Step 1: Collect selected layers inside anim_* folders
      for (var i = 0; i < doc.layers.length; i++) {
        var group = doc.layers[i];
        if (group && group.typename === "LayerSet" && group.name.indexOf("anim_") === 0) {
          for (var j = 0; j < group.layers.length; j++) {
            var layer = group.layers[j];
            if (layer && layer.selected && layer.typename !== "LayerSet") {
              selectedLayers.push({ layer: layer, parent: group });
            }
          }
        }
      }

      if (selectedLayers.length === 0) return;

      // Step 2: Reset previous onion skin
      if (window.onionSkinLog && Array.isArray(window.onionSkinLog)) {
        for (var a = 0; a < window.onionSkinLog.length; a++) {
          var entry = window.onionSkinLog[a];

          for (var b = 0; b < entry.affected.length; b++) {
            var rec = entry.affected[b];
            try {
              if (rec.layer && rec.type === "opacity") {
                rec.layer.opacity = rec.originalOpacity;
              } else if (rec.layer && rec.type === "visibility") {
                rec.layer.visible = rec.originalVisible;
              }
            } catch (e) {}
          }

          if (entry.hiddenGroups && Array.isArray(entry.hiddenGroups)) {
            for (var h = 0; h < entry.hiddenGroups.length; h++) {
              try {
                var g = entry.hiddenGroups[h];
                if (g) g.visible = true;
              } catch (e) {}
            }
          }
        }
      }

      // Step 3: Apply new onion skin
      var newLog = [];

      // Track which folders contain selected layers
      var selectedParents = [];
      var selectedParentNames = [];
      for (var i = 0; i < selectedLayers.length; i++) {
        var parent = selectedLayers[i].parent;
        var alreadyIncluded = false;
        for (var j = 0; j < selectedParentNames.length; j++) {
          if (selectedParentNames[j] === parent.name) {
            alreadyIncluded = true;
            break;
          }
        }
        if (!alreadyIncluded) {
          selectedParents.push(parent);
          selectedParentNames.push(parent.name);
        }
      }

      // STEP 3A: Handle folders with selected layers
      for (var i = 0; i < selectedParents.length; i++) {
        var group = selectedParents[i];
        var groupLayers = group.layers;
        var entryLog = {
          parentName: group.name,
          selectedLayers: [],
          affected: [],
          hiddenGroups: []
        };

        // Get indexes of selected layers in this group
        var selectedIndexes = [];
        for (var j = 0; j < groupLayers.length; j++) {
          for (var k = 0; k < selectedLayers.length; k++) {
            if (selectedLayers[k].parent === group && selectedLayers[k].layer === groupLayers[j]) {
              selectedIndexes.push(j);
              entryLog.selectedLayers.push(groupLayers[j].name);
            }
          }
        }

        for (var j = 0; j < groupLayers.length; j++) {
          var layer = groupLayers[j];
          if (!layer || layer.typename === "LayerSet" || layer.locked) continue;

          var newOpacity = 0;
          for (var si = 0; si < selectedIndexes.length; si++) {
            var selIdx = selectedIndexes[si];
            if (j === selIdx) {
              newOpacity = 100;
              break;
            } else if (j === selIdx - 1 || j === selIdx + 1) {
              newOpacity = 40;
            }
          }

          entryLog.affected.push({
            layer: layer,
            type: "opacity",
            originalOpacity: layer.opacity
          });
          layer.opacity = newOpacity;
        }

        newLog.push(entryLog);
      }

      // STEP 3B: Hide other folders
      for (var i = 0; i < doc.layers.length; i++) {
        var group = doc.layers[i];
        if (
          group &&
          group.typename === "LayerSet" &&
          group.name.indexOf("anim_") === 0
        ) {
          var isSelected = false;
          for (var s = 0; s < selectedParentNames.length; s++) {
            if (group.name === selectedParentNames[s]) {
              isSelected = true;
              break;
            }
          }

          if (!isSelected) {
            group.visible = false;
            newLog.push({
              parentName: null,
              selectedLayers: [],
              affected: [],
              hiddenGroups: [group]
            });
          }
        }
      }

      window.onionSkinLog = newLog;
      console.log("🧅 Onion Skin Log:", window.onionSkinLog);
    })();
  `;

  window.parent.postMessage(script, "*");
}
