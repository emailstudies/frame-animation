function handleUpdateLayerNumbers() {
  const script = `
    var doc = app.activeDocument;
    var foundAnimFolder = false;

    // Strip previous format: "● 5/5 Ball" or "○ 3/5 Ball"
    function cleanBaseName(name) {
      var match = name.match(/^[●○]\\s+\\d+\\/\\d+\\s+(.*)$/);
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

        var originalName = frameLayers[max - 1].name;
        var baseName = cleanBaseName(originalName);

        for (var k = 0; k < max; k++) {
          var frameNum = max - k;
          var layer = frameLayers[k];
          var cue = "●";

          try {
            var b = layer.bounds;
            if (b[0] === 0 && b[1] === 0 && b[2] === 0 && b[3] === 0) {
              cue = "○";
            }
          } catch (e) {
            cue = "○";
          }

          try {
            layer.name = cue + " " + frameNum + "/" + max + " " + baseName;
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
