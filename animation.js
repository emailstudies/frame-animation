function mergeFrames() {
  const script = `
    (function () {
      if (!app.documents.length) {
        alert("❗ No document is open.");
        return;
      }

      var doc = app.activeDocument;
      var newLayer = doc.createLayer();
      newLayer.name = "Layer_From_Plugin";
      alert("✅ New layer created by plugin.");
    })();
  `;

  window.parent.postMessage(script.trim(), "*");
}
