// src/browser_preview.js

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("webPreviewSelectedBtn");

  if (!btn) {
    console.error("❌ Preview button not found");
    return;
  }

  let collectedFrames = [];

  btn.onclick = () => {
    collectedFrames = []; // Reset before every run

    const script = `
      (function () {
        try {
          var original = app.activeDocument;
          if (!original || !original.activeLayer || !original.activeLayer.name.startsWith("anim_") || original.activeLayer.typename !== "LayerSet") {
            app.echoToOE("❌ Please select an anim_* folder.");
            return;
          }

          var group = original.activeLayer;
          if (group.layers.length === 0) {
            app.echoToOE("❌ Selected folder has no layers.");
            return;
          }

          var tempDoc = app.documents.add(original.width, original.height, original.resolution, "_temp_export", NewDocumentMode.RGB);

          for (var i = group.layers.length - 1; i >= 0; i--) {
            var layer = group.layers[i];
            if (layer.kind !== undefined && !layer.locked) {
              app.activeDocument = tempDoc;
              while (tempDoc.layers.length > 0) tempDoc.layers[0].remove();

              app.activeDocument = original;
              original.activeLayer = layer;
              layer.duplicate(tempDoc, ElementPlacement.PLACEATBEGINNING);

              app.activeDocument = tempDoc;
              tempDoc.saveToOE("png");
            }
          }

          tempDoc.close(SaveOptions.DONOTSAVECHANGES);
          app.echoToOE("✅ done");
        } catch (e) {
          app.echoToOE("❌ ERROR: " + e.message);
        }
      })();
    `;

    parent.postMessage(script, "*");
    console.log("📤 Export script sent to Photopea");
  };

  window.addEventListener("message", (event) => {
    if (event.data instanceof ArrayBuffer) {
      collectedFrames.push(event.data);
    } else if (typeof event.data === "string") {
      console.log("📩 Message from Photopea:", event.data);

      if (event.data.includes("❌")) {
        alert(event.data);
        return;
      }

      if (event.data.includes("✅ done")) {
        if (collectedFrames.length === 0) {
          alert("❌ No frames were received.");
          return;
        }

        const framesJS = collectedFrames
          .map((ab, i) => {
            const base64 = btoa(String.fromCharCode(...new Uint8Array(ab)));
            return `frames[${i}] = "data:image/png;base64,${base64}";`;
          })
          .join("\n");

        const html = `
<!DOCTYPE html>
<html>
  <head>
    <title>Flipbook Preview</title>
    <style>
      html, body { margin: 0; background: #111; overflow: hidden; height: 100%; display: flex; justify-content: center; align-items: center; }
      canvas { image-rendering: pixelated; }
    </style>
  </head>
  <body>
    <canvas id="previewCanvas"></canvas>
    <script>
      const frames = [];
      ${framesJS}

      const images = frames.map(src => {
        const img = new Image();
        img.src = src;
        return img;
      });

      const canvas = document.getElementById("previewCanvas");
      const ctx = canvas.getContext("2d");
      const fps = 12;
      let index = 0;

      const preload = () => {
        let loaded = 0;
        images.forEach(img => {
          img.onload = () => {
            loaded++;
            if (loaded === images.length) startLoop();
          };
        });
      };

      const startLoop = () => {
        canvas.width = images[0].width;
        canvas.height = images[0].height;
        setInterval(() => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = "#fff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(images[index], 0, 0);
          index = (index + 1) % images.length;
        }, 1000 / fps);
      };

      preload();
    <\/script>
  </body>
</html>`;

        const blob = new Blob([html], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const win = window.open();
        win.document.open();
        win.document.write(html);
        win.document.close();

        collectedFrames = []; // reset after playback
      }
    }
  });
});
