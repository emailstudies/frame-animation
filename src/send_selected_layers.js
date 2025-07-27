window.addEventListener("message", (event) => {
  if (event.data !== "EXPORT_SELECTED_ANIM_FRAMES") return;

  const script = `
    (function () {
      try {
        var original = app.activeDocument;
        var sel = original.activeLayer;

        if (!sel || sel.typename !== "LayerSet" || !sel.name.startsWith("anim_")) {
          app.echoToOE("❌ Please select a folder starting with 'anim_'.");
          return;
        }

        var temp = app.documents.add(original.width, original.height, original.resolution, "_temp_export", NewDocumentMode.RGB);

        for (var i = sel.layers.length - 1; i >= 0; i--) {
          var frame = sel.layers[i];

          if (frame.kind !== undefined && !frame.locked) {
            // Clear temp doc
            app.activeDocument = temp;
            while (temp.layers.length > 0) temp.layers[0].remove();

            // Duplicate this frame into temp doc
            app.activeDocument = original;
            original.activeLayer = frame;
            frame.duplicate(temp, ElementPlacement.PLACEATBEGINNING);

            // Flatten and send PNG
            app.activeDocument = temp;
            var png = temp.saveToOE("png");
            app.sendToOE(png);
          }
        }

        // Cleanup
        app.activeDocument = temp;
        temp.close(SaveOptions.DONOTSAVECHANGES);
        app.echoToOE("done");
      } catch (e) {
        app.echoToOE("❌ Export error: " + e.message);
      }
    })();
  `;

  parent.postMessage(script, "*");
  console.log("📤 Export script sent to Photopea");
});
