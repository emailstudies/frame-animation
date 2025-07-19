function handleCreateFolder() {
  const script = `
    var doc = app.activeDocument;
    var sel = doc.activeLayer;

    if (sel) {
      var name = sel.name;
      var isFolder = typeof sel.layers !== "undefined";
      var type = isFolder ? "folder" : "layer";
      alert("You already selected a " + type + ": " + name);
    } else {
      // Nothing is selected, select the topmost layer
      var first = doc.layers[0];
      var desc = new ActionDescriptor();
      var ref = new ActionReference();
      ref.putIndex(charIDToTypeID("Lyr "), 1);  // 1-based index
      desc.putReference(charIDToTypeID("null"), ref);
      desc.putBoolean(charIDToTypeID("MkVs"), false);
      executeAction(charIDToTypeID("slct"), desc, DialogModes.NO);

      var newlySelected = app.activeDocument.activeLayer;
      var name = newlySelected.name;
      var isFolder = typeof newlySelected.layers !== "undefined";
      var type = isFolder ? "folder" : "layer";
      alert("Nothing was selected. Auto-selected " + type + ": " + name);
    }
  `;
  window.parent.postMessage(script, "*");
}
