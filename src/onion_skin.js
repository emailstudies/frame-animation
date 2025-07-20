function applyOnionSkinOnce() {
  const script = `
    var doc = app.activeDocument;
    var sel = doc.activeLayer;
    
    if (sel && sel.typename !== "LayerSet") {
      var selName = sel.name;
      var parent = sel.parent;

      if (parent && parent.typename === "LayerSet") {
        var siblings = parent.layers;
        var idx = -1;

        for (var i = 0; i < siblings.length; i++) {
          if (siblings[i].name === selName && siblings[i].typename !== "LayerSet") {
            idx = i;
            break;
          }
        }

        if (idx > -1) {
          // Previous layer
          if (idx > 0) {
            var prev = siblings[idx - 1];
            if (prev.typename !== "LayerSet") prev.opacity = 40;
          }

          // Next layer
          if (idx < siblings.length - 1) {
            var next = siblings[idx + 1];
            if (next.typename !== "LayerSet") next.opacity = 40;
          }
        }
      }
    }
  `;
  window.parent.postMessage(script, "*");
}
