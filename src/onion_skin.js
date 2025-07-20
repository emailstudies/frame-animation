// onion_skin.js
let onionSkinLog = [];

function toggleOnionSkinMode() {
  const script = `
    (function () {
      if (!window.onionSkinLog) window.onionSkinLog = [];

      var doc = app.activeDocument;
      var selLayers = [];
      for (var i = 0; i < doc.layers.length; i++) {
        var layer = doc.layers[i];
        if (layer.selected && layer.typename !== "LayerSet") {
          selLayers.push(layer);
        }
      }

      if (selLayers.length === 0) return;

      // Reset previous affected layers
      for (var i = 0; i < window.onionSkinLog.length; i++) {
        var entry = window.onionSkinLog[i];
        for (var j = 0; j < entry.affected.length; j++) {
          try {
            var rec = entry.affected[j];
            if (rec.layer) rec.layer.opacity = rec.originalOpacity;
          } catch (e) {}
        }
      }
      window.onionSkinLog = []; // Clear previous log

      // Apply new onion skin
      for (var s = 0; s < selLayers.length; s++) {
        var sel = selLayers[s];
        var parent = sel.parent;
        if (!parent || parent.typename !== "LayerSet") continue;

        var siblings = parent.layers;
        var idx = -1;

        for (var i = 0; i < siblings.length; i++) {
          if (siblings[i] == sel) {
            idx = i;
            break;
          }
        }

        if (idx === -1) continue;

        var logEntry = {
          selectedLayer: sel.name,
          parentName: parent.name,
          affected: []
        };

        if (idx > 0 && siblings[idx - 1].typename !== "LayerSet") {
          logEntry.affected.push({
            layer: siblings[idx - 1],
            originalOpacity: siblings[idx - 1].opacity
          });
          siblings[idx - 1].opacity = 40;
        }

        if (idx < siblings.length - 1 && siblings[idx + 1].typename !== "LayerSet") {
          logEntry.affected.push({
            layer: siblings[idx + 1],
            originalOpacity: siblings[idx + 1].opacity
          });
          siblings[idx + 1].opacity = 40;
        }

        window.onionSkinLog.push(logEntry);
      }
    })();
  `;

  window.parent.postMessage(script, "*");
}

window.handleOnionSkinClick = handleOnionSkinClick; // Expose to app.js
