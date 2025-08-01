function exportGifFromSelected() {
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

      // ✅ Step 1: Gather selected anim_* folders
      var selected = [];
      for (var i = 0; i < original.layers.length; i++) {
        var layer = original.layers[i];
        if (
          layer.typename === "LayerSet" &&
          layer.name.indexOf("anim_") === 0 &&
          layer.name !== "anim_preview" &&
          layer.selected
        ) {
          selected.push(layer);
        }
      }

      if (selected.length === 0) {
        alert("❌ No anim_* folders selected.");
        return;
      }

      console.log("✅ Selected folders to export: " + selected.length);

      // 🎨 Step 1.5: Capture background color of original doc (bottom layer if present)
      var bgColor = null;
      try {
        var bottomLayer = original.layers[original.layers.length - 1];
        if (
          bottomLayer &&
          bottomLayer.kind === LayerKind.NORMAL &&
          !bottomLayer.allLocked
        ) {
          original.activeLayer = bottomLayer;
          bgColor = bottomLayer.pixelColor;
          console.log("🎨 Captured background color.");
        }
      } catch (e) {
        console.log("⚠️ Could not capture background color: " + e);
      }

      // 🪄 Step 2: Duplicate document
      var dupDoc = app.documents.add(original.width, original.height, original.resolution, "anim_preview", NewDocumentMode.RGB);
      console.log("📄 Duplicated document created.");

      // 🧱 Step 3: Copy only selected folders into new document
      for (var i = selected.length - 1; i >= 0; i--) {
        var folder = selected[i];
        if (folder.locked) continue;
        try {
          app.activeDocument = original;
          original.activeLayer = folder;
          folder.duplicate(dupDoc, ElementPlacement.PLACEATEND);
          console.log("✅ Duplicated folder: " + folder.name);
        } catch (e) {
          console.log("❌ Failed to duplicate: " + folder.name + " — " + e);
        }
      }

      // 🧠 Step 4: Process duplicated document
      app.activeDocument = dupDoc;
      var doc = dupDoc;
      var delay = ${delay};

      var previewFolder = (${createAnimPreviewFolder.toString()})(doc);
      if (!previewFolder) {
        console.log("❌ Failed to create anim_preview folder.");
        return;
      }

      var data = (${getAnimFoldersAndMaxFrames.toString()})(doc);
      console.log("📊 Max frames: " + data.maxFrames);

      (${duplicateSingleLayerFolders.toString()})(doc, data.maxFrames);
      console.log("📌 Duplicated single-layer folders (if needed).");

      var frameMap = (${buildFrameMap.toString()})(data.folders, data.maxFrames);
      console.log("🧠 Frame map built with " + frameMap.length + " frames.");

      if (frameMap.length === 0) {
        alert("❌ No eligible animation frames found.");
        return;
      }

      (${mergeFrameGroups.toString()})(doc, frameMap, previewFolder, delay);
      (${fadeOutAnimFolders.toString()})(doc);

      // 🧹 Step 5: Remove all anim_* folders except anim_preview
      for (var i = doc.layers.length - 1; i >= 0; i--) {
        var layer = doc.layers[i];
        if (
          layer.typename === "LayerSet" &&
          layer.name.indexOf("anim_") === 0 &&
          layer.name !== "anim_preview"
        ) {
          try {
            layer.remove();
            console.log("🗑 Removed: " + layer.name);
          } catch (e) {
            console.log("❌ Failed to remove: " + layer.name);
          }
        }
      }

      // 👁 Step 6: Show only the first preview frame
      for (var i = 0; i < doc.layers.length; i++) {
        var group = doc.layers[i];
        if (group.typename === "LayerSet" && group.name === "anim_preview") {
          var layers = group.layers;
          for (var j = 0; j < layers.length; j++) {
            layers[j].visible = (j === layers.length - 1); // show bottom-most
          }
        }
      }

      // 🎨 Step 7: Fill background layer if it's still empty
      if (bgColor) {
        try {
          var bgLayer = doc.layers[doc.layers.length - 1];
          if (
            bgLayer &&
            bgLayer.kind === LayerKind.NORMAL &&
            !bgLayer.allLocked &&
            bgLayer.layers === undefined // Not a group
          ) {
            doc.activeLayer = bgLayer;
            doc.selection.selectAll();
            doc.selection.clear(); // clear any content
            doc.selection.fill(bgColor);
            doc.selection.deselect();
            bgLayer.name = "_a_FilledBackground";
            console.log("✅ Background layer filled.");
          } else {
            console.log("ℹ️ Background layer not suitable for fill.");
          }
        } catch (e) {
          console.log("⚠️ Could not fill background: " + e);
        }
      } else {
        console.log("ℹ️ No background color available to fill.");
      }

      app.refresh();
      alert("✅ Selected folders exported to 'anim_preview'. You can now export via File > Export As > GIF.");
    })();
  `;

  window.parent.postMessage(script, "*");
}


/* worked but background layer was transparent
function exportGifFromSelected() {
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

      // ✅ Step 1: Gather selected anim_* folders
      var selected = [];
      for (var i = 0; i < original.layers.length; i++) {
        var layer = original.layers[i];
        if (
          layer.typename === "LayerSet" &&
          layer.name.indexOf("anim_") === 0 &&
          layer.name !== "anim_preview" &&
          layer.selected
        ) {
          selected.push(layer);
        }
      }

      if (selected.length === 0) {
        alert("❌ No anim_* folders selected.");
        return;
      }

      console.log("✅ Selected folders to export: " + selected.length);

      // 🪄 Step 2: Duplicate document
      var dupDoc = app.documents.add(original.width, original.height, original.resolution, "anim_preview", NewDocumentMode.RGB);
      console.log("📄 Duplicated document created.");

      // 🧱 Step 3: Copy only selected folders into new document
      for (var i = selected.length - 1; i >= 0; i--) {
        var folder = selected[i];
        if (folder.locked) continue;
        try {
          app.activeDocument = original;
          original.activeLayer = folder;
          folder.duplicate(dupDoc, ElementPlacement.PLACEATEND);
          console.log("✅ Duplicated folder: " + folder.name);
        } catch (e) {
          console.log("❌ Failed to duplicate: " + folder.name + " — " + e);
        }
      }

      // 🧠 Step 4: Process duplicated document
      app.activeDocument = dupDoc;
      var doc = dupDoc;
      var delay = ${delay};

      var previewFolder = (${createAnimPreviewFolder.toString()})(doc);
      if (!previewFolder) {
        console.log("❌ Failed to create anim_preview folder.");
        return;
      }

      var data = (${getAnimFoldersAndMaxFrames.toString()})(doc);
      console.log("📊 Max frames: " + data.maxFrames);

      (${duplicateSingleLayerFolders.toString()})(doc, data.maxFrames);
      console.log("📌 Duplicated single-layer folders (if needed).");

      var frameMap = (${buildFrameMap.toString()})(data.folders, data.maxFrames);
      console.log("🧠 Frame map built with " + frameMap.length + " frames.");

      if (frameMap.length === 0) {
        alert("❌ No eligible animation frames found.");
        return;
      }

      (${mergeFrameGroups.toString()})(doc, frameMap, previewFolder, delay);
      (${fadeOutAnimFolders.toString()})(doc);

      // 🧹 Step 5: Remove all anim_* folders except anim_preview
      for (var i = doc.layers.length - 1; i >= 0; i--) {
        var layer = doc.layers[i];
        if (
          layer.typename === "LayerSet" &&
          layer.name.indexOf("anim_") === 0 &&
          layer.name !== "anim_preview"
        ) {
          try {
            layer.remove();
            console.log("🗑 Removed: " + layer.name);
          } catch (e) {
            console.log("❌ Failed to remove: " + layer.name);
          }
        }
      }

      // 👁 Step 6: Show only the first preview frame
      for (var i = 0; i < doc.layers.length; i++) {
        var group = doc.layers[i];
        if (group.typename === "LayerSet" && group.name === "anim_preview") {
          var layers = group.layers;
          for (var j = 0; j < layers.length; j++) {
            layers[j].visible = (j === layers.length - 1); // show bottom-most
          }
        }
      }

      app.refresh();
      alert("✅ Selected folders exported to 'anim_preview'. You can now export via File > Export As > GIF.");
    })();
  `;

  window.parent.postMessage(script, "*");
}




