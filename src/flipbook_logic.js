// ✅ flipbook_logic.js (All-in-one Flipbook Export and Preview)

let flipbookFrames = [];

// 🚀 Main runner
window.runCombinedFlipbookExport = function () {
  console.log("🚀 Starting combined flipbook export");

  const script = `
    (function () {
      try {
        var doc = app.activeDocument;
        var group = null;

        // 🔍 Find anim_preview group
        for (var i = 0; i < doc.layers.length; i++) {
          var layer = doc.layers[i];
          if (layer.typename === "LayerSet" && layer.name === "anim_preview") {
            group = layer;
            break;
          }
        }

        if (!group) {
          app.echoToOE("[flipbook] ❌ anim_preview not found");
          return;
        }

        var count = group.layers.length;
        app.echoToOE("[flipbook] 📦 " + count + " frames");

        // 🪄 Export one by one
        for (var i = count - 1; i >= 0; i--) {
          for (var j = 0; j < group.layers.length; j++) {
            group.layers[j].visible = false;
          }
          var current = group.layers[i];
          current.visible = true;
          doc.activeLayer = current;

          // 🌀 Force refresh
          var w = doc.width;
          doc.resizeImage(w + 1);
          doc.resizeImage(w);

          app.echoToOE("[flipbook] 🔁 Sending frame " + (count - 1 - i) + ": " + current.name);
          doc.saveToOE("png");
        }

        app.echoToOE("[flipbook] done");
      } catch (e) {
        app.echoToOE("[flipbook] ❌ JS ERROR: " + e.message);
      }
    })();
  `;

  parent.postMessage(script, "*");
};

// 📩 Receive frames and display preview
window.addEventListener("message", (event) => {
  if (event.data instanceof ArrayBuffer) {
    console.log("🧪 Got ArrayBuffer of length", event.data.byteLength);
    flipbookFrames.push(event.data);
    console.log("📥 Received frame #" + flipbookFrames.length);
  }

  if (typeof event.data === "string") {
    console.log("📩 Flipbook Plugin Message:", event.data);

    if (event.data.includes("[flipbook] done")) {
      if (flipbookFrames.length === 0) {
        alert("❌ No flipbook frames received.");
        return;
      }

      console.log("📸 Flipbook: Received", flipbookFrames.length, "frames.");

      const html = generateFlipbookHTML(flipbookFrames);
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      flipbookFrames = [];
    }
  }
});
