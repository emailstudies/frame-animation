function toggleOnionSkinMode() {
  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) return;

      var selectedLayers = [];

      // 🧅 Step 1: Gather selected layers inside anim_ folders
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

      // 🧼 Step 2: Reset previous onion skin if log exists
      if (window.onionSkinLog && Array.isArray(window.onionSkinLog)) {
        for (var i = 0; i < window.onionSkinLog.length; i++) {
          var entry = window.onionSkinLog[i];
          if (entry.affected) {
            for (var j = 0; j < entry.affected.length; j++) {
              try {
                var rec = entry.affected[j];
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

      // 🆕 Step 3: Apply onion skin and create new log
      var newLog = [];
      var selectedParents = selectedLayers.map(function(l) { return l.parent; });
      var selectedNames = selectedParents.map(function(p) { return p.name; });

      for (var i = 0; i < doc.layers.length; i++) {
        var group = doc.layers[i];
        if (group.typename !== "LayerSet") continue;

        // Case A: This group has selected layers
        if (selectedNames.indexOf(group.name) !== -1) {
          var groupLog = { parentName: group.name, affected: [] };
          var groupSels = selectedLayers.filter(function(sl) { return sl.parent === group; });

          for (var j = 0; j < group.layers.length; j++) {
            var layer = group.layers[j];
            if (layer.typename === "LayerSet") continue;

            var isSelected = false;
            for (var k = 0; k < groupSels.length; k++) {
              if (groupSels[k].layer === layer) {
                isSelected = true;
                break;
              }
            }

            var isSibling = false;
            for (var k = 0; k < groupSels.length; k++) {
              var selIndex = group.layers.indexOf(groupSels[k].layer);
              if (selIndex === j - 1 || selIndex === j + 1) {
                isSibling = true;
                break;
              }
            }

            groupLog.affected.push({ layer: layer, originalOpacity: layer.opacity });

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
          newLog.push({ hiddenGroups: [{ group: group, wasVisible: group.visible }] });
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
