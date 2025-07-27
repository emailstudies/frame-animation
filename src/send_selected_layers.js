document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("webPreviewSelectedBtn");

  if (!btn) return;

  btn.onclick = () => {
    const script = `
      (function () {
        try {
          var doc = app.activeDocument;
          var sel = doc.activeLayer;

          if (!sel || sel.typename !== "LayerSet" || !sel.name.startsWith("anim_")) {
            app.echoToOE("❌ Please select a single anim_* folder.");
            return;
          }

          var tempDoc = app.documents.add(doc.width, doc.height, doc.resolution, "_temp_export", NewDocumentMode.RGB);

          var frames = sel.layers;
          for (var i = frames.length - 1; i >= 0; i--) {
            var layer = frames[i];
            if (layer.kind !== undefined && !layer.locked) {
              app.activeDocument = tempDoc;
              for (var j = tempDoc.layers.length - 1; j >= 0; j--) {
                tempDoc.layers[j].remove();
              }

              app.activeDocument = doc;
              doc.activeLayer = layer;
              layer.duplicate(tempDoc, ElementPlacement.PLACEATBEGINNING);

              app.activeDocument = tempDoc;
              tempDoc.saveToOE("png");
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
    console.log("📤 Export script sent to Photopea");
  };
});
