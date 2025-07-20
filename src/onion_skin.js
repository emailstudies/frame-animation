const MAX_ONION_STEPS = 5;

const OPACITY_MAP = {
  1: 50,
  2: 40,
  3: 30,
  4: 20,
  5: 10,
};

// Public function to trigger Onion Skin with multi-step support
window.toggleOnionSkinMode = function (stepCount = 1) {
  if (stepCount < 1 || stepCount > MAX_ONION_STEPS) {
    alert("Step count must be between 1 and " + MAX_ONION_STEPS);
    return;
  }

  const script =
    buildOnionSkinGlobals(stepCount) +
    buildOnionSkinCore() +
    buildOnionSkinMultistep() +
    buildOnionSkinMainLoop();

  window.parent.postMessage(script, "*");
};

// ----------------- Modular Script Builders -----------------

function buildOnionSkinGlobals(stepCount) {
  return `
    var doc = app.activeDocument;
    var selLayers = doc.activeLayers;
    var stepCount = ${stepCount};
    var OPACITY_MAP = ${JSON.stringify(OPACITY_MAP)};
  `;
}

function buildOnionSkinCore() {
  return `
    function onionSkinSingleStep(centerIndex, siblings, offset) {
      var opacity = OPACITY_MAP[offset];

      var before = siblings[centerIndex - offset];
      if (before && before.typename !== "LayerSet") {
        before.opacity = opacity;
      }

      var after = siblings[centerIndex + offset];
      if (after && after.typename !== "LayerSet") {
        after.opacity = opacity;
      }
    }
  `;
}

function buildOnionSkinMultistep() {
  return `
    function onionSkinMultiStep(layerName, parentGroup, stepCount) {
      var siblings = parentGroup.layers;
      var centerIndex = -1;

      for (var i = 0; i < siblings.length; i++) {
        if (siblings[i].name === layerName && siblings[i].typename !== "LayerSet") {
          centerIndex = i;
          break;
        }
      }

      if (centerIndex === -1) return;

      for (var offset = 1; offset <= stepCount; offset++) {
        onionSkinSingleStep(centerIndex, siblings, offset);
      }
    }
  `;
}

function buildOnionSkinMainLoop() {
  return `
    for (var i = 0; i < selLayers.length; i++) {
      var layer = selLayers[i];
      if (layer.typename === "LayerSet") continue;

      var parent = layer.parent;
      if (!parent || parent.typename !== "LayerSet") continue;

      onionSkinMultiStep(layer.name, parent, stepCount);
    }
  `;
}
