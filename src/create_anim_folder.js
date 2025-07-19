function handleCreateFolder() {
  const script = `
    var doc = app.activeDocument;
    var tempFolder = doc.layerSets.add();
    tempFolder.name = "temp_check_folder";

    var parent = tempFolder.parent;
    var docName = doc.name;

    var parentName = parent && parent.name ? parent.name : "(no name)";
    var atRoot = (parentName === docName);

    // Remove the temp folder
    tempFolder.remove();

    if (atRoot) {
      // Create actual folder at root
      var groupDesc = new ActionDescriptor();
      var ref = new ActionReference();
      ref.putClass(stringIDToTypeID("layerSection"));
      groupDesc.putReference(charIDToTypeID("null"), ref);

      var props = new ActionDescriptor();
      props.putString(charIDToTypeID("Nm  "), "anim_auto");
      groupDesc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("layerSection"), props);

      executeAction(charIDToTypeID("Mk  "), groupDesc, DialogModes.NO);
      alert("✅ Folder 'anim_auto' created at root.");
    } else {
      alert("❌ Folder would not be created at root. Please deselect nested items.");
    }
  `;
  window.parent.postMessage(script, "*");
}
