// onion_skin.js

window.onionSkinMode = false;
window.onionSkinLog = null;
window.onionSkinInterval = null;

function toggleOnionSkinMode() {
  window.onionSkinMode = !window.onionSkinMode;

  if (window.onionSkinMode) {
    // Start watching for selection changes every 700ms
    window.onionSkinInterval = setInterval(watchSelectionChange, 700);
    console.log("Onion Skin Mode Enabled");
  } else {
    // Turn off and reset previous opacities
    clearInterval(window.onionSkinInterval);
    window.onionSkinInterval = null;
    resetPreviousOnionSkin();
    window.onionSkinLog = null;
    console.log("Onion Skin Mode Disabled");
  }
}

// Poll selection change
let lastSelectedLayer = null;

function watchSelectionChange() {
  const script = `
    (function () {
      var doc = app.activeDocument;
      var sel = doc.activeLayer;
      if (!sel || sel.typename === "LayerSet") return "";
      sel.name;
    })();
  `;
  window.addEventListener("message", (e) => {
    if (typeof e.data === "string") {
      const current = e.data;
      if (current !== lastSelectedLayer) {
        lastSelectedLayer = current;
        handleLiveOnionSkin(); // Update skinning
      }
    }
  }, { once: true });
  window.parent.postMessage(script, "*");
}

// Apply Onion Skin + Logging
function handleLiveOnionSkin() {
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
          idx = i; break;
        }
      }
      if (idx === -1) return;

      // Reset from previous log
      if (window.onionSkinLog && window.onionSkinLog.affected && window.onionSkinLog.parentGroup) {
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

// Reset opacities from log
function resetPreviousOnionSkin() {
  const log = window.onionSkinLog;
  if (!log) return;

  const script = `
    (function () {
      var doc = app.activeDocument;
      var group = doc.layers.find(g => g.name === ${JSON.stringify(log.parentGroup)});
      if (!group || group.typename !== "LayerSet") return;

      var layers = group.layers;
      var affected = ${JSON.stringify(log.affected)};
      for (var i = 0; i < layers.length; i++) {
        for (var j = 0; j < affected.length; j++) {
          if (layers[i].name === affected[j].name) {
            layers[i].opacity = affected[j].opacity;
          }
        }
      }
    })();
  `;
  window.parent.postMessage(script, "*");
}

// Expose to global
window.toggleOnionSkinMode = toggleOnionSkinMode;
window.handleLiveOnionSkin = handleLiveOnionSkin;
