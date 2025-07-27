// browser_preview_loader.js
document.addEventListener("DOMContentLoaded", () => {
  const selectedBtn = document.getElementById("webPreviewSelectedBtn");

  let previewWindow = null;
  let collectedFrames = [];

  selectedBtn.onclick = () => {
    console.clear();
    console.log("▶️ Preview Selected button clicked");

    // Check selected layer
    const script = `
      (function () {
        try {
          var doc = app.activeDocument;
          var sel = doc.activeLayer;
          if (!sel || !sel.layers || !sel.name.startsWith("anim_")) {
            app.echoToOE("❌ Please select an anim_* folder");
            return;
          }

          var tempDoc = app.documents.add(doc.width, doc.height, doc.resolution, "_temp_export", NewDocumentMode.RGB);

          for (var i = sel.layers.length - 1; i >= 0; i--) {
            var layer = sel.layers[i];
            if (layer.kind !== undefined && !layer.locked) {
              app.activeDocument = tempDoc;
              while (tempDoc.layers.length > 0) tempDoc.layers[0].remove();

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

    collectedFrames = [];
    previewWindow = window.open("preview.html", "_blank");
    setTimeout(() => parent.postMessage(script, "*"), 500); // Allow new tab to load
    console.log("📤 Export script sent to Photopea");
  };

  window.addEventListener("message", (event) => {
    if (event.data instanceof ArrayBuffer) {
      collectedFrames.push(event.data);
    } else if (typeof event.data === "string") {
      console.log("📩 From Photopea:", event.data);

      if (event.data === "done") {
        if (collectedFrames.length === 0) {
          alert("❌ No frames received.");
          return;
        }

        if (previewWindow && previewWindow.postMessage) {
          previewWindow.postMessage(collectedFrames, "*");
          console.log(`✅ Sent ${collectedFrames.length} frames to preview window`);
        } else {
          alert("❌ Preview tab not ready.");
        }

        collectedFrames = [];
      } else if (event.data.startsWith("❌")) {
        alert(event.data);
      }
    }
  });
});
