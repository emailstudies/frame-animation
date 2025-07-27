document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("previewSelectedBtn");

  if (!btn) {
    console.error("❌ Button not found");
    return;
  }

  btn.onclick = () => {
    const safeScript = `
      (function () {
        try {
          if (!app.documents.length) {
            App.echoToOE("❌ No document open.");
            return;
          }

          var doc = app.activeDocument;
          if (!doc.activeLayer) {
            App.echoToOE("⚠️ No layer selected.");
            return;
          }

          var name = doc.activeLayer.name || "(no name)";
          App.echoToOE("✅ Active Layer Name: " + name);
        } catch (e) {
          App.echoToOE("❌ JS Exception: " + e.message);
        }
      })();
    `;

    parent.postMessage(safeScript, "*");
    console.log("📤 Sent script to Photopea.");
  };

  window.addEventListener("message", (e) => {
    if (typeof e.data === "string") {
      console.log("📩 Message from Photopea:", e.data);
      alert("📬 " + e.data);
    }
  });
});
