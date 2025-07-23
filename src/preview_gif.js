function previewGif() {
  window.parent.postMessage({ type: "getPSD" }, "*");
}

window.onmessage = function (event) {
  const psd = event.data;
  if (!psd || !psd.children) {
    alert("No PSD data received");
    return;
  }

  const canvas = document.getElementById("previewCanvas");
  const ctx = canvas.getContext("2d");

  const animFolder = psd.children.find(f => f.name.startsWith("anim_") && f.type === "group");

  if (!animFolder) {
    alert("No anim_* folder found");
    return;
  }

  const frameLayers = animFolder.children.filter(
    l => l.type === "layer" && !l.locked && l.visible && l.thumbnail
  );

  if (frameLayers.length < 2) {
    alert("Need at least 2 visible, unlocked layers with thumbnails");
    return;
  }

  const images = frameLayers.map(l => {
    const img = new Image();
    img.src = "data:image/png;base64," + l.thumbnail;
    return img;
  });

  let loaded = 0;
  images.forEach(img => {
    img.onload = () => {
      loaded++;
      if (loaded === images.length) {
        let current = 0;
        setInterval(() => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(images[current], 0, 0);
          current = (current + 1) % images.length;
        }, 1000 / 24);
        alert("Preview started");
      }
    };
  });
};