/* this was creating the anim preview from selected in the same doc
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

      // ✅ Grab selected anim_* folders
      var selected = [];
      for (var i = 0; i < doc.layers.length; i++) {
        var layer = doc.layers[i];
        if (
          layer.typename === "LayerSet" &&
          layer.name.indexOf("anim_") === 0 &&
          layer.name !== "anim_preview" &&
          layer.selected
        ) {
          selected.push(layer);
        }
      }

      if (selected.length === 0) {
        alert("❌ No anim_* folders selected.");
        return;
      }

      // alert("✅ Selected: " + selected.length);

      // 🧠 Determine max frame count
      var maxFrames = 0;
      for (var i = 0; i < selected.length; i++) {
        if (selected[i].layers.length > maxFrames) {
          maxFrames = selected[i].layers.length;
        }
      }

      var delay = ${delay};

      // 📁 Create or clean anim_preview
      var previewFolder = (${createAnimPreviewFolder.toString()})(doc);
      if (!previewFolder) return;

      // 🧱 Duplicate single-frame folders
      (${duplicateSingleLayerFolders.toString()})(doc, maxFrames);
      // alert("📌 Duplicated single-layer folders (if any).");

      // 🧠 Build frame map (reverse-indexed)
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
        return frameMap;
      }

      var frameMap = buildFrameMap(selected, maxFrames);
      // alert("🧠 Frame map built: " + frameMap.length + " frames.");

      // 🎞 Merge frame layers into preview
      function mergeFrameGroups(doc, frameMap, previewFolder, delay) {
        for (var f = 0; f < frameMap.length; f++) {
          var layers = frameMap[f];
          var duplicates = [];

          for (var i = 0; i < layers.length; i++) {
            var original = layers[i];
            if (!original || original.typename === "LayerSet" || original.locked) continue;

            try {
              doc.activeLayer = original;
              var dup = original.duplicate();
              dup.name = "_a_" + original.name;
              dup.move(doc.layers[0], ElementPlacement.PLACEBEFORE);
              duplicates.push(dup);
            } catch (e) {
              alert("❌ Error duplicating layer: " + (original ? original.name : "null"));
            }
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
          } else if (duplicates.length === 1) {
            var only = duplicates[0];
            only.name = "_a_Frame " + (f + 1) + "," + delay;
            only.move(previewFolder, ElementPlacement.INSIDE);
          }
        }
      }

      mergeFrameGroups(doc, frameMap, previewFolder, delay);

      (${fadeOutAnimFolders.toString()})(doc);

      alert("✅ Selected folders merged into 'anim_preview'.\\nExport via File > Export As > GIF.");
    })();
  `;

  window.parent.postMessage(script, "*");
}
*/
