document.addEventListener("DOMContentLoaded", () => {
  const collectedFrames = [];
  let previewTab = null;

  document.getElementById("browserPreviewAllBtn").onclick =
  document.getElementById("browserPreviewSelectedBtn").onclick = () => {
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
