// 🧱 Helper: Get selected top-level folders
function getSelectedLayers(doc) {
  var selected = [];

  for (var i = 0; i < doc.layers.length; i++) {
    var layer = doc.layers[i];
    if (layer.typename === "LayerSet" && layer.selected) {
      selected.push(layer);
    }
  }

  return selected;
}

// 🧱 Only return selected anim_* folders
function getSelectedAnimFoldersAndMaxFrames(doc) {
  var animFolders = [];
  var maxFrames = 0;

  var selectedLayers = getSelectedLayers(doc);
  for (var i = 0; i < selectedLayers.length; i++) {
    var layer = selectedLayers[i];
    if (
      layer.name.indexOf("anim_") === 0 &&
      layer.name !== "anim_preview"
    ) {
      animFolders.push(layer);
      if (layer.layers.length > maxFrames) {
        maxFrames = layer.layers.length;
      }
    }
  }

  return {
    folders: animFolders,
    maxFrames: maxFrames
  };
}

// 🧱 Export selected folders only
function exportGifFromSelected() {
  const fps = getSelectedFPS(); // from app.js
  const manual = document.getElementById("manualDelay").value;
  const delay = manual ? Math.round(parseFloat(manual) * 1000) : fpsToDelay(fps);

  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) {
        alert("No active document.");
        return;
      }

      var delay = ${delay};

      var previewFolder = (${createAnimPreviewFolder.toString()})(doc);
      if (!previewFolder) return;

      var getSelectedLayers = ${getSelectedLayers.toString()};
      var data = (${getSelectedAnimFoldersAndMaxFrames.toString()})(doc);

      if (data.folders.length === 0) {
        alert("❌ No anim_* folders selected.");
        return;
      }

      (${duplicateSingleLayerFolders.toString()})(doc, data.maxFrames);
      var frameMap = (${buildFrameMap.toString()})(data.folders, data.maxFrames);
      if (frameMap.length === 0) {
        alert("No eligible frames in selected folders.");
        return;
      }

      (${mergeFrameGroups.toString()})(doc, frameMap, previewFolder, delay);
      (${fadeOutAnimFolders.toString()})(doc);

      alert("✅ Selected folders merged into 'anim_preview'.\\nOther anim folders hidden.\\nYou can export via File > Export As > GIF.");
    })();
  `;

  window.parent.postMessage(script, "*");
}
