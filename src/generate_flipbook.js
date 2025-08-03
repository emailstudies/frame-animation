function generateFlipbookHTML(frames) {
  const base64Snippets = frames.map((ab, i) => {
    const base64 = btoa(String.fromCharCode(...new Uint8Array(ab)));
    return `frames[${i}] = "data:image/png;base64,${base64}";`;
  }).join("\n");

  return `
<!DOCTYPE html>
<html>
<head>
  <title>Flipbook Preview</title>
  <style>
    html, body {
      margin: 0;
      background: #111;
      overflow: hidden;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    canvas { image-rendering: pixelated; }
  </style>
</head>
<body>
  <canvas id="previewCanvas"></canvas>
  <script>
    const frames = [];
    ${base64Snippets}

    console.log("🧪 Base64 snippet diff check:");
    frames.forEach((f, i) => {
      console.log("Frame", i, "starts with:", f.slice(0, 80));
    });

    const canvas = document.getElementById("previewCanvas");
    const ctx = canvas.getContext("2d");
    const fps = 12;
    let index = 0;

    const images = [];
    let loaded = 0;

    for (let i = 0; i < frames.length; i++) {
      const img = new Image();
      img.onload = () => {
        console.log("✅ Frame", i, "loaded");
        loaded++;
        if (loaded === frames.length) {
          console.log("🚀 All frames loaded. Starting loop.");
          startLoop();
        }
      };
      img.onerror = () => {
        console.error("❌ Failed to load frame", i);
      };
      images.push(img);
      img.src = frames[i]; // Set AFTER onload
    }

    function startLoop() {
      if (images.length === 0) return;

      canvas.width = images[0].width;
      canvas.height = images[0].height;
      console.log("🎞️ Starting animation loop");

      setInterval(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(images[index], 0, 0);
        console.log("🖼️ Showing frame", index);
        index = (index + 1) % images.length;
      }, 1000 / fps);
    }
  </script>
</body>
</html>`;
}
