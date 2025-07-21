function toggleOnionSkinMode() {
  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) return;

      var selectedLayers = [];

      // Step 1: Collect selected layers inside anim_* folders
      for (var i = 0; i < doc.layers.length; i++) {
        var top = doc.layers[i];
        if (top.typename === "LayerSet" && top.name.indexOf("anim_") === 0) {
          for (var j = 0; j < top.layers.length; j++) {
            var layer = top.layers[j];
            if (layer.selected && layer.typename !== "LayerSet") {
              selectedLayers.push({ layer: layer, parent: top });
            }
          }
        }
      }

      if (selectedLayers.length === 0) {
        console.log("🧅 Onion Skin aborted: No selected layers.");
        return;
      }

      // Step 2: Reset previously affected layers
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
          if (entry.hiddenGroups) {
            for (var h = 0; h < entry.hiddenGroups.length; h++) {
              try {
                entry.hiddenGroups[h].visible = true;
              } catch (e) {}
            }
          }
        }
      }

      // Step 3: Apply new onion skin
      var newLog = [];

      // Track which anim_* folders were affected
      var selectedParentNames = [];
      for (var i = 0; i < selectedLayers.length; i++) {
        var pName = selectedLayers[i].parent.name;
        var exists = false;
        for (var j = 0; j < selectedParentNames.length; j++) {
          if (selectedParentNames[j] === pName) {
            exists = true;
            break;
          }
        }
        if (!exists) selectedParentNames.push(pName);
      }

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

        for (var m = 0; m < siblings.length; m++) {
          var layer = siblings[m];
          if (layer.typename === "LayerSet" || layer.locked) continue;

          // Save original opacity
          entryLog.affected.push({
            layer: layer,
            type: "opacity",
            originalOpacity: layer.opacity
          });

          if (layer.name === sel.name) {
            layer.opacity = 100; // selected
          } else if (
            m === siblings.indexOf(sel) - 1 ||
            m === siblings.indexOf(sel) + 1
          ) {
            layer.opacity = 40; // siblings
          } else {
            layer.opacity = 0; // non-siblings
          }
        }

        newLog.push(entryLog);
      }

      // Step 4: Hide unrelated anim_* folders
      for (var i = 0; i < doc.layers.length; i++) {
        var group = doc.layers[i];
        if (
          group.typename === "LayerSet" &&
          group.name.indexOf("anim_") === 0
        ) {
          var skip = false;
          for (var j = 0; j < selectedParentNames.length; j++) {
            if (group.name === selectedParentNames[j]) {
              skip = true;
              break;
            }
          }
          if (!skip) {
            var entry = {
              parentName: null,
              selectedLayers: [],
              affected: [],
              hiddenGroups: [group]
            };
            group.visible = false;
            newLog.push(entry);
          }
        }
      }

      window.onionSkinLog = newLog;
      console.log("🧅 Onion Skin Log:", window.onionSkinLog);
    })();
  `;

  window.parent.postMessage(script, "*");
}
