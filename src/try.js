function createAnimEFolder(doc) {
  console.log("📁 Document found: " + doc.name);

  if (!doc) {
    alert("No active document.");
    return null;
  }

  // Step 1: Prevent duplicate anim_e
  for (var i = 0; i < doc.layers.length; i++) {
    var layer = doc.layers[i];
    if (layer.typename === "LayerSet" && layer.name === "anim_e") {
      alert("❌ Folder 'anim_e' already exists. Please delete it before running this.");
      return null;
    }
  }
  console.log("✅ No existing 'anim_e' folder found.");

  // Step 2: Force root selection via dummy layer
  var dummy = doc.artLayers.add();
  dummy.name = "force_root_selection";
  doc.activeLayer = dummy;
  dummy.remove();
  console.log("✅ Forced root-level selection using dummy layer.");

  // Step 3: Create anim_e using ActionDescriptor
  var groupDesc = new ActionDescriptor();
  var ref = new ActionReference();
  ref.putClass(stringIDToTypeID("layerSection"));
  groupDesc.putReference(charIDToTypeID("null"), ref);

  var props = new ActionDescriptor();
  props.putString(charIDToTypeID("Nm  "), "anim_e");
  groupDesc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("layerSection"), props);
  executeAction(charIDToTypeID("Mk  "), groupDesc, DialogModes.NO);

  // Step 4: Move it to top
  var animFolder = doc.activeLayer;
  animFolder.move(doc.layers[0], ElementPlacement.PLACEBEFORE);
  console.log("✅ 'anim_e' folder created and moved to top.");

  return animFolder;
}

function mapAnimFrames(doc) {
  var animFolders = [];
  var maxFrames = 0;

  for (var i = 0; i < doc.layers.length; i++) {
    var layer = doc.layers[i];
    if (layer.typename === "LayerSet" && layer.name.indexOf("anim_") === 0 && layer.name !== "anim_e") {
      animFolders.push(layer);
      if (layer.layers.length > maxFrames) maxFrames = layer.layers.length;
    }
  }

  var frameMap = [];
  for (var i = 0; i < maxFrames; i++) {
    var frameGroup = [];
    for (var j = 0; j < animFolders.length; j++) {
      var folder = animFolders[j];
      var layer = folder.layers[i];
      if (layer && layer.typename !== "LayerSet" && !layer.locked) {
        frameGroup.push(layer);
        console.log("✅ Collected: " + folder.name + " → " + layer.name);
      }
    }
    if (frameGroup.length > 0) frameMap.push(frameGroup);
  }

  console.log("🗂 Total frames mapped: " + frameMap.length);
  return frameMap;
}

function mergeFrameGroups(doc, frameMap, animFolder) {
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
      console.log("📌 Moved to top: " + dup.name);
    }

    if (duplicates.length >= 2) {
      doc.activeLayer = duplicates[0];
      for (var i = 1; i < duplicates.length; i++) {
        doc.activeLayer = duplicates[i];
        var merged = duplicates[i].merge();
      }
      var mergedLayer = doc.activeLayer;
      mergedLayer.name = "_a_Frame " + (f + 1);
      mergedLayer.move(animFolder, ElementPlacement.INSIDE);
      console.log("✅ Merged frame " + (f + 1) + " added to anim_e.");
    } else if (duplicates.length === 1) {
      var only = duplicates[0];
      only.name = "_a_Frame " + (f + 1);
      only.move(animFolder, ElementPlacement.INSIDE);
      console.log("✅ Single layer frame " + (f + 1) + " added to anim_e.");
    }
  }
}

function exportGif() {
  const script = `
    (function () {
      var doc = app.activeDocument;
      var createAnimEFolder = ${createAnimEFolder.toString()};
      var mapAnimFrames = ${mapAnimFrames.toString()};
      var mergeFrameGroups = ${mergeFrameGroups.toString()};

      var animFolder = createAnimEFolder(doc);
      if (!animFolder) return;

      var frameMap = mapAnimFrames(doc);
      if (frameMap.length === 0) {
        alert("No eligible frames found.");
        return;
      }

      mergeFrameGroups(doc, frameMap, animFolder);

      alert("✅ Merged all corresponding frame layers into 'anim_e'. Check console for steps.");
    })();
  `;

  window.parent.postMessage(script, "*");
}
