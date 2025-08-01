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

      // 🪄 Step 2: Duplicate document
      var dupDoc = app.documents.add(original.width, original.height, original.resolution, "anim_preview", NewDocumentMode.RGB);

      for (var i = original.layers.length - 1; i >= 0; i--) {
        var layer = original.layers[i];
        if (layer.locked) continue;

        if (layer.typename === "LayerSet" && layer.name.indexOf("anim_") === 0 && layer.name !== "anim_preview" && layer.selected) {
          app.activeDocument = original;
          original.activeLayer = layer;
          layer.duplicate(dupDoc, ElementPlacement.PLACEATEND);
        }
      }

      app.activeDocument = dupDoc;
      var doc = dupDoc;

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

      // 🧹 Remove all anim_* folders except anim_preview
      for (var i = doc.layers.length - 1; i >= 0; i--) {
        var layer = doc.layers[i];
        if (
          layer.typename === "LayerSet" &&
          layer.name.indexOf("anim_") === 0 &&
          layer.name !== "anim_preview"
        ) {
          try { layer.remove(); } catch (e) {}
        }
      }

      // 👁 Show only the first frame of anim_preview
      for (var i = 0; i < doc.layers.length; i++) {
        var group = doc.layers[i];
        if (group.typename === "LayerSet" && group.name === "anim_preview") {
          var layers = group.layers;
          for (var j = 0; j < layers.length; j++) {
            layers[j].visible = (j === layers.length - 1);
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
