function exportPreviewFramesToFlipbook() {
  const previewWindow = window.open("flipbook.html", "_blank");

  // Step 1: Wait for flipbook to be ready
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

      if (typeof e.data === "string" && e.data === "done") {
        console.log("✅ Received 'done' from Photopea");
        gotDone = true;
      }

      if (base64Image && gotDone) {
        window.removeEventListener("message", handleFrame);
        console.log("🚀 Sending frame to flipbook");

        previewWindow.postMessage({
          type: "frames",
          data: [base64Image],
        }, "*");
      }
    };

    window.addEventListener("message", handleFrame);

    // ✅ Send only a string as postMessage to Photopea
    const script = `
      var f = null;
      for (var i = 0; i < app.activeDocument.layers.length; i++) {
        var layer = app.activeDocument.layers[i];
        if (layer.name === "anim_preview" && layer.type === "layerSection") {
          f = layer;
          break;
        }
      }

      if (f) {
        for (var i = 0; i < f.layers.length; i++) {
          f.layers[i].visible = (i === 0);
        }
        app.activeDocument.saveToOE("png");
      } else {
        app.echoToOE("❌ anim_preview not found");
      }
    `;

    console.log("🛠 Sending save script for layer 0");
    parent.postMessage(script, "*"); // ✅ Only string sent to Photopea
  }
}
