// ✅ browser_preview_loader.js (patched, modular, no tempDoc)
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

    // ⏳ Begin Photopea export inline
    const script = `
      (function () {
        try {
          var doc = app.activeDocument;
          if (!doc) {
            app.echoToOE("❌ No document open.");
            return;
          }

          var targetGroup = null;
          var active = doc.activeLayer;

          if (active && active.typename === "LayerSet" && active.name.startsWith("anim_")) {
            targetGroup = active;
          } else if (active && active.parent && active.parent.typename === "LayerSet" && active.parent.name.startsWith("anim_")) {
            targetGroup = active.parent;
          }

          if (!targetGroup) {
            app.echoToOE("❌ Please select an anim_* folder or a layer inside it.");
            return;
          }

          var layers = Array.from(targetGroup.layers).reverse();
          var originalVisibility = [];

          for (var i = 0; i < layers.length; i++) {
            var layer = layers[i];
            originalVisibility[i] = layer.visible;

            // Hide all
            for (var j = 0; j < layers.length; j++) {
              layers[j].visible = false;
            }

            // Show only this one
            layer.visible = true;

            var png = doc.saveToOE("png");
            app.sendToOE(png);
          }

          // Restore visibility
          for (var i = 0; i < layers.length; i++) {
            layers[i].visible = originalVisibility[i];
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

  // 🖼️ Received PNG frame
  if (event.data instanceof ArrayBuffer) {
    collectedFrames.push(event.data);
  } 
  
  // 📩 Message from Photopea
  else if (typeof event.data === "string") {
    console.log("📩 Message from Photopea:", event.data);

    if (event.data === "done") {
      console.log("📦 All frames received:", collectedFrames.length, "total");

      if (collectedFrames.length === 0) {
        alert("❌ No frames received.");
        return;
      }

      if (previewTab && previewReady) {
        previewTab.postMessage({ type: "FRAMES", frames: collectedFrames }, "*");
        console.log("🚀 Sent frames to preview tab");
      } else {
        alert("❌ Preview tab not ready to receive frames.");
      }

    } else if (event.data.startsWith("❌")) {
      alert(event.data);
    }
  }
});
