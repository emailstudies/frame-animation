function generateFlipbookInNewTab(byteArrays) {
  const htmlContent = `
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
    function generateFlipbookHTML(byteArrays) {
      const canvas = document.getElementById("previewCanvas");
      const ctx = canvas.getContext("2d");
      const fps = 12;
      let frames = [], index = 0;

      const loadImage = (bytes) => {
        return new Promise((resolve) => {
          const blob = new Blob([new Uint8Array(bytes)], { type: "image/png" });
          const url = URL.createObjectURL(blob);
          const img = new Image();
          img.onload = () => {
            URL.revokeObjectURL(url);
            resolve(img);
          };
          img.src = url;
        });
      };

      (async () => {
        frames = await Promise.all(byteArrays.map(loadImage));
        if (!frames.length) return;

        canvas.width = frames[0].width;
        canvas.height = frames[0].height;

        setInterval(() => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(frames[index], 0, 0);
          index = (index + 1) % frames.length;
        }, 1000 / fps);
      })();
    }

    const byteArrays = __FRAME_DATA__.map(arr => new Uint8Array(arr));
    generateFlipbookHTML(byteArrays);
  <\/script>
</body>
</html>
`;

  const frameData = JSON.stringify(byteArrays.map(buf => Array.from(new Uint8Array(buf))));
  const finalHtml = htmlContent.replace("__FRAME_DATA__", frameData);

  const newTab = window.open();
  newTab.document.open();
  newTab.document.write(finalHtml);
  newTab.document.close();
}
