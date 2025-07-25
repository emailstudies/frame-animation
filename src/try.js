function exportGif() {
  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) {
        alert("No active document.");
        return;
      }

      var selectedNames = [];

      for (var i = 0; i < doc.layers.length; i++) {
        var layer = doc.layers[i];
        if (!layer || layer.typename === "LayerSet") continue;

        if (layer.selected) {
          selectedNames.push(layer.name);
        }
      }

      if (selectedNames.length > 0) {
        alert("Selected Layer(s): " + selectedNames.join(", "));
      } else {
        alert("No layers are selected.");
      }
    })();
  `;

  window.parent.postMessage(script, "*");
}
