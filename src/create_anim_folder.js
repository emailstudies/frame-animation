function handleCreateFolder() {
  const script = `
    try {
      var doc = app.activeDocument;
      var sel = doc.activeLayer;

      var willBeNested = false;

      if (sel) {
        // Check if the selected item's parent is not the document itself
        if (sel.parent && sel.parent !== doc) {
          willBeNested = true;
        }
      }

      if (willBeNested) {
        alert("Cannot create folder here. It would be nested inside another folder or layer.");
      } else {
        // Create the folder at root level
        var desc = new ActionDescriptor();
        var ref = new ActionReference();
        ref.putClass(stringIDToTypeID("layerSection")); // folder
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
