let onionSkinEnabled = false;
let lastActiveLayerName = null;
let onionLog = null;

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

  const match = e.data.match(/activeLayer.+name\s*=\s*"([^"]+)"/);
  const selectedName = match ? match[1] : null;
  if (!selectedName || selectedName === lastActiveLayerName) return;
  lastActiveLayerName = selectedName;

  // Reset previous
  if (onionLog) resetLoggedOpacities();

  // Update log and apply new skin
  const script = `
    var doc = app.activeDocument;
    var sel = doc.activeLayer;

    if (sel && sel.typename !== "LayerSet") {
      var parent = sel.parent;
      if (parent && parent.typename === "LayerSet") {
        var siblings = parent.layers;
        var idx = siblings.indexOf(sel);

        // Apply onion skin and log affected
        for (var i = 0; i < siblings.length; i++) {
          if (i === idx - 1 || i === idx + 1) {
            var l = siblings[i];
            if (l && l.typename !== "LayerSet") {
              l.opacity = 40;
            }
          }
        }
      }
    }
  `;
  // Send script to apply onion skin
  window.parent.postMessage(script, "*");

  // Store log (just names — we assume default opacity is 100)
  onionLog = {
    parentFolderName: null, // we can’t dynamically detect this yet
    affectedLayers: [
      { name: `Layer ${parseInt(selectedName.split(" ")[1]) - 1}`, originalOpacity: 100 },
      { name: `Layer ${parseInt(selectedName.split(" ")[1]) + 1}`, originalOpacity: 100 }
    ]
  };
}

function resetLoggedOpacities() {
  if (!onionLog) return;

  const resetScript = `
    var doc = app.activeDocument;
    for (var i = 0; i < doc.layers.length; i++) {
      var folder = doc.layers[i];
      if (folder.name && folder.name.startsWith("anim_") && folder.typename === "LayerSet") {
        for (var j = 0; j < folder.layers.length; j++) {
          var layer = folder.layers[j];
          if (layer.typename !== "LayerSet") {
            var ln = layer.name;
            ${onionLog.affectedLayers.map(layer => `
              if (ln === "${layer.name}") {
                layer.opacity = ${layer.originalOpacity};
              }
            `).join("\n")}
          }
        }
      }
    }
  `;
  window.parent.postMessage(resetScript, "*");
}
