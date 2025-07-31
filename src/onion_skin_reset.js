function resetOnionSkin() {
  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) {
        alert("No active document.");
        return;
      }

      for (var i = 0; i < doc.layers.length; i++) {
        var group = doc.layers[i];

        // Only process anim_* folders (excluding anim_preview)
        if (group.typename === "LayerSet" && group.name.indexOf("anim_") === 0 && group.name !== "anim_preview") {
          try {
            group.visible = true;
          } catch (e) {
            alert("⚠️ Couldn't change visibility of folder: " + group.name);
          }

          // Restore opacity and visibility of the first frame only
          if (group.layers.length > 0) {
            var firstLayer = group.layers[0];
            if (firstLayer.typename === "Layer") {
              try {
                firstLayer.visible = true;
                firstLayer.opacity = 100;
              } catch (e) {
                alert("⚠️ Couldn't restore layer: " + firstLayer.name);
              }
            }
          }
        }
      }

      alert("✅ Onion skin reset: All anim_* folders made visible. First frame restored.");
    })();
  `;

  window.parent.postMessage(script, "*");
}



/* function resetOnionSkin() {
  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) {
        alert("No active document.");
        return;
      }

      var count = 0;

      for (var i = 0; i < doc.layers.length; i++) {
        var group = doc.layers[i];
        if (group.typename === "LayerSet" && group.name.startsWith("anim_")) {
          var layers = group.layers;

          for (var j = 0; j < layers.length; j++) {
            var layer = layers[j];
            if (layer.typename !== "LayerSet") {
              layer.opacity = (j === layers.length - 1) ? 100 : 0;
            }
          }

          count++;
        }
      }

      alert("✅ Onion skin reset. The first frame of each of the " + count + " animation folders is now visible.");
    })();
  `;

  window.parent.postMessage(script, "*");
}
*/
