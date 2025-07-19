function handleCreateFolder() {
  const script = `
    var doc = app.activeDocument;

    if (!doc) {
      alert("No document is open.");
    } else {
      var first = doc.layers[0]; // top-most visible layer/folder

      // Force-select the top layer/folder using ActionDescriptor
      var desc = new ActionDescriptor();
      var ref = new ActionReference();
      ref.putIndex(charIDToTypeID("Lyr "), 1); // 1-based index
      desc.putReference(charIDToTypeID("null"), ref);
      desc.putBoolean(charIDToTypeID("MkVs"), false); // no make visible
      executeAction(charIDToTypeID("slct"), desc, DialogModes.NO);

      // Alert the name and type
      var sel = app.activeDocument.activeLayer;
      var name = sel && sel.name ? sel.name : "(Unnamed)";
      var isFolder = typeof sel.layers !== "undefined";
      var type = isFolder ? "folder" : "layer";

      alert("Auto-selected " + type + ": " + name);
    }
  `;
  window.parent.postMessage(script, "*");
}
