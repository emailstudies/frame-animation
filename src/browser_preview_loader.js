// browser_preview_loader.js
// ✅ Handles Web Preview Selected logic safely

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("webPreviewSelectedBtn");
  const collectedFrames = [];
  let exportStarted = false;

  btn.onclick = () => {
    collectedFrames.length = 0;
    exportStarted = false;
    console.log("▶️ Started frame export");

    // Open tab immediately to avoid popup block
    const win = window.open();
    win.document.write("<p>Preparing preview...</p>");
    win.document.close();
    window._previewTab = win;

    // Tell Photopea to begin export
    parent.postMessage("EXPORT_SELECTED_ANIM_FRAMES", "*");
  };

  window.addEventListener("message", (event) => {
    if (event.data instanceof ArrayBuffer) {
      collectedFrames.push(event.data);
    } else if (typeof event.data === "string") {
      console.log("📩 Message from Photopea:", event.data);

      if (event.data === "done") {
        if (!exportStarted) {
          exportStarted = true; // First 'done' = init
          return;
        }

        if (collectedFrames.length === 0) {
          alert("❌ No frames received.");
          return;
        }

        console.log("✅ Received all frames, opening inline preview");
        const flipbookHTML = generateInlineFlipbook(collectedFrames);

        const blob = new Blob([flipbookHTML], { type: "text/html" });
        const url = URL.createObjectURL(blob);

        window._previewTab.location.href = url;
        window._previewTab.focus();
      }

      if (event.data.startsWith("❌")) {
        alert(event.data);
      }
    }
  });

  function generateInlineFlipbook(arrayBuffers) {
    const frameData = arrayBuffers
      .map((ab, i) => {
        const base64 = btoa(String.fromCharCode(...new Uint8Array(ab)));
        return `frames[${i}] = "data:image/png;base64,${base64}";`;
      })
      .join("\n");

    return `<!DOCTYPE html>
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
    const canvas = document.getElementById("previewCanvas");
    const ctx = canvas.getContext("2d");
    const fps = 12;
    const frames = [];
    let index = 0;

    ${frameData}

    const images = frames.map(src => {
      const img = new Image();
      img.src = src;
      return img;
    });

    const preload = () => {
      let loaded = 0;
      images.forEach(img => {
        img.onload = () => {
          loaded++;
          if (loaded === images.length) start();
        };
      });
    };

    const start = () => {
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
  </script>
</body>
</html>`;
  }
});
