function handleUpdateLayerNumbers() {
  const script = `
    var doc = app.activeDocument;

    for (var i = 0; i < doc.layers.length; i++) {
      var folder = doc.layers[i];

      if (!folder.isGroup || folder.name.indexOf("anim_") !== 0) continue;

      var frameLayers = [];

      // Collect all non-folder layers
      for (var j = 0; j < folder.layers.length; j++) {
        var layer = folder.layers[j];
        if (!layer.isGroup) {
          frameLayers.push(layer);
        }
      }

      var max = frameLayers.length;
      if (max === 0) continue;

      // ✅ Base name is from the bottommost layer (last in stack)
      var baseName = frameLayers[max - 1].name;

      // ✅ Rename top to bottom: 3/3, 2/3, 1/3, etc.
      for (var k = 0; k < max; k++) {
        var frameNum = max - k;
        frameLayers[k].name = frameNum + "/" + max + " " + baseName;
      }
    }

    alert("Layer Numbers Updated");
  `;

  window.parent.postMessage(script, "*");
}
