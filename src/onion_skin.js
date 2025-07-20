function toggleOnionSkinMode() {
  const script = `
    var doc = app.activeDocument;
    var sel = doc.activeLayer;

    if (sel && sel.typename !== "LayerSet") {
      var parent = sel.parent;
      if (parent && parent.typename === "LayerSet") {
        var siblings = parent.layers;
        var idx = siblings.indexOf(sel);

        // Previous layer
        if (idx > 0) {
          var prev = siblings[idx - 1];
          if (prev.typename !== "LayerSet") {
            prev.opacity = 40;
          }
        }

        // Next layer
        if (idx < siblings.length - 1) {
          var next = siblings[idx + 1];
          if (next.typename !== "LayerSet") {
            next.opacity = 40;
          }
        }
      }
    }
  `;
  window.parent.postMessage(script, "*");
}
