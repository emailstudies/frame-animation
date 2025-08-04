// ✅ flipbook_logic.js (Photopea side)
function exportPreviewFramesToFlipbook() {
  console.log("🚀 [flipbook] Starting coordinated frame export");

  const initScript = `
    (function () {
      try {
        var doc = app.activeDocument;
        var previewGroup = null;

        // 🔍 Find anim_preview group
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

        // 🫥 Hide everything else
        for (var i = 0; i < doc.layers.length; i++) {
          doc.layers[i].visible = (doc.layers[i] === previewGroup);
        }
        previewGroup.visible = true;
        app.refresh();

        var frameCount = previewGroup.layers.length;
        app.echoToOE("[flipbook] 📦 anim_preview contains " + frameCount + " frames.");

        // 🧠 Store export context
        window._flipbook = {
          doc: doc,
          group: previewGroup,
          count: frameCount,
          current: frameCount - 1
        };

        // 👣 Begin with the first frame
        (function exportNext() {
          var ctx = window._flipbook;
          if (ctx.current < 0) {
            delete window._flipbook;
            app.echoToOE("[flipbook] ✅ Exported all frames to OE.");
            return;
          }

          for (var j = 0; j < ctx.count; j++) {
            ctx.group.layers[j].visible = false;
          }

          var layer = ctx.group.layers[ctx.current];
          layer.visible = true;
          app.refresh();

          app.echoToOE("[flipbook] 🔁 Ready to export frame " + (ctx.count - ctx.current - 1) + ": " + layer.name);
          ctx.doc.saveToOE("png");
        })();
      } catch (e) {
        app.echoToOE("[flipbook] ❌ ERROR: " + e.message);
      }
    })();
  `;

  parent.postMessage(initScript, "*");
}

// 📩 Listen for "frame received" and export the next
window.addEventListener("message", (event) => {
  if (typeof event.data === "string" && event.data.trim() === "[flipbook] ✅ frame received") {
    const nextScript = `
      (function () {
        try {
          var ctx = window._flipbook;
          if (!ctx || ctx.current < 0) {
            app.echoToOE("[flipbook] ✅ Exported all frames to OE.");
            delete window._flipbook;
            return;
          }

          for (var j = 0; j < ctx.count; j++) {
            ctx.group.layers[j].visible = false;
          }

          var layer = ctx.group.layers[ctx.current];
          layer.visible = true;
          app.refresh();

          app.echoToOE("[flipbook] 🔁 Ready to export frame " + (ctx.count - ctx.current - 1) + ": " + layer.name);
          ctx.doc.saveToOE("png");
          ctx.current--;
        } catch (e) {
          app.echoToOE("[flipbook] ❌ ERROR during next export: " + e.message);
        }
      })();
    `;
    parent.postMessage(nextScript, "*");
  }
});

// Make callable
window.exportPreviewFramesToFlipbook = exportPreviewFramesToFlipbook;
