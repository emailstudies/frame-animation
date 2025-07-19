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

We will continue working with the temp logic - just need to create at the correct index. Maybe reverse index too.

function createFolderAtIndexMinusTemp() {
  const script = `
    var doc = app.activeDocument;
    var docName = doc.name;

    // Step 1: Create a temp folder to find insertion point
    var tempFolder = doc.layerSets.add();
    tempFolder.name = "temp_check_folder";
    var tempIndex = doc.layers.length - 1; // Last index (top in doc, bottom in UI)

    var parent = tempFolder.parent;
    var atRoot = (parent.name === docName);

    // Step 2: Remove temp folder
    tempFolder.remove();

    if (atRoot) {
      // Step 3: Create the actual folder
      var groupDesc = new ActionDescriptor();
      var ref = new ActionReference();
      ref.putClass(stringIDToTypeID("layerSection"));
      groupDesc.putReference(charIDToTypeID("null"), ref);

      var props = new ActionDescriptor();
      props.putString(charIDToTypeID("Nm  "), "anim_auto");
      groupDesc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("layerSection"), props);

      executeAction(charIDToTypeID("Mk  "), groupDesc, DialogModes.NO);

      // Step 4: Move it to tempIndex - 1 in UI order
      var newGroup = doc.activeLayer; // The newly created folder becomes active
      var targetLayer = doc.layers[tempIndex - 1];
      newGroup.move(targetLayer, ElementPlacement.PLACEBEFORE);

      alert("✅ Folder 'anim_auto' created and placed before index: " + (tempIndex - 1));
    } else {
      alert("❌ Folder would not be at root. Please deselect nested items.");
    }
  `;
  window.parent.postMessage(script, "*");
}
