// flipbook_export.js - exporting anim_preview frames one by one

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
