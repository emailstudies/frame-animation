function handleUpdateLayerNumbers() {
  const script = `
    var doc = app.activeDocument;
    var foundAnimFolder = false;

    // Utility to strip previous numbering and cue (e.g., "3/10 ● Ball" -> "Ball")
    function cleanBaseName(name) {
      var match = name.match(/^\\d+\\/\\d+\\s+[●○]\\s+(.*)$/);
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

        // Clean base name from last layer
        var originalName = frameLayers[max - 1].name;
        var baseName = cleanBaseName(originalName);

        for (var k = 0; k < max; k++) {
          var frameNum = max - k;
          var layer = frameLayers[k];
          var cue = "●"; // assume filled

          try {
            var b = layer.bounds;
            if (b[0] === 0 && b[1] === 0 && b[2] === 0 && b[3] === 0) {
              cue = "○"; // empty if bounds are all zero
            }
          } catch (e) {
            cue = "○"; // fallback if bounds can't be read
          }

          try {
            layer.name = frameNum + "/" + max + " " + cue + " " + baseName;
          } catch (e) {}
        }
      }
    }

    if (foundAnimFolder) {
      alert("Layer numbers + visual cue updated.");
    } else {
      alert("No anim folder exists. To update layer numbers, at least one anim folder must exist.");
    }
  `;

  window.parent.postMessage(script, "*");
}
