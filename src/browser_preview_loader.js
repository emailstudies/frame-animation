// ✅ browser_preview_loader.js

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("webPreviewSelectedBtn");
  const collectedFrames = [];
  let previewOpened = false;
  let previewWindow = null;

  btn.onclick = () => {
    if (previewOpened && previewWindow && !previewWindow.closed) {
      previewWindow.close();
    }

    collectedFrames.length = 0;
    previewOpened = false;
    previewWindow = window.open("preview.html", "FlipbookPreviewTab");
    console.log("🪟 Preview tab opened");
  };

  window.addEventListener("message", (event) => {
    if (event.data === "READY_FOR_FRAMES") {
      console.log("✅ Preview tab ready");
      console.log("▶️ Starting frame export");
      parent.postMessage("EXPORT_SELECTED_ANIM_FRAMES", "*");
      return;
    }

    if (event.data instanceof ArrayBuffer) {
      collectedFrames.push(event.data);
      return;
    }

    if (typeof event.data === "string") {
      console.log("📩 Message from Photopea:", event.data);

      if (event.data === "done") {
        if (collectedFrames.length === 0) {
          alert("❌ No frames received.");
          return;
        }

        console.log("✅ All frames received, sending to preview");
        previewOpened = true;
        previewWindow?.postMessage(collectedFrames, "*");
        return;
      }

      if (event.data.startsWith("❌")) {
        alert(event.data);
      }
    }
  });
});
