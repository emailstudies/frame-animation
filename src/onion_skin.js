window.applyOnionSkinMultiStep = function (stepCount = 1) {
  const OPACITY_MAP = {
    1: 50,
    2: 40,
    3: 30,
    4: 20,
    5: 10,
  };

  const script = `
    (function () {
      var doc = app.activeDocument;

      // Get selected layers manually
      var selLayers = [];
      for (var i = 0; i < doc.layers.length; i++) {
        if (doc.layers[i].selected) {
          selLayers.push(doc.layers[i]);
        }
      }

      if (selLayers.length === 0) {
        alert("Please select a layer to apply onion skin.");
        return;
      }

      var OPACITY_MAP = ${JSON.stringify(OPACITY_MAP)};
      var stepCount = ${stepCount};

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

      for (var i = 0; i < selLayers.length; i++) {
        var layer = selLayers[i];
        if (layer.typename === "LayerSet") continue;

        var parent = layer.parent;
        if (!parent || parent.typename !== "LayerSet") continue;

        onionSkinMultiStep(layer.name, parent, stepCount);
      }
    })();
  `;

  console.log("Sending to Photopea:", script);
  window.parent.postMessage(script, "*");
};
