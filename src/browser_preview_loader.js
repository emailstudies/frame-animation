document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("webPreviewSelectedBtn");
  let previewWin = null;
  let collectedFrames = [];

  btn.onclick = () => {
    collectedFrames = [];
    console.log("🪟 Opening preview tab...");
    previewWin = window.open("preview.html", "_blank");
  };

  // Wait for READY signal from preview.html
  window.addEventListener("message", (event) => {
    if (event.data === "READY_FOR_FRAMES") {
      console.log("✅ Preview tab ready");
      console.log("▶️ Starting frame export");
      parent.postMessage("EXPORT_SELECTED_ANIM_FRAMES", "*");
      return;
    }

    // Receive image buffers
    if (event.data instanceof ArrayBuffer) {
      collectedFrames.push(event.data);
      return;
    }

    // On done, send to preview
    if (event.data === "done") {
      if (collectedFrames.length === 0) {
        alert("❌ No frames received.");
        return;
      }

      console.log("📤 Sending", collectedFrames.length, "frames to preview tab");
      previewWin?.postMessage(collectedFrames, "*");
    }
  });
});
