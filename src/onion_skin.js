// onion_skin.js

let onionSkinMode = false;
let lastAffectedLayers = [];

// 1. Toggle Onion Skin Mode
window.toggleOnionSkinMode = function () {
  onionSkinMode = !onionSkinMode;
  alert("Onion Skin Mode: " + (onionSkinMode ? "ON" : "OFF"));

  if (onionSkinMode) {
    window.addEventListener("message", handleLayerSelection);
  } else {
    resetLastAffectedOpacities();
    window.removeEventListener("message", handleLayerSelection);
  }
};

// 2. Respond to layer selection
function handleLayerSelection(e) {
  if (!e.data || typeof e.data !== "object" || e.data.type !== "layerSelectionChanged") return;

  const script = `
    var doc = app.activeDocument;
    var sel = doc.activeLayer;

    if (sel && sel.typename !== "LayerSet") {
      var selName = sel.name;
      var parent = sel.parent;
      var affected = [];

      if (parent && parent.typename === "LayerSet") {
        var siblings = parent.layers;
        var idx = -1;

        for (var i = 0; i < siblings.length; i++) {
          if (siblings[i].name === selName && siblings[i].typename !== "LayerSet") {
            idx = i;
            break;
          }
        }

        if (idx > -1) {
          // Reset old ones
          var prevNames = doc.info.split("|#|");
          for (var j = 0; j < siblings.length; j++) {
            if (prevNames.indexOf(siblings[j].name) > -1) siblings[j].opacity = 100;
          }

          // New onion skin targets
          if (idx > 0) {
            siblings[idx - 1].opacity = 40;
            affected.push(siblings[idx - 1].name);
          }
          if (idx < siblings.length - 1) {
            siblings[idx + 1].opacity = 40;
            affected.push(siblings[idx + 1].name);
          }

          doc.info = affected.join("|#|");
        }
      }
    }
  `;

  window.parent.postMessage(script, "*");
}

// 3. Reset all previously affected opacities
function resetLastAffectedOpacities() {
  const resetScript = `
    var doc = app.activeDocument;
    if (!doc.info) return;

    var names = doc.info.split("|#|");
    var all = doc.layers;

    for (var i = 0; i < all.length; i++) {
      if (names.indexOf(all[i].name) > -1) {
        all[i].opacity = 100;
      }
    }

    doc.info = "";
  `;
  window.parent.postMessage(resetScript, "*");
}
