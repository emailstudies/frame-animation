console.log("✅ flipbook_logic.js loaded");

window.addEventListener("load", function () {
  const btn = parent.document.getElementById("browserPreviewSelectedBtn");
  console.log("🔍 Looking for #browserPreviewSelectedBtn in parent:", !!btn);

  if (!btn) {
    console.error("❌ Button not found in parent document");
    return;
  }

  btn.onclick = function () {
    console.log("✅ browserPreviewSelectedBtn clicked");

    const collectedFrames = [];
    let previewWindow = window.open("", "_blank");

    if (!previewWindow) {
      alert("⚠️ Popup blocked! Please allow popups and try again.");
      return;
    }

    const script = `
      (function () {
        try {
          var doc = app.activeDocument;
          if (!doc) {
            app.echoToOE("❌ No active document.");
            return;
          }

          var animGroup = null;
          for (var i = 0; i < doc.layers.length; i++) {
            var layer = doc.layers[i];
            if (layer.typename === "LayerSet" && layer.name === "anim_preview") {
              animGroup = layer;
              break;
            }
          }

          if (!animGroup) {
            app.echoToOE("❌ anim_preview group not found.");
            return;
          }

          var tempDoc = app.documents.add(doc.width, doc.height, doc.resolution, "_temp_export", NewDocumentMode.RGB);

          for (var i = 0; i < animGroup.layers.length; i++) {
            for (var j = 0; j < animGroup.layers.length; j++) {
              animGroup.layers[j].visible = false;
            }
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

          for (var k = 0; k < animGroup.layers.length; k++) {
            animGroup.layers[k].visible = true;
          }

          app.activeDocument = tempDoc;
          tempDoc.close(SaveOptions.DONOTSAVECHANGES);
          app.echoToOE("done");
        } catch (e) {
          app.echoToOE("❌ ERROR: " + e.message);
        }
      })();
    `;

    parent.postMessage(script, "*");

    window.addEventListener("message", function handler(event) {
      if (event.data instanceof ArrayBuffer) {
        collectedFrames.push(event.data);
        console.log("📥 Frame received (" + collectedFrames.length + ")");
      } else if (typeof event.data === "string") {
        console.log("📩 Message from Photopea:", event.data);

        if (event.data === "done") {
          if (collectedFrames.length === 0) {
            alert("❌ No frames received.");
            return;
          }

          const frameJS = collectedFrames
            .map((buf, i) => {
              const base64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
              return \`frames[\${i}] = "data:image/png;base64,\${base64}";\`;
            })
            .join("\\n");

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
        console.error("Image failed to load");
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

          collectedFrames.length = 0;
          window.removeEventListener("message", handler);
        } else if (event.data.startsWith("❌")) {
          if (previewWindow) {
            previewWindow.document.body.innerHTML = \`<h2 style="color: red;">\${event.data}</h2>\`;
            previewWindow.document.close();
          } else {
            alert(event.data);
          }
          window.removeEventListener("message", handler);
        }
      }
    });
  };
});
