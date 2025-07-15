function mergeFrames() {
  const script = `
    (function () {
      if (!app.activeDocument) {
        alert("❗ No document open.");
        return;
      }

      var doc = app.activeDocument;
      var layer = new Layer();
      layer.name = "Layer_From_Plugin";
      doc.addLayer(layer);
      alert("✅ Layer created via addLayer().");
    })();
  `;

  window.parent.postMessage(script.trim(), "*");
}
