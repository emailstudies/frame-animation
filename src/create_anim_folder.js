function handleCreateFolder() {
  const script = `
    try {
      var doc = app.activeDocument;
      var sel = doc.activeLayer;

      if (!sel) {
        alert("Created folder should be top level — please deselect everything by clicking on canvas.");
      } else {
        var isFolder = typeof sel.layers !== "undefined";
        var isRootLevel = sel.parent === doc;

        if (isFolder && isRootLevel) {
          // ✅ Top-level folder is selected → create new folder
          var desc = new ActionDescriptor();
          var ref = new ActionReference();
          ref.putClass(stringIDToTypeID("layerSection")); // "folder"
          desc.putReference(charIDToTypeID("null"), ref);

          var nameDesc = new ActionDescriptor();
          nameDesc.putString(stringIDToTypeID("name"), "anim_1");
          desc.putObject(stringIDToTypeID("using"), stringIDToTypeID("layerSection"), nameDesc);

          executeAction(charIDToTypeID("Mk  "), desc, DialogModes.NO);
        } else {
          // ❌ Not a root-level folder
          alert("Created folder should be top level — please deselect everything by clicking on canvas.");
        }
      }
    } catch (e) {
      alert("Script error: " + e.message);
    }
  `;
  window.parent.postMessage(script, "*");
}
