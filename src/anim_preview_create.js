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
        // console.log("📌 Duplicated " + folder.name + " to " + maxFrames + " frames.");
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

  // console.log("🗂 Frame map built: " + frameMap.length + " frames.");
  return frameMap;
}
/*------------------------------------------------------------------------------------------------*/

function mergeFrameGroups(doc, frameMap, previewFolder, delay) {
  for (var f = 0; f < frameMap.length; f++) {
    var layers = frameMap[f];
    var duplicates = [];

    app.echoToOE("🎞 Frame " + f + ": merging " + layers.length + " layers.");

    for (var i = 0; i < layers.length; i++) {
      var original = layers[i];
      app.echoToOE("🔹 Source: " + original.name);
      doc.activeLayer = original;

      try {
        var dup = original.duplicate();
        dup.name = "_a_" + original.name;
        dup.move(doc.layers[0], ElementPlacement.PLACEBEFORE);
        duplicates.push(dup);
        app.echoToOE("✅ Duplicated: " + dup.name);
      } catch (e) {
        app.echoToOE("❌ Error duplicating: " + original.name + " - " + e.message);
      }
    }

    if (duplicates.length >= 2) {
      try {
        doc.activeLayer = duplicates[0];
        for (var i = 1; i < duplicates.length; i++) {
          doc.activeLayer = duplicates[i];
          doc.activeLayer.merge();
        }
        var mergedLayer = doc.activeLayer;
        mergedLayer.name = "_a_Frame " + (f + 1) + "," + delay;
        app.echoToOE("🔧 Merged layer: " + mergedLayer.name);
        mergedLayer.move(previewFolder, ElementPlacement.INSIDE);
        app.echoToOE("📦 Moved merged layer into anim_preview.");
      } catch (e) {
        app.echoToOE("❌ Error during merging or moving: " + e.message);
      }
    } else if (duplicates.length === 1) {
      try {
        var only = duplicates[0];
        only.name = "_a_Frame " + (f + 1) + "," + delay;
        only.move(previewFolder, ElementPlacement.INSIDE);
        app.echoToOE("📦 Moved single layer into anim_preview: " + only.name);
      } catch (e) {
        app.echoToOE("❌ Error moving single layer: " + e.message);
      }
    } else {
      app.echoToOE("⚠️ No valid layers found to merge for frame " + f);
    }
  }
}

/* -------------------------------------------------------------------------- */

/*--------------------------------------original

// 🧱 Merge layers per frame index into anim_preview, with delay
function mergeFrameGroups(doc, frameMap, previewFolder, delay) {
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
        doc.activeLayer.merge();
      }
      var mergedLayer = doc.activeLayer;
      mergedLayer.name = "_a_Frame " + (f + 1) + "," + delay;
      mergedLayer.move(previewFolder, ElementPlacement.INSIDE);
      // console.log("✅ Merged frame " + (f + 1));
    } else if (duplicates.length === 1) {
      var only = duplicates[0];
      only.name = "_a_Frame " + (f + 1) + "," + delay;
      only.move(previewFolder, ElementPlacement.INSIDE);
    }
  }
}

---------------------------------------------------------original */

// 🧱 Set visibility of anim_* folders to false (except anim_preview)
function fadeOutAnimFolders(doc) {
  for (var i = 0; i < doc.layers.length; i++) {
    var layer = doc.layers[i];
    if (
      layer.typename === "LayerSet" &&
      layer.name.indexOf("anim_") === 0 &&
      layer.name !== "anim_preview"
    ) {
      layer.visible = false;
      // console.log("🔕 Faded out: " + layer.name);
    }
  }
}

