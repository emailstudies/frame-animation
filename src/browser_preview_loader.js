document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("webPreviewSelectedBtn");
  const collectedFrames = [];
  let previewWin = null;
  let previewReady = false;

  btn.onclick = () => {
    collectedFrames.length = 0;
    previewReady = false;

    // 🪟 Open the preview tab
    console.log("🪟 Opening preview tab...");
    previewWin = window.open("preview.html");

    // Wait for "READY_FOR_FRAMES" before triggering export
  };

  window.addEventListener("message", (event) => {
    if (event.data === "READY_FOR_FRAMES") {
      console.log("✅ Preview tab ready");
      previewReady = true;

      // Trigger export now that preview is ready
      console.log("▶️ Starting frame export");
      parent.postMessage("EXPORT_SELECTED_ANIM_FRAMES", "*");
    }

    // Handle incoming frames from Photopea
    else if (event.data instanceof ArrayBuffer) {
      collectedFrames.push(event.data);
    }

    // Handle end-of-export signal
    else if (typeof event.data === "string") {
      console.log("📩 Message from Photopea:", event.data);

      if (event.data === "done") {
        console.log("📦 All frames received:", collectedFrames.length, "total");

        if (collectedFrames.length === 0) {
          alert("❌ No frames received.");
          return;
        }

        // Send all frames to preview tab
        collectedFrames.forEach((ab) => {
          previewWin.postMessage(ab, "*");
        });

        // Finally, notify preview to start playback
        previewWin.postMessage("done", "*");
      } else if (event.data.startsWith("❌")) {
        alert(event.data);
      }
    }
  });
});
