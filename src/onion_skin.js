function toggleOnionSkinMode() {
  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) return;

      var selectedLayers = [];

      // Step 1: Collect selected layers inside anim_* folders
      for (var i = 0; i < doc.layers.length; i++) {
        var top = doc.layers[i];
        if (top.typename === "LayerSet" && top.name.startsWith("anim_")) {
          for (var j = 0; j < top.layers.length; j++) {
            var layer = top.layers[j];
            if (layer.selected && layer.typename !== "LayerSet") {
              selectedLayers.push({ layer: layer, parent: top });
            }
          }
        }
      }

      if (selectedLayers.length === 0) return;

      // Step 2: Reset previously affected layers
      if (window.onionSkinLog && Array.isArray(window.onionSkinLog)) {
        for (var a = 0; a < window.onionSkinLog.length; a++) {
          var entry = window.onionSkinLog[a];
          for (var b = 0; b < entry.affected.length; b++) {
            try {
              var rec = entry.affected[b];
              if (rec.layer) rec.layer.opacity = rec.originalOpacity;
            } catch (e) {}
          }
        }
      }

      // Step 3: Apply new onion skin and store log
      var newLog = [];

      for (var k = 0; k < selectedLayers.length; k++) {
        var sel = selectedLayers[k].layer;
        var parent = selectedLayers[k].parent;
        var siblings = parent.layers;

        var idx = -1;
        for (var m = 0; m < siblings.length; m++) {
          if (siblings[m] == sel) {
            idx = m;
            break;
          }
        }

        if (idx === -1) continue;

        var entryLog = {
          selectedLayer: sel.name,
          parentName: parent.name,
          affected: []
        };

        for (var n = 0; n < siblings.length; n++) {
          var sib = siblings[n];

          // Skip the selected layer itself
          if (sib == sel || sib.typename === "LayerSet") continue;

          var originalOpacity = sib.opacity;

          if (n === idx - 1 || n === idx + 1) {
            // Immediate prev or next
            sib.opacity = 40;
            entryLog.affected.push({ layer: sib, originalOpacity: originalOpacity });
          } else {
            // All other siblings get fully dimmed
            sib.opacity = 0;
            entryLog.affected.push({ layer: sib, originalOpacity: originalOpacity });
          }
        }

        newLog.push(entryLog);
      }

      // Store updated log
      window.onionSkinLog = newLog;

      // 🐞 DEBUG: Print the onion skin log to console
      console.log("🧅 Updated Onion Skin Log:", window.onionSkinLog);
    })();
  `;

  window.parent.postMessage(script, "*");
}
