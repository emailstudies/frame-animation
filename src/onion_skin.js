let onionSkinLog = null;

function toggleOnionSkinMode() {
  const script = `
    (function () {
      var doc = app.activeDocument;
      var sel = doc.activeLayer;

      if (!sel || sel.typename === "LayerSet") return;

      var parent = sel.parent;
      if (!parent || parent.typename !== "LayerSet") return;

      var siblings = parent.layers;
      var idx = -1;

      for (var i = 0; i < siblings.length; i++) {
        if (siblings[i] == sel) {
          idx = i;
          break;
        }
      }

      if (idx === -1) return;

      // Step 1: Reset previously affected layers
      if (window.onionSkinLog) {
        var prev = window.onionSkinLog;
        for (var j = 0; j < prev.affected.length; j++) {
          var rec = prev.affected[j];
          try {
            if (rec.layer) rec.layer.opacity = rec.originalOpacity;
          } catch (e) {}
        }
      }

      // Step 2: Apply onion skin to new selection
      var newLog = {
        selectedName: sel.name,
        parentName: parent.name,
        affected: []
      };

      if (idx > 0 && siblings[idx - 1].typename !== "LayerSet") {
        newLog.affected.push({ layer: siblings[idx - 1], originalOpacity: siblings[idx - 1].opacity });
        siblings[idx - 1].opacity = 40;
      }

      if (idx < siblings.length - 1 && siblings[idx + 1].typename !== "LayerSet") {
        newLog.affected.push({ layer: siblings[idx + 1], originalOpacity: siblings[idx + 1].opacity });
        siblings[idx + 1].opacity = 40;
      }

      window.onionSkinLog = newLog;
    })();
  `;
  window.parent.postMessage(script, "*");
}
