// flipbook_logic.js

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("browserPreviewSelectedBtn");

  if (!btn) {
    console.error("❌ Button not found: #previewSelectedBtn");
    return;
  }

  btn.onclick = () => {
    const script = `
      (async function () {
        try {
          var doc = app.activeDocument;
          if (!doc) {
            app.echoToOE("❌ No active document.");
            return;
          }

          // Find the 'anim_preview' group
          var group = null;
          for (var i = 0; i < doc.layers.length; i++) {
            if (doc.layers[i].name === "anim_preview" && doc.layers[i].typename === "LayerSet") {
              group = doc.layers[i];
              break;
            }
          }

          if (!group || group.layers.length < 2) {
            app.echoToOE("❌ 'anim_preview' not found or has < 2 layers.");
            return;
          }

          for (var f = 0; f < 2; f++) {
            // Hide all layers
            for (var j = 0; j < group.layers.length; j++) {
              group.layers[j].visible = false;
            }
            // Show current frame
            group.layers[f].visible = true;

            // Duplicate visible layer into new temp doc
            var tempDoc = app.documents.add(doc.width, doc.height, doc.resolution, "export_frame_" + f, NewDocumentMode.RGB);
            app.activeDocument = doc;
            group.layers[f].duplicate(tempDoc, ElementPlacement.PLACEATBEGINNING);

            // Export and close
            app.activeDocument = tempDoc;
            tempDoc.saveToOE("png");
            app.echoToOE("[flipbook] ✅ Frame " + f + " exported");
            tempDoc.close(SaveOptions.DONOTSAVECHANGES);
          }

          app.echoToOE("[flipbook] ✅ All frames sent.");
        } catch (e) {
          app.echoToOE("❌ ERROR: " + e.message);
        }
      })();
    `;

    parent.postMessage(script, "*");
    console.log("📤 Sent flipbook export script to Photopea.");
  };

  // Frame receiver + flipbook builder
  let receivedFrames = [];

  window.addEventListener("message", (event) => {
    if (event.data instanceof ArrayBuffer) {
      console.log("📥 Received frame", receivedFrames.length + 1);
      receivedFrames.push(event.data);

      if (receivedFrames.length === 2) {
        // All frames received, build preview
        const urls = receivedFrames.map((buf) =>
          URL.createObjectURL(new Blob([buf], { type: "image/png" }))
        );

        const html = `
          <html>
            <head><title>Flipbook Preview</title></head>
            <body style="margin:0; display:flex; justify-content:center; align-items:center; height:100vh; background:#000;">
              <canvas id="flipCanvas"></canvas>
              <script>
                const urls = ${JSON.stringify(urls)};
                const canvas = document.getElementById('flipCanvas');
                const ctx = canvas.getContext('2d');
                const images = [];
                let frame = 0;

                function loadImages(index = 0) {
                  if (index >= urls.length) return playFlipbook();
                  const img = new Image();
                  img.onload = () => {
                    images.push(img);
                    if (images.length === 1) {
                      canvas.width = img.width;
                      canvas.height = img.height;
                    }
                    loadImages(index + 1);
                  };
                  img.src = urls[index];
                }

                function playFlipbook() {
                  setInterval(() => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(images[frame], 0, 0);
                    frame = (frame + 1) % images.length;
                  }, 500);
                }

                loadImages();
              </script>
            </body>
          </html>
        `;

        const blob = new Blob([html], { type: "text/html" });
        const flipURL = URL.createObjectURL(blob);
        window.open(flipURL, "_blank");

        receivedFrames = []; // Reset for next run
      }
    } else if (typeof event.data === "string") {
      console.log("📩 Message from Photopea:", event.data);
      if (event.data.startsWith("[flipbook]")) {
        console.log(event.data);
      } else {
        alert(event.data);
      }
    }
  });
});
