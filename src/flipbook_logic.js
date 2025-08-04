document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("browserPreviewSelectedBtn");

  if (!btn) {
    console.error("❌ Button not found");
    return;
  }

  btn.onclick = () => {
    const script = `
      (function () {
        try {
          var doc = app.activeDocument;
          if (!doc) {
            app.echoToOE("❌ No active document.");
            return;
          }

          // Find the 'anim_preview' group
          var previewGroup = null;
          for (var i = 0; i < doc.layers.length; i++) {
            if (doc.layers[i].name === "anim_preview" && doc.layers[i].typename === "LayerSet") {
              previewGroup = doc.layers[i];
              break;
            }
          }

          if (!previewGroup) {
            app.echoToOE("❌ 'anim_preview' group not found.");
            return;
          }

          // Find the one visible layer in anim_preview
          var visibleLayers = [];
          for (var j = 0; j < previewGroup.layers.length; j++) {
            if (previewGroup.layers[j].visible) {
              visibleLayers.push(previewGroup.layers[j]);
            }
          }

          if (visibleLayers.length !== 1) {
            app.echoToOE("❌ Expected exactly 1 visible layer in 'anim_preview', found: " + visibleLayers.length);
            return;
          }

          var targetLayer = visibleLayers[0];

          // Create a new temp document and export
          var tempDoc = app.documents.add(doc.width, doc.height, doc.resolution, "export_layer", NewDocumentMode.RGB);
          app.activeDocument = doc;
          targetLayer.duplicate(tempDoc, ElementPlacement.PLACEATBEGINNING);

          app.activeDocument = tempDoc;
          tempDoc.saveToOE("png");
          app.echoToOE("✅ PNG of visible layer sent.");
          tempDoc.close(SaveOptions.DONOTSAVECHANGES);
        } catch (e) {
          app.echoToOE("❌ ERROR: " + e.message);
        }
      })();
    `;

    parent.postMessage(script, "*");
    console.log("📤 Sent script to Photopea for visible anim_preview layer export.");
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
