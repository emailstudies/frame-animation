function beforeMergingInExport(callback) {
  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) {
        alert("No active document.");
        return;
      }

      for (var i = 0; i < doc.layers.length; i++) {
        var folder = doc.layers[i];
        if (
          folder.typename === "LayerSet" &&
          folder.name.startsWith("anim_") &&
          folder.name !== "anim_preview"
        ) {
          folder.visible = true;

          for (var j = 0; j < folder.layers.length; j++) {
            var layer = folder.layers[j];
            if (layer.typename !== "LayerSet") {
              layer.opacity = 100;
              layer.visible = true;
            }
          }
        }
      }
      app.refresh(); // Force refresh in Photopea
    })();
  `;

  window.parent.postMessage(script, "*");

  // Small delay to ensure Photopea completes execution
  if (typeof callback === "function") {
    setTimeout(callback, 150); // Adjust if needed
  }
}


/* this is the code that what making all layers to 100% and only 1 visible beofr emerging layers - did not work with onion skin 
function beforeMergingInExport() {
  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) {
        alert("No active document.");
        return;
      }

      // Loop through all anim_* folders except anim_preview
      for (var i = 0; i < doc.layers.length; i++) {
        var folder = doc.layers[i];
        if (
          folder.typename === "LayerSet" &&
          folder.name.startsWith("anim_") &&
          folder.name !== "anim_preview"
        ) {
          folder.visible = true;

          var layers = folder.layers;
          for (var j = 0; j < layers.length; j++) {
            var layer = layers[j];
            if (layer.typename !== "LayerSet") {
              layer.opacity = 100;
              layer.visible = (j === layers.length - 1); // Only topmost frame visible
            }
          }
        }
      }

      alert("🔄 Onion skin reset: visibility and opacity restored.");
    })();
  `;

  window.parent.postMessage(script, "*");
} */
