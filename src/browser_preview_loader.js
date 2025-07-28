document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("webPreviewSelectedBtn");
  const collectedFrames = [];
  let previewTab = null;

  btn.onclick = () => {
    collectedFrames.length = 0;
    previewTab = window.open("preview.html", "_blank");

    setTimeout(() => {
      const exportScript = `
        (function () {
          try {
            var doc = app.activeDocument;
            if (!doc || doc.layers.length === 0) {
              app.echoToOE("❌ No document or layers found.");
              return;
            }

            var selectedGroup = null;
            for (var i = 0; i < doc.layers.length; i++) {
              var layer = doc.layers[i];
              if (layer.typename === "LayerSet" && layer.selected && layer.name.indexOf("anim_") === 0) {
                selectedGroup = layer;
                break;
              }
            }

            if (!selectedGroup) {
              app.echoToOE("❌ Selection is not inside an anim_* folder.");
              return;
            }

            // Create temp doc
            var tempDoc = app.documents.add(doc.width, doc.height, doc.resolution, "_temp_export", NewDocumentMode.RGB);

            for (var i = selectedGroup.layers.length - 1; i >= 0; i--) {
              var frameLayer = selectedGroup.layers[i];
              if (!frameLayer.locked && frameLayer.kind !== undefined) {
                app.activeDocument = tempDoc;

                // Clear temp doc before adding frame
                for (var j = tempDoc.layers.length - 1; j >= 0; j--) {
                  tempDoc.layers[j].remove();
                }

                app.activeDocument = doc;
                doc.activeLayer = frameLayer;
                frameLayer.duplicate(tempDoc, ElementPlacement.PLACEATBEGINNING);

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

      parent.postMessage(exportScript, "*");
      console.log("▶️ Started frame export from selected anim_* folder");
    }, 300);
  };

  window.addEventListener("message", (event) => {
    if (event.data instanceof ArrayBuffer) {
      collectedFrames.push(event.data);
      console.log("🧩 Frame received:", collectedFrames.length);
    } else if (typeof event.data === "string") {
      console.log("📩 Message from Photopea:", event.data);

      if (event.data === "done") {
        if (!collectedFrames.length) {
          alert("❌ No frames received");
          return;
        }

        setTimeout(() => {
          previewTab?.postMessage(collectedFrames, "*");
          console.log("📨 Sent frames to preview tab");
        }, 500);
      } else if (event.data.startsWith("❌")) {
        alert(event.data);
      }
    }
  });
});
