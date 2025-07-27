document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("webPreviewSelectedBtn");
  const collectedFrames = [];
  let previewWindow = null;
  let previewReady = false;

  btn.onclick = () => {
    collectedFrames.length = 0;
    previewReady = false;

    // Step 1: Open preview.html
    previewWindow = window.open("preview.html", "_blank");
    console.log("🪟 Preview tab opened");

    // Step 2: Wait until preview tab is ready
    const waitForReady = setInterval(() => {
      if (previewReady) {
        clearInterval(waitForReady);
        parent.postMessage("EXPORT_SELECTED_ANIM_FRAMES", "*");
        console.log("▶️ Starting frame export");
      }
    }, 100);
  };

  // Step 3: Handle responses
  window.addEventListener("message", (event) => {
    if (event.data === "READY_FOR_FRAMES") {
      previewReady = true;
      console.log("✅ Preview tab ready");
    } else if (event.data instanceof ArrayBuffer) {
      console.log("📥 Frame received");
      collectedFrames.push(event.data);
    } else if (typeof event.data === "string") {
      console.log("📩 Message from Photopea:", event.data);

      if (event.data.startsWith("✅")) {
        if (collectedFrames.length === 0) {
          alert("❌ No frames received.");
          return;
        }

        // Send frames to preview tab
        previewWindow.postMessage(collectedFrames, "*");
        console.log("📨 Frames sent to preview tab");
      } else if (event.data.startsWith("❌")) {
        alert(event.data);
      }
    }
  });
});
