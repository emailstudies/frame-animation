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

      // Track which folders were selected
      var handledGroups = [];

      for (var x = 0; x < selectedLayers.length; x++) {
        var selLayer = selectedLayers[x].layer;
        var parent = selectedLayers[x].parent;

        if (handledGroups.indexOf(parent) !== -1) continue; // Skip if already handled
        handledGroups.push(parent);

        var siblings = parent.layers;

        var entryLog = {
          parentName: parent.name,
          selectedLayers: [],
          affected: [],
          hiddenGroups: []
        };

        // 1. Go layer by layer in the parent folder
        for (var s = 0; s < siblings.length; s++) {
          var layer = siblings[s];
          if (!layer || layer.typename === "LayerSet" || layer.locked) continue;

          let isSelected = false;
          let isSibling = false;

          for (var z = 0; z < selectedLayers.length; z++) {
            if (selectedLayers[z].layer === layer && selectedLayers[z].parent === parent) {
              isSelected = true;
              break;
            }
          }

          if (!isSelected) {
            // Now check if it's a sibling of any selected layer
            for (var q = 0; q < selectedLayers.length; q++) {
              if (selectedLayers[q].parent !== parent) continue;
              var indexSel = -1;
              for (var k = 0; k < siblings.length; k++) {
                if (siblings[k] === selectedLayers[q].layer) {
                  indexSel = k;
                  break;
                }
              }
              if (layer === siblings[indexSel - 1] || layer === siblings[indexSel + 1]) {
                isSibling = true;
                break;
              }
            }
          }

          entryLog.affected.push({
            layer: layer,
            type: "opacity",
            originalOpacity: layer.opacity
          });

          if (isSelected) {
            entryLog.selectedLayers.push(layer.name);
            layer.opacity = 100;
          } else if (isSibling) {
            layer.opacity = 40;
          } else {
            layer.opacity = 0;
          }
        }

        // 2. Hide all other anim_* folders not in handledGroups
        for (var g = 0; g < doc.layers.length; g++) {
          var group = doc.layers[g];
          if (
            group &&
            group.typename === "LayerSet" &&
            group.name.indexOf("anim_") === 0 &&
            handledGroups.indexOf(group) === -1 &&
            group.visible
          ) {
            entryLog.hiddenGroups.push(group);
            group.visible = false;
          }
        }

        newLog.push(entryLog);
      }

      window.onionSkinLog = newLog;
      console.log("\\ud83e\\udd45 Onion Skin Log Updated:", window.onionSkinLog);
    })();
  `;

  window.parent.postMessage(script, "*");
}
