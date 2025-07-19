function handleCreateFolder() {
  const script = `
    var doc = app.activeDocument;
    var docName = doc.name;

    // 1. Create TEMP folder to check if creation is at root
    var tempFolder = doc.layerSets.add();
    tempFolder.name = "temp_check_folder";
    var parent = tempFolder.parent;
    var atRoot = (parent && parent.name === docName);
    tempFolder.remove();

    if (!atRoot) {
      alert("❌ Folder would not be created at root. Please deselect nested items.");
    } else {
      // 2. Create actual anim_auto folder
      var groupDesc = new ActionDescriptor();
      var ref = new ActionReference();
      ref.putClass(stringIDToTypeID("layerSection"));
      groupDesc.putReference(charIDToTypeID("null"), ref);

      var props = new ActionDescriptor();
      props.putString(charIDToTypeID("Nm  "), "anim_auto");
      groupDesc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("layerSection"), props);

      executeAction(charIDToTypeID("Mk  "), groupDesc, DialogModes.NO);

      // 3. Move new folder to the visual top of Layers panel
      var newGroup = doc.activeLayer;
      var topLayer = doc.layers[doc.layers.length - 1];
      newGroup.move(topLayer, ElementPlacement.PLACEAFTER);

      // 4. Create "Frame 1" layer inside the new group
      var layerDesc = new ActionDescriptor();
      var layerRef = new ActionReference();
      layerRef.putClass(charIDToTypeID("Lyr "));
      layerDesc.putReference(charIDToTypeID("null"), layerRef);

      var layerProps = new ActionDescriptor();
      layerProps.putString(charIDToTypeID("Nm  "), "Frame 1");
      layerDesc.putObject(charIDToTypeID("Usng"), charIDToTypeID("Lyr "), layerProps);

      executeAction(charIDToTypeID("Mk  "), layerDesc, DialogModes.NO);

      // 5. Move the new layer inside the newly created group
      var newLayer = doc.activeLayer;
      newLayer.move(newGroup, ElementPlacement.INSIDE);

      // 6. Select the folder
      doc.activeLayer = newGroup;

      alert("✅ Folder 'anim_auto' created at top with 'Frame 1' inside.");
    }
  `;

  window.parent.postMessage(script, "*");
}
