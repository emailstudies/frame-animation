document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("previewSelectedBtn");

  if (!btn) {
    console.error("❌ Button not found");
    return;
  }

  btn.onclick = () => {
    const script = `
      (function () {
        var doc = app.activeDocument;
        var validLayers = [];

        // Collect all visible, unlocked pixel layers (not groups or adjustment/text)
        for (var i = 0; i < doc.layers.length; i++) {
          var l = doc.layers[i];
          if (!l.visible || l.locked || l.kind != "LayerKind.NORMAL") continue;
          validLayers.push(l);
        }

        if (validLayers.length === 0) {
          app.echoToOE("❌ No valid layers found.");
          return;
        }

        // Process one layer at a time
        var delay = 1000 / 12; // 12 fps
        function processNext(i) {
          if (i >= validLayers.length) {
            app.echoToOE("✅ All layers sent.");
            return;
          }

          var layer = validLayers[i];

          // Create a temporary document
          var dupDoc = app.documents.add(doc.width, doc.height, doc.resolution, "temp", NewDocumentMode.RGB);
          doc.activeLayer = layer;
          layer.duplicate(dupDoc, ElementPlacement.PLACEATEND);
          app.activeDocument = dupDoc;

          dupDoc.saveToOE("png");

          setTimeout(function () {
            dupDoc.close(SaveOptions.DONOTSAVECHANGES);
            app.activeDocument = doc;
            processNext(i + 1);
          }, delay);
        }

        processNext(0);
      })();
    `;
    parent.postMessage(script, "*");
    console.log("📤 Sent layer export script to Photopea.");
  };

  // Collect ArrayBuffers and play as animation in new tab
  const imageBuffers = [];
  window.addEventListener("message", (event) => {
    if (event.data instanceof ArrayBuffer) {
      imageBuffers.push(event.data);
    } else if (typeof event.data === "string") {
      console.log("📩 Message from Photopea:", event.data);

      if (event.data.startsWith("✅ All layers sent")) {
        // Open animation in new tab after all buffers collected
        const animWindow = window.open("", "_blank");
        const html = `
          <html>
            <head><title>Preview</title></head>
            <body style="margin:0; background:#111;">
              <canvas id="previewCanvas"></canvas>
              <script>
                const canvas = document.getElementById("previewCanvas");
                const ctx = canvas.getContext("2d");
                const buffers = [];
                let index = 0;
                const fps = 12;

                window.addEventListener("message", async (event) => {
                  if (event.data instanceof ArrayBuffer) {
                    const blob = new Blob([event.data], { type: "image/png" });
                    const img = new Image();
                    img.src = URL.createObjectURL(blob);
                    await img.decode();
                    buffers.push(img);

                    if (buffers.length === 1) {
                      canvas.width = img.width;
                      canvas.height = img.height;
                      playAnimation();
                    }
                  }
                });

                function playAnimation() {
                  setInterval(() => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(buffers[index], 0, 0);
                    index = (index + 1) % buffers.length;
                  }, 1000 / fps);
                }
              </script>
            </body>
          </html>
        `;

        // Write the animation page content and pipe images
        animWindow.document.write(html);
        imageBuffers.forEach(buf => animWindow.postMessage(buf, "*"));
      } else {
        alert(event.data); // e.g. "❌ No valid layers found."
      }
    }
  });
});
