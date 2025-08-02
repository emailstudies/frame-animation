document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("webPreviewSelectedBtn");
  if (!btn) return;

  let previewWindow = null;
  const collectedFrames = [];

  btn.onclick = () => {
    // ✅ Open new tab immediately for flipbook
    previewWindow = window.open("", "_blank");
    collectedFrames.length = 0;

    const script = `
      (function () {
        try {
          var doc = app.activeDocument;
          var animFolder = null;

          // Find the 'anim_preview' folder
          for (var i = 0; i < doc.layerSets.length; i++) {
            if (doc.layerSets[i].name === "anim_preview") {
              animFolder = doc.layerSets[i];
              break;
            }
          }

          if (!animFolder || animFolder.artLayers.length === 0) {
            app.echoToOE("❌ anim_preview folder not found or empty.");
            return;
          }

          // Hide all layers first
          for (var i = 0; i < animFolder.artLayers.length; i++) {
            animFolder.artLayers[i].visible = false;
          }

          // Loop through each layer, make visible, export, hide again
          for (var i = 0; i < animFolder.artLayers.length; i++) {
            var layer = animFolder.artLayers[i];
            layer.visible = true;
            app.activeDocument.saveToOE("png");
            layer.visible = false;
          }

          app.echoToOE("done");
        } catch (e) {
          app.echoToOE("❌ " + e.message);
        }
      })();
    `;

    parent.postMessage(script, "*");
    console.log("📤 Sent anim_preview export script to Photopea");
  };

  // Collect frames and display them once all are received
  window.addEventListener("message", (event) => {
    if (event.data instanceof ArrayBuffer) {
      collectedFrames.push(event.data);
    } else if (typeof event.data === "string") {
      if (event.data === "done") {
        if (!previewWindow || collectedFrames.length === 0) return;

        const frameJS = collectedFrames
          .map((buf, i) => {
            const base64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
            return `frames[${i}] = "data:image/png;base64,${base64}";`;
          })
          .join("\n");

        const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Flipbook</title>
  <style>
    html, body { margin: 0; background: #111; height: 100%;
      display: flex; justify-content: center; align-items: center; }
    canvas { background: white; image-rendering: pixelated; }
  </style>
</head>
<body>
  <canvas id="c"></canvas>
  <script>
    const frames = [];
    ${frameJS}

    const images = frames.map(src => {
      const img = new Image();
      img.src = src;
      return img;
    });

    const canvas = document.getElementById("c");
    const ctx = canvas.getContext("2d");
    let index = 0;
    const fps = 12;

    let loaded = 0;
    images.forEach(img => {
      img.onload = () => {
        loaded++;
        if (loaded === images.length) start();
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
</html>`;

        previewWindow.document.open();
        previewWindow.document.write(html);
        previewWindow.document.close();
        collectedFrames.length = 0;
      } else if (event.data.startsWith("❌")) {
        previewWindow?.document.write(`<h2 style="color:red;">${event.data}</h2>`);
        previewWindow?.document.close();
      }
    }
  });
});
