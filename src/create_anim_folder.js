function handleCreateFolder() {
  const script = `
    var doc = app.activeDocument;
    if (doc.layers.length > 0) {
      var desc = new ActionDescriptor();
      var ref = new ActionReference();
      ref.putIndex(charIDToTypeID("Lyr "), 1); // bottom-most = index 1
      desc.putReference(charIDToTypeID("null"), ref);
      executeAction(charIDToTypeID("slct"), desc, DialogModes.NO);
    }
  `;
  window.parent.postMessage(script, "*");
}
