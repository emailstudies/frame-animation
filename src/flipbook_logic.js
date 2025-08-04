const collectedFrames = [];
let flipbookIndex = 0;
let flipbookTotal = 0;

// 🚀 Start coordinated flipbook export
window.runCombinedFlipbookExport = function () {
  console.log("🚀 Starting combined flipbook export");

  const initScript = `
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
        app.refresh();

        app.echoToOE("[flipbook] ✅ anim_preview created - done");
        app.echoToOE("[flipbook] 📦 " + previewGroup.layers.length + " frames");
      } catch (e) {
        app.echoToOE("[flipbook] ❌ JS ERROR: " + e.message);
      }
    })();
  `;
  parent.postMessage(initScript, "*");
  flipbookIndex = 0;
  collectedFrames.length = 0;
};

// 🔁 Export next frame
function stepAndExportNextFrame() {
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
          app.echoToOE("[flipbook] ❌ anim_preview group missing during step");
          return;
        }

        if (${flipbookIndex} >= group.layers.length) {
          app.echoToOE("[flipbook] ✅ done");
          return;
        }

        // Hide all
        for (var j = 0; j < group.layers.length; j++) {
          group.layers[j].visible = false;
        }

        // Show only current frame
        var layer = group.layers[${flipbookIndex}];
        layer.visible = true;
        app.refresh();

        app.echoToOE("[flipbook] 🔁 Sending frame ${flipbookIndex}: " + layer.name);
        doc.saveToOE("png");
      } catch (e) {
        app.echoToOE("[flipbook] ❌ JS ERROR: " + e.message);
      }
    })();
  `;
  setTimeout(() => parent.postMessage(script, "*"), 150);
}

// 📩 Handle incoming messages
window.addEventListener("message", (event) => {
  if (event.data instanceof ArrayBuffer) {
    console.log("🧪 Got ArrayBuffer of length", event.data.byteLength);
    collectedFrames.push(event.data);
    console.log("📥 Received frame #" + collectedFrames.length);

    flipbookIndex++;
    if (flipbookIndex < flipbookTotal) {
      stepAndExportNextFrame();
    } else {
      console.log("📸 Flipbook: Received all frames. Opening preview.");
      const html = generateFlipbookHTML(collectedFrames);
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    }
  }

  if (typeof event.data === "string") {
    const msg = event.data.trim();
    if (msg.startsWith("[flipbook]")) {
      const clean = msg.replace("[flipbook] ", "").trim();
      console.log("📩 Flipbook Plugin Message:", clean);

      if (clean.startsWith("📦")) {
        const match = clean.match(/(\d+)/);
        flipbookTotal = match ? parseInt(match[1]) : 0;
        console.log("🧮 Total frames:", flipbookTotal);
      }

      if (clean === "✅ anim_preview created - done") {
        flipbookIndex = 0;
        setTimeout(() => stepAndExportNextFrame(), 250);
      }

      if (clean === "✅ done") {
        console.log("🎉 Export complete. Final frame count:", collectedFrames.length);
      }
    }
  }
});
