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
        if (!doc) {
          app.echoToOE("❌ No document open.");
          return;
        }

        var validLayers = [];
        for (var i = 0; i < doc.layers.length; i++) {
          var l = doc.layers[i];
          if (!l.visible || l.locked || l.kind !== 1) continue; // kind === 1 is normal/pixel
          validLayers.push(l);
        }

        if (validLayers.length === 0) {
          app.echoToOE("❌ No valid layers found.");
          return;
        }

        var dupDoc = app.documents.add(doc.width, doc.height, doc.resolution, "temp_export", NewDocumentMode.RGB);

        for (var i = validLayers.length - 1; i >= 0; i--) {
          app.activeDocument = doc;
          doc.activeLayer = validLayers[i];
          validLayers[i].duplicate(dupDoc, ElementPlacement.PLACEATEND);
        }

        app.activeDocument = dupDoc;

        for (var i = 0; i < dupDoc.layers.length; i++) {
          dupDoc.activeLayer = dupDoc.layers[i];
          app.activeDocument.saveToOE("png");
        }

        app.echoToOE("done");
      })();
    `;
    parent.postMessage(script, "*");
    console.log("📤 Sent script to Photopea.");
  };

  // FPS = 12 → 1000 / 12 = ~83ms per frame
  const FPS = 12;
  const DELAY = 1000 / FPS;
  const receivedFrames = [];

  window.addEventListener("message", (event) => {
    if (event.data instanceof ArrayBuffer) {
      const blob = new Blob([event.data], { type: "image/png" });
      const url = URL.createObjectURL(blob);
      receivedFrames.push(url);
      console.log("📥 Received frame:", url);
    } else if (typeof event.data === "string") {
      console.log("📩 Message from Photopea:", event.data);

      if (event.data === "done") {
        if (receivedFrames.length === 0) {
          alert("❌ No frames received.");
          return;
        }

        // 🧠 Open a new tab with a canvas-based preview
        const previewTab = window.open("", "_blank");
        const html = `
          <html>
          <head><title>Preview</title></head>
          <body style="margin:0; display:flex; align-items:center; justify-content:center; background:#111;">
            <canvas id="previewCanvas"></canvas>
            <script>
              const frames = ${JSON.stringify(receivedFrames)};
              let index = 0;
              const fps = ${FPS};
              const delay = ${DELAY};
              const img = new Image();
              const canvas = document.getElementById("previewCanvas");
              const ctx = canvas.getContext("2d");

              img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
              };
              img.src = frames[0];

              setInterval(() => {
                index = (index + 1) % frames.length;
                img.src = frames[index];
              }, delay);
            </script>
          </body>
          </html>
        `;
        previewTab.document.write(html);
        previewTab.document.close();
      } else {
        alert(event.data);
      }
    }
  });
});
