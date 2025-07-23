function previewGif() {
  const script = `
    var doc = app.activeDocument;
    if (!doc) {
      alert("No document open.");
    } else {
      // Find the first anim_ folder
      var animFolder = null;
      for (var i = 0; i < doc.layers.length; i++) {
        var layer = doc.layers[i];
        if (layer.typename === "LayerSet" && layer.name.startsWith("anim_")) {
          animFolder = layer;
          break;
        }
      }

      if (!animFolder) {
        alert("No animation folder (anim_*) found.");
      } else {
        var visibleStates = [];
        for (var i = 0; i < animFolder.layers.length; i++) {
          visibleStates.push(animFolder.layers[i].visible);
          animFolder.layers[i].visible = false;
        }

        var frames = [];
        var frameCount = animFolder.layers.length;

        function collectFrame(index) {
          if (index >= frameCount) {
            // Restore visibility
            for (var i = 0; i < animFolder.layers.length; i++) {
              animFolder.layers[i].visible = visibleStates[i];
            }

            alert("✅ Frame data collected: " + frames.length + " image(s)");

            var newWin = window.open("canvas_preview.html", "_blank");
            setTimeout(function () {
              newWin.postMessage({ type: "frameImages", frames: frames }, "*");
            }, 500);
          } else {
            var layer = animFolder.layers[frameCount - 1 - index];
            layer.visible = true;
            app.activeDocument.activeLayer = layer;

            app.activeDocument.saveToOE("png").then(function(png) {
              frames.push({ name: layer.name, data: png });
              layer.visible = false;
              collectFrame(index + 1);
            });
          }
        }

        collectFrame(0);
      }
    }
  `;

  window.parent.postMessage(script, "*");
}
