function handleCreateFolder() {
  const script = `
    var doc = app.activeDocument;
    var totalLayers = doc.layers.length;

    if (totalLayers > 1) {
      alert("Number of layers = " + totalLayers);
    } else if (totalLayers === 1) {
      var sel = doc.activeLayer;

      if (!sel) {
        alert("Only one layer exists, but nothing is selected.");
      } else {
        var parent = sel.parent;
        if (parent && parent.name !== doc.name) {
          alert("Selected layer is nested. Auto-selecting root-level folder.");

          // Automatically select the top-level item
          app.activeDocument.activeLayer = doc.layers[0];
        } else {
          alert("Only one layer exists and it is already at the root.");
        }
      }
    } else {
      alert("No layers found in the document.");
    }
  `;

  window.parent.postMessage(script, "*");
}
