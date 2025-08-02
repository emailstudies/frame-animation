function exportPreviewFramesToFlipbook() {
  const previewWindow = window.open("flipbook.html", "_blank");

  // Step 1: Wait for flipbook to signal it's ready
  const handleReady = function (e) {
    if (e.data === "ready-for-frames") {
      window.removeEventListener("message", handleReady);
      exportTopmostFrame();
    }
  };
  window.addEventListener("message", handleReady);

  // Step 2: Export only the topmost layer of anim_preview
  function exportTopmostFrame() {
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

    // ✅ Script to find anim_preview and export topmost visible frame
    const script = `
      var f = null;
      for (var i = 0; i < app.activeDocument.layers.length; i++) {
        var layer = app.activeDocument.layers[i];
        if (layer.name === "anim_preview" && layer.type === "layerSection") {
          f = layer;
          break;
        }
      }

      if (f && f.layers.length > 0) {
        var topIndex = f.layers.length - 1;
        var target = f.layers[topIndex];

        app.echoToOE("✅ Exporting layer: " + target.name + ", type: " + target.type);

        for (var i = 0; i < f.layers.length; i++) {
          f.layers[i].visible = (i === topIndex);
        }

        app.activeDocument.saveToOE("png");
      } else {
        app.echoToOE("❌ anim_preview not found or empty");
      }
    `;

    console.log("🛠 Sending save script for topmost frame");
    parent.postMessage(script, "*");
  }
}
