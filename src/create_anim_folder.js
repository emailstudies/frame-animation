function handleCreateFolder() {
  const script = `
    var doc = app.activeDocument;
    var docName = doc.name;

    // Step 1: Create temp folder to check if at root
    var tempFolder = doc.layerSets.add();
    tempFolder.name = "temp_check_folder";
    var parent = tempFolder.parent;

    var atRoot = (parent && parent.name === docName);

    // Remove temp
    tempFolder.remove();

    if (!atRoot) {
      alert("❌ Folder would not be created at root. Please deselect nested items.");
    } else {
      // Step 2: Create real folder
      var groupDesc = new ActionDescriptor();
      var ref = new ActionReference();
      ref.putClass(stringIDToTypeID("layerSection"));
      groupDesc.putReference(charIDToTypeID("null"), ref);

      var props = new ActionDescriptor();
      props.putString(charIDToTypeID("Nm  "), "anim_auto");
      groupDesc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("layerSection"), props);

      executeAction(charIDToTypeID("Mk  "), groupDesc, DialogModes.NO);

      // Step 3: Move new group to top of UI stack (visually top = index 0)
      var newGroup = doc.activeLayer;
      var topLayer = doc.layers[0];
      newGroup.move(topLayer, ElementPlacement.PLACEBEFORE);

      // Step 4: Create Frame 1 inside it
      var layerDesc = new ActionDescriptor();
      var layerRef = new ActionReference();
      layerRef.putClass(charIDToTypeID("Lyr "));
      layerDesc.putReference(charIDToTypeID("null"), layerRef);

      var layerProps = new ActionDescriptor();
      layerProps.putString(charIDToTypeID("Nm  "), "Frame 1");
      layerDesc.putObject(charIDToTypeID("Usng"), charIDToTypeID("Lyr "), layerProps);

      executeAction(charIDToTypeID("Mk  "), layerDesc, DialogModes.NO);

      // Step 5: Move new layer into folder
      var newLayer = doc.activeLayer;
      newLayer.move(newGroup, ElementPlacement.INSIDE);

      alert("✅ Folder 'anim_auto' created at top of UI with Frame 1 inside.");
    }
  `;
  window.parent.postMessage(script, "*");
}
