const MAX_ONION_STEPS = 5;

const OPACITY_MAP = {
  1: 50,
  2: 40,
  3: 30,
  4: 20,
  5: 10,
};

window.applyOnionSkinMultiStep = function (stepCount = 1) {
  if (stepCount < 1 || stepCount > MAX_ONION_STEPS) {
    alert("Step count must be between 1 and " + MAX_ONION_STEPS);
    return;
  }

  const script = `
    var doc = app.activeDocument;
    var selLayers = app.activeDocument.activeLayers;
    var stepCount = ${stepCount};
    var OPACITY_MAP = ${JSON.stringify(OPACITY_MAP)};

    function getLayerIndexByName(name, layers) {
      for (var i = 0; i < layers.length; i++) {
        if (layers[i].name === name && layers[i].typename !== "LayerSet") {
          return i;
        }
      }
      return -1;
    }

    function setSiblingOpacity(centerIndex, siblings, offset, opacity) {
      var before = siblings[centerIndex - offset];
      if (before && before.typename !== "LayerSet") {
        before.opacity = opacity;
      }
      var after = siblings[centerIndex + offset];
      if (after && after.typename !== "LayerSet") {
        after.opacity = opacity;
      }
    }

    function applyOnionSkinToLayer(layerName, parentGroup, stepCount) {
      var siblings = parentGroup.layers;
      var centerIndex = getLayerIndexByName(layerName, siblings);
      if (centerIndex === -1) return;

      for (var offset = 1; offset <= stepCount; offset++) {
        var opacity = OPACITY_MAP[offset];
        setSiblingOpacity(centerIndex, siblings, offset, opacity);
      }
    }

    for (var i = 0; i < selLayers.length; i++) {
      var layer = selLayers[i];
      if (layer.typename === "LayerSet") continue;
      var parent = layer.parent;
      if (!parent || parent.typename !== "LayerSet") continue;

      applyOnionSkinToLayer(layer.name, parent, stepCount);
    }
  `;

  window.parent.postMessage(script, "*");
};
