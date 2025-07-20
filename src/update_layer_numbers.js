function handleUpdateLayerNumbers() {
  const script = `
    var doc = app.activeDocument;

    // Find first folder that starts with anim_
    var animFolder = null;
    for (var i = 0; i < doc.layers.length; i++) {
      var folder = doc.layers[i];
      if (folder.name && folder.name.startsWith("anim_") && folder.typename === "LayerSet") {
        animFolder = folder;
        break;
      }
    }

    if (!animFolder) {
      alert("No anim_ folder found.");
    } else {
      var frameLayers = [];

      for (var j = 0; j < animFolder.layers.length; j++) {
        var layer = animFolder.layers[j];
        if (layer.typename !== "LayerSet") frameLayers.push(layer);
      }

      var max = frameLayers.length;
      if (max === 0) {
        alert("No frame layers inside anim folder.");
      } else {
        var baseName = frameLayers[max - 1].name;

        // Rename top to bottom: 3/3, 2/3, 1/3, etc.
        for (var k = 0; k < max; k++) {
          var frameNum = max - k;
          try {
            frameLayers[k].name = frameNum + "/" + max + " " + baseName;
          } catch (e) {}
        }

        alert("Layer Numbers Updated");
      }
    }
  `;

  window.parent.postMessage(script, "*");
}
