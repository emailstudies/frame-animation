function handleCreateFolder() {
  const script = `
    var doc = app.activeDocument;

    if (!doc) {
      alert("No document is open.");
    } else {
      var total = doc.layers.length;
      var topIndex = total; // Photopea indexing is 1-based

      // Select the top-most visible layer or folder
      var desc = new ActionDescriptor();
      var ref = new ActionReference();
      ref.putIndex(charIDToTypeID("Lyr "), topIndex);
      desc.putReference(charIDToTypeID("null"), ref);
      desc.putBoolean(charIDToTypeID("MkVs"), false);
      executeAction(charIDToTypeID("slct"), desc, DialogModes.NO);

      // Confirm selection
      var sel = app.activeDocument.activeLayer;
      var name = sel && sel.name ? sel.name : "(Unnamed)";
      var isFolder = typeof sel.layers !== "undefined";
      var type = isFolder ? "folder" : "layer";

      alert("Auto-selected " + type + ": " + name);
    }
  `;
  window.parent.postMessage(script, "*");
}
