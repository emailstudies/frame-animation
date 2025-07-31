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
