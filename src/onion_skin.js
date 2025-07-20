// onion_skin.js

// Store global mode and log
window.onionSkinMode = false;
window.onionSkinLog = null;

// Toggle Onion Skin Live Mode
function toggleOnionSkinMode() {
  window.onionSkinMode = !window.onionSkinMode;
  alert("Onion Skin Mode " + (window.onionSkinMode ? "Enabled" : "Disabled"));

  if (!window.onionSkinMode && window.onionSkinLog) {
    applyResetFromLog(window.onionSkinLog);
    window.onionSkinLog = null;
  }
}

// Called when a new layer is selected manually by user
function handleLiveOnionSkin() {
  if (!window.onionSkinMode) return;

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

      // Reset previous if exists
      if (window.onionSkinLog && window.onionSkinLog.affected) {
        var prevGroup = doc.layers.find(g => g.name === window.onionSkinLog.parentGroup);
        if (prevGroup && prevGroup.typename === "LayerSet") {
          var prevLayers = prevGroup.layers;
          for (var j = 0; j < prevLayers.length; j++) {
            for (var k = 0; k < window.onionSkinLog.affected.length; k++) {
              if (prevLayers[j].name === window.onionSkinLog.affected[k].name) {
                prevLayers[j].opacity = window.onionSkinLog.affected[k].opacity;
              }
            }
          }
        }
      }

      // Apply new onion skin
      var affected = [];
      if (idx > 0 && siblings[idx - 1].typename !== "LayerSet") {
        affected.push({ name: siblings[idx - 1].name, opacity: siblings[idx - 1].opacity });
        siblings[idx - 1].opacity = 40;
      }
      if (idx < siblings.length - 1 && siblings[idx + 1].typename !== "LayerSet") {
        affected.push({ name: siblings[idx + 1].name, opacity: siblings[idx + 1].opacity });
        siblings[idx + 1].opacity = 40;
      }

      window.onionSkinLog = {
        selectedLayer: sel.name,
        parentGroup: parent.name,
        affected: affected
      };
    })();
  `;
  window.parent.postMessage(script, "*");
}

// Resets the logged layers to original opacity
function applyResetFromLog(log) {
  const script = `
    (function () {
      var doc = app.activeDocument;
      var group = doc.layers.find(g => g.name === "${log.parentGroup}");
      if (!group || group.typename !== "LayerSet") return;

      var layers = group.layers;
      for (var i = 0; i < layers.length; i++) {
        for (var j = 0; j < ${JSON.stringify(log.affected)}.length; j++) {
          if (layers[i].name === ${JSON.stringify(log.affected)}[j].name) {
            layers[i].opacity = ${JSON.stringify(log.affected)}[j].opacity;
          }
        }
      }
    })();
  `;
  window.parent.postMessage(script, "*");
}

// Expose to app.js
window.toggleOnionSkinMode = toggleOnionSkinMode;
window.handleLiveOnionSkin = handleLiveOnionSkin;
