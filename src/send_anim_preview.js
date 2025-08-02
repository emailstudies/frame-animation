// send_anim_preview.js

window.addEventListener("message", (event) => {
  if (event.data !== "EXPORT_ANIM_PREVIEW_FRAMES") return;

  const script = `
    (function () {
      try {
        var doc = app.activeDocument;
        var previewFolder = null;

        for (var i = 0; i < doc.layerSets.length; i++) {
          if (doc.layerSets[i].name === "anim_preview") {
            previewFolder = doc.layerSets[i];
            break;
          }
        }

        if (!previewFolder) {
          app.echoToOE("❌ 'anim_preview' folder not found.");
          return;
        }

        var numLayers = previewFolder.layers.length;
        app.echoToOE("📂 Found anim_preview with " + numLayers + " layers");

        if (numLayers === 0) {
          app.echoToOE("❌ 'anim_preview' has no layers.");
          return;
        }

        var temp = app.documents.add(
          doc.width,
          doc.height,
          doc.resolution,
          "_temp_export",
          NewDocumentMode.RGB
        );

        for (var i = previewFolder.layers.length - 1; i >= 0; i--) {
          var layer = previewFolder.layers[i];
          if (layer.kind !== undefined && !layer.locked) {
            app.echoToOE("🔁 Exporting frame: " + layer.name);

            app.activeDocument = temp;
            while (temp.layers.length > 0) temp.layers[0].remove();

            app.activeDocument = doc;
            doc.activeLayer = layer;
            layer.duplicate(temp, ElementPlacement.PLACEATBEGINNING);

            app.activeDocument = temp;
            var png = temp.saveToOE("png");
            app.sendToOE(png);
          } else {
            app.echoToOE("⏭️ Skipping locked or invalid layer: " + layer.name);
          }
        }

        app.activeDocument = temp;
        temp.close(SaveOptions.DONOTSAVECHANGES);

        app.echoToOE("✅ Export complete");
      } catch (e) {
        app.echoToOE("❌ ERROR: " + e.message);
      }
    })();
  `;

  parent.postMessage(script, "*");
  console.log("📤 Export script sent to Photopea");
});
