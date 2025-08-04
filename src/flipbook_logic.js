console.log("📦 flipbook_logic.js loaded");

window.runSelectedFlipbookPreview = function () {
  console.log("🚀 runSelectedFlipbookPreview triggered");

  let previewWindow = window.open("", "_blank");
  if (!previewWindow) {
    alert("⚠️ Popup blocked! Please allow popups.");
    return;
  }

  const collectedFrames = [];

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

          var frame = animGroup.layers[i];
          frame.visible = true;

          app.activeDocument = doc;
          doc.activeLayer = frame;
          frame.duplicate(tempDoc, ElementPlacement.PLACEATBEGINNING);

          app.activeDocument = tempDoc;
          tempDoc.flatten();
          tempDoc.saveToOE("png");
          tempDoc.undo();
        }

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

  window.addEventListener("message", function handleMessage(event) {
    if (event.data instanceof ArrayBuffer) {
      collectedFrames.push(event.data);
      console.log("📥 Received frame", collectedFrames.length);
    } else if (typeof event.data === "string") {
      console.log("📩 Message:", event.data);

      if (event.data === "done") {
        window.removeEventListener("message", handleMessage);
        if (collectedFrames.length === 0) {
          previewWindow.document.write("<h2 style='color:red;'>❌ No frames received.</h2>");
          previewWindow.document.close();
          return;
        }

        const frameJS = collectedFrames.map((buf, i) => {
          const base64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
          return `frames[${i}] = "data:image/png;base64,${base64}";`;
        }).join("\n");

        const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Flipbook Preview</title>
  <style>
    html, body {
      margin: 0; background: #111;
      height: 100%; display: flex;
      justify-content: center; align-items: center;
    }
    canvas { background: black; image-rendering: pixelated; }
  </style>
</head>
<body>
  <canvas id="previewCanvas"></canvas>
  <script>
    const frames = [];
    ${frameJS}

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
      } else if (event.data.startsWith("❌")) {
        previewWindow.document.body.innerHTML = `<h2 style="color:red;">${event.data}</h2>`;
        previewWindow.document.close();
      }
    }
  });
};
