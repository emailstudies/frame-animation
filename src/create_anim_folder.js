function handleCreateFolder() {
  const script = `
    try {
      var doc = app.activeDocument;
      var sel = doc.activeLayer;

      if (sel) {
        // Something is selected: could be a layer or folder
        var isFolder = typeof sel.layers !== "undefined";
        var type = isFolder ? "folder" : "layer";
        alert("A " + type + " is selected. Please deselect by clicking outside the Layers panel.");
      } else {
        // ✅ Nothing is selected → safe to create folder at root
        var desc = new ActionDescriptor();
        var ref = new ActionReference();
        ref.putClass(stringIDToTypeID("layerSection"));
        desc.putReference(charIDToTypeID("null"), ref);

        var nameDesc = new ActionDescriptor();
        nameDesc.putString(stringIDToTypeID("name"), "anim_1");
        desc.putObject(stringIDToTypeID("using"), stringIDToTypeID("layerSection"), nameDesc);

        executeAction(charIDToTypeID("Mk  "), desc, DialogModes.NO);
      }
    } catch (e) {
      alert("Script error: " + e.message);
    }
  `;
  window.parent.postMessage(script, "*");
}
