function exportPreviewFramesToFlipbook() {
  const previewWindow = window.open("flipbook.html", "_blank");
  const collectedFrames = [];

  let frameIndex = 0;
  let layerCount = 0;

  // Step 1: wait for flipbook to say it's ready
  const waitForReady = function (e) {
    if (e.data === "ready-for-frames") {
      window.removeEventListener("message", waitForReady);
      startFrameExport();
    }
  };
  window.addEventListener("message", waitForReady);

  // Step 2: count anim_preview layers
  const countScript = `
    var f = app.activeDocument.layers.find(l => l.name === "anim_preview" && l.type === "layerSection");
    app.echoToOE(f ? f.layers.length.toString() : "0");
  `;
  window.addEventListener("message", function handleCount(e) {
    if (typeof e.data === "string" && /^\d+$/.test(e.data)) {
      layerCount = parseInt(e.data);
      console.log("📦 Frame count:", layerCount);
      window.removeEventListener("message", handleCount);
      // hide all preview layers first
      const hideScript = `
        var f = app.activeDocument.layers.find(l => l.name === "anim_preview" && l.type === "layerSection");
        if (f) f.layers.forEach(l => l.visible = false);
      `;
      parent.postMessage(hideScript, "*");
    }
  });
  parent.postMessage(countScript, "*");

  // Step 3: export each frame as PNG
  function startFrameExport() {
    requestNextFrame();
  }

  function requestNextFrame() {
    const handleFrame = function (e) {
      if (e.data instanceof ArrayBuffer) {
        const base64 = "data:image/png;base64," + btoa(
          String.fromCharCode(...new Uint8Array(e.data))
        );
        collectedFrames.push(base64);
        console.log("🖼️ Frame", frameIndex, "captured");
      } else if (e.data === "done") {
        window.removeEventListener("message", handleFrame);
        frameIndex++;
        if (frameIndex < layerCount) {
          requestNextFrame();
        } else {
          console.log("🚀 Sending", collectedFrames.length, "frames to flipbook");
          previewWindow.postMessage({ type: "frames", data: collectedFrames }, "*");
        }
      }
    };
    window.addEventListener("message", handleFrame);

    const script = `
      var f = app.activeDocument.layers.find(l => l.name === "anim_preview" && l.type === "layerSection");
      if (f) {
        f.layers.forEach((l, i) => l.visible = (i === ${frameIndex}));
        app.activeDocument.saveToOE("png");
      }
    `;
    parent.postMessage(script, "*");
  }
}
