let onionSkinEnabled = false;
let lastActiveLayerName = null;
let onionLog = null; // Keeps track of affected layers

function toggleOnionSkinMode() {
  onionSkinEnabled = !onionSkinEnabled;
  const btn = document.getElementById("onionSkinBtn");
  btn.textContent = onionSkinEnabled ? "Disable Onion Skin" : "Enable Onion Skin";

  if (onionSkinEnabled) {
    window.addEventListener("message", handleOnionSkinSelection);
  } else {
    window.removeEventListener("message", handleOnionSkinSelection);
    resetLoggedOpacities();
    onionLog = null;
  }
}

function handleOnionSkinSelection(e) {
  if (!onionSkinEnabled || typeof e.data !== "string") return;
  if (!e.data.includes("activeLayer")) return;

  const layerMatch = e.data.match(/activeLayer.+name\s*=\s*"([^"]+)"/);
  const layerName = layerMatch ? layerMatch[1] : null;
  if (layerName === lastActiveLayerName) return;
  lastActiveLayerName = layerName;

  const script = `
    var doc = app.activeDocument;
    var sel = doc.activeLayer;

    var onionAffected = [];

    if (sel && sel.typename !== "LayerSet") {
      var parent = sel.parent;
      if (parent && parent.typename === "LayerSet") {
        var siblings = parent.layers;
        var idx = siblings.indexOf(sel);

        // Restore last affected layers
        if (${onionLog ? "true" : "false"}) {
          try {
            var prevLog = ${JSON.stringify(onionLog)};
            for (var i = 0; i < prevLog.affectedLayers.length; i++) {
              var name = prevLog.affectedLayers[i].name;
              var opacity = prevLog.affectedLayers[i].originalOpacity;
              var layer = parent.layers.find(l => l.name === name);
              if (layer && layer.typename !== "LayerSet") layer.opacity = opacity;
            }
          } catch (e) {}
        }

        // Apply onion skin to previous layer
        if (idx > 0) {
          var prev = siblings[idx - 1];
          if (prev.typename !== "LayerSet") {
            onionAffected.push({ name: prev.name, originalOpacity: prev.opacity });
            prev.opacity = 40;
          }
        }

        // Apply onion skin to next layer
        if (idx < siblings.length - 1) {
          var next = siblings[idx + 1];
          if (next.typename !== "LayerSet") {
            onionAffected.push({ name: next.name, originalOpacity: next.opacity });
            next.opacity = 40;
          }
        }

        // Return onion log
        onionAffected;
      }
    }
  `;

  window.parent.postMessage({ type: "onion-skin-update", script }, "*");
}

// Custom listener to capture onionLog from Photopea
window.addEventListener("message", function (e) {
  if (typeof e.data === "object" && e.data.type === "onion-skin-update-result") {
    onionLog = e.data.log;
  }
});

function resetLoggedOpacities() {
  if (!onionLog) return;

  const script = `
    var doc = app.activeDocument;
    try {
      var folder = doc.layers.find(g => g.name === "${onionLog.parentFolderName}");
      if (folder && folder.typename === "LayerSet") {
        var log = ${JSON.stringify(onionLog)};
        for (var i = 0; i < log.affectedLayers.length; i++) {
          var name = log.affectedLayers[i].name;
          var original = log.affectedLayers[i].originalOpacity;
          var layer = folder.layers.find(l => l.name === name);
          if (layer && layer.typename !== "LayerSet") {
            layer.opacity = original;
          }
        }
      }
    } catch (e) {}
  `;
  window.parent.postMessage(script, "*");
}
