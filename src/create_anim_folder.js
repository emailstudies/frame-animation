function handleCreateFolder() {
  const script = `
    var doc = app.activeDocument;
    var docName = doc.name;

    // Step 1: Create temp folder
    var tempFolder = doc.layerSets.add();
    tempFolder.name = "temp_check_folder";
    var tempIndex = doc.layers.length;
    var parent = tempFolder.parent;

    var atRoot = (parent.name === docName);

    // Step 2: Remove temp folder
    tempFolder.remove();

    if (atRoot) {
      // Step 3: Create actual folder
      var groupDesc = new ActionDescriptor();
      var ref = new ActionReference();
      ref.putClass(stringIDToTypeID("layerSection"));
      groupDesc.putReference(charIDToTypeID("null"), ref);

      var props = new ActionDescriptor();
      props.putString(charIDToTypeID("Nm  "), "anim_auto");
      groupDesc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("layerSection"), props);

      executeAction(charIDToTypeID("Mk  "), groupDesc, DialogModes.NO);

      var finalIndex = tempIndex + 1;
      alert("✅ Folder 'anim_auto' created at root at index: " + finalIndex);
    } else {
      alert("❌ Folder would not be at root. Please deselect nested items.");
    }
  `;
  window.parent.postMessage(script, "*");
}
