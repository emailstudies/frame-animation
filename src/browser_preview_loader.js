document.addEventListener("DOMContentLoaded", () => {
  const previewBtn = document.getElementById("webPreviewSelectedBtn");
  const collectedFrames = [];
  let previewTab = null;

  previewBtn.onclick = () => {
    collectedFrames.length = 0;
    previewTab = window.open("preview.html", "_blank");

    setTimeout(() => {
      parent.postMessage("EXPORT_SELECTED_ANIM_FRAMES", "*");
      console.log("▶️ Preview Selected button clicked");
    }, 500);
  };

  window.addEventListener("message", (event) => {
    if (event.data instanceof ArrayBuffer) {
      collectedFrames.push(event.data);
      console.log("🧩 Frame received:", collectedFrames.length);
    } else if (typeof event.data === "string") {
      console.log("📩 Message from Photopea:", event.data);

      if (event.data.startsWith("✅")) {
        if (collectedFrames.length === 0) {
          alert("❌ No frames received.");
          return;
        }

        setTimeout(() => {
          if (previewTab) {
            previewTab.postMessage(collectedFrames, "*");
            console.log("📨 Frames sent to preview tab");
          } else {
            alert("❌ Preview tab not found.");
          }
        }, 1000);
      } else if (event.data.startsWith("❌")) {
        alert(event.data);
      }
    }
  });
});
