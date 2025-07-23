function previewGif() {
  window.parent.postMessage({ type: "getPSD" }, "*");

  window.onmessage = async function (event) {
    const psd = event.data;
    if (!psd || !psd.children) return;

    const canvas = document.getElementById("previewCanvas");
    const ctx = canvas.getContext("2d");

    // 1. Find first anim_* folder
    const animFolder = psd.children.find(f => f.name.startsWith("anim_") && f.type === "group");

    if (!animFolder) {
      alert("❌ No animation folder found.");
      return;
    }

    // 2. Get visible, unlocked layers with thumbnails
    const frameLayers = animFolder.children.filter(l =>
      l.type === "layer" && !l.locked && l.visible && l.thumbnail
    );

    if (frameLayers.length < 2) {
      alert("❌ Need at least 2 visible, unlocked layers with thumbnails.");
      return;
    }

    // 3. Convert thumbnails to Image objects
    const frameImages = frameLayers.map(layer => {
      const img = new Image();
      img.src = "data:image/png;base64," + layer.thumbnail;
      return img;
    });

    // 4. Wait for all images to load
    let loaded = 0;
    frameImages.forEach(img => {
      img.onload = () => {
        loaded++;
        if (loaded === frameImages.length) {
          startCanvasAnimation(frameImages);
        }
      };
    });

    function startCanvasAnimation(frames) {
      let current = 0;
      const fps = 24;
      const delay = 1000 / fps;

      setInterval(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(frames[current], 0, 0);
        current = (current + 1) % frames.length;
      }, delay);

      alert("✅ Preview started on canvas at 24 FPS.");
    }
  };
}
