// ✅ flipbook_logic.js — Self-contained frame-by-frame export from anim_preview using temp doc

window.runCombinedFlipbookExport = function () {
  console.log("🚀 Starting combined flipbook export");
  const collectedFrames = [];

  let frameIndex = 0;
  let totalFrames = 0;
  let tempDocId = null;

  // 📨 Receive images or control messages
  window.addEventListener("message", async function handleFlipbookMessage(event) {
    if (event.data instanceof ArrayBuffer) {
      collectedFrames.push(event.data);
      console.log("📥 Received frame #" + collectedFrames.length);

      // Delete current temp doc layer before sending next
      sendNextFrame();
    } else if (typeof event.data === "string") {
      const msg = event.data.trim();

      if (msg.startsWith("[flipbook]")) {
        console.log("📩 Flipbook Plugin Message:", msg);

        if (msg === "[flipbook] ✅ anim_preview created - done") {
          prepareAndSend();
        }
      } else if (msg === "done") {
        console.log("📸 Flipbook: Received " + collectedFrames.length + " frames.");

        if (collectedFrames.length === 0) {
          alert("❌ No flipbook frames received.");
          return;
        }

        // 🖼️ Show the flipbook
        const html = generateFlipbookHTML(collectedFrames);
        const blob = new Blob([html], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const win = window.open();
        win.document.open();
        win.document.write(html);
        win.document.close();

        // Cleanup
        collectedFrames.length = 0;
        window.removeEventListener("message", handleFlipbookMessage);
      }
    }
  });

  function prepareAndSend() {
    const script = `
      (function () {
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

        app.echoToOE("[flipbook] 📦 " + previewGroup.layers.length + " frames");

        var tempDoc = app.documents.add(doc.width, doc.height, doc.resolution, "temp_export", NewDocumentMode.RGB);
        window._flipbookPreviewLayers = previewGroup.layers;
        window._flipbookTempDoc = tempDoc;
        window._flipbookFrameIndex = 0;

        app.echoToOE("[flipbook] ✅ anim_preview created - done");
      })();
    `;
    parent.postMessage(script, "*");
  }

  function sendNextFrame() {
    const script = `
      (function () {
        try {
          var previewLayers = window._flipbookPreviewLayers;
          var tempDoc = window._flipbookTempDoc;
          var index = window._flipbookFrameIndex;

          if (!previewLayers || !tempDoc) {
            app.echoToOE("[flipbook] ❌ Missing temp doc or preview layers");
            return;
          }

          if (index >= previewLayers.length) {
            window._flipbookPreviewLayers = null;
            window._flipbookTempDoc = null;
            window._flipbookFrameIndex = null;
            tempDoc.close(SaveOptions.DONOTSAVECHANGES);
            app.echoToOE("done");
            return;
          }

          app.activeDocument = tempDoc;
          for (var j = tempDoc.layers.length - 1; j >= 0; j--) {
            tempDoc.layers[j].remove();
          }

          var doc = app.documents.getByName("_temp_export");
          var originalDoc = app.documents[0];

          app.activeDocument = originalDoc;
          var layer = previewLayers[index];
          layer.visible = true;
          originalDoc.activeLayer = layer;
          layer.duplicate(doc, ElementPlacement.PLACEATBEGINNING);

          app.activeDocument = doc;
          app.refresh();

          app.echoToOE("[flipbook] 🔁 Sending frame " + index + ": " + layer.name);
          doc.saveToOE("png");

          window._flipbookFrameIndex++;
        } catch (e) {
          app.echoToOE("[flipbook] ❌ JS ERROR: " + e.message);
        }
      })();
    `;
    parent.postMessage(script, "*");
  }
};
