function handleUpdateLayerNumbers() {
  const script = `
    var doc = app.activeDocument;

    // Find first anim_* folder
    var animFolder = null;
    for (var i = 0; i < doc.layers.length; i++) {
      var folder = doc.layers[i];
      if (folder.isGroup && folder.name.indexOf("anim_") === 0) {
        animFolder = folder;
        break;
      }
    }

    if (!animFolder) {
      alert("No anim_ folder found.");
    } else {
      // Collect non-group layers only
      var frameLayers = [];
      for (var j = 0; j < animFolder.layers.length; j++) {
        var layer = animFolder.layers[j];
        if (!layer.isGroup) frameLayers.push(layer);
      }

      var max = frameLayers.length;
      if (max === 0) {
        alert("No layers inside anim folder.");
      } else {
        var baseName = frameLayers[max - 1].name;

        // Rename top → bottom: 3/3, 2/3, 1/3
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
