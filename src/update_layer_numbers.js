function handleUpdateLayerNumbers() {
  const script = `
    var doc = app.activeDocument;

    for (var i = 0; i < doc.layers.length; i++) {
      var folder = doc.layers[i];

      if (!folder.isGroup || folder.name.indexOf("anim_") !== 0) continue;

      var frameLayers = [];

      for (var j = 0; j < folder.layers.length; j++) {
        var layer = folder.layers[j];
        if (!layer.isGroup) {
          frameLayers.push(layer);
        }
      }

      var max = frameLayers.length;
      if (max === 0) continue;

      // Base name from bottom layer
      var baseName = frameLayers[max - 1].name;

      for (var k = 0; k < max; k++) {
        var frameNum = max - k;
        var renameLayer = frameLayers[k];
        try {
          renameLayer.name = frameNum + "/" + max + " " + baseName;
        } catch (e) {
          // skip any rename that fails silently
        }
      }
    }

    alert("Layer Numbers Updated");
  `;

  window.parent.postMessage(script, "*");
}
