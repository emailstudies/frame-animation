""// ✅ flipbook_logic.js (Combined sending + receiving flipbook script for anim_preview)

const flipbookFrames = [];

// 🚀 Start everything when anim_preview is ready
window.runCombinedFlipbookExport = function () {
  console.log("🚀 Starting combined flipbook export");

  const script = `
    (function () {
      try {
        var doc = app.activeDocument;
        var previewGroup = null;

        for (var i = 0; i < doc.layers.length; i++) {
          var layer = doc.layers[i];
          if (layer.typename === "LayerSet" && layer.name === "anim_preview") {
            previewGroup = layer;
            break;
          }
        }

        if (!previewGroup) {
          app.echoToOE("[flipbook] ❌ anim_preview not found");
          return;
        }

        // Hide everything except anim_preview
        for (var i = 0; i < doc.layers.length; i++) {
          doc.layers[i].visible = (doc.layers[i] === previewGroup);
        }
        previewGroup.visible = true;

        // Force refresh without confirmation
        app.resizeImage(doc.width + 1, doc.height);
        app.resizeImage(doc.width - 1, doc.height);

        app.echoToOE("done");
        app.echoToOE("[flipbook] ✅ anim_preview created - done");
        app.echoToOE("[flipbook] 📦 " + previewGroup.layers.length + " frames");

        for (var i = previewGroup.layers.length - 1; i >= 0; i--) {
          var layer = previewGroup.layers[i];
          for (var j = 0; j < previewGroup.layers.length; j++) {
            previewGroup.layers[j].visible = false;
          }
          layer.visible = true;

          // Force refresh again per frame
          app.resizeImage(doc.width + 1, doc.height);
          app.resizeImage(doc.width - 1, doc.height);

          app.echoToOE("[flipbook] 🔁 Sending frame " + (previewGroup.layers.length - 1 - i) + ": " + layer.name);
          doc.saveToOE("png");
        }

        app.echoToOE("done");
      } catch (e) {
        app.echoToOE("[flipbook] ❌ JS ERROR: " + e.message);
      }
    })();
  `;

  parent.postMessage(script, "*");
};

// 📥 Collect received ArrayBuffers
window.addEventListener("message", (event) => {
  if (event.data instanceof ArrayBuffer) {
    console.log("🧪 Got ArrayBuffer of length", event.data.byteLength);
    flipbookFrames.push(event.data);
    console.log("📥 Received frame #" + flipbookFrames.length);
  } else if (typeof event.data === "string") {
    console.log("📩 Flipbook Plugin Message:", event.data);

    if (event.data.trim() === "done") {
      if (flipbookFrames.length === 0) {
        alert("❌ No flipbook frames received.");
        return;
      }

      const html = generateFlipbookHTML(flipbookFrames);
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const win = window.open();
      win.document.open();
      win.document.write(html);
      win.document.close();

      flipbookFrames.length = 0;
    }
  }
});
