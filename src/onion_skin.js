function toggleOnionSkinMode() {
  const script = `
    (function () {
      var doc = app.activeDocument;
      var sel = doc.activeLayer;

      if (!sel || sel.typename === "LayerSet") {
        alert("Please select a layer inside an animation group.");
        return;
      }

      var parent = sel.parent;
      if (!parent || parent.typename !== "LayerSet") return;

      var siblings = parent.layers;
      var idx = -1;

      for (var i = 0; i < siblings.length; i++) {
        if (siblings[i] == sel) {
          idx = i;
          break;
        }
      }

      if (idx > -1) {
        if (idx > 0 && siblings[idx - 1].typename !== "LayerSet") {
          siblings[idx - 1].opacity = 40;
        }
        if (idx < siblings.length - 1 && siblings[idx + 1].typename !== "LayerSet") {
          siblings[idx + 1].opacity = 40;
        }
      }
    })();
  `;
  window.parent.postMessage(script, "*");
}
