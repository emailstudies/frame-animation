function exportGif() {
  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) {
        alert("No active document.");
        return;
      }

      // Find the folder named "anim_e"
      var targetFolder = null;
      for (var i = 0; i < doc.layers.length; i++) {
        var layer = doc.layers[i];
        if (layer.name === "anim_e" && layer.typename === "LayerSet") {
          targetFolder = layer;
          break;
        }
      }

      if (!targetFolder) {
        alert("Folder 'anim_e' not found.");
        return;
      }

      // Select the folder and create a new layer inside it
      app.activeDocument.activeLayer = targetFolder;
      var newLayer = app.activeDocument.artLayers.add();
      newLayer.name = "New Layer";
      newLayer.move(targetFolder, ElementPlacement.INSIDE);

      console.log("✅ New layer created inside 'anim_e'");
    })();
  `;

  window.parent.postMessage(script, "*");
}
