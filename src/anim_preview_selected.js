// ✅ anim_preview_selected.js — Only merges selected anim_* folders into 'anim_preview'

// 🧱 Get selected anim_* folders by name (safe approach)
function getSelectedTopLevelAnimFolders(doc) {
  var selectedNames = [];

  try {
    var ref = new ActionReference();
    ref.putProperty(charIDToTypeID("Prpr"), stringIDToTypeID("targetLayers"));
    ref.putEnumerated(charIDToTypeID("Dcmn"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
    var desc = executeActionGet(ref);

    if (!desc.hasKey(stringIDToTypeID("targetLayers"))) return [];

    var selList = desc.getList(stringIDToTypeID("targetLayers"));
    for (var i = 0; i < selList.count; i++) {
      var selRef = selList.getReference(i);
      if (selRef.getName) {
        selectedNames.push(selRef.getName());
      }
    }
  } catch (e) {
    alert("❌ Could not read selected layer names.");
    return [];
  }

  var selectedFolders = [];
  for (var i = 0; i < doc.layers.length; i++) {
    var layer = doc.layers[i];
    if (
      layer.typename === "LayerSet" &&
      layer.name.indexOf("anim_") === 0 &&
      layer.name !== "anim_preview" &&
      selectedNames.includes(layer.name)
    ) {
      selectedFolders.push(layer);
    }
  }

  return selectedFolders;
}

// 🧱 Build max frame count from selected folders
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

// ✅ MAIN: Export only selected folders
function exportGifFromSelected() {
  const fps = getSelectedFPS();
  const manual = document.getElementById("manualDelay").value;
  const delay = manual ? Math.round(parseFloat(manual) * 1000) : fpsToDelay(fps);

  console.log("🎯 Exporting selected folders only. Delay:", delay, "ms");

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

      alert("✅ Selected folders merged into 'anim_preview'.\\nOther anim folders hidden.\\nYou can export via File > Export As > GIF.");
    })();
  `;

  window.parent.postMessage(script, "*");
}
