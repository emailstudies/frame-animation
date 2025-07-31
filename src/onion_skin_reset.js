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

        if (
          group.typename === "LayerSet" &&
          group.name.indexOf("anim_") === 0 &&
          group.name !== "anim_preview"
        ) {
          try {
            group.visible = true;
          } catch (e) {
            alert("⚠️ Could not unhide folder: " + group.name);
          }

          var layers = group.layers;
          for (var j = 0; j < layers.length; j++) {
            var layer = layers[j];
            if (layer.typename !== "Layer") continue;

            try {
              if (j === 0) {
                layer.visible = true;
                layer.opacity = 100;
              } else {
                layer.opacity = 0;
              }
            } catch (e) {
              alert("⚠️ Failed to update layer: " + layer.name);
            }
          }
        }
      }

      alert("✅ Onion skin reset: Folders shown, first layer restored, others faded out.");
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
