function exportGif() {
  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) {
        alert("No active document.");
        return;
      }

      var layerToMove = null;
      var targetFolder = null;

      for (var i = 0; i < doc.layers.length; i++) {
        var layer = doc.layers[i];
        if (layer.name === "Layer 1" && layer.typename !== "LayerSet") {
          layerToMove = layer;
        }
        if (layer.name === "anim_e" && layer.typename === "LayerSet") {
          targetFolder = layer;
        }
      }

      if (!layerToMove || !targetFolder) {
        alert("Could not find 'Layer 1' or 'anim_e' folder.");
        return;
      }

      app.activeDocument.activeLayer = layerToMove;
      layerToMove.move(targetFolder, ElementPlacement.INSIDE);
      console.log("✅ Moved 'Layer 1' into 'anim_e'");
    })();
  `;

  window.parent.postMessage(script, "*");
}
