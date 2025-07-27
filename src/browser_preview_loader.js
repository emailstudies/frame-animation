document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("webPreviewSelectedBtn");
  if (!button) return;

  let collectedFrames = [];
  let previewTab;

  button.onclick = () => {
    collectedFrames = [];
    previewTab = window.open("preview.html", "_blank");
    window.sendSelectedFrames();
  };

  window.addEventListener("message", (event) => {
    if (event.data instanceof ArrayBuffer) {
      collectedFrames.push(event.data);
    } else if (typeof event.data === "string") {
      console.log("📩 Message:", event.data);

      if (event.data === "done") {
        if (collectedFrames.length === 0) {
          alert("❌ No frames received.");
          previewTab?.close();
          return;
        }

        previewTab?.postMessage({ type: "frames", frames: collectedFrames }, "*");
      } else if (event.data.startsWith("❌")) {
        alert(event.data);
        previewTab?.close();
      }
    }
  });
});
