function toggleOnionSkinMode() {
  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) return;

      var selectedLayers = [];

      // Step 1: Find selected layers inside anim_* folders
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

          // Reset affected layers
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

          // Reset hidden anim folders
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

      // Step 3: Apply onion skin and update log
      var newLog = [];

      for (var k = 0; k < selectedLayers.length; k++) {
        var sel = selectedLayers[k].layer;
        var parent = selectedLayers[k].parent;
        var siblings = parent.layers;

        var entryLog = {
          selectedLayer: sel.name,
          parentName: parent.name,
          affected: [],
          hiddenGroups: []
        };

        // Apply to siblings only, skip nested groups
        for (var s = 0; s < siblings.length; s++) {
          var sib = siblings[s];
          if (!sib || sib.typename === "LayerSet") continue;

          if (sib === sel) {
            entryLog.affected.push({
              layer: sib,
              type: "opacity",
              originalOpacity: sib.opacity
            });
            sib.opacity = 100;
          } else {
            entryLog.affected.push({
              layer: sib,
              type: "opacity",
              originalOpacity: sib.opacity
            });
            sib.opacity = 40;
          }
        }

        // Hide unrelated anim_* folders
        for (var g = 0; g < doc.layers.length; g++) {
          var animGroup = doc.layers[g];
          if (
            animGroup &&
            animGroup.typename === "LayerSet" &&
            animGroup.name.indexOf("anim_") === 0 &&
            animGroup !== parent &&
            animGroup.visible
          ) {
            entryLog.hiddenGroups.push(animGroup);
            animGroup.visible = false;
          }
        }

        newLog.push(entryLog);
      }

      // Save new log globally
      window.onionSkinLog = newLog;

      // 🧪 Debug Log
      console.log("\\ud83e\\udd45 Onion Skin Log Updated:", window.onionSkinLog);
    })();
  `;

  window.parent.postMessage(script, "*");
}
