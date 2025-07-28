// ✅ browser_preview_loader.js (fixed, modular, preview-compatible)

const webPreviewBtn = document.getElementById("webPreviewSelectedBtn");
let collectedFrames = [];
let previewTab = null;
let previewReady = false;

webPreviewBtn.onclick = () => {
  collectedFrames = [];
  previewReady = false;

  console.log("🪟 Opening preview tab...");
  previewTab = window.open("preview.html", "_blank");
};

window.addEventListener("message", (event) => {
  if (event.data === "READY_FOR_FRAMES") {
    console.log("✅ Preview tab ready");
    previewReady = true;

    console.log("▶️ Starting frame export");
    parent.postMessage("EXPORT_SELECTED_ANIM_FRAMES", "*");
    return;
  }

  if (event.data instanceof ArrayBuffer) {
    collectedFrames.push(event.data);
  } else if (typeof event.data === "string") {
    console.log("📩 Message from Photopea:", event.data);

    if (event.data === "done") {
      console.log("📦 All frames received:", collectedFrames.length, "total");

      if (collectedFrames.length === 0) {
        alert("❌ No frames received.");
        return;
      }

      // Send each frame individually as ArrayBuffer to preview tab
      if (previewTab && previewReady) {
        for (let frame of collectedFrames) {
          previewTab.postMessage(frame, "*");
        }
        console.log("🚀 Sent all frames to preview tab");
      } else {
        alert("❌ Preview tab not ready to receive frames.");
      }
    } else if (event.data.startsWith("❌")) {
      alert(event.data);
    }
  }
});
