// This JS file runs inside your plugin iframe
// It sends multiple selected layers from Photopea, opens a new tab, and previews them as a flipbook

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("previewSelectedBtn");

  if (!btn) {
    console.error("❌ Button not found");
    return;
  }

  const frames = [];
  const FPS = 12;
  let previewTab = null;

  btn.onclick = () => {
    frames.length = 0; // Clear old frames

    // Open a new blank tab early
    previewTab = window.open("", "_blank");
    if (!previewTab) {
      alert("Popup blocked! Please allow popups for this site.");
      return;
    }

    // Ask Photopea to export selected layers as PNGs
    const script = `
      var doc = app.activeDocument;
      var selectedLayers = [];
      for (var i = 0; i < doc.layers.length; i++) {
        if (doc.layers[i].selected) {
          selectedLayers.push(doc.layers[i]);
        }
      }
      if (selectedLayers.length > 0) {
        app.activeDocument.saveToOE("png", selectedLayers);
        app.echoToOE("✅ done");
      } else {
        app.echoToOE("❌ No layers selected");
      }
    `;
    parent.postMessage(script, "*");
    console.log("📤 Sent script to Photopea.");
  };

  window.addEventListener("message", (event) => {
    if (event.data instanceof ArrayBuffer) {
      const blob = new Blob([event.data], { type: "image/png" });
      const url = URL.createObjectURL(blob);
      frames.push(url);
    } else if (typeof event.data === "string") {
      console.log("📩 Message from Photopea:", event.data);
      if (event.data.includes("✅ done")) {
        if (frames.length > 0) {
          openCanvasPreview(frames);
        } else {
          console.warn("⚠️ No frames received");
        }
      }
    }
  });

  function openCanvasPreview(urls) {
    const html = `<!DOCTYPE html>
      <html><head><title>Animation Preview</title><style>
        body { margin: 0; background: #111; display: flex; justify-content: center; align-items: center; height: 100vh; }
        canvas { border: 2px solid #ccc; background: white; }
      </style></head>
      <body><canvas id="previewCanvas"></canvas>
        <script>
          const canvas = document.getElementById('previewCanvas');
          const ctx = canvas.getContext('2d');
          const urls = ${JSON.stringify(urls)};
          const FPS = ${FPS};
          const images = [];
          let loaded = 0;

          urls.forEach(url => {
            const img = new Image();
            img.onload = () => {
              loaded++;
              if (loaded === urls.length) start();
            };
            img.src = url;
            images.push(img);
          });

          function start() {
            canvas.width = images[0].naturalWidth;
            canvas.height = images[0].naturalHeight;
            let i = 0;
            setInterval(() => {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(images[i], 0, 0);
              i = (i + 1) % images.length;
            }, 1000 / FPS);
          }
        <\/script>
      </body></html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    previewTab.location = url;
  }
});
