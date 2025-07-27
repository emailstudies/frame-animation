document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("previewSelectedBtn");

  if (!btn) {
    console.error("❌ Button not found");
    return;
  }

  btn.onclick = () => {
    const script = `
      (function () {
        try {
          var original = app.activeDocument;
          if (!original || original.layers.length === 0) {
            app.echoToOE("❌ No active document or layers.");
            return;
          }

          var dupDoc = app.documents.add(original.width, original.height, original.resolution, "temp_export", NewDocumentMode.RGB);

          for (var i = original.layers.length - 1; i >= 0; i--) {
            var layer = original.layers[i];
            if (layer.kind !== LayerKind.NORMAL || layer.name === "Background") continue;

            app.activeDocument = original;
            original.activeLayer = layer;
            layer.opacity = 100; // ensure visible
            layer.duplicate(dupDoc, ElementPlacement.PLACEATEND);
          }

          app.activeDocument = dupDoc;

          for (var i = dupDoc.layers.length - 1; i >= 0; i--) {
            dupDoc.activeLayer = dupDoc.layers[i];
            dupDoc.saveToOE("png");
          }

          app.echoToOE("done");
          dupDoc.close(SaveOptions.DONOTSAVECHANGES);
        } catch (e) {
          app.echoToOE("❌ ERROR: " + e.message);
        }
      })();
    `;

    parent.postMessage(script, "*");
    console.log("📤 Sent export script to Photopea.");

    const receivedFrames = [];
    const win = window.open("", "_blank");

    window.addEventListener("message", function handler(event) {
      if (event.data instanceof ArrayBuffer) {
        const blob = new Blob([event.data], { type: "image/png" });
        const url = URL.createObjectURL(blob);
        receivedFrames.push(url);
      } else if (typeof event.data === "string") {
        console.log("📩 Photopea message:", event.data);

        if (event.data === "done") {
          if (receivedFrames.length === 0) {
            alert("❌ No frames received.");
            return;
          }

          const fps = 12;
          const duration = 1000 / fps;

          // Delay building until all frames are ready
          let html = `
            <html><head><title>Flipbook Preview</title></head>
            <body style="margin:0; background:#111;">
              <canvas id="flipCanvas"></canvas>
              <script>
                const frames = ${JSON.stringify(receivedFrames)};
                const fps = ${fps};
                const canvas = document.getElementById('flipCanvas');
                const ctx = canvas.getContext('2d');
                const images = [];
                let index = 0;

                const loadImages = () => {
                  let loaded = 0;
                  frames.forEach((src, i) => {
                    const img = new Image();
                    img.onload = () => {
                      loaded++;
                      if (loaded === frames.length) start();
                    };
                    img.src = src;
                    images[i] = img;
                  });
                };

                const start = () => {
                  if (!images[0]) return;
                  canvas.width = images[0].width;
                  canvas.height = images[0].height;
                  setInterval(() => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(images[index], 0, 0);
                    index = (index + 1) % images.length;
                  }, ${duration});
                };

                loadImages();
              </script>
            </body></html>
          `;

          win.document.open();
          win.document.write(html);
          win.document.close();
        }
      }
    });
  };
});
