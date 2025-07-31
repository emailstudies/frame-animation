function exportGifFromSelected() {
  const fps = getSelectedFPS();
  const manual = document.getElementById("manualDelay").value;
  const delay = manual ? Math.round(parseFloat(manual) * 1000) : fpsToDelay(fps);

  const script = `
    (function () {
      var doc = app.activeDocument;
      var delay = ${delay};

      function getSelectedAnimFolders(doc) {
        var selectedNames = [];
        try {
          var ref = new ActionReference();
          ref.putProperty(stringIDToTypeID("property"), stringIDToTypeID("targetLayers"));
          ref.putEnumerated(stringIDToTypeID("document"), stringIDToTypeID("ordinal"), stringIDToTypeID("targetEnum"));
          var desc = executeActionGet(ref);
          var selIndexList = desc.getList(stringIDToTypeID("targetLayers"));

          for (var i = 0; i < selIndexList.count; i++) {
            var idx = selIndexList.getReference(i).getIndex();
            var layer = doc.layers[idx - 1]; // 1-based indexing
            if (
              layer.typename === "LayerSet" &&
              layer.name.indexOf("anim_") === 0 &&
              layer.name !== "anim_preview"
            ) {
              selectedNames.push(layer.name);
            }
          }
        } catch (e) {
          alert("❌ Could not detect selected folders.");
        }

        // Now match by name, not index (safe even if order changed)
        var folders = [];
        var maxFrames = 0;
        for (var i = 0; i < doc.layers.length; i++) {
          var layer = doc.layers[i];
          if (
            layer.typename === "LayerSet" &&
            selectedNames.includes(layer.name)
          ) {
            folders.push(layer);
            if (layer.layers.length > maxFrames) {
              maxFrames = layer.layers.length;
            }
          }
        }

        return {
          folders: folders,
          maxFrames: maxFrames
        };
      }

      var data = getSelectedAnimFolders(doc);
      if (data.folders.length === 0) {
        alert("❌ No anim_* folders selected.");
        return;
      }

      var previewFolder = (${createAnimPreviewFolder.toString()})(doc);
      if (!previewFolder) return;

      (${duplicateSingleLayerFolders.toString()})(doc, data.maxFrames);
      var frameMap = (${buildFrameMap.toString()})(data.folders, data.maxFrames);
      (${mergeFrameGroups.toString()})(doc, frameMap, previewFolder, delay);
      (${fadeOutAnimFolders.toString()})(doc);

      alert("✅ Selected folders merged into 'anim_preview'.\\nOther folders hidden.");
    })();
  `;

  window.parent.postMessage(script, "*");
}
