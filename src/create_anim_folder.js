function handleCreateFolder() {
  const script = `
    var doc = app.activeDocument;
    if (!doc) {
      alert("No document is open.");
    } else {
      var sel = doc.activeLayer;

      if (!sel) {
        alert("Nothing is selected.");
      } else {
        var parent = sel.parent;
        var docName = doc.name;

        if (parent.name === docName) {
          // ✅ Parent is the document → create folder
          var desc = new ActionDescriptor();
          var ref = new ActionReference();
          ref.putClass(stringIDToTypeID("layerSection")); // Folder
          desc.putReference(charIDToTypeID("null"), ref);

          var nameDesc = new ActionDescriptor();
          nameDesc.putString(stringIDToTypeID("name"), "anim_1");
          desc.putObject(stringIDToTypeID("using"), stringIDToTypeID("layerSection"), nameDesc);

          executeAction(charIDToTypeID("Mk  "), desc, DialogModes.NO);
          alert("✅ Folder 'anim_1' created at root.");
        } else {
          // ❌ Not at root
          alert("❌ Cannot create folder here.\\nParent is: '" + parent.name + "' (not the document).\\n\\nPlease deselect or select a top-level item.");
        }
      }
    }
  `;
  window.parent.postMessage(script, "*");
}
