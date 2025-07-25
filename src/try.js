function exportGif() {
  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) {
        alert("No active document.");
        return;
      }

      var name = prompt("Enter the exact name of the layer to select:");

      if (!name) {
        alert("No name entered.");
        return;
      }

      for (var i = 0; i < doc.layers.length; i++) {
        var layer = doc.layers[i];
        if (layer.name === name && layer.typename !== "LayerSet") {
          doc.activeLayer = layer;
          alert("✅ Selected: " + name);
          return;
        }
      }

      alert("❌ Layer '" + name + "' not found.");
    })();
  `;

  window.parent.postMessage(script, "*");
}
