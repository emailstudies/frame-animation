function previewGif() {
  window.parent.postMessage({ type: "getPSD" }, "*");
}

window.addEventListener("message", (e) => {
  if (e.data.type === "psd") {
    const psd = e.data.data;
    if (!psd || !psd.children) {
      alert("No PSD data received");
      return;
    }

    const animFolder = psd.children.find(
      (layer) => layer.name.startsWith("anim_") && layer._R === "LayerSection"
    );

    if (!animFolder || !animFolder.children || animFolder.children.length === 0) {
      alert("No anim folder with layers found");
      return;
    }

    const frames = [];
    for (let layer of animFolder.children) {
      if (
        layer &&
        layer._R === "Layer" &&
        !layer.hidden &&
        !layer.locked &&
        layer.thumbnail
      ) {
        frames.push({ name: layer.name, data: layer.thumbnail });
      }
    }

    if (frames.length === 0) {
      alert("No visible, unlocked layers with thumbnails found");
      return;
    }

    alert("Frame data collected: " + frames.length + " image(s)");

    const previewWindow = window.open("canvas_preview.html", "_blank");
    setTimeout(() => {
      previewWindow.postMessage({ type: "frameImages", frames }, "*");
    }, 1000);
  }
});
