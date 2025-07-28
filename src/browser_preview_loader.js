// ✅ browser_preview_loader.js (modular, stable, flipbook-ready)

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

      // Send to preview tab via postMessage
      if (previewTab && previewTabReady) {
        previewTab.postMessage({ type: "FRAMES", frames: collectedFrames }, "*");
        console.log("🚀 Sent frames to preview tab");
      } else {
        alert("❌ Preview tab not ready to receive frames.");
      }
    } else if (event.data.startsWith("❌")) {
      alert(event.data);
    }
  }
});
