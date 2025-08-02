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
    let base64Image = null;
    let gotDone = false;

    const handleFrame = function (e) {
      if (e.data instanceof ArrayBuffer) {
        console.log("🟢 Received ArrayBuffer");
        base64Image = "data:image/png;base64," + btoa(
          String.fromCharCode(...new Uint8Array(e.data))
        );
      }

      if (e.data === "done") {
        console.log("✅ Received 'done' from Photopea");
        gotDone = true;
      }

      // ✅ Only send when both parts are received
      if (gotDone && base64Image) {
        window.removeEventListener("message", handleFrame);
        console.log("🚀 Sending frame to flipbook");
        previewWindow.postMessage({
          type: "frames",
          data: [base64Image],
        }, "*");
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
