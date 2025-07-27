document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("webPreviewSelectedBtn");
  let collectedFrames = [];
  let previewWindow = null;

  btn.onclick = () => {
    collectedFrames = [];
    previewWindow = window.open("preview.html", "_blank");
    console.log("🪟 Preview tab opened");
  };

  window.addEventListener("message", (event) => {
    if (event.data === "READY_FOR_FRAMES") {
      console.log("✅ Preview tab ready");
      parent.postMessage("EXPORT_SELECTED_ANIM_FRAMES", "*");
      console.log("▶️ Starting frame export");
    } else if (event.data instanceof ArrayBuffer) {
      console.log("📥 Got PNG:", event.data.byteLength);
      collectedFrames.push(event.data);
    } else if (typeof event.data === "string" && event.data.startsWith("✅")) {
      if (previewWindow && collectedFrames.length > 0) {
        previewWindow.postMessage(collectedFrames, "*");
        console.log("📨 Sent frames to preview");
      } else {
        console.warn("⚠️ No frames or preview window not found");
      }
    } else if (event.data.startsWith("❌")) {
      alert(event.data);
    }
  });
});
