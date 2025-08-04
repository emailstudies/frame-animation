window.runCombinedFlipbookExport = function () {
  console.log("🚀 Starting combined flipbook export");

  const script = `
    (function () {
      try {
        var doc = app.activeDocument;
        var group = null;

        for (var i = 0; i < doc.layers.length; i++) {
          var layer = doc.layers[i];
          if (layer.typename === "LayerSet" && layer.name === "anim_preview") {
            group = layer;
            break;
          }
        }

        if (!group) {
          app.echoToOE("❌ anim_preview group not found.");
          return;
        }

        var frameCount = group.layers.length;
        app.echoToOE("[flipbook] 📦 " + frameCount + " frames");

        for (var i = 0; i < group.layers.length; i++) {
          for (var j = 0; j < group.layers.length; j++) {
            group.layers[j].visible = false;
          }

          var layer = group.layers[i];
          layer.visible = true;
          app.refresh();
          doc.activeLayer = layer;

          app.echoToOE("[flipbook] 🔁 Sending frame " + i + ": " + layer.name);
          doc.saveToOE("png");
        }

        app.echoToOE("[flipbook] ✅ All frames sent");
      } catch (e) {
        app.echoToOE("[flipbook] ❌ ERROR: " + e.message);
      }
    })();
  `;

  parent.postMessage(script, "*");
};

const collectedFrames = [];

window.addEventListener("message", (event) => {
  if (event.data instanceof ArrayBuffer) {
    console.log("🧪 Got ArrayBuffer of length", event.data.byteLength);
    collectedFrames.push(event.data);
    console.log("📥 Received frame #" + collectedFrames.length);
  } else if (typeof event.data === "string") {
    const msg = event.data.trim();
    if (msg === "[flipbook] ✅ All frames sent") {
      if (collectedFrames.length === 0) {
        alert("❌ No frames received.");
        return;
      }

      const html = generateFlipbookHTML(collectedFrames);
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      collectedFrames.length = 0;
    } else {
      console.log("📩 Flipbook Plugin Message:", msg);
      if (msg.startsWith("❌")) {
        alert(msg);
      }
    }
  }
});
