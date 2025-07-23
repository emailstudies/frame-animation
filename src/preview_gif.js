var input = prompt('Enter onion skin opacity (0–100) or type "reset" to disable onion skin:', "30");

if (input !== null) {
  var doc = app.activeDocument;
  var flatLayers = [];
  var ignoredLayers = new Set();
  var ignoredFolderName = "dnd";

  // Find "dnd" group and all children
  function collectIgnoredLayers(layersList) {
    for (var i = 0; i < layersList.length; i++) {
      var layer = layersList[i];
      if (layer.name === ignoredFolderName && layer.layers) {
        addAllNested(layer);
      } else if (layer.layers) {
        collectIgnoredLayers(layer.layers);
      }
    }
  }

  function addAllNested(group) {
    ignoredLayers.add(group);
    for (var i = 0; i < group.layers.length; i++) {
      ignoredLayers.add(group.layers[i]);
      if (group.layers[i].layers) {
        addAllNested(group.layers[i]);
      }
    }
  }

  // Flatten layers except ignored
  function flattenLayers(layersList) {
    for (var i = 0; i < layersList.length; i++) {
      var layer = layersList[i];
      if (ignoredLayers.has(layer)) continue;
      if (layer.layers) flattenLayers(layer.layers);
      else flatLayers.push(layer);
    }
  }

  collectIgnoredLayers(doc.layers);
  flattenLayers(doc.layers);

  if (input.toLowerCase() === "reset") {
    function resetLayers(layersList) {
      for (var i = 0; i < layersList.length; i++) {
        var l = layersList[i];
        if (!ignoredLayers.has(l)) {
          l.visible = true;
          l.opacity = 100;
        }
        if (l.layers) resetLayers(l.layers);
      }
    }
    resetLayers(doc.layers);
    alert("All layers reset (excluding 'dnd' and its children).");
  } else {
    var opacity = parseInt(input);
    if (isNaN(opacity) || opacity < 0 || opacity > 100) {
      alert("Enter a number between 0–100 or type 'reset'.");
    } else {
      var activeLayer = doc.activeLayer;
      var activeIndex = -1;

      for (var i = 0; i < flatLayers.length; i++) {
        if (flatLayers[i] === activeLayer) {
          activeIndex = i;
          break;
        }
      }

      for (var j = 0; j < flatLayers.length; j++) {
        var l = flatLayers[j];
        if (j === activeIndex) {
          l.visible = true;
          l.opacity = 100;
        } else if (j === activeIndex - 1 || j === activeIndex + 1) {
          l.visible = true;
          l.opacity = opacity;
        } else {
          l.visible = false;
        }
      }

      alert('"dnd" folder and its children skipped. Onion skin applied.');
    }
  }
}
