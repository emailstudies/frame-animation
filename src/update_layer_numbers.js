async function handleUpdateLayerNumbers() {
  const script = `
    var doc = app.activeDocument;

    for (var i = 0; i < doc.layers.length; i++) {
      var folder = doc.layers[i];
      if (!folder.isGroup || !folder.name.startsWith("anim_")) continue;

      var layers = folder.layers.filter(l => !l.isGroup);
      var max = layers.length;
      if (max === 0) continue;

      var baseName = layers[max - 1].name;

      for (var j = 0; j < max; j++) {
        var frameNum = j + 1;
        layers[j].name = frameNum + "/" + max + " " + baseName;
      }
    }

    alert("Layer Numbers Updated");
  `;
  await Photopea.runScript(script);
}
