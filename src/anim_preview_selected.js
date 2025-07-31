function getSelectedAnimFolders(doc) {
  var selected = [];

  try {
    var ref = new ActionReference();
    ref.putProperty(charIDToTypeID("Prpr"), stringIDToTypeID("targetLayers"));
    ref.putEnumerated(charIDToTypeID("Dcmn"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
    var desc = executeActionGet(ref);

    if (!desc.hasKey(stringIDToTypeID("targetLayers"))) return [];

    var selList = desc.getList(stringIDToTypeID("targetLayers"));
    var selIndices = [];

    for (var i = 0; i < selList.count; i++) {
      var idx = selList.getReference(i).getIndex() - 1; // 0-based
      selIndices.push(idx);
    }

    for (var j = 0; j < selIndices.length; j++) {
      var i = selIndices[j];
      var layer = doc.layers[i];
      if (
        layer &&
        layer.typename === "LayerSet" &&
        layer.name.indexOf("anim_") === 0 &&
        layer.name !== "anim_preview"
      ) {
        selected.push(layer);
      }
    }

  } catch (e) {
    alert("❌ Could not detect selected folders.");
    return [];
  }

  return selected;
}

function exportGifFromSelected() {
  const fps = getSelectedFPS();
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

      var createAnimPreviewFolder = ${createAnimPreviewFolder.toString()};
      var duplicateSingleLayerFolders = ${duplicateSingleLayerFolders.toString()};
      var buildFrameMap = ${buildFrameMap.toString()};
      var mergeFrameGroups = ${mergeFrameGroups.toString()};
      var fadeOutAnimFolders = ${fadeOutAnimFolders.toString()};
      var getSelectedAnimFolders = ${getSelectedAnimFolders.toString()};

      var previewFolder = createAnimPreviewFolder(doc);
      if (!previewFolder) return;

      var folders = getSelectedAnimFolders(doc);
      if (folders.length === 0) {
        alert("❌ No anim_* folders selected.");
        return;
      }

      var maxFrames = 0;
      for (var i = 0; i < folders.length; i++) {
        if (folders[i].layers.length > maxFrames) {
          maxFrames = folders[i].layers.length;
        }
      }

      duplicateSingleLayerFolders(doc, maxFrames);
      var frameMap = buildFrameMap(folders, maxFrames);
      if (frameMap.length === 0) {
        alert("No eligible frames in selected folders.");
        return;
      }

      mergeFrameGroups(doc, frameMap, previewFolder, delay);
      fadeOutAnimFolders(doc);

      alert("✅ Selected folders merged into 'anim_preview'.\\nOther anim folders hidden.\\nYou can export via File > Export As > GIF.");
    })();
  `;

  window.parent.postMessage(script, "*");
}
