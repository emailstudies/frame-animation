// send_selected_layers.js

function sendSelectedFolderLayers() {
  const script = `
    (function () {
      try {
        var doc = app.activeDocument;
        var sel = doc.activeLayer;

        if (!sel || sel.typename !== "LayerSet" || !sel.name.startsWith("anim_")) {
          app.echoToOE("❌ Please select an anim_* folder.");
          return;
        }

        var tempDoc = app.documents.add(doc.width, doc.height, doc.resolution, "temp_anim_export", NewDocumentMode.RGB);

        // Duplicate all layers from selected anim_* folder to new doc
        app.activeDocument = doc;
        for (var i = sel.layers.length - 1; i >= 0; i--) {
          var layer = sel.layers[i];
          if (!layer.locked && layer.kind !== undefined) {
            doc.activeLayer = layer;
            layer.duplicate(tempDoc, ElementPlacement.PLACEATBEGINNING);
          }
        }

        // Send each layer as PNG from tempDoc
        app.activeDocument = tempDoc;
        for (var i = tempDoc.layers.length - 1; i >= 0; i--) {
          tempDoc.activeLayer = tempDoc.layers[i];
          tempDoc.saveToOE("png");
        }

        tempDoc.close(SaveOptions.DONOTSAVECHANGES);
        app.echoToOE("done");
      } catch (e) {
        app.echoToOE("❌ ERROR: " + e.message);
      }
    })();
  `;

  parent.postMessage(script, "*");
  console.log("📤 Export script sent to Photopea");
}

// Export function
window.sendSelectedFolderLayers = sendSelectedFolderLayers;
