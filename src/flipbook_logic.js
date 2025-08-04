// ✅ Single-file flipbook preview using anim_preview (Photopea + plugin UI)
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("browserPreviewAllBtn");
  if (!btn) {
    console.error("❌ previewSelectedBtn not found");
    return;
  }

  const collectedFrames = [];
  let currentIndex = 0;
  let totalFrames = 0;

  btn.onclick = () => {
    currentIndex = 0;
    collectedFrames.length = 0;

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
            app.echoToOE("❌ anim_preview group not found");
            return;
          }

          for (var i = 0; i < doc.layers.length; i++) {
            doc.layers[i].visible = (doc.layers[i] === previewGroup);
          }
          previewGroup.visible = true;

          window._flipbookCtx = {
            group: previewGroup,
            count: previewGroup.layers.length,
            index: 0
          };

          app.echoToOE("[flipbook] INIT " + previewGroup.layers.length);
        } catch (e) {
          app.echoToOE("❌ JS ERROR: " + e.message);
        }
      })();
    `;
    parent.postMessage(initScript, "*");
  };

  window.addEventListener("message", (event) => {
    if (event.data instanceof ArrayBuffer) {
      collectedFrames.push(event.data);
      currentIndex++;
      requestNextFrame();
    } else if (typeof event.data === "string") {
      if (event.data.startsWith("[flipbook] INIT")) {
        totalFrames = parseInt(event.data.split(" ").pop());
        requestNextFrame();
      } else if (event.data.trim() === "[flipbook] ✅ done") {
        if (collectedFrames.length === 0) {
          alert("❌ No flipbook frames received.");
          return;
        }
        const html = generateFlipbookHTML(collectedFrames);
        const blob = new Blob([html], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const win = window.open();
        win.document.open();
        win.document.write(html);
        win.document.close();
      } else if (event.data.startsWith("❌")) {
        alert(event.data);
      }
    }
  });

  function requestNextFrame() {
    if (currentIndex >= totalFrames) {
      parent.postMessage(`[flipbook] ✅ done`, "*");
      return;
    }

    const stepScript = `
      (function () {
        try {
          var ctx = window._flipbookCtx;
          var doc = app.activeDocument;

          if (!ctx || !ctx.group || ctx.index >= ctx.count) {
            app.echoToOE("[flipbook] ✅ done");
            return;
          }

          for (var i = 0; i < ctx.group.layers.length; i++) {
            ctx.group.layers[i].visible = false;
          }

          var layer = ctx.group.layers[ctx.index];
          layer.visible = true;
          app.refresh(false);
          doc.saveToOE("png");

          ctx.index++;
        } catch (e) {
          app.echoToOE("❌ JS ERROR: " + e.message);
        }
      })();
    `;
    parent.postMessage(stepScript, "*");
  }
});
