window.sendSelectedFrames = function () {
  const script = `
    (function () {
      try {
        var doc = app.activeDocument;
        var selected = doc.activeLayer;

        if (!selected || selected.typename !== "LayerSet" || !selected.name.startsWith("anim_")) {
          app.echoToOE("❌ Please select an 'anim_*' folder.");
          return;
        }

        var tempDoc = app.documents.add(doc.width, doc.height, doc.resolution, "_temp_export", NewDocumentMode.RGB);

        var frames = selected.layers;
        for (var i = frames.length - 1; i >= 0; i--) {
          var frame = frames[i];
          if (frame.kind !== undefined && !frame.locked) {
            // Switch to tempDoc and clear it
            app.activeDocument = tempDoc;
            while (tempDoc.layers.length > 0) {
              try { tempDoc.layers[0].remove(); } catch (e) {}
            }

            // Duplicate frame into tempDoc
            app.activeDocument = doc;
            doc.activeLayer = frame;
            frame.duplicate(tempDoc, ElementPlacement.PLACEATBEGINNING);

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
  console.log("📤 Export script sent to Photopea.");
};
