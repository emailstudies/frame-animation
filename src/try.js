// 🧱 Create anim_preview folder at root and top
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

// 🧱 Get all anim_* folders (excluding anim_preview) and determine maxFrames
function getAnimFoldersAndMaxFrames(doc) {
  var folders = [];
  var maxFrames = 0;

  for (var i = 0; i < doc.layers.length; i++) {
    var layer = doc.layers[i];
    if (
      layer.typename === "LayerSet" &&
      layer.name.indexOf("anim_") === 0 &&
      layer.name !== "anim_preview"
    ) {
      folders.push(layer);
      if (layer.layers.length > maxFrames) {
        maxFrames = layer.layers.length;
      }
    }
  }

  return { folders: folders, maxFrames: maxFrames };
}

// 🧱 Duplicate single-layer anim folders to match maxFrames
function duplicateSingleLayerFolders(doc, maxFrames) {
  var folders = getAnimFoldersAndMaxFrames(doc).folders;

  for (var i = 0; i < folders.length; i++) {
    var folder = folders[i];
    if (folder.layers.length === 1) {
      var base = folder.layers[0];
      for (var j = 1; j < maxFrames; j++) {
        var dup = base.duplicate();
        folder.insertLayer(dup);
      }
    }
  }
}

// 🧱 Build a 2D frame map: one frame group per index
function buildFrameMap(folders, maxFrames) {
  var frameMap = [];

  for (var frameIndex = 0; frameIndex < maxFrames; frameIndex++) {
    var group = [];
    for (var j = 0; j < folders.length; j++) {
      var folder = folders[j];
      var layerIndex = folder.layers.length - 1 - frameIndex;
      var layer = folder.layers[layerIndex];
      if (layer && layer.typename !== "LayerSet" && !layer.locked) {
        group.push(layer);
      }
    }
    if (group.length > 0) frameMap.push(group);
  }

  return frameMap;
}

// 🧱 Merge each frame group into one layer → anim_preview
function mergeFrameGroups(doc, frameMap, previewFolder) {
  for (var f = 0; f < frameMap.length; f++) {
    var layers = frameMap[f];
    var dups = [];

    for (var i = 0; i < layers.length; i++) {
      var orig = layers[i];
      doc.activeLayer = orig;
      var dup = orig.duplicate();
      dup.name = "_a_" + orig.name;
      dup.move(doc.layers[0], ElementPlacement.PLACEBEFORE);
      dups.push(dup);
    }

    var merged;
    if (dups.length >= 2) {
      doc.activeLayer = dups[0];
      for (var i = 1; i < dups.length; i++) {
        doc.activeLayer = dups[i];
        merged = dups[i].merge();
      }
    } else {
      merged = dups[0];
    }

    merged.name = "_a_Frame " + (f + 1);
    merged.move(previewFolder, ElementPlacement.INSIDE);
  }
}

// 🧱 Hide all anim_* folders except anim_preview
function hideAnimFolders(doc) {
  for (var i = 0; i < doc.layers.length; i++) {
    var layer = doc.layers[i];
    if (
      layer.typename === "LayerSet" &&
      layer.name.indexOf("anim_") === 0 &&
      layer.name !== "anim_preview"
    ) {
      layer.visible = false;
    }
  }
}

// 🧱 Main execution wrapper
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
      (${hideAnimFolders.toString()})(doc);

      alert("✅ 'anim_preview' created and filled. All anim_* folders hidden. Ready to export.");
    })();
  `;

  window.parent.postMessage(script, "*");
}
