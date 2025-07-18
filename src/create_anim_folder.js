function handleCreateFolder() {
  const deselectScript = `
    app.activeDocument.activeLayer = null;
  `;
  window.parent.postMessage(deselectScript, "*");

  setTimeout(() => {
    const createFolderScript = `
      var doc = app.activeDocument;
      if (!doc) {
        alert("No document open.");
      } else {
        var desc = new ActionDescriptor();
        var ref = new ActionReference();
        ref.putClass(stringIDToTypeID("layerSection"));
        desc.putReference(charIDToTypeID("null"), ref);

        var nameDesc = new ActionDescriptor();
        nameDesc.putString(stringIDToTypeID("name"), "anim_1");
        desc.putObject(stringIDToTypeID("using"), stringIDToTypeID("layerSection"), nameDesc);

        executeAction(charIDToTypeID("Mk  "), desc, DialogModes.NO);
        alert("✅ Created folder 'anim_1' after deselection.");
      }
    `;
    window.parent.postMessage(createFolderScript, "*");
  }, 50); // Wait 50ms before creating folder
}
