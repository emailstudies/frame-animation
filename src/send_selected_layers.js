window.addEventListener("message", (event) => {
  if (event.data === "EXPORT_SELECTED_ANIM_FRAMES") {
    const script = `
      (function () {
        try {
          var doc = app.activeDocument;
          if (!doc) {
            app.echoToOE("❌ No document open.");
            return;
          }

          var selectedLayer = doc.activeLayer;
          if (!selectedLayer || !selectedLayer.parent || selectedLayer.parent === doc) {
            app.echoToOE("❌ Please select a layer inside an anim_* folder.");
            return;
          }

          var group = selectedLayer.parent;
          if (!group.name.startsWith("anim_")) {
            app.echoToOE("❌ Selection is not inside an anim_* folder.");
            return;
          }

          var frames = group.layers.slice().reverse(); // Frame 1 at bottom
          var original = app.activeDocument;
          var tempDoc = app.documents.add(original.width, original.height, original.resolution, "_temp_preview", NewDocumentMode.RGB);

          for (var i = 0; i < frames.length; i++) {
            var layer = frames[i];
            app.echoToOE("🔎 Frame " + (i + 1) + ": " + layer.name + " | visible=" + layer.visible + ", locked=" + layer.locked + ", kind=" + layer.kind);

            // Skip if not a usable raster/text/smart object
            if (layer.kind !== undefined && !layer.locked && layer.visible) {
              // Clear temp doc
              app.activeDocument = tempDoc;
              while (tempDoc.layers.length > 0) tempDoc.layers[0].remove();

              // Duplicate current frame layer
              app.activeDocument = original;
              original.activeLayer = layer;
              layer.duplicate(tempDoc, ElementPlacement.PLACEATBEGINNING);

              app.activeDocument = tempDoc;
              var png = tempDoc.saveToOE("png");
              app.sendToOE(png);
              app.echoToOE("✅ Sent frame " + (i + 1));
            } else {
              app.echoToOE("⏭️ Skipped frame " + (i + 1));
            }
          }

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
