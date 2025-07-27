document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("previewSelectedBtn");

  if (!btn) {
    console.error("❌ Button not found");
    return;
  }

  btn.onclick = () => {
    // Step 1: Ask Photopea to export active layer as PNG
    const script = `
      var doc = app.activeDocument;
      if (!doc || !doc.activeLayer) {
        app.echoToOE("❌ No active layer.");
      } else {
        app.activeDocument.saveToOE("png", [doc.activeLayer]);
        app.echoToOE("✅ Sent PNG layer.");
      }
    `;
    parent.postMessage(script, "*");
    console.log("📤 Sent script to Photopea.");
  };

  // Step 2: Listen for Photopea response
  window.addEventListener("message", (event) => {
    if (event.data instanceof ArrayBuffer) {
      console.log("📥 Received PNG from Photopea");

      // Optional: display the image in a new tab
      const blob = new Blob([event.data], { type: "image/png" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");

    } else if (typeof event.data === "string") {
      console.log("📩 Message from Photopea:", event.data);
      alert(event.data);
    }
  });
});
