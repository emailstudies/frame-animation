document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("webPreviewSelectedBtn");
  const collectedFrames = [];

  btn.onclick = () => {
    collectedFrames.length = 0;
    parent.postMessage("EXPORT_SELECTED_ANIM_FRAMES", "*");
    console.log("▶️ Started frame export from selected anim_* folder");
  };

  let previewURL = null;

  window.addEventListener("message", (event) => {
    if (event.data instanceof ArrayBuffer) {
      collectedFrames.push(event.data);
      console.log("🧩 Frame received:", collectedFrames.length);
    } else if (typeof event.data === "string") {
      console.log("📩 Message from Photopea:", event.data);

      if (event.data === "done") {
        if (!collectedFrames.length) {
          alert("❌ No frames received.");
          return;
        }

        // ✅ Create inline preview HTML with base64 frames
        const flipbookHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Flipbook Preview</title>
  <style>
    html, body {
      margin: 0;
      background: #111;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
    }
    canvas {
      image-rendering: pixelated;
    }
  </style>
</head>
<body>
  <canvas id="previewCanvas"></canvas>
  <script>
    const frames = [];
    ${collectedFrames
      .map((ab, i) => {
        const base64 = btoa(String.fromCharCode(...new Uint8Array(ab)));
        return `frames[${i}] = "data:image/png;base64,${base64}";`;
      })
      .join("\n")}

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
          loaded++;
          if (loaded === images.length) startLoop();
        };
      });
    };

    const startLoop = () => {
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

        const blob = new Blob([flipbookHTML], { type: "text/html" });
        previewURL = URL.createObjectURL(blob);
        window.open(previewURL, "_blank");

        collectedFrames.length = 0;
      } else if (event.data.startsWith("❌")) {
        alert(event.data);
      }
    }
  });
});
