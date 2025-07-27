window.addEventListener("message", (event) => {
  if (event.data !== "EXPORT_SELECTED_ANIM_FRAMES") return;

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

      var i = sel.layers.length - 1;

      function exportNext() {
        if (i < 0) {
          app.activeDocument = temp;
          temp.close(SaveOptions.DONOTSAVECHANGES);
          app.echoToOE("✅ All PNGs sent");
          return;
        }

        var layer = sel.layers[i];
        i--;

        if (!layer.visible || layer.locked || layer.kind === undefined) {
          exportNext();
          return;
        }

        app.activeDocument = temp;
        while (temp.layers.length > 0) temp.layers[0].remove();

        app.activeDocument = doc;
        doc.activeLayer = layer;
        layer.duplicate(temp, ElementPlacement.PLACEATBEGINNING);

        app.activeDocument = temp;
        var png = temp.saveToOE("png");
        app.sendToOE(png); // ✅ Sends PNG as ArrayBuffer to browser

        exportNext();
      }

      exportNext();
    } catch (e) {
      app.echoToOE("❌ ERROR: " + e.message);
    }
  })();
  `;

  parent.postMessage(script, "*");
  console.log("📤 Sent PNG export script to Photopea");
});
