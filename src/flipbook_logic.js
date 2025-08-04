function exportPreviewFramesToFlipbook() {
  console.log("🚀 [flipbook] Starting coordinated frame export");

  const script = `
    (function () {
      try {
        var doc = app.activeDocument;
        var previewGroup = null;

        // 🔍 Find anim_preview
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

        // 👉 Store in temp global for stepping
        window._flipbook = {
          group: previewGroup,
          count: frameCount,
          current: frameCount - 1,
          doc: doc
        };

        // 👣 Begin export loop
        (function exportNext() {
          var ctx = window._flipbook;
          if (ctx.current < 0) {
            delete window._flipbook;
            app.echoToOE("[flipbook] ✅ All frames exported.");
            return;
          }

          // 🧼 Hide all
          for (var j = 0; j < ctx.count; j++) {
            ctx.group.layers[j].visible = false;
          }

          var layer = ctx.group.layers[ctx.current];
          layer.visible = true;
          app.refresh();

          app.echoToOE("[flipbook] 🔁 Ready to export frame " + (ctx.count - ctx.current - 1) + ": " + layer.name);
        })();
      } catch (e) {
        app.echoToOE("[flipbook] ❌ ERROR: " + e.message);
      }
    })();
  `;

  setTimeout(() => {
    parent.postMessage(script, "*");
  }, 50);
}





/* // flipbook_export.js - exporting anim_preview frames one by one

let frameIndex = 0;
let totalFrames = 0;

function exportPreviewFramesToFlipbook() {
  console.log("🚀 Starting flipbook export");
  frameIndex = 0;

  const initScript = `
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

      for (var i = 0; i < doc.layers.length; i++) {
        doc.layers[i].visible = (doc.layers[i] === previewGroup);
      }

      previewGroup.visible = true;

      app.echoToOE("[flipbook] 📦 init " + previewGroup.layers.length);
    })();
  `;

  parent.postMessage(initScript, "*");
}

// continue frame export after receiving frame count from Photopea
function continueFlipbookExport(total) {
  totalFrames = total;
  exportNextFrame();
}

function exportNextFrame() {
  if (frameIndex >= totalFrames) {
    parent.postMessage(`app.echoToOE("[flipbook] ✅ Exported all frames to OE.");`, "*");
    return;
  }

  const script = `
    (function () {
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
        app.echoToOE("[flipbook] ❌ anim_preview group missing during export");
        return;
      }

      for (var j = 0; j < group.layers.length; j++) {
        group.layers[j].visible = false; 
      }

      var currentLayer = group.layers[${totalFrames - 1 - frameIndex}];
      currentLayer.visible = true;
      app.refresh();
      app.echoToOE("[flipbook] 🔁 Frame ${frameIndex}: " + currentLayer.name);
      doc.saveToOE("png");
    })();
  `;

  parent.postMessage(script, "*");
  frameIndex++;
}
*/
