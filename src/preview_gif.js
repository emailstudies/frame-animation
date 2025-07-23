function previewGif() {
  // Open a new window for preview
  const previewWindow = window.open("canvas_preview.html", "_blank");

  // Once the window is ready, send the PSD
  window.parent.postMessage({ type: "getPSD" }, "*");

  window.addEventListener("message", function handlePSD(event) {
    if (event.data?.type === "getPSD") {
      const psd = event.data.data;
      if (previewWindow) {
        previewWindow.postMessage(psd, "*");
      }
      // Remove listener after sending
      window.removeEventListener("message", handlePSD);
    }
  });
}
