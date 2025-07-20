function toggleOnionSkin() {
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

        // Previous layer
        if (idx > 0 && siblings[idx - 1].typename !== "LayerSet") {
          entryLog.affected.push({
            layer: siblings[idx - 1],
            originalOpacity: siblings[idx - 1].opacity
          });
          siblings[idx - 1].opacity = 40;
        }

        // Next layer
        if (idx < siblings.length - 1 && siblings[idx + 1].typename !== "LayerSet") {
          entryLog.affected.push({
            layer: siblings[idx + 1],
            originalOpacity: siblings[idx + 1].opacity
          });
          siblings[idx + 1].opacity = 40;
        }

        newLog.push(entryLog);
      }

      window.onionSkinLog = newLog;
    })();
  `;

  window.parent.postMessage(script, "*");
}
