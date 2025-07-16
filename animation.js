function showFrameByName(name = "Frame_1") {
  const script = `
    (function () {
      var doc = app.activeDocument;
      var layers = doc.layers;
      var found = false;

      for (var i = 0; i < layers.length; i++) {
        if (layers[i].name.startsWith("Frame_")) {
          layers[i].visible = (layers[i].name === "${name}");
          if (layers[i].visible) found = true;
        }
      }

      alert(found ? "🖼️ Showing: ${name}" : "⚠️ Frame not found: ${name}");
    })();
  `;

  window.parent.postMessage(script.trim(), "*");
}
