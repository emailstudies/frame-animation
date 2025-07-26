// 🧱 Create anim_preview folder at root and top of layer stack
function createAnimPreviewFolder(doc) {
  if (!doc) {
    alert("No active document.");
    return null;
  }

  for (var i = 0; i < doc.layers.length; i++) {
    var layer = doc.layers[i];
    if (layer.typename === "LayerSet" && layer.name === "anim_preview") {
      alert("❌ Folder 'anim_preview' already exists. Please delete it before running this.");
      return null;
    }
  }

  var dummy = doc.artLayers.add();
  dummy.name = "force_root_selection";
  doc.activeLayer = dummy;
  dummy.remove();

  var groupDesc = new ActionDescriptor();
  var ref = new ActionReference();
  ref.putClass(stringIDToTypeID("layerSection"));
  groupDesc.putReference(charIDToTypeID("null"), ref);

  var props = new ActionDescriptor();
  props.putString(charIDToTypeID("Nm  "), "anim_preview");
  groupDesc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("layerSection"), props);

  executeAction(charIDToTypeID("Mk  "), groupDesc, DialogModes.NO);

  var previewFolder = doc.activeLayer;
  previewFolder.move(doc.layers[0], ElementPlacement.PLACEBEFORE);

  return previewFolder;
}

// 🧱 Duplicate single-layer folders to match maxFrames
function duplicateSingleLayerFolders(doc, maxFrames) {
  for (var i = 0; i < doc.layers.length; i++) {
    var folder = doc.layers[i];
    if (
      folder.typename === "LayerSet" &&
      folder.name.indexOf("anim_") === 0 &&
      folder.name !== "anim_preview"
    ) {
      if (folder.layers.length === 1) {
        var baseLayer = folder.layers[0];
        var currentLayer = baseLayer;
        for (var j = 1; j < maxFrames; j++) {
          var dup = currentLayer.duplicate();
          folder.insertLayer(dup);
          currentLayer = dup;
        }
        console.log("📌 Duplicated " + folder.name + " to " + maxFrames + " frames.");
      }
    }
  }
}

// 🧱 Get anim_* folders and max frame count (before mapping)
function getAnimFoldersAndMaxFrames(doc) {
  var animFolders = [];
  var maxFrames = 0;

  for (var i = doc.layers.length - 1; i >= 0; i--) {
    var layer = doc.layers[i];
    if (
      layer.typename === "LayerSet" &&
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

// 🧱 Build the frame map AFTER duplication
function buildFrameMap(animFolders, maxFrames) {
  var frameMap = [];

  for (var frameIndex = 0; frameIndex < maxFrames; frameIndex++) {
    var frameGroup = [];
    for (var j = 0; j < animFolders.length; j++) {
      var folder = animFolders[j];
      var layerIndex = folder.layers.length - 1 - frameIndex;
      var layer = folder.layers[layerIndex];
      if (layer && layer.typename !== "LayerSet" && !layer.locked) {
        frameGroup.push(layer);
      }
    }
    if (frameGroup.length > 0) frameMap.push(frameGroup);
  }

  console.log("🗂 Frame map built: " + frameMap.length + " frames.");
  return frameMap;
}

// 🧱 Merge layers per frame index into anim_preview
function mergeFrameGroups(doc, frameMap, previewFolder) {
  for (var f = 0; f < frameMap.length; f++) {
    var layers = frameMap[f];
    var duplicates = [];

    for (var i = 0; i < layers.length; i++) {
      var original = layers[i];
      doc.activeLayer = original;
      var dup = original.duplicate();
      dup.name = "_a_" + original.name;
      dup.move(doc.layers[0], ElementPlacement.PLACEBEFORE);
      duplicates.push(dup);
    }

    if (duplicates.length >= 2) {
      doc.activeLayer = duplicates[0];
      for (var i = 1; i < duplicates.length; i++) {
        doc.activeLayer = duplicates[i];
        var merged = duplicates[i].merge();
      }
      var mergedLayer = doc.activeLayer;
      mergedLayer.name = "_a_Frame " + (f + 1);
      mergedLayer.move(previewFolder, ElementPlacement.INSIDE);
      console.log("✅ Merged frame " + (f + 1));
    } else if (duplicates.length === 1) {
      var only = duplicates[0];
      only.name = "_a_Frame " + (f + 1);
      only.move(previewFolder, ElementPlacement.INSIDE);
    }
  }
}

// 🧱 Set opacity of all anim_* folders to 0 (except anim_preview)
function fadeOutAnimFolders(doc) {
  for (var i = 0; i < doc.layers.length; i++) {
    var layer = doc.layers[i];
    if (
      layer.typename === "LayerSet" &&
      layer.name.indexOf("anim_") === 0 &&
      layer.name !== "anim_preview"
    ) {
      layer.opacity = 0;
      console.log("🔕 Faded out: " + layer.name);
    }
  }
}

// 🧱 MAIN wrapper to run everything in order
function exportGif() {
  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) {
        alert("No active document.");
        return;
      }

      var previewFolder = (${createAnimPreviewFolder.toString()})(doc);
      if (!previewFolder) return;

      var data = (${getAnimFoldersAndMaxFrames.toString()})(doc);
      (${duplicateSingleLayerFolders.toString()})(doc, data.maxFrames);

      var frameMap = (${buildFrameMap.toString()})(data.folders, data.maxFrames);
      if (frameMap.length === 0) {
        alert("No eligible animation frames found.");
        return;
      }

      (${mergeFrameGroups.toString()})(doc, frameMap, previewFolder);
      (${fadeOutAnimFolders.toString()})(doc);

      alert("✅ All frames merged into 'anim_preview'. /n Other anim_folders opacity set to 0 for export. /n You can export via File > Export As > GIF/MP4.");
    })();
  `;

  window.parent.postMessage(script, "*");
}
