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

      if (selectedLayers.length === 0) return;

      // Step 2: Reset previously affected layers and groups
      if (window.onionSkinLog && Array.isArray(window.onionSkinLog)) {
        for (var a = 0; a < window.onionSkinLog.length; a++) {
          var entry = window.onionSkinLog[a];

          // Restore affected layers
          for (var b = 0; b < entry.affected.length; b++) {
            try {
              var rec = entry.affected[b];
              if (rec.layer) rec.layer.opacity = rec.originalOpacity;
              if (rec.type === "visibility" && rec.layer) rec.layer.visible = rec.originalVisible;
            } catch (e) {}
          }

          // Restore hidden folders
          if (entry.hiddenGroups && Array.isArray(entry.hiddenGroups)) {
            for (var h = 0; h < entry.hiddenGroups.length; h++) {
              try {
                var g = entry.hiddenGroups[h];
                g.visible = true;
              } catch (e) {}
            }
          }
        }
      }

      // Step 3: Apply new onion skin and store updated log
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

        // Lower opacity of siblings
        for (var m = 0; m < siblings.length; m++) {
          var sib = siblings[m];
          if (sib === sel || sib.typename === "LayerSet") continue;

          entryLog.affected.push({
            layer: sib,
            type: "opacity",
            originalOpacity: sib.opacity
          });
          sib.opacity = 40;
        }

        // Keep selected at full opacity
        entryLog.affected.push({
          layer: sel,
          type: "opacity",
          originalOpacity: sel.opacity
        });
        sel.opacity = 100;

        // Step 4: Hide all non-parent anim_* folders
        for (var g = 0; g < doc.layers.length; g++) {
          var group = doc.layers[g];
          if (
            group.typename === "LayerSet" &&
            group.name.indexOf("anim_") === 0 &&
            group !== parent &&
            group.visible
          ) {
            entryLog.hiddenGroups.push(group);
            group.visible = false;
          }
        }

        newLog.push(entryLog);
      }

      // Save new log for future resets
      window.onionSkinLog = newLog;

      // 🐞 DEBUG: Print log
      console.log("\\ud83e\\udd45 Updated Onion Skin Log:", window.onionSkinLog);
    })();
  `;

  window.parent.postMessage(script, "*");
}
