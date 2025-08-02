document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("webPreviewAllBtn");

  if (!btn) {
    console.error("❌ Button not found");
    return;
  }

  btn.onclick = () => {
    const script = `
      try {
        exportGif();                             // Already creates anim_preview
        app.activeDocument.saveToOE("png");      // Export the current doc as PNG
        app.echoToOE("done");                    // Signal that it’s done
      } catch (e) {
        app.echoToOE("❌ " + e.message);
      }
    `;
    parent.postMessage(script, "*");
    console.log("📤 Sent script to run exportGif + saveToOE(PNG)");
  };

  window.addEventListener("message", (event) => {
    if (event.data instanceof ArrayBuffer) {
      console.log("📥 Received PNG from Photopea");

      const blob = new Blob([event.data], { type: "image/png" });
      const url = URL.createObjectURL(blob);
      console.log("🌐 Opening preview tab:", url);
      window.open(url, "_blank");
      return;
    }

    if (typeof event.data === "string") {
      console.log("📩 Message from Photopea:", event.data);

      if (event.data.trim() === "done") {
        alert("✅ PNG preview complete!");
      } else if (event.data.startsWith("❌")) {
        alert("❌ Error from Photopea:\n" + event.data);
      }
    }
  });
});
