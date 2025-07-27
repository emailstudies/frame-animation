document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("previewSelectedBtn");

  if (!btn) {
    console.error("❌ Button not found");
    return;
  }

  btn.onclick = () => {
    const script = `
      (function () {
        // Attempt to access document and active layer
        var doc = app.activeDocument;
        var layer = doc.activeLayer;

        // Now send message to plugin
        App.echoToOE("✅ Hello from plugin, layer name: " + (layer ? layer.name : "no layer selected"));
      })();
    `;
    parent.postMessage(script, "*");
    console.log("📤 Sent script to Photopea.");
  };

  window.addEventListener("message", (e) => {
    if (typeof e.data === "string") {
      console.log("📩 Message from Photopea:", e.data);
      alert("✅ Photopea says: " + e.data);
    }
  });
});
