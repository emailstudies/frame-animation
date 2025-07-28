document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("webPreviewSelectedBtn");
  const collectedFrames = [];

  let previewTab = null;
  let previewTabReady = false;

  btn.onclick = () => {
    collectedFrames.length = 0;
    previewTabReady = false;

    console.log("🪟 Opening preview tab...");
    previewTab = window.open("preview.html", "_blank");

    // Wait for preview tab to confirm it's ready
    const waitForPreview = setInterval(() => {
      if (previewTabReady) {
        clearInterval(waitForPreview);
        console.log("▶️ Starting frame export");
        parent.postMessage("EXPORT_SELECTED_ANIM_FRAMES", "*");
      }
    }, 200);
  };

  window.addEventListener("message", (event) => {
    const data = event.data;

    if (typeof data === "string") {
      if (data === "READY_FOR_FRAMES") {
        console.log("✅ Preview tab ready");
        previewTabReady = true;
        return;
      }

      console.log("📩 Message from Photopea:", data);

      if (data === "done") {
        console.log(`📦 All frames received: ${collectedFrames.length} total`);
        if (collectedFrames.length === 0) {
          alert("❌ No frames received.");
          return;
        }

        previewTab.postMessage(collectedFrames, "*");
        console.log("📤 Sent frames to preview tab");
      }

      if (data.startsWith("❌") || data.startsWith("⏭️") || data.startsWith("✅") || data.startsWith("🔎")) {
        console.log(data); // Extra debug logs from export script
      }
    } else if (data instanceof ArrayBuffer) {
      collectedFrames.push(data);
      console.log(`🖼️ Frame ${collectedFrames.length} received (${data.byteLength} bytes)`);
    }
  });
});
