// Create anim_e folder at root and at top of stack
function createAnimEFolder(doc) {
  console.log("📁 Document found: " + doc.name);

  if (!doc) {
    alert("No active document.");
    return null;
  }

  // Step 1: Ensure anim_e doesn't already exist
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

  // Step 3: Create anim_e folder using ActionDescriptor
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
  var topLayer = doc.layers[0];
  animFolder.move(topLayer, ElementPlacement.PLACEBEFORE);
  console.log("✅ 'anim_e' folder created and moved to top.");

  return animFolder;
}

// Get first unlocked, non-folder layer from each anim_* folder
function getFirstFrameLayers(doc) {
  var layersToMerge = [];

  for (var i = 0; i < doc.layers.length; i++) {
    var group = doc.layers[i];
    if (group.typename === "LayerSet" && group.name.indexOf("anim_") === 0) {
      for (var j = 0; j < group.layers.length; j++) {
        var layer = group.layers[j];
        if (layer.typename !== "LayerSet" && !layer.locked) {
          console.log("✅ Duplicated from: " + group.name + " → " + layer.name);
          layersToMerge.push(layer);
          break;
        } else {
          console.log(layer, layer.locked ? "locked" : "skipped");
        }
      }
    }
  }

  console.log("✅ Total layers to merge: " + layersToMerge.length);
  return layersToMerge;
}

// Duplicate each layer, move to top, merge, rename
function mergeLayers(doc, layers, animFolder) {
  var mergedLayer = null;
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

  // Merge top two, then loop
  if (duplicates.length >= 2) {
    doc.activeLayer = duplicates[0];
    for (var i = 1; i < duplicates.length; i++) {
      doc.activeLayer = duplicates[i];
      var merged = duplicates[i].merge();
    }
    mergedLayer = doc.activeLayer;
    mergedLayer.name = "_a_Merged_Frame_1";
    console.log("✅ Layers merged successfully: " + mergedLayer.name);

    // Move merged layer into anim_e
    mergedLayer.move(animFolder, ElementPlacement.INSIDE);
    console.log("✅ Merged layer moved inside 'anim_e'");
  }
}

// Main wrapper
function exportGif() {
  const script = `
    (function () {
      var doc = app.activeDocument;
      var animFolder = (${createAnimEFolder.toString()})(doc);
      if (!animFolder) return;
      var layers = (${getFirstFrameLayers.toString()})(doc);
      (${mergeLayers.toString()})(doc, layers, animFolder);
      alert("✅ Merged first layers from all anim_* folders into 'anim_e'. Check console for details.");
    })();
  `;

  window.parent.postMessage(script, "*");
}
