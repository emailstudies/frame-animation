// onion_skin.js (Hybrid: Opacity + Visibility)
function toggleOnionSkinMode() {
  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) return;

      var selectedLayers = [];

      // 🧅 Step 1: Gather selected layers inside anim_ folders
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
      var selectedParents = selectedLayers.map(l => l.parent);
      var selectedNames = selectedParents.map(p => p.name);

      for (var i = 0; i < doc.layers.length; i++) {
        var group = doc.layers[i];
        if (group.typename !== "LayerSet") continue;

        // Case A: This group has selected layers
        if (selectedNames.includes(group.name)) {
          var groupLog = { parentName: group.name, affected: [] };
          var groupSels = selectedLayers.filter(sl => sl.parent === group);

          for (var j = 0; j < group.layers.length; j++) {
            var layer = group.layers[j];
            if (layer.typename === "LayerSet") continue;

            var isSelected = groupSels.some(sel => sel.layer === layer);
            var isSibling = groupSels.some(sel =>
              group.layers[j - 1] === sel.layer || group.layers[j + 1] === sel.layer
            );

            groupLog.affected.push({ layer: layer, originalOpacity: layer.opacity });

            if (isSelected) {
              layer.opacity = 100; // preserve selected layer
            } else if (
              groupSels.some(sel => group.layers.indexOf(sel.layer) === j - 1 || group.layers.indexOf(sel.layer) === j + 1)
            ) {
              layer.opacity = 40; // immediate siblings
            } else {
              layer.opacity = 0; // all others in this group
            }
          }
          newLog.push(groupLog);
        }

        // Case B: Other groups get hidden
        else if (group.name.startsWith("anim_")) {
          newLog.push({ hiddenGroups: [{ group: group, wasVisible: group.visible }] });
          group.visible = false;
        }
      }

      window.onionSkinLog = newLog;
      console.log("🧅 Updated Onion Skin Log:", window.onionSkinLog); // 🐞 DEBUG
    })();
  `;

  window.parent.postMessage(script, "*");
}
