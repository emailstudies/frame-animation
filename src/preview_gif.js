function previewGif() {
  // Ask Photopea to send us the current PSD structure
  window.parent.postMessage({ type: "getPSD" }, "*");
}

// Listen for PSD data from Photopea
window.addEventListener("message", function (event) {
  if (event.data && event.data.type === "getPSD") {
    const psd = event.data.data;

    if (!psd || !psd.children) {
      alert("❌ No PSD data received or PSD is empty");
      return;
    }

    // ✅ PSD received! Proceed to preview the frames
    console.log("✅ PSD received", psd);
    startFramePreview(psd);
  }
});

function startFramePreview(psd) {
  const canvas = document.getElementById("previewCanvas");
  const ctx = canvas.getContext("2d");

  const animFolder = psd.children.find(f => f.name.startsWith("anim_") && f.type === "group");

  if (!animFolder) {
    alert("❌ No anim_* folder found");
    return;
  }

  const frameLayers = animFolder.children.filter(
    l => l.type === "layer" && !l.locked && l.visible && l.thumbnail
  );

  if (frameLayers.length < 2) {
    alert("❌ Need at least 2 visible, unlocked layers with thumbnails");
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
        const fps = 24;
        const delay = 1000 / fps;

        setInterval(() => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(images[current], 0, 0);
          current = (current + 1) % images.length;
        }, delay);

        alert("✅ Preview started at 24 FPS");
      }
    };
  });
}