function exportGif() {
  const fps = getSelectedFPS();
  const manual = document.getElementById("manualDelay").value;
  const delay = manual ? Math.round(parseFloat(manual) * 1000) : fpsToDelay(fps);

  const script = `
    (function () {
      var original = app.activeDocument;
      if (!original) {
        alert("No active document.");
        return;
      }

        // 🔍 Check if any anim_ folders exist
  var hasAnimFolder = false;
  for (var i = 0; i < original.layers.length; i++) {
    var layer = original.layers[i];
    if (layer.typename === "LayerSet" && layer.name.toLowerCase().indexOf("anim_") === 0) {
      hasAnimFolder = true;
      break;
    }
  }

  if (!hasAnimFolder) {
    alert("❌ No 'anim_' folders found in this document.");
    return;
  }

      // 🪄 Step 1: Duplicate document
      var dupDoc = app.documents.add(original.width, original.height, original.resolution, "anim_preview", NewDocumentMode.RGB);
      app.activeDocument = dupDoc;

      // 🎨 Fill background with white if possible
      try {
        var bgLayer = dupDoc.layers[dupDoc.layers.length - 1]; // bottom-most
        dupDoc.activeLayer = bgLayer;

        var white = new SolidColor();
        white.rgb.red = 255;
        white.rgb.green = 255;
        white.rgb.blue = 255;

        dupDoc.selection.selectAll();
        dupDoc.selection.fill(white);
        dupDoc.selection.deselect();

        bgLayer.name = "Background";
        console.log("✅ White background filled.");
      } catch (e) {
        console.log("⚠️ Background fill failed: " + e);
      }

      // 🧱 Step 2: Copy all unlocked layers except background
      for (var i = original.layers.length - 1; i >= 0; i--) {
        var layer = original.layers[i];
        if (layer.locked) continue;

        if (
          layer.typename === "ArtLayer" &&
          layer.name.toLowerCase().includes("background")
        ) continue; // ❌ skip background layers from original

        try {
          app.activeDocument = original;
          original.activeLayer = layer;
          layer.duplicate(dupDoc, ElementPlacement.PLACEATEND);
        } catch (e) {
          console.log("❌ Failed to duplicate layer: " + e);
        }
      }

      app.activeDocument = dupDoc;
      var doc = dupDoc;
      var delay = ${delay};

      // 🧱 Step 3: Merge frame groups into anim_preview
      var previewFolder = (${createAnimPreviewFolder.toString()})(doc);
      if (!previewFolder) return;

      var data = (${getAnimFoldersAndMaxFrames.toString()})(doc);
      (${duplicateSingleLayerFolders.toString()})(doc, data.maxFrames);

      var frameMap = (${buildFrameMap.toString()})(data.folders, data.maxFrames);
      if (frameMap.length === 0) {
        alert("❌ No eligible animation frames found.");
        return;
      }

      (${mergeFrameGroups.toString()})(doc, frameMap, previewFolder, delay);
      (${fadeOutAnimFolders.toString()})(doc);

      // 🧹 Step 4: Delete anim_* folders except anim_preview
      for (var i = doc.layers.length - 1; i >= 0; i--) {
        var layer = doc.layers[i];
        if (
          layer.typename === "LayerSet" &&
         
          layer.name !== "anim_preview"
        ) {
          try { layer.remove(); } catch (e) {}
        }
      }


      // 👁 Step 5: Show only the first frame in anim_preview
      for (var i = 0; i < doc.layers.length; i++) {
        var group = doc.layers[i];
        if (group.typename === "LayerSet" && group.name === "anim_preview") {
          var layers = group.layers;
          for (var j = 0; j < layers.length; j++) {
            layers[j].visible = (j === layers.length - 1); // show only bottom-most
          }
        }
      }

      // 🧽 Step 6: Remove bottom layer if it’s an empty background
      try {
        var lastLayer = doc.layers[doc.layers.length - 1];
        if (
          lastLayer.name.toLowerCase().includes("background") &&
          lastLayer.bounds[2] - lastLayer.bounds[0] === 0 &&
          lastLayer.bounds[3] - lastLayer.bounds[1] === 0
        ) {
          lastLayer.remove();
          console.log("🗑 Removed empty background layer.");
        }
      } catch (e) {
        console.log("⚠️ Error checking background layer: " + e);
      }

      app.refresh();
      
      alert("✅ All frames merged into 'anim_preview'. You can now export via File > Export As > GIF.");
      app.echoToOE("[flipbook] ✅ anim_preview created - done");

      
      
    })();
  `;

  window.parent.postMessage(script, "*");
}



