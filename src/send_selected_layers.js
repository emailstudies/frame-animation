// send_selected_layers.js (Export selected anim_* folder as PSD)
document.addEventListener("DOMContentLoaded", () => {
  const previewBtn = document.getElementById("webPreviewSelectedBtn");

  if (!previewBtn) {
    console.error("❌ webPreviewSelectedBtn not found");
    return;
  }

  previewBtn.onclick = () => {
    const script = `
      (function () {
        try {
          var doc = app.activeDocument;
          var sel = doc.activeLayer;

          if (!sel || sel.typename !== "LayerSet" || sel.name.indexOf("anim_") !== 0) {
            app.echoToOE("❌ Please select an anim_* folder.");
            return;
          }

          // Duplicate the selected anim_* folder into a new document
          var dupDoc = app.documents.add(doc.width, doc.height, doc.resolution, "_export_psd", NewDocumentMode.RGB);
          app.activeDocument = doc;
          doc.activeLayer = sel;
          sel.duplicate(dupDoc, ElementPlacement.PLACEATBEGINNING);

          app.activeDocument = dupDoc;
          dupDoc.saveToOE("psd");
          dupDoc.close(SaveOptions.DONOTSAVECHANGES);

          app.echoToOE("✅ PSD exported");
        } catch (e) {
          app.echoToOE("❌ ERROR: " + e.message);
        }
      })();
    `;

    parent.postMessage(script, "*");
    console.log("📤 Export PSD script sent to Photopea");
  };
});
