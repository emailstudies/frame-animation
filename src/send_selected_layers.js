window.addEventListener("message", async (event) => {
  if (event.data !== "EXPORT_SELECTED_ANIM_FRAMES") return;

  try {
    var doc = app.activeDocument;
    if (!doc) {
      app.echoToOE("❌ No active document.");
      return;
    }

    var selected = doc.activeLayer;
    if (!selected || !selected.parent || !selected.parent.name.startsWith("anim_")) {
      app.echoToOE("❌ Please select a layer inside an anim_* folder.");
      return;
    }

    var folder = selected.parent;
    var temp = app.documents.add(doc.width, doc.height, doc.resolution, "_temp_export", NewDocumentMode.RGB);

    // Loop through layers (reverse to preserve order)
    for (var i = folder.layers.length - 1; i >= 0; i--) {
      var layer = folder.layers[i];

      if (layer.kind !== undefined && !layer.locked) {
        app.activeDocument = temp;

        // Remove existing layers
        while (temp.layers.length > 0) temp.layers[0].remove();

        // Duplicate the selected layer
        app.activeDocument = doc;
        doc.activeLayer = layer;
        layer.duplicate(temp, ElementPlacement.PLACEATBEGINNING);

        // Save and send PNG to plugin
        app.activeDocument = temp;
        var png = temp.saveToOE("png");
        app.sendToOE(png);
      }
    }

    temp.close(SaveOptions.DONOTSAVECHANGES);
    app.echoToOE("done");

  } catch (e) {
    app.echoToOE("❌ ERROR: " + e.message);
  }
});
