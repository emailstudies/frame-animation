function handleCreateFolder() {
  const script = `
    try {
      var doc = app.activeDocument;
      var sel = doc.activeLayer;

      var willBeNested = false;

      if (sel) {
        var parent = sel.parent;
        // Check if the selected layer is nested inside a folder
        if (parent && parent !== doc) {
          willBeNested = true;
        }
      }

      if (willBeNested) {
        alert("Cannot create folder: it would be nested inside another folder.");
      } else {
        // ✅ Create at root level
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
