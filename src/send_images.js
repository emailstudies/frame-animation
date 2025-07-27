document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("previewSelectedBtn");

  if (!btn) {
    console.error("❌ Button not found");
    return;
  }

  btn.onclick = () => {
    const safeScript = `
      (function () {
        if (!app.documents.length) {
          App.echoToOE("❌ No document open.");
          return;
        }

        var doc = app.activeDocument;
        if (!doc.activeLayer) {
          App.echoToOE("❌ No active layer selected.");
          return;
        }

        App.echoToOE("✅ Active Layer Name: " + doc.activeLayer.name);
      })();
    `;
    parent.postMessage(safeScript, "*");
    console.log("📤 Sent script to Photopea.");
  };

  window.addEventListener("message", (e) => {
    if (typeof e.data === "string") {
      console.log("📩 Message from Photopea:", e.data);
      alert("✅ Photopea says: " + e.data);
    }
  });
});
