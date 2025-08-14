document.getElementById("onionSkinBtn").onclick = function () {
  const before = parseInt(document.getElementById("beforeSteps").value, 10);
  const after = parseInt(document.getElementById("afterSteps").value, 10);

  console.log("🧅 Onion Skin: Before =", before, "After =", after);
  toggleOnionSkinMode(before, after);
};


// ✅ app.js (updated)
function getSelectedFPS() {
  const fpsSelect = document.getElementById("fpsSelect");
  return fpsSelect ? parseInt(fpsSelect.value, 10) : 12;
}

function fpsToDelay(fps) {
  return Math.round(1000 / fps);
}

function getSelectedDelay() {
  const manualInput = document.getElementById("manualDelay").value.trim();
  if (manualInput) {
    const delayInSec = parseFloat(manualInput);
    if (!isNaN(delayInSec) && delayInSec > 0) {
      return Math.round(delayInSec * 1000); // seconds to milliseconds
    }
  }

  const fps = getSelectedFPS();
  return fpsToDelay(fps);
}

// Optional: Disable fps select if manual delay exists
function updateDelayInputState() {
  const fpsSelect = document.getElementById("fpsSelect");
  const manualDelay = document.getElementById("manualDelay").value.trim();
  fpsSelect.disabled = manualDelay !== "";
}


// Hard Reset - all visble and all opacity = 100
function showAllLayersAndFolders() {
  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) {
        alert("No active document.");
        return;
      }

      function isLayerSetLocked(layerSet) {
        return layerSet.allLocked || layerSet.pixelsLocked || layerSet.positionLocked || layerSet.transparentPixelsLocked;
      }

      function processLayer(layer) {
        if (layer.typename === "LayerSet") {
          if (!isLayerSetLocked(layer)) {
            try {
              layer.visible = true;
              layer.opacity = 100;
            } catch (e) {
              alert("⚠️ Could not update folder: " + layer.name);
            }
            for (var i = 0; i < layer.layers.length; i++) {
              processLayer(layer.layers[i]);
            }
          }
        } else {
          try {
            layer.visible = true;
            layer.opacity = 100;
          } catch (e) {
            alert("⚠️ Failed to update layer: " + layer.name);
          }
        }
      }

      for (var i = 0; i < doc.layers.length; i++) {
        processLayer(doc.layers[i]);
      }
    })();
  `;

  window.parent.postMessage(script, "*");
}


