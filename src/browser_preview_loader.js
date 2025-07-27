// browser_preview_loader.js

let previewTab = null;
let collectedFrames = [];

window.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("webPreviewSelectedBtn");

  if (!btn) {
    console.error("❌ webPreviewSelectedBtn not found");
    return;
  }

  btn.onclick = () => {
    collectedFrames = []; // Clear previous run

    const selectedAnim = parent?.Photopea?.app?.activeDocument?.activeLayer;
    console.log("📌 Clicked Web Preview Selected");

    // Open new preview tab early to avoid popup blocker
    previewTab = window.open("preview.html", "_blank");
    if (!previewTab) {
      alert("❌ Failed to open preview tab. Please allow popups.");
      return;
    }

    window.sendSelectedFrames(); // Defined in send_selected_layers.js
  };
});

// Receive PNG frames from Photopea
window.addEventListener("message", (event) => {
  if (event.data instanceof ArrayBuffer) {
    console.log("📥 Got a frame");
    collectedFrames.push(event.data);
  } else if (typeof event.data === "string") {
    console.log("📩 Message from Photopea:", event.data);

    if (event.data === "done") {
      console.log("✅ Done received. Total frames:", collectedFrames.length);

      if (collectedFrames.length === 0) {
        alert("❌ No frames received.");
        previewTab?.close();
        return;
      }

      previewTab?.postMessage({ type: "frames", frames: collectedFrames }, "*");
    } else if (event.data.startsWith("❌")) {
      console.warn("⚠️ Error from Photopea:", event.data);
      alert(event.data);
      previewTab?.close();
    }
  }
});
