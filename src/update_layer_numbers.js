function handleUpdateLayerNumbers() {
  const script = `
    var doc = app.activeDocument;
    var foundAnimFolder = false;

    // Remove any existing cue/number prefix, e.g., "● 3/5 Layer 1" → "Layer 1"
    function stripPrefix(name) {
      var match = name.match(/^[●○]\\s+\\d+\\/\\d+\\s+(.*)$/);
      return match ? match[1] : name;
    }

    for (var i = 0; i < doc.layers.length; i++) {
      var folder = doc.layers[i];

      if (folder.typename === "LayerSet" && folder.name.startsWith("anim_")) {
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

        for (var k = 0; k < max; k++) {
          var frameNum = max - k; // Visually bottom = frame 1
          var layer = frameLayers[k];

          var cue = "●";
          try {
            var b = layer.bounds;
            if (b[0] == 0 && b[1] == 0 && b[2] == 0 && b[3] == 0) {
              cue = "○";
            }
          } catch (e) {
            cue = "○";
          }

          var originalName = stripPrefix(layer.name);

          try {
            layer.name = cue + " " + frameNum + "/" + max + " " + originalName;
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
