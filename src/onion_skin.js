let onionSkinMode = false;

window.toggleOnionSkinMode = function () {
  onionSkinMode = !onionSkinMode;
  console.log(onionSkinMode ? "Onion Skin Mode ON" : "OFF");

  if (!onionSkinMode) {
    resetPreviousOnionSkin();
  }
};

// Live tracking every click
document.addEventListener("click", () => {
  if (!onionSkinMode) return;

  const script = `
    var doc = app.activeDocument;
    var sel = doc.activeLayer;

    if (sel && sel.typename !== "LayerSet") {
      var parent = sel.parent;
      if (parent && parent.typename === "LayerSet") {
        var siblings = parent.layers;
        var idx = -1;

        for (var i = 0; i < siblings.length; i++) {
          if (siblings[i] === sel) {
            idx = i;
            break;
          }
        }

        if (idx >= 0) {
          // Restore opacities from previous log
          if (doc.info && doc.info.length > 0) {
            try {
              var log = JSON.parse(doc.info);
              if (log.parent === parent.name) {
                for (var j = 0; j < siblings.length; j++) {
                  var name = siblings[j].name;
                  for (var k = 0; k < log.affected.length; k++) {
                    if (log.affected[k].name === name) {
                      siblings[j].opacity = log.affected[k].opacity;
                    }
                  }
                }
              }
            } catch (e) {}
          }

          // Apply onion skin to new siblings and record log
          var log = {
            parent: parent.name,
            selected: { name: sel.name },
            affected: []
          };

          var prev = siblings[idx - 1];
          var next = siblings[idx + 1];

          if (prev && prev.typename !== "LayerSet") {
            log.affected.push({ name: prev.name, opacity: prev.opacity });
            prev.opacity = 40;
          }

          if (next && next.typename !== "LayerSet") {
            log.affected.push({ name: next.name, opacity: next.opacity });
            next.opacity = 40;
          }

          doc.info = JSON.stringify(log);
        }
      }
    }
  `;
  window.parent.postMessage(script, "*");
});

function resetPreviousOnionSkin() {
  const script = `
    var doc = app.activeDocument;
    if (doc.info && doc.info.length > 0) {
      try {
        var log = JSON.parse(doc.info);
        for (var i = 0; i < doc.layers.length; i++) {
          var layer = doc.layers[i];
          if (!layer || layer.typename === "LayerSet") continue;

          for (var j = 0; j < log.affected.length; j++) {
            if (layer.name === log.affected[j].name) {
              layer.opacity = log.affected[j].opacity;
            }
          }
        }
      } catch (e) {}
    }
    doc.info = "";
  `;
  window.parent.postMessage(script, "*");
}
