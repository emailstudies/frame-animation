let onionSkinLog = null;
let onionSkinInterval = null;
let lastSelectedLayer = null;
let lastCheck = 0;

function toggleOnionSkinMode() {
  if (onionSkinInterval) {
    clearInterval(onionSkinInterval);
    onionSkinInterval = null;
    clearPreviousOnionSkin();
    onionSkinLog = null;
    console.log("🧅 Onion Skin Mode Disabled");
  } else {
    onionSkinInterval = setInterval(watchSelectionChange, 400); // Fast, but throttled
    console.log("🧅 Onion Skin Mode Enabled");
  }
}

function watchSelectionChange() {
  const now = Date.now();
  if (now - lastCheck < 200) return; // Debounce every 200ms
  lastCheck = now;

  const script = `
    (function () {
      var doc = app.activeDocument;
      var sel = doc.activeLayer;
      if (!sel || sel.typename === "LayerSet") return "";
      sel.name;
    })();
  `;
  window.addEventListener("message", function handler(e) {
    if (typeof e.data === "string") {
      window.removeEventListener("message", handler);
      const selected = e.data;
      if (selected !== lastSelectedLayer) {
        lastSelectedLayer = selected;
        handleLiveOnionSkin();
      }
    }
  });
  window.parent.postMessage(script, "*");
}

function handleLiveOnionSkin() {
  const script = `
    (function () {
      var doc = app.activeDocument;
      var sel = doc.activeLayer;
      if (!sel || sel.typename === "LayerSet") return;

      // 1. Reset previous siblings' opacities using onionSkinLog
      ${onionSkinLog ? `
      var prevGroup = null;
      for (var i = 0; i < doc.layerSets.length; i++) {
        if (doc.layerSets[i].name === ${JSON.stringify(onionSkinLog.parentGroup)}) {
          prevGroup = doc.layerSets[i];
          break;
        }
      }
      if (prevGroup) {
        var prevLayers = prevGroup.layers;
        var logged = ${JSON.stringify(onionSkinLog.affectedLayers)};
        for (var i = 0; i < prevLayers.length; i++) {
          for (var j = 0; j < logged.length; j++) {
            if (prevLayers[i].name === logged[j].name) {
              prevLayers[i].opacity = logged[j].opacity;
            }
          }
        }
      }
      ` : ''}

      // 2. Apply onion skin to siblings of newly selected layer
      var parent = sel.parent;
      if (!parent || parent.typename !== "LayerSet") return;

      var siblings = parent.layers;
      var centerIdx = -1;
      for (var i = 0; i < siblings.length; i++) {
        if (siblings[i] == sel) {
          centerIdx = i;
          break;
        }
      }
      if (centerIdx === -1) return;

      var affected = [];

      if (centerIdx > 0 && siblings[centerIdx - 1].typename !== "LayerSet") {
        affected.push({ name: siblings[centerIdx - 1].name, opacity: siblings[centerIdx - 1].opacity });
        siblings[centerIdx - 1].opacity = 40;
      }

      if (centerIdx < siblings.length - 1 && siblings[centerIdx + 1].typename !== "LayerSet") {
        affected.push({ name: siblings[centerIdx + 1].name, opacity: siblings[centerIdx + 1].opacity });
        siblings[centerIdx + 1].opacity = 40;
      }

      // Log new state
      window.parent.postMessage({
        type: "onionSkinLog",
        data: {
          selectedLayer: sel.name,
          parentGroup: parent.name,
          affectedLayers: affected
        }
      }, "*");
    })();
  `;
  window.parent.postMessage(script, "*");
}

function clearPreviousOnionSkin() {
  const script = `
    (function () {
      var doc = app.activeDocument;
      var group = null;
      for (var i = 0; i < doc.layerSets.length; i++) {
        if (doc.layerSets[i].name === ${JSON.stringify(onionSkinLog?.parentGroup)}) {
          group = doc.layerSets[i];
          break;
        }
      }
      if (!group) return;

      var logged = ${JSON.stringify(onionSkinLog?.affectedLayers || [])};
      var siblings = group.layers;
      for (var i = 0; i < siblings.length; i++) {
        for (var j = 0; j < logged.length; j++) {
          if (siblings[i].name === logged[j].name) {
            siblings[i].opacity = logged[j].opacity;
          }
        }
      }
    })();
  `;
  window.parent.postMessage(script, "*");
}

// Capture log message from Photopea script
window.addEventListener("message", (e) => {
  if (e.data?.type === "onionSkinLog") {
    onionSkinLog = e.data.data;
  }
});

// Expose to app.js
window.toggleOnionSkinMode = toggleOnionSkinMode;
