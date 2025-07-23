function handleUpdateLayerNumbers() {
  const script = `
    var doc = app.activeDocument;
    var foundAnimFolder = false;

    // Remove ". 1/5 " prefix
    function stripPrefix(name) {
      var match = name.match(/^[●○]\\s+\\d+\\/\\d+\\s+(.*)$/);
      return match ? match[1] : name;
    }

    // Extract "copy*", like copy, copy2, copy_final, copy(3), copy1, etc.
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
          var frameNum = k + 1; // Visually bottom = Frame 1
          var layer = frameLayers[max - 1 - k]; // bottom-to-top

          // Step 1: Get cue
          var cue = "●";
          try {
            var b = layer.bounds;
            if (b[0] == 0 && b[1] == 0 && b[2] == 0 && b[3] == 0) {
              cue = "○";
            }
          } catch (e) {
            cue = "○";
          }

          // Step 2: Clean name + handle "copy"
          var original = stripPrefix(layer.name);
          var result = extractCopySuffix(original);

          // Step 3: Final name
          var newName = cue + " " + frameNum + "/" + max + " ";
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
