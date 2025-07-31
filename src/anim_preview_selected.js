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

      // ✅ Collect selected anim_* folders
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

      // ✅ Determine max number of frames across selected folders
      var maxFrames = 0;
      for (var i = 0; i < selected.length; i++) {
        if (selected[i].layers.length > maxFrames) {
          maxFrames = selected[i].layers.length;
        }
      }

      var delay = ${delay};

      var previewFolder = (${createAnimPreviewFolder.toString()})(doc);
      if (!previewFolder) return;
      alert("✅ Preview folder ready.");

      (${duplicateSingleLayerFolders.toString()})(doc, maxFrames);
      alert("📌 Duplicated single-layer folders (if any).");

      var frameMap = (${buildFrameMap.toString()})(selected, maxFrames);
      if (frameMap.length === 0) {
        alert("❌ No eligible frames found in selected folders.");
        return;
      }
      alert("🧠 Frame map built: " + frameMap.length + " frames.");

      (${mergeFrameGroups.toString()})(doc, frameMap, previewFolder, delay);
      (${fadeOutAnimFolders.toString()})(doc);

      alert("✅ Selected folders merged into 'anim_preview'.\\nOther anim folders hidden.\\nExport via File > Export As > GIF.");
    })();
  `;

  window.parent.postMessage(script, "*");
}
