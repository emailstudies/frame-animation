// ✅ Unified Flipbook Controller for Photopea Plugin
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("webPreviewSelectedBtn");
  const collectedFrames = [];
  let previewTab = null;

  btn.onclick = () => {
    collectedFrames.length = 0;
    previewTab = window.open("preview.html", "_blank");

    setTimeout(() => {
      parent.postMessage("EXPORT_SELECTED_ANIM_FRAMES", "*");
      console.log("▶️ Started frame export from selected anim_* folder");
    }, 300);
  };

  window.addEventListener("message", (event) => {
    if (event.data instanceof ArrayBuffer) {
      collectedFrames.push(event.data);
      console.log("🧩 Frame received:", collectedFrames.length);
    } else if (typeof event.data === "string") {
      console.log("📩 Message from Photopea:", event.data);

      if (event.data === "done") {
        if (!collectedFrames.length) {
          alert("❌ No frames received");
          return;
        }

        // ✅ Send collected frames to preview tab
        setTimeout(() => {
          if (previewTab) {
            previewTab.postMessage(collectedFrames, "*");
            console.log("📨 Sent frames to preview tab");
          } else {
            alert("❌ Preview tab is not available.");
          }
        }, 300);
      } else if (event.data.startsWith("❌")) {
        alert(event.data);
      }
    }
  });
});
