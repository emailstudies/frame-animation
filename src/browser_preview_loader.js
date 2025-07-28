// ✅ browser_preview_loader.js (Single controller)

const webPreviewBtn = document.getElementById("webPreviewSelectedBtn");
let collectedFrames = [];
let previewTab = null;
let previewReady = false;

webPreviewBtn.onclick = () => {
  collectedFrames = [];
  previewReady = false;

  console.log("🪟 Opening preview tab...");
  previewTab = window.open("preview.html", "_blank");
};

window.addEventListener("message", (event) => {
  if (event.data === "READY_FOR_FRAMES") {
    console.log("✅ Preview tab ready");
    previewReady = true;

    console.log("▶️ Starting frame export");
    const script = `
      (function () {
        try {
          var doc = app.activeDocument;
          if (!doc) {
            app.echoToOE("❌ No document open.");
            return;
          }

          var selectedLayer = doc.activeLayer;
          if (!selectedLayer || !selectedLayer.parent || selectedLayer.parent === doc) {
            app.echoToOE("❌ Please select a layer inside an anim_* folder.");
            return;
          }

          var group = selectedLayer.parent;
          if (!group.name.startsWith("anim_")) {
            app.echoToOE("❌ Selection is not inside an anim_* folder.");
            return;
          }

          var frames = group.layers.slice().reverse(); // Frame 1 is at bottom
          var originalVisibility = [];

          for (var i = 0; i < frames.length; i++) {
            var frame = frames[i];

            // Store current visibility
            originalVisibility[i] = frame.visible;

            // Hide all frames
            for (var j = 0; j < frames.length; j++) {
              frames[j].visible = false;
            }

            // Show only current frame
            frame.visible = true;

            // Export PNG
            var png = doc.saveToOE("png");
            app.sendToOE(png);
          }

          // Restore visibility
          for (var i = 0; i < frames.length; i++) {
            frames[i].visible = originalVisibility[i];
          }

          app.echoToOE("done");
        } catch (e) {
          app.echoToOE("❌ ERROR: " + e.message);
        }
      })();
    `;
    parent.postMessage(script, "*");
    return;
  }

  // Receive PNGs
  if (event.data instanceof ArrayBuffer) {
    collectedFrames.push(event.data);
  } else if (typeof event.data === "string") {
    console.log("📩 Message from Photopea:", event.data);

    if (event.data === "done") {
      console.log("📦 All frames received:", collectedFrames.length, "total");

      if (collectedFrames.length === 0) {
        alert("❌ No frames received.");
        return;
      }

      if (previewTab && previewReady) {
        for (let i = 0; i < collectedFrames.length; i++) {
          previewTab.postMessage(collectedFrames[i], "*");
        }
        console.log("🚀 Sent frames to preview tab");
      } else {
        alert("❌ Preview tab not ready to receive frames.");
      }
    } else if (event.data.startsWith("❌")) {
      alert(event.data);
    }
  }
});
