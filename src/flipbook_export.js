// flipbook_export.js

document.addEventListener("DOMContentLoaded", () => {
  const collectedFrames = [];
  let previewTab = null;

  window.exportPreviewFramesToFlipbook = async () => {
    collectedFrames.length = 0;

    // Step 1: Generate anim_preview using exportGif
    await exportGif(); // assumes this creates the anim_preview folder

    // Step 2: Open flipbook preview tab
    previewTab = window.open("flipbook.html", "_blank");

    // Step 3: Ask Photopea to send all frames from anim_preview
    setTimeout(() => {
      parent.postMessage("EXPORT_ANIM_PREVIEW_FRAMES", "*");
      console.log("▶️ Started anim_preview export");
    }, 300);
  };

  // Step 4: Handle frames received
  window.addEventListener("message", (event) => {
    if (event.data instanceof ArrayBuffer) {
      collectedFrames.push(event.data);
      console.log(`🧩 Frame received: ${collectedFrames.length}`);
    } else if (typeof event.data === "string") {
      console.log("📩 Message from Photopea:", event.data);

      if (event.data.startsWith("✅")) {
        if (!collectedFrames.length) {
          alert("❌ No frames received");
          return;
        }

        // Wait for the flipbook tab to be ready
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
