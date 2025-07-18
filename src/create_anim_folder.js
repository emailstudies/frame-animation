function handleCreateFolder() {
  const script = `
    var doc = app.activeDocument;
    if (!doc) {
      alert("No document open.");
    } else {
      var sel = doc.activeLayer;
      var canCreate = true;

      if (sel) {
        // If something is selected, check if its parent is the doc
        if (typeof sel.parent !== "undefined" && sel.parent !== doc) {
          canCreate = false;
        }
      }

      if (canCreate) {
        var desc = new ActionDescriptor();
        var ref = new ActionReference();
        ref.putClass(stringIDToTypeID("layerSection")); // New folder
        desc.putReference(charIDToTypeID("null"), ref);

        var nameDesc = new ActionDescriptor();
        nameDesc.putString(stringIDToTypeID("name"), "anim_1");
        desc.putObject(stringIDToTypeID("using"), stringIDToTypeID("layerSection"), nameDesc);

        executeAction(charIDToTypeID("Mk  "), desc, DialogModes.NO);
        alert("✅ Folder 'anim_1' created at root.");
      } else {
        alert("❌ Please deselect or select a top-level item to create the folder at root.");
      }
    }
  `;

  window.parent.postMessage(script, "*");
}
