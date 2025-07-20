function handleUpdateLayerNumbers() {
  const script = `
    var doc = app.activeDocument;

    for (var i = 0; i < doc.layers.length; i++) {
      var folder = doc.layers[i];

      // ✅ Confirm it's a group and name starts with "anim_"
      if (folder.name && folder.name.startsWith("anim_") && folder.typename === "LayerSet") {

        var frameLayers = [];

        for (var j = 0; j < folder.layers.length; j++) {
          var layer = folder.layers[j];
          if (layer.typename !== "LayerSet") {
            frameLayers.push(layer);
          }
        }

        var max = frameLayers.length;
        if (max === 0) continue;

        var baseName = frameLayers[max - 1].name;

        for (var k = 0; k < max; k++) {
          var frameNum = max - k;
          try {
            frameLayers[k].name = frameNum + "/" + max + " " + baseName;
          } catch (e) {}
        }
      }
    }

    alert("Layer Numbers Updated");
  `;

  window.parent.postMessage(script, "*");
}
