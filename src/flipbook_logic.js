function launchFlipbookFromAnimPreview(buttonId = "browserPreviewSelectedBtn") {
  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById(buttonId);
    if (!btn) return console.error(`❌ Button #${buttonId} not found`);

    const collectedFrames = [];

    btn.onclick = () => {
      const script = `
        (function () {
          try {
            var doc = app.activeDocument;
            var group = doc.layerSets.getByName("anim_preview");

            if (!group || group.layers.length === 0) {
              app.echoToOE("❌ 'anim_preview' group missing or empty.");
              return;
            }

            var tempDoc = app.documents.add(doc.width, doc.height, doc.resolution, "_temp_export", NewDocumentMode.RGB);

            for (var i = group.layers.length - 1; i >= 0; i--) {
              var layer = group.layers[i];
              if (layer.kind !== undefined && !layer.locked) {
                app.activeDocument = tempDoc;
                while (tempDoc.layers.length > 0) tempDoc.layers[0].remove();

                app.activeDocument = doc;
                group.layers[i].duplicate(tempDoc, ElementPlacement.PLACEATBEGINNING);

                app.activeDocument = tempDoc;
                var png = tempDoc.saveToOE("png");
                app.sendToOE(png);
              }
            }

            tempDoc.close(SaveOptions.DONOTSAVECHANGES);
            app.echoToOE("done");
          } catch (e) {
            app.echoToOE("❌ ERROR: " + e.message);
          }
        })();
      `;

      parent.postMessage(script, "*");
      console.log("📤 Script sent to Photopea");
    };

    window.addEventListener("message", (event) => {
      if (event.data instanceof ArrayBuffer) {
        collectedFrames.push(event.data);
      } else if (typeof event.data === "string") {
        if (event.data === "done") {
          if (!collectedFrames.length) {
            alert("❌ No frames received.");
            return;
          }

          const flipbookHTML = `
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
    ${collectedFrames.map((ab, i) => {
      const base64 = btoa(String.fromCharCode(...new Uint8Array(ab)));
      return \`frames[\${i}] = "data:image/png;base64,\${base64}";\`;
    }).join("\n")}

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
          if (++loaded === images.length) startLoop();
        };
      });
    };

    const startLoop = () => {
      canvas.width = images[0].width;
      canvas.height = images[0].height;
      setInterval(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(images[index], 0, 0);
        index = (index + 1) % images.length;
      }, 1000 / fps);
    };

    preload();
  <\/script>
</body>
</html>`;

          const blob = new Blob([flipbookHTML], { type: "text/html" });
          const url = URL.createObjectURL(blob);
          const win = window.open(url, "_blank");
          collectedFrames.length = 0;
        } else if (event.data.startsWith("❌")) {
          alert(event.data);
        }
      }
    });
  });
}
