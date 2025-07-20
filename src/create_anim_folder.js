function handleUpdateLayerNumbers() {
  const script = `
    var doc = app.activeDocument;
    var foundAnimFolder = false;

    // Function to strip leading number/number pattern
    function cleanBaseName(name) {
      var match = name.match(/^\\d+\\/\\d+\\s+(.*)$/);
      return match ? match[1] : name;
    }

    for (var i = 0; i < doc.layers.length; i++) {
      var folder = doc.layers[i];

      if (folder.name && folder.name.startsWith("anim_") && folder.typename === "LayerSet") {
        foundAnimFolder = true;

        var frameLayers = [];

        for (var j = 0; j < folder.layers.length; j++) {
          var layer = folder.layers[j];
          if (layer.typename !== "LayerSet") {
            frameLayers.push(layer);
          }
        }

        var max = frameLayers.length;
        if (max === 0) continue;

        // ✅ Clean any previous prefix before reusing as base name
        var originalName = frameLayers[max - 1].name;
        var baseName = cleanBaseName(originalName);

        for (var k = 0; k < max; k++) {
          var frameNum = max - k;
          try {
            frameLayers[k].name = frameNum + "/" + max + " " + baseName;
          } catch (e) {}
        }
      }
    }

    if (foundAnimFolder) {
      alert("Layer Numbers Updated");
    } else {
      alert("No anim folder exists. To update layer numbers, at least one anim folder must exist.");
    }
  `;

  window.parent.postMessage(script, "*");
}
