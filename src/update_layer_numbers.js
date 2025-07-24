function handleUpdateLayerNumbers() {
  const script = `
    var doc = app.activeDocument;
    var foundAnimFolder = false;

    // Strip cue + frame prefix
    function stripPrefix(name) {
      var match = name.match(/^[●○]\\s+\\d+\\/\\d+\\s+(.*)$/);
      return match ? match[1] : name;
    }

    // Move "copy*" chunk (if present) to middle
    function moveCopyChunk(name) {
      var copyPattern = /(.*)\\b(copy[\\w()\\-\\s]*)\\b/i;
      var match = name.match(copyPattern);
      if (match) {
        var beforeCopy = match[1].trim();
        var copyChunk = match[2].trim();
        return {
          hasCopy: true,
          copyLabel: copyChunk,
          baseName: beforeCopy
        };
      } else {
        return {
          hasCopy: false,
          baseName: name
        };
      }
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
          var frameNum = k + 1;
          var layer = frameLayers[max - 1 - k];

          // Cue
          var cue = "●";
          try {
            var b = layer.bounds;
            if (b[0] == 0 && b[1] == 0 && b[2] == 0 && b[3] == 0) {
              cue = "○";
            }
          } catch (e) {
            cue = "○";
          }

          // Clean name and rearrange copy
          var originalName = stripPrefix(layer.name);
          var result = moveCopyChunk(originalName);

          var newName = cue + " " + frameNum + "/" + max + " ";
          if (result.hasCopy) {
            newName += result.copyLabel + " " + result.baseName;
          } else {
            newName += result.baseName;
          }

          try {
            layer.name = newName;
          } catch (e) {}
        }
      }
    }

    if (foundAnimFolder) {
      alert("Layer numbers updated.");
    } else {
      alert("No anim folder exists. To update layer numbers, at least one anim folder must exist.");
    }
  `;
  window.parent.postMessage(script, "*");
}
