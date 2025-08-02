function exportPreviewFramesToFlipbook() {
  const previewWindow = window.open("flipbook.html", "_blank");

  // Step 1: Wait for flipbook to say it's ready
  const handleReady = function (e) {
    if (e.data === "ready-for-frames") {
      window.removeEventListener("message", handleReady);
      exportOneFrame();
    }
  };
  window.addEventListener("message", handleReady);

  function exportOneFrame() {
    const handleFrame = function (e) {
      if (e.data instanceof ArrayBuffer) {
        const base64 = "data:image/png;base64," + btoa(
          String.fromCharCode(...new Uint8Array(e.data))
        );
        console.log("🟢 Received first frame");

        // Send it to the flipbook
        previewWindow.postMessage({
          type: "frames",
          data: [base64],
        }, "*");
      } else if (e.data === "done") {
        console.log("✅ Photopea finished saveToOE");
        window.removeEventListener("message", handleFrame);
      }
    };

    window.addEventListener("message", handleFrame);

    const script = `
      var f = app.activeDocument.layers.find(l => l.name === "anim_preview" && l.type === "layerSection");
      if (f) {
        f.layers.forEach((l, i) => l.visible = (i === 0));
        app.activeDocument.saveToOE("png");
      } else {
        app.echoToOE("❌ anim_preview not found");
      }
    `;
    console.log("🛠 Sending save script for layer 0");
    parent.postMessage(script, "*");
  }
}
