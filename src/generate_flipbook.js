function generateFlipbookHTML(frames) {
  const encoded = frames.map((ab, i) => {
    const base64 = btoa(String.fromCharCode(...new Uint8Array(ab)));
    return `frames[${i}] = "data:image/png;base64,${base64}";`;
  }).join("\n");

  return `
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
    ${encoded}

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
        ctx.drawImage(images[index], 0, 0);
        index = (index + 1) % images.length;
      }, 1000 / fps);
    };

    preload();
  </script>
</body>
</html>`;
}
