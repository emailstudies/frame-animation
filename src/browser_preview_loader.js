/*document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("webPreviewSelectedBtn");

  if (!btn) {
    console.error("❌ Button not found");
    return;
  }

  btn.onclick = () => {
    const script = `
      (function () {
        try {
          var original = app.activeDocument;
          if (!original || !original.activeLayer) {
            app.echoToOE("❌ No active document or layer.");
            return;
          }

          var layer = original.activeLayer;

          // Create new document same size
          var tempDoc = app.documents.add(original.width, original.height, original.resolution, "export_layer", NewDocumentMode.RGB);

          // Focus original and select the active layer
          app.activeDocument = original;
          original.activeLayer = layer;

          // Duplicate to temp doc
          layer.duplicate(tempDoc, ElementPlacement.PLACEATBEGINNING);

          // Focus temp doc and export
          app.activeDocument = tempDoc;
          tempDoc.saveToOE("png");
          app.echoToOE("✅ PNG layer sent.");
          tempDoc.close(SaveOptions.DONOTSAVECHANGES);
        } catch (e) {
          app.echoToOE("❌ ERROR: " + e.message);
        }
      })();
    `;
    parent.postMessage(script, "*");
    console.log("📤 Sent layer export script to Photopea.");
  };

  window.addEventListener("message", (event) => {
    if (event.data instanceof ArrayBuffer) {
      console.log("📥 Received PNG from Photopea");

      const blob = new Blob([event.data], { type: "image/png" });
      const url = URL.createObjectURL(blob);
      console.log("🌐 Opening preview tab:", url);
      window.open(url, "_blank");
    } else if (typeof event.data === "string") {
      console.log("📩 Message from Photopea:", event.data);
      alert(event.data);
    }
  });
});


*/
