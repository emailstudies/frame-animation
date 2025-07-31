document.getElementById("webPreviewAllBtn").onclick = function () {
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

function showOnlyFirstPreviewLayer() {
  const script = `
    (function () {
      var doc = app.activeDocument;
      var previewFolder = null;

      for (var i = 0; i < doc.layers.length; i++) {
        var layer = doc.layers[i];
        if (layer.typename === "LayerSet" && layer.name === "anim_preview") {
          previewFolder = layer;
          break;
        }
      }

      if (!previewFolder) return;

      var layers = previewFolder.layers;
      for (var j = 0; j < layers.length; j++) {
        layers[j].visible = (j === layers.length - 1); // Show only first (bottom-most)
      }

      app.refresh();
    })();
  `;
  window.parent.postMessage(script, "*");
}


function deleteOtherAnimFolders() {
  const script = `
    (function () {
      function deleteAnimFolders(layerGroup) {
        for (var i = layerGroup.layers.length - 1; i >= 0; i--) {
          var layer = layerGroup.layers[i];

          if (layer.typename === "LayerSet") {
            if (layer.name.startsWith("anim_") && layer.name !== "anim_preview") {
              try {
                layer.remove();
              } catch (e) {
                // maybe locked
                try { layer.visible = true; layer.locked = false; layer.remove(); } catch (e2) {}
              }
            } else {
              // recurse into nested folders
              deleteAnimFolders(layer);
            }
          }
        }
      }

      var doc = app.activeDocument;
      if (!doc) return;
      deleteAnimFolders(doc);
      app.refresh();
    })();
  `;
  window.parent.postMessage(script, "*");
}

