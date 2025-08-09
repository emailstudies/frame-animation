/* the generic update to all as well as special anim_preview handling */

function handleUpdateLayerNumbers() {
  const delay = getSelectedDelay(); // get delay from your helpers.js

  const script = `
    var doc = app.activeDocument;
    var foundLayerSet = false;
    var foundAnimPreview = false;

    // Remove _a_ prefix if present
    function stripAPrefix(name) {
      return name.replace(/^_a_\\s*/, "");
    }

    // Remove delay suffix like ", 123"
    function stripDelaySuffix(name) {
      return name.replace(/,\\s*\\d+$/, "");
    }

    // Remove all cue/frame prefixes (multiple) at start, e.g. "● 5/5 "
    function stripAllPrefixes(name) {
      var pattern = /^[●○]\\s+\\d+\\/\\d+\\s+/;
      while (pattern.test(name)) {
        name = name.replace(pattern, "");
      }
      return name;
    }

    // Fully clean layer name by stripping all known prefixes & suffixes
    function cleanName(name) {
      name = stripAPrefix(name);
      name = stripAllPrefixes(name);
      name = stripDelaySuffix(name);
      return name.trim();
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

      if (folder.typename === "LayerSet") {
        if (folder.name === "anim_preview") {
          foundAnimPreview = true;

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

            var cue = "●";
            try {
              var b = layer.bounds;
              if (b[0] == 0 && b[1] == 0 && b[2] == 0 && b[3] == 0) {
                cue = "○";
              }
            } catch (e) {
              cue = "○";
            }

            var baseName = cleanName(layer.name);
            var result = moveCopyChunk(baseName);

            var newName = "_a_ " + cue + " " + frameNum + "/" + max + " ";
            if (result.hasCopy) {
              newName += result.copyLabel + " " + result.baseName;
            } else {
              newName += result.baseName;
            }

            newName += ", " + ${delay};

            try {
              layer.name = newName;
            } catch (e) {}
          }
        } else {
          foundLayerSet = true;

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

            var cue = "●";
            try {
              var b = layer.bounds;
              if (b[0] == 0 && b[1] == 0 && b[2] == 0 && b[3] == 0) {
                cue = "○";
              }
            } catch (e) {
              cue = "○";
            }

            var baseName = cleanName(layer.name);
            var result = moveCopyChunk(baseName);

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
    }

    if (foundAnimPreview || foundLayerSet) {
      alert("Layer numbers updated.");
    } else {
      alert("No folders found to update.");
    }
  `;

  window.parent.postMessage(script, "*");
}




/* -------------------------------------------- this was the generic do update for all 
function handleUpdateLayerNumbers() {
  const script = `
    var doc = app.activeDocument;
    var foundLayerSet = false;

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

      if (folder.typename === "LayerSet" && folder.name !== "anim_preview") {
        foundLayerSet = true;

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

    if (foundLayerSet) {
      alert("Layer numbers updated.");
    } else {
      alert("No folder exists. To update layer numbers, at least one folder must exist.");
    }
  `;
  window.parent.postMessage(script, "*");
}
*/


/* ------------------------------------------------ this was the previous one targeting only anim_ folders, but my playback is anim_ agnostic works for all root folders
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
*/
