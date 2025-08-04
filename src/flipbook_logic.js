document.addEventListener("DOMContentLoaded", function () {
  const btn = document.getElementById("browserPreviewSelectedBtn");
  if (!btn) {
    console.error("❌ Button not found: #previewSelectedBtn");
    return;
  }

  let previewWindow = null;
  const collectedFrames = [];

  btn.onclick = function () {
    previewWindow = window.open("", "_blank");
    if (!previewWindow) {
      alert("⚠️ Popup blocked! Please allow popups and try again.");
      return;
    }

    collectedFrames.length = 0;

    const script = `
      (function () {
        try {
          var doc = app.activeDocument;
          if (!doc) {
            app.echoToOE("❌ No active document.");
            return;
          }

          // Find the anim_preview group
          var animGroup = null;
          for (var i = 0; i < doc.layers.length; i++) {
            if (doc.layers[i].typename === "LayerSet" && doc.layers[i].name === "anim_preview") {
              animGroup = doc.layers[i];
              break;
            }
          }

          if (!animGroup) {
            app.echoToOE("❌ anim_preview group not found.");
            return;
          }

          var tempDoc = app.documents.add(doc.width, doc.height, doc.resolution, "_temp_export", NewDocumentMode.RGB);

          for (var i = 0; i < animGroup.layers.length; i++) {
            // Hide all layers
            for (var j = 0; j < animGroup.layers.length; j++) {
              animGroup.layers[j].visible = false;
            }
            // Show only current layer
            animGroup.layers[i].visible = true;

            var layer = animGroup.layers[i];
            if (layer.kind !== undefined && !layer.locked) {
              app.activeDocument = doc;
              doc.activeLayer = layer;
              layer.duplicate(tempDoc, ElementPlacement.PLACEATBEGINNING);

              app.activeDocument = tempDoc;
              tempDoc.flatten();
              tempDoc.saveToOE("png");
              tempDoc.undo();
            }
          }

          // Restore all layers visibility (optional)
          for (var j = 0; j < animGroup.layers.length; j++) {
            animGroup.layers[j].visible = true;
          }

          app.activeDocument = tempDoc;
          tempDoc.close(SaveOptions.DONOTSAVECHANGES);
          app.echoToOE("done");
        } catch (e) {
          app.echoToOE("❌ " + e.message);
        }
      })();
    `;

    parent.postMessage(script, "*");
    console.log("📤 Sent export script to Photopea");
  };

  window.addEventListener("message", function (event) {
    if (event.data instanceof ArrayBuffer) {
      collectedFrames.push(event.data);
    } else if (typeof event.data === "string") {
      if (event.data === "done") {
        if (!previewWindow || collectedFrames.length === 0) {
          alert("❌ No frames received.");
          return;
        }

        const frameJS = collectedFrames
          .map((buf, i) => {
            const base64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
            return \`frames[\${i}] = "data:image/png;base64,\${base64}";\`;
          })
          .join("\n");

        const html = \`
<!DOCTYPE html>
<html>
<head>
  <title>Flipbook Preview</title>
  <style>
    html, body {
      margin: 0;
      background: #111;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
    }
    canvas {
      image-rendering: pixelated;
      background: black;
    }
  </style>
</head>
<body>
  <canvas id="previewCanvas"></canvas>
  <script>
    const frames = [];
    \${frameJS}

    const images = frames.map(src => {
      const img = new Image();
      img.src = src;
      return img;
    });

    const canvas = document.getElementById("previewCanvas");
    const ctx = canvas.getContext("2d");
    const fps = 12;
    let index = 0;

    let loaded = 0;
    images.forEach(img => {
      img.onload = () => {
        loaded++;
        if (loaded === images.length) start();
      };
      img.onerror = () => {
        console.error("Failed to load image");
      };
    });

    function start() {
      canvas.width = images[0].width;
      canvas.height = images[0].height;
      setInterval(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(images[index], 0, 0);
        index = (index + 1) % images.length;
      }, 1000 / fps);
    }
  </script>
</body>
</html>\`;

        previewWindow.document.open();
        previewWindow.document.write(html);
        previewWindow.document.close();

        collectedFrames.length = 0; // Reset frames buffer
      } else if (event.data.startsWith("❌")) {
        if (previewWindow) {
          previewWindow.document.body.innerHTML = \`<h2 style="color: red;">\${event.data}</h2>\`;
          previewWindow.document.close();
        } else {
          alert(event.data);
        }
      }
    }
  });
});
