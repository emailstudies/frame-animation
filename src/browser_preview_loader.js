document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("webPreviewSelectedBtn");
  const collectedFrames = [];

  btn.onclick = () => {
    collectedFrames.length = 0;
    console.log("▶️ Started frame export");
    parent.postMessage("EXPORT_SELECTED_ANIM_FRAMES", "*");
  };

  window.addEventListener("message", (event) => {
    if (event.data instanceof ArrayBuffer) {
      collectedFrames.push(event.data);
    } else if (typeof event.data === "string") {
      console.log("📩 Message from Photopea:", event.data);

      if (event.data === "done") {
        if (collectedFrames.length === 0) {
          alert("❌ No frames received.");
          return;
        }

        console.log("✅ Received all frames, opening preview...");
        openFlipbookPreview(collectedFrames);
        collectedFrames.length = 0;
      } else if (event.data.startsWith("❌")) {
        alert(event.data);
      }
    }
  });

  function openFlipbookPreview(arrayBuffers) {
    const frameJS = arrayBuffers.map((ab, i) => {
      const base64 = btoa(String.fromCharCode(...new Uint8Array(ab)));
      return `frames[${i}] = "data:image/png;base64,${base64}";`;
    }).join("\n");

    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Flipbook Preview</title>
  <style>
    html, body {
      margin: 0; background: #111; height: 100%; overflow: hidden;
      display: flex; justify-content: center; align-items: center;
    }
    canvas { image-rendering: pixelated; }
  </style>
</head>
<body>
  <canvas id="previewCanvas"></canvas>
  <script>
    const frames = [];
    ${frameJS}

    const canvas = document.getElementById("previewCanvas");
    const ctx = canvas.getContext("2d");
    const fps = 12;
    let index = 0;

    const images = frames.map(src => {
      const img = new Image();
      img.src = src;
      return img;
    });

    let loaded = 0;
    images.forEach(img => {
      img.onload = () => {
        if (++loaded === images.length) startPlayback();
      };
    });

    function startPlayback() {
      canvas.width = images[0].width;
      canvas.height = images[0].height;
      setInterval(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(images[index], 0, 0);
        index = (index + 1) % images.length;
      }, 1000 / fps);
    }
  </script>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  }
});
