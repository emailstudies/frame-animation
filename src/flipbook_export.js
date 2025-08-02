// flipbook_export.js

document.addEventListener("DOMContentLoaded", () => {
  const collectedFrames = [];
  let previewTab = null;

  // Expose this to global for external use (like from app.js)
  window.exportPreviewFramesToFlipbook = () => {
    collectedFrames.length = 0;
    previewTab = window.open("flipbook.html", "_blank");

    setTimeout(() => {
      parent.postMessage("EXPORT_ANIM_PREVIEW_FRAMES", "*");
      console.log("▶️ Started anim_preview export");
    }, 300);
  };

  window.addEventListener("message", (event) => {
    if (event.data instanceof ArrayBuffer) {
      collectedFrames.push(event.data);
      console.log("🧩 Frame received:", collectedFrames.length);
    } else if (typeof event.data === "string") {
      console.log("📩 Message from Photopea:", event.data);

      if (event.data.startsWith("✅")) {
        if (!collectedFrames.length) {
          alert("❌ No frames received");
          return;
        }

        // Wait for flipbook.html to load, then send frames
        setTimeout(() => {
          previewTab?.postMessage(collectedFrames, "*");
          console.log("📨 Sent frames to flipbook tab");
        }, 500);
      } else if (event.data.startsWith("❌")) {
        alert(event.data);
      }
    }
  });
});
