document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("webPreviewSelectedBtn");
  const collectedFrames = [];

  btn.onclick = () => {
    collectedFrames.length = 0;
    window.open("preview.html", "_blank");
    parent.postMessage("EXPORT_SELECTED_ANIM_FRAMES", "*");
    console.log("▶️ Preview Selected button clicked");
  };

  window.addEventListener("message", (event) => {
    if (event.data instanceof ArrayBuffer) {
      collectedFrames.push(event.data);
    } else if (typeof event.data === "string") {
      console.log("📩 Message from Photopea:", event.data);

      if (event.data.startsWith("✅")) {
        if (collectedFrames.length === 0) {
          alert("❌ No frames received.");
          return;
        }

        // Delay to ensure preview tab loads
        setTimeout(() => {
          const previewTab = [...window.open().parent.frames].find(f => f.location && f.location.href.includes("preview.html"));
          if (previewTab) {
            previewTab.postMessage(collectedFrames, "*");
            console.log("📨 Sent frames to preview.html");
          }
        }, 1000);
      } else if (event.data.startsWith("❌")) {
        alert(event.data);
      }
    }
  });
});
