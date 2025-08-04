// ✅ flipbook_logic.js – Combined sender + receiver for flipbook

const collectedFrames = [];

// 🚀 Start export process from anim_preview
window.runCombinedFlipbookExport = function () {
  console.log("🚀 Starting combined flipbook export");

  const script = `
    (function () {
      try {
        var doc = app.activeDocument;
        var previewGroup = null;

        // 🔍 Locate anim_preview
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

        // 👁️ Hide everything except anim_preview
        for (var i = 0; i < doc.layers.length; i++) {
          doc.layers[i].visible = (doc.layers[i] === previewGroup);
        }
        previewGroup.visible = true;
        app.refresh();

        app.echoToOE("[flipbook] 📦 " + previewGroup.layers.length + " frames");
        app.echoToOE("[flipbook] ✅ anim_preview created - done");

        // Start frame index
        window._flipbookIndex = 0;
      } catch (e) {
        app.echoToOE("[flipbook] ❌ JS ERROR: " + e.message);
      }
    })();
  `;
  parent.postMessage(script, "*");
};

// 🔁 Send next frame
window.stepAndExportNextFrame = function () {
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

        if (typeof window._flipbookIndex === "undefined") window._flipbookIndex = 0;

        if (window._flipbookIndex >= group.layers.length) {
          app.echoToOE("[flipbook] done");
          return;
        }

        // Hide all
        for (var j = 0; j < group.layers.length; j++) {
          group.layers[j].visible = false;
        }

        var layer = group.layers[window._flipbookIndex];
        layer.visible = true;
        app.refresh();

        app.echoToOE("[flipbook] 🔁 Sending frame " + window._flipbookIndex + ": " + layer.name);
        doc.saveToOE("png");

        window._flipbookIndex++;
      } catch (e) {
        app.echoToOE("[flipbook] ❌ JS ERROR: " + e.message);
      }
    })();
  `;
  setTimeout(() => {
    parent.postMessage(script, "*");
  }, 150); // 🕒 Delay before sending next
};

// 📩 Handle messages from Photopea
window.addEventListener("message", (event) => {
  if (event.data instanceof ArrayBuffer) {
    console.log("🧪 Got ArrayBuffer of length", event.data.byteLength);
    collectedFrames.push(event.data);
    console.log("📥 Received frame #" + collectedFrames.length);
    setTimeout(() => window.stepAndExportNextFrame(), 150);
    return;
  }

  if (typeof event.data === "string") {
    const msg = event.data.trim();
    if (msg.startsWith("[flipbook]")) {
      const clean = msg.replace("[flipbook] ", "").trim();
      console.log("📩 Flipbook Plugin Message:", clean);

      if (clean === "✅ anim_preview created - done") {
        setTimeout(() => window.stepAndExportNextFrame(), 150);
      }

      if (clean === "done") {
        console.log("📸 Flipbook: Received " + collectedFrames.length + " frames.");
        if (collectedFrames.length === 0) {
          alert("❌ No flipbook frames received.");
          return;
        }

        const html = generateFlipbookHTML(collectedFrames);
        const blob = new Blob([html], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");

        collectedFrames.length = 0;
      }
    }
  }
});
