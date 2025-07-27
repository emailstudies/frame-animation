document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("previewSelectedBtn");

  if (!btn) {
    console.error("❌ Button not found");
    return;
  }

  btn.onclick = () => {
    const script = `
      (function () {
        var doc = app.activeDocument;
        if (!doc || !doc.activeLayer) {
          app.echoToOE("❌ No active layer.");
          return;
        }

        var newDoc = app.documents.add(doc.width, doc.height);
        doc.activeLayer.duplicate(newDoc, ElementPlacement.PLACEATBEGINNING);
        newDoc.activeLayer.visible = true;

        newDoc.saveToOE("png");
        app.echoToOE("✅ PNG sent.");
        newDoc.close(SaveOptions.DONOTSAVECHANGES);
      })();
    `;
    parent.postMessage(script, "*");
    console.log("📤 Sent layer export script to Photopea.");
  };

  // ✅ Just receive PNG and open in tab
  window.addEventListener("message", (event) => {
    if (event.data instanceof ArrayBuffer) {
      console.log("📥 Received PNG from Photopea");

      // Convert ArrayBuffer to blob URL and open in new tab
      const blob = new Blob([event.data], { type: "image/png" });
      const url = URL.createObjectURL(blob);
      console.log("🌐 Opening tab with:", url);
      window.open(url, "_blank");
    } else if (typeof event.data === "string") {
      console.log("📩 Message from Photopea:", event.data);
      alert(event.data);
    }
  });
});
