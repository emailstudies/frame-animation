window.addEventListener("message", (event) => {
  if (event.data !== "EXPORT_SELECTED_ANIM_FRAMES_INLINE") return;

  const script = `
    (function () {
      try {
        var doc = app.activeDocument;
        var sel = doc.activeLayer;

        if (!sel || sel.typename !== "LayerSet" || !sel.name.startsWith("anim_")) {
          app.echoToOE("❌ Please select an 'anim_*' folder.");
          return;
        }

        var temp = app.documents.add(doc.width, doc.height, doc.resolution, "_temp_export", NewDocumentMode.RGB);

        for (var i = sel.layers.length - 1; i >= 0; i--) {
          var layer = sel.layers[i];

          if (
            layer &&
            layer.typename === "ArtLayer" &&
            !layer.locked &&
            layer.visible
          ) {
            app.activeDocument = temp;
            while (temp.layers.length > 0) temp.layers[0].remove();

            app.activeDocument = doc;
            doc.activeLayer = layer;
            layer.duplicate(temp, ElementPlacement.PLACEATBEGINNING);

            app.activeDocument = temp;
            var png = temp.saveToOE("png");
            app.sendToOE(png);
          }
        }

        temp.close(SaveOptions.DONOTSAVECHANGES);
        app.echoToOE("✅ PNGs exported");
      } catch (e) {
        app.echoToOE("❌ ERROR: " + e.message);
      }
    })();
  `;

  parent.postMessage(script, "*");
  console.log("📤 Inline export script sent to Photopea");
});
