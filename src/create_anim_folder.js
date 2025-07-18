function handleCreateFolder() {
  const script = `
    try {
      var doc = app.activeDocument;
      var sel = doc.activeLayer;

      if (sel) {
        var isFolder = sel.isGroup === true;
        var type = isFolder ? "folder" : "layer";
        alert("A " + type + " is currently selected.\\n\\nPlease click on the empty canvas area to deselect all layers, then try again.");
      } else {
        // ✅ Nothing is selected → create folder at root
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
