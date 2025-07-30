// ✅ anim_preview_selected.js — Only merges selected anim_* folders into 'anim_preview'

// 🧱 Helper to get selected top-level anim_* folders
function getSelectedTopLevelAnimFolders(doc) {
  var selected = [];

  try {
    var ref = new ActionReference();
    ref.putProperty(charIDToTypeID("Prpr"), stringIDToTypeID("targetLayers"));
    ref.putEnumerated(charIDToTypeID("Dcmn"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
    var desc = executeActionGet(ref);

    if (!desc.hasKey(stringIDToTypeID("targetLayers"))) return [];

    var selIndexList = desc.getList(stringIDToTypeID("targetLayers"));
    var selIndices = [];

    for (var i = 0; i < selIndexList.count; i++) {
      var idx = selIndexList.getReference(i).getIndex();
      selIndices.push(idx);
    }

    for (var j = 0; j < selIndices.length; j++) {
      var i = selIndices[j] - 1; // Photoshop uses 1-based indexing
      if (doc.layers[i] && doc.layers[i].typename === "LayerSet") {
        var layer = doc.layers[i];
        if (
          layer.name.indexOf("anim_") === 0 &&
          layer.name !== "anim_preview"
        ) {
          selected.push(layer);
        }
      }
    }

  } catch (e) {
    alert("❌ Could not detect selected layers.");
    return [];
  }

  return selected;
}

// 🧱 Build max frame count from selected anim_* folders
function getSelectedAnimFoldersAndMaxFrames(doc) {
  var animFolders = getSelectedTopLevelAnimFolders(doc);
  var maxFrames = 0;

  for (var i = 0; i < animFolders.length; i++) {
    if (animFolders[i].layers.length > maxFrames) {
      maxFrames = animFolders[i].layers.length;
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
    (${function () {
      var doc = app.activeDocument;
      if (!doc) {
        alert("No active document.");
        return;
      }

      var delay = ${delay};

      var previewFolder = (${createAnimPreviewFolder.toString()})(doc);
      if (!previewFolder) return;

      var getSelectedTopLevelAnimFolders = ${getSelectedTopLevelAnimFolders.toString()};
      var getSelectedAnimFoldersAndMaxFrames = ${getSelectedAnimFoldersAndMaxFrames.toString()};
      var data = getSelectedAnimFoldersAndMaxFrames(doc);

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

      alert("✅ Selected folders merged into 'anim_preview'.\nOther anim folders hidden.\nYou can export via File > Export As > GIF.");
    }.toString()})();
  `;

  window.parent.postMessage(script, "*");
}
