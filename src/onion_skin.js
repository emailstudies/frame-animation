let onionSkinEnabled = false;

function toggleOnionSkinMode() {
  const btn = document.getElementById("onionSkinBtn");
  onionSkinEnabled = !onionSkinEnabled;

  if (onionSkinEnabled) {
    btn.textContent = "Disable Onion Skin";
    window.addEventListener("message", handleOnionSkinSelection);
  } else {
    btn.textContent = "Enable Onion Skin";
    window.removeEventListener("message", handleOnionSkinSelection);
    resetAllOpacities();
  }
}

function handleOnionSkinSelection(e) {
  if (!onionSkinEnabled || typeof e.data !== "string") return;
  if (!e.data.includes("activeLayer")) return;

  const script = `
    var doc = app.activeDocument;
    var sel = doc.activeLayer;
    if (!sel || sel.typename === "LayerSet") return;

    var parent = sel.parent;
    if (!parent || parent.typename !== "LayerSet") return;

    var siblings = parent.layers;
    var idx = siblings.indexOf(sel);

    // Reset all layer opacities in this folder
    for (var i = 0; i < siblings.length; i++) {
      var layer = siblings[i];
      if (layer.typename !== "LayerSet") layer.opacity = 100;
    }

    // Onion skin: Previous and next
    if (idx > 0 && siblings[idx - 1].typename !== "LayerSet") {
      siblings[idx - 1].opacity = 40;
    }
    if (idx < siblings.length - 1 && siblings[idx + 1].typename !== "LayerSet") {
      siblings[idx + 1].opacity = 40;
    }
  `;
  window.parent.postMessage(script, "*");
}

function resetAllOpacities() {
  const script = `
    var doc = app.activeDocument;
    for (var i = 0; i < doc.layers.length; i++) {
      var group = doc.layers[i];
      if (group.name.startsWith("anim_") && group.typename === "LayerSet") {
        for (var j = 0; j < group.layers.length; j++) {
          var layer = group.layers[j];
          if (layer.typename !== "LayerSet" && layer.opacity !== 100) {
            layer.opacity = 100;
          }
        }
      }
    }
  `;
  window.parent.postMessage(script, "*");
}
