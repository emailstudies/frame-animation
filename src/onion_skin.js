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
    onionSkinInterval = setInterval(watchSelectionChange, 50); // Fast polling, debounce handles extra calls
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
      return sel.name;
    })();
  `;
  window.addEventListener("message", function handler(e) {
    if (typeof e.data === "string") {
      window.removeEventListener("message", handler);
      const selected = e.data;
      if (selected && selected !== lastSelectedLayer) {
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
      if (!sel || sel.typename === "LayerSet") return "";

      // Step 1: Reset previous onion skin layers
      ${onionSkinLog ? `
      var prevGroup = null;
      for (var i = 0; i < doc.layerSets.length; i++) {
        if (doc.layerSets[i].name === ${JSON.stringify(onionSkinLog?.parentGroup)}) {
          prevGroup = doc.layerSets[i];
          break;
        }
      }
      if (prevGroup) {
        var prevLayers = prevGroup.layers;
        var prevLog = ${JSON.stringify(onionSkinLog?.affectedLayers || [])};
        for (var i = 0; i < prevLayers.length; i++) {
          for (var j = 0; j < prevLog.length; j++) {
            if (prevLayers[i].name === prevLog[j].name) {
              prevLayers[i].opacity = prevLog[j].opacity;
            }
          }
        }
      }
      ` : ""}

      // Step 2: Apply onion skin to current selection
      var parent = sel.parent;
      if (!parent || parent.typename !== "LayerSet") return "";

      var siblings = parent.layers;
      var idx = -1;
      for (var i = 0; i < siblings.length; i++) {
        if (siblings[i] === sel) {
          idx = i;
          break;
        }
      }
      if (idx === -1) return "";

      var affected = [];

      if (idx > 0 && siblings[idx - 1].typename !== "LayerSet") {
        affected.push({ name: siblings[idx - 1].name, opacity: siblings[idx - 1].opacity });
        siblings[idx - 1].opacity = 40;
      }

      if (idx < siblings.length - 1 && siblings[idx + 1].typename !== "LayerSet") {
        affected.push({ name: siblings[idx + 1].name, opacity: siblings[idx + 1].opacity });
        siblings[idx + 1].opacity = 40;
      }

      return JSON.stringify({
        selectedLayer: sel.name,
        parentGroup: parent.name,
        affectedLayers: affected
      });
    })();
  `;

  window.addEventListener("message", function handleReturn(e) {
    window.removeEventListener("message", handleReturn);
    try {
      const parsed = JSON.parse(e.data);
      if (parsed && parsed.selectedLayer && parsed.parentGroup) {
        onionSkinLog = parsed;
      }
    } catch (err) {
      // Not a JSON string or valid message
    }
  });

  window.parent.postMessage(script, "*");
}

function clearPreviousOnionSkin() {
  if (!onionSkinLog) return;
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

// 🔓 Expose to app.js
window.toggleOnionSkinMode = toggleOnionSkinMode;
