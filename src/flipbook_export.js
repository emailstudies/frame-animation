function exportPreviewFramesToFlipbook() {
  const previewWindow = window.open("flipbook.html", "_blank");
  const collectedFrames = [];

  let frameIndex = 0;
  let layerCount = 0;

  const waitForReady = function (e) {
    if (e.data === "ready-for-frames") {
      window.removeEventListener("message", waitForReady);
      startFrameExport();
    }
  };
  window.addEventListener("message", waitForReady);

  const hideScript = `
    var f = app.activeDocument.layers.find(l => l.name === "anim_preview" && l.type === "layerSection");
    if (f) f.layers.forEach(l => l.visible = false);
  `;
  parent.postMessage(hideScript, "*");

  const countScript = `
    var f = app.activeDocument.layers.find(l => l.name === "anim_preview" && l.type === "layerSection");
    app.echoToOE(f ? f.layers.length.toString() : "0");
  `;
  window.addEventListener("message", function handleCount(e) {
    if (typeof e.data === "string" && /^\d+$/.test(e.data)) {
      layerCount = parseInt(e.data);
      window.removeEventListener("message", handleCount);
    }
  });
  parent.postMessage(countScript, "*");

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
      } else if (e.data === "done") {
        window.removeEventListener("message", handleFrame);

        frameIndex++;
        if (frameIndex < layerCount) {
          requestNextFrame();
        } else {
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
