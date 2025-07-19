function handleCreateFolder() {
  const script = `
    var doc = app.activeDocument;
    var totalLayers = doc.layers.length;

    if (totalLayers > 1) {
      alert("Number of layers = " + totalLayers);
    } else if (totalLayers === 1) {
      var onlyLayer = doc.layers[0];
      var parentName = onlyLayer.parent && onlyLayer.parent.name ? onlyLayer.parent.name : "";

      if (parentName === doc.name) {
        alert("Only one layer exists and it is at the root level.");
      } else {
        alert("Only one layer exists and it is nested. Selecting the top-level layer...");

        // Use ActionDescriptor to select the only top-level item (layer/folder)
        var desc = new ActionDescriptor();
        var ref = new ActionReference();
        ref.putIndex(charIDToTypeID("Lyr "), doc.layers.length); // Layer index in reverse (last = 1)
        desc.putReference(charIDToTypeID("null"), ref);
        desc.putBoolean(charIDToTypeID("MkVs"), false); // Don't make visible
        executeAction(charIDToTypeID("slct"), desc, DialogModes.NO);
      }
    } else {
      alert("No layers found in the document.");
    }
  `;

  window.parent.postMessage(script, "*");
}