/* the first layer preview and delete all anim folders will be inline - no need for extra functions for these 2 */
/* this was creating a background copy and a transparent background in the dup doc
function exportGif() {
  const fps = getSelectedFPS();
  const manual = document.getElementById("manualDelay").value;
  const delay = manual ? Math.round(parseFloat(manual) * 1000) : fpsToDelay(fps);

  const script = `
    (function () {
      var original = app.activeDocument;
      if (!original) {
        alert("No active document.");
        return;
      }

      // 🪄 Step 1: Duplicate document
      var dupDoc = app.documents.add(original.width, original.height, original.resolution, "anim_preview", NewDocumentMode.RGB);

      for (var i = original.layers.length - 1; i >= 0; i--) {
        var layer = original.layers[i];
        if (layer.locked) continue;

        app.activeDocument = original;
        original.activeLayer = layer;
        layer.duplicate(dupDoc, ElementPlacement.PLACEATEND);
      }

      app.activeDocument = dupDoc;

      // 🧱 Step 2: Run merging logic on duplicated document
      var doc = app.activeDocument;
      var delay = ${delay};

      var previewFolder = (${createAnimPreviewFolder.toString()})(doc);
      if (!previewFolder) return;

      var data = (${getAnimFoldersAndMaxFrames.toString()})(doc);
      (${duplicateSingleLayerFolders.toString()})(doc, data.maxFrames);

      var frameMap = (${buildFrameMap.toString()})(data.folders, data.maxFrames);
      if (frameMap.length === 0) {
        alert("No eligible animation frames found.");
        return;
      }

      (${mergeFrameGroups.toString()})(doc, frameMap, previewFolder, delay);
      (${fadeOutAnimFolders.toString()})(doc);

      // 🧹 Step 3: Remove all anim_* folders except anim_preview
      for (var i = doc.layers.length - 1; i >= 0; i--) {
        var layer = doc.layers[i];
        if (
          layer.typename === "LayerSet" &&
          layer.name.startsWith("anim_") &&
          layer.name !== "anim_preview"
        ) {
          try { layer.remove(); } catch (e) {}
        }
      }

      // 🎬 Step 4: Show only first frame in anim_preview
      for (var i = 0; i < doc.layers.length; i++) {
        var group = doc.layers[i];
        if (group.typename === "LayerSet" && group.name === "anim_preview") {
          var layers = group.layers;
          for (var j = 0; j < layers.length; j++) {
            layers[j].visible = (j === layers.length - 1); // Show only bottom-most
          }
        }
      }

      app.refresh();
      alert("✅ All frames merged into 'anim_preview'. You can now export via File > Export As > GIF.");
    })();
  `;

  window.parent.postMessage(script, "*");
}



/* ------------------------------------------
this utilizes the beforeMergingInExport() in app.js 

function exportGif() {
  const fps = getSelectedFPS();
  const manual = document.getElementById("manualDelay").value;
  const delay = manual ? Math.round(parseFloat(manual) * 1000) : fpsToDelay(fps);

  const script = `
    (function () {
      var original = app.activeDocument;
      if (!original) {
        alert("No active document.");
        return;
      }

      // 🪄 Step 1: Duplicate document
      var dupDoc = app.documents.add(original.width, original.height, original.resolution, "anim_preview", NewDocumentMode.RGB);

      for (var i = original.layers.length - 1; i >= 0; i--) {
        var layer = original.layers[i];
        if (layer.locked) continue;

        app.activeDocument = original;
        original.activeLayer = layer;
        layer.duplicate(dupDoc, ElementPlacement.PLACEATEND);
      }

      app.activeDocument = dupDoc;

      // 🧱 Step 2: Run merging logic
      var doc = app.activeDocument;
      var delay = ${delay};

      var previewFolder = (${createAnimPreviewFolder.toString()})(doc);
      if (!previewFolder) return;

      var data = (${getAnimFoldersAndMaxFrames.toString()})(doc);
      (${duplicateSingleLayerFolders.toString()})(doc, data.maxFrames);

      var frameMap = (${buildFrameMap.toString()})(data.folders, data.maxFrames);
      if (frameMap.length === 0) {
        alert("No eligible animation frames found.");
        return;
      }

      (${mergeFrameGroups.toString()})(doc, frameMap, previewFolder, delay);
      (${fadeOutAnimFolders.toString()})(doc);

      alert("✅ All frames merged into 'anim_preview' in duplicated document.\\nYou can export via File > Export As > GIF.");
    })();
  `;

  window.parent.postMessage(script, "*");
}


/*-----------------------------------------------------------

/* this will create a clone of the document 
function exportGif() {
  const fps = getSelectedFPS();
  const manual = document.getElementById("manualDelay").value;
  const delay = manual ? Math.round(parseFloat(manual) * 1000) : fpsToDelay(fps);

  const script = `
    (function () {
      var original = app.activeDocument;
      if (!original) {
        alert("No active document.");
        return;
      }

      // 🪄 Step 1: Duplicate document
      var dupDoc = app.documents.add(original.width, original.height, original.resolution, "anim_preview", NewDocumentMode.RGB);

      for (var i = original.layers.length - 1; i >= 0; i--) {
        var layer = original.layers[i];
        if (layer.locked) continue;

        app.activeDocument = original;
        original.activeLayer = layer;
        layer.duplicate(dupDoc, ElementPlacement.PLACEATEND);
      }

      app.activeDocument = dupDoc; // Set context to duplicated doc

      // 🧱 Step 2: Run export logic in dupDoc
      var doc = app.activeDocument;
      var delay = ${delay};

      var previewFolder = (${createAnimPreviewFolder.toString()})(doc);
      if (!previewFolder) return;

      var data = (${getAnimFoldersAndMaxFrames.toString()})(doc);
      (${duplicateSingleLayerFolders.toString()})(doc, data.maxFrames);

      var frameMap = (${buildFrameMap.toString()})(data.folders, data.maxFrames);
      if (frameMap.length === 0) {
        alert("No eligible animation frames found.");
        return;
      }

      (${mergeFrameGroups.toString()})(doc, frameMap, previewFolder, delay);
      (${fadeOutAnimFolders.toString()})(doc);

      alert("✅ All frames merged into 'anim_preview' in duplicated document.\\nYou can export via File > Export As > GIF.");
    })();
  `;

  window.parent.postMessage(script, "*");
}

*/
/* ---------------------------------


/* this creates the anim_preview in the same document - was not working well with Onion Skin Applied 

// 🧱 MAIN wrapper to run everything in order
function exportGif() {
  const fps = getSelectedFPS();
  const manual = document.getElementById("manualDelay").value;
  const delay = manual ? Math.round(parseFloat(manual) * 1000) : fpsToDelay(fps);

  // console.log("🎬 Export with delay:", delay, "ms");

  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) {
        alert("No active document.");
        return;
      }

      var delay = ${delay}; // 👈 inject delay value directly

      var previewFolder = (${createAnimPreviewFolder.toString()})(doc);
      if (!previewFolder) return;

      var data = (${getAnimFoldersAndMaxFrames.toString()})(doc);
      (${duplicateSingleLayerFolders.toString()})(doc, data.maxFrames);

      var frameMap = (${buildFrameMap.toString()})(data.folders, data.maxFrames);
      if (frameMap.length === 0) {
        alert("No eligible animation frames found.");
        return;
      }

      (${mergeFrameGroups.toString()})(doc, frameMap, previewFolder, delay);
      (${fadeOutAnimFolders.toString()})(doc);

      alert("✅ All frames merged into 'anim_preview'.\\nOther anim_folders hidden.\\nYou can export via File > Export As > GIF.");
    })();
  `;

  window.parent.postMessage(script, "*");
}

*/


