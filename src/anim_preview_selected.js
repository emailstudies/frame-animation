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

      // 📦 Get selected folder names from targetLayers
      var selectedNames = [];
      try {
        var ref = new ActionReference();
        ref.putProperty(charIDToTypeID("Prpr"), stringIDToTypeID("targetLayers"));
        ref.putEnumerated(charIDToTypeID("Dcmn"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
        var desc = executeActionGet(ref);
        var selIndexList = desc.getList(stringIDToTypeID("targetLayers"));

        for (var i = 0; i < selIndexList.count; i++) {
          var idx = selIndexList.getReference(i).getIndex() - 1; // Photoshop index is 1-based
          var layer = doc.layers[idx];
          if (layer && layer.typename === "LayerSet" && layer.name.indexOf("anim_") === 0 && layer.name !== "anim_preview") {
            selectedNames.push(layer.name);
          }
        }
      } catch (e) {
        alert("❌ Could not read selected folders. Please select anim_* folders.");
        return;
      }

      if (selectedNames.length === 0) {
        alert("❌ No anim_* folders selected.");
        return;
      }

      // 📦 Match names to LayerSet references
      var folders = [];
      for (var i = 0; i < doc.layers.length; i++) {
        var layer = doc.layers[i];
        if (layer.typename === "LayerSet" && selectedNames.indexOf(layer.name) !== -1) {
          folders.push(layer);
        }
      }

      var maxFrames = 0;
      for (var i = 0; i < folders.length; i++) {
        if (folders[i].layers.length > maxFrames) {
          maxFrames = folders[i].layers.length;
        }
      }

      var previewFolder = (${createAnimPreviewFolder.toString()})(doc);
      if (!previewFolder) return;

      (${duplicateSingleLayerFolders.toString()})(doc, maxFrames);
      var frameMap = (${buildFrameMap.toString()})(folders, maxFrames);
      if (frameMap.length === 0) {
        alert("No frames found to merge.");
        return;
      }

      (${mergeFrameGroups.toString()})(doc, frameMap, previewFolder, ${delay});
      (${fadeOutAnimFolders.toString()})(doc);

      alert("✅ Selected folders merged into 'anim_preview'.\\nYou can export via File > Export As > GIF.");
    })();
  `;

  window.parent.postMessage(script, "*");
}
