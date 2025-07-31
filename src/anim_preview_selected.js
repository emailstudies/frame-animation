function exportGifFromSelected() {
  const fps = getSelectedFPS(); // from UI
  const manual = document.getElementById("manualDelay").value;
  const delay = manual ? Math.round(parseFloat(manual) * 1000) : fpsToDelay(fps);

  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) {
        alert("No active document.");
        return;
      }

      var delay = ${delay};

      // ✅ 1. Use targetLayers to collect selected anim_* folders by NAME
      var selectedNames = [];
      try {
        var ref = new ActionReference();
        ref.putProperty(charIDToTypeID("Prpr"), stringIDToTypeID("targetLayers"));
        ref.putEnumerated(charIDToTypeID("Dcmn"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
        var desc = executeActionGet(ref);
        var selList = desc.getList(stringIDToTypeID("targetLayers"));

        for (var i = 0; i < selList.count; i++) {
          var layerRef = selList.getReference(i);
          var index = layerRef.getIndex() - 1;
          var layer = doc.layers[index];
          if (
            layer && layer.typename === "LayerSet" &&
            layer.name.indexOf("anim_") === 0 &&
            layer.name !== "anim_preview"
          ) {
            selectedNames.push(layer.name);
          }
        }
      } catch (e) {
        alert("❌ Could not read selected folders.");
        return;
      }

      if (selectedNames.length === 0) {
        alert("❌ No anim_* folders selected.");
        return;
      }

      // ✅ 2. Get only selected anim_* folders
      var selectedFolders = [];
      var maxFrames = 0;
      for (var i = 0; i < doc.layers.length; i++) {
        var layer = doc.layers[i];
        if (
          layer.typename === "LayerSet" &&
          selectedNames.includes(layer.name)
        ) {
          selectedFolders.push(layer);
          if (layer.layers.length > maxFrames) {
            maxFrames = layer.layers.length;
          }
        }
      }

      if (selectedFolders.length === 0) {
        alert("❌ No valid anim_* folders found.");
        return;
      }

      var previewFolder = (${createAnimPreviewFolder.toString()})(doc);
      if (!previewFolder) return;

      // ✅ 3. Only duplicate selected folders
      for (var i = 0; i < selectedFolders.length; i++) {
        var folder = selectedFolders[i];
        if (folder.layers.length === 1) {
          var base = folder.layers[0];
          for (var j = 1; j < maxFrames; j++) {
            var dup = base.duplicate();
            folder.insertLayer(dup);
          }
        }
      }

      // ✅ 4. Build frame map from selected
      var frameMap = (${buildFrameMap.toString()})(selectedFolders, maxFrames);
      if (frameMap.length === 0) {
        alert("No eligible frames.");
        return;
      }

      (${mergeFrameGroups.toString()})(doc, frameMap, previewFolder, delay);

      // ✅ 5. Only hide the folders we merged from
      for (var i = 0; i < selectedFolders.length; i++) {
        selectedFolders[i].visible = false;
      }

      alert("✅ Selected folders merged into 'anim_preview'.\\nYou can now export as GIF.");
    })();
  `;

  window.parent.postMessage(script, "*");
}
