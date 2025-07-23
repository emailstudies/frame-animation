function handleUpdateLayerNumbers() {
  const script = `
    var doc = app.activeDocument;
    var foundAnimFolder = false;

    // Remove ". 1/5 " prefix
    function stripPrefix(name) {
      var match = name.match(/^\\.\\s+\\d+\\/\\d+\\s+(.*)$/);
      return match ? match[1] : name;
    }

    // Extract "copy", "copy1", "copy 2", "copy_final", "copy(3)", etc.
    function extractCopySuffix(name) {
      var copyPattern = /\\b(copy[\\w()\\-]*)\\b/i;
      var match = name.match(copyPattern);

      if (match) {
        var copyChunk = match[1].trim();
        var cleaned = name.replace(copyPattern, "").trim();
        return {
          hasCopy: true,
          copyLabel: copyChunk,
          cleanedName: cleaned
        };
      } else {
        return {
          hasCopy: false,
          cleanedName: name
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
          var frameNum = max - k;
          var layer = frameLayers[k];

          var original = stripPrefix(layer.name);
          var result = extractCopySuffix(original);

          var newName = ". " + frameNum + "/" + max + " ";
          if (result.hasCopy) {
            newName += result.copyLabel + " " + result.cleanedName;
          } else {
            newName += result.cleanedName;
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
