window.addEventListener("message", (event) => {
  if (event.data === "EXPORT_SELECTED_ANIM_FRAMES") {
    const script = `
      (function () {
        try {
          var original = app.activeDocument;
          if (!original || original.layers.length === 0) {
            app.echoToOE("❌ No valid layers found.");
            return;
          }

          // Create temporary doc only once
          var tempDoc = app.documents.add(original.width, original.height, original.resolution, "_temp_export", NewDocumentMode.RGB);

          for (var i = original.layers.length - 1; i >= 0; i--) {
            var layer = original.layers[i];
            if (layer.kind !== undefined && !layer.locked) {
              // Clear temp doc
              app.activeDocument = tempDoc;
              while (tempDoc.layers.length > 0) tempDoc.layers[0].remove();

              // Copy from original
              app.activeDocument = original;
              original.activeLayer = layer;
              layer.duplicate(tempDoc, ElementPlacement.PLACEATBEGINNING);

              // Export
              app.activeDocument = tempDoc;
              var png = tempDoc.saveToOE("png");
              app.sendToOE(png);
            }
          }

          // Close temp doc
          app.activeDocument = tempDoc;
          tempDoc.close(SaveOptions.DONOTSAVECHANGES);
          app.echoToOE("done");
        } catch (e) {
          app.echoToOE("❌ ERROR: " + e.message);
        }
      })();
    `;
    parent.postMessage(script, "*");
  }
});
