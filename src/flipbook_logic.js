// flipbook_logic.js

window.runSelectedFlipbookPreview = function () {
  console.log("\uD83D\uDE80 runSelectedFlipbookPreview triggered");

  const script = `
    (function () {
      try {
        var doc = app.activeDocument;
        if (!doc) {
          app.echoToOE("\u274C No active document.");
          return;
        }

        var animGroup = null;
        for (var i = 0; i < doc.layers.length; i++) {
          var layer = doc.layers[i];
          if (layer.typename === "LayerSet" && layer.name === "anim_preview") {
            animGroup = layer;
            break;
          }
        }

        if (!animGroup) {
          app.echoToOE("\u274C anim_preview group not found.");
          return;
        }

        var tempDoc = app.documents.add(doc.width, doc.height, doc.resolution, "_temp_export", NewDocumentMode.RGB);

        for (var i = 0; i < animGroup.layers.length; i++) {
          for (var j = 0; j < animGroup.layers.length; j++) {
            animGroup.layers[j].visible = false;
          }

          var frame = animGroup.layers[i];
          frame.visible = true;

          app.activeDocument = doc;
          doc.activeLayer = frame;

          app.refresh();

          frame.duplicate(tempDoc, ElementPlacement.PLACEATBEGINNING);

          app.activeDocument = tempDoc;

          if (tempDoc.artLayers.length > 0) {
            tempDoc.saveToOE("png");
            app.echoToOE("\u2705 Exported frame " + i + ": " + frame.name);
            tempDoc.activeLayer.remove();
          } else {
            app.echoToOE("\u26A0\uFE0F Frame " + i + " is empty.");
          }
        }

        for (var j = 0; j < animGroup.layers.length; j++) {
          animGroup.layers[j].visible = true;
        }

        app.activeDocument = tempDoc;
        tempDoc.close(SaveOptions.DONOTSAVECHANGES);
        app.echoToOE("done");
      } catch (e) {
        app.echoToOE("\u274C ERROR: " + e.message);
      }
    })();
  `;

  parent.postMessage(script, "*");
};
