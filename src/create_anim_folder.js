function handleCreateFolder() {
  const script = `
    var doc = app.activeDocument;
    var docName = doc.name;

    // Step 1: Create temp folder
    var tempFolder = doc.layerSets.add();
    tempFolder.name = "temp_check_folder";
    var tempIndex = doc.layers.length - 1;
    var parent = tempFolder.parent;

    var atRoot = (parent.name === docName);

    // Step 2: Remove temp folder
    tempFolder.remove();

    if (atRoot) {
      // Step 3: Create actual anim folder
      var groupDesc = new ActionDescriptor();
      var ref = new ActionReference();
      ref.putClass(stringIDToTypeID("layerSection"));
      groupDesc.putReference(charIDToTypeID("null"), ref);

      var props = new ActionDescriptor();
      props.putString(charIDToTypeID("Nm  "), "anim_auto");
      groupDesc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("layerSection"), props);

      executeAction(charIDToTypeID("Mk  "), groupDesc, DialogModes.NO);

      // Step 4: Move anim_auto to tempIndex position
      var animFolder = app.activeDocument.layerSets.getByName("anim_auto");
      var targetLayer = doc.layers[tempIndex];
      animFolder.move(targetLayer, ElementPlacement.PLACEBEFORE);

      // Step 5: Create Frame 1 layer
      var layerDesc = new ActionDescriptor();
      var layerRef = new ActionReference();
      layerRef.putClass(charIDToTypeID("Lyr "));
      layerDesc.putReference(charIDToTypeID("null"), layerRef);

      var layerProps = new ActionDescriptor();
      layerProps.putString(charIDToTypeID("Nm  "), "Frame 1");
      layerDesc.putObject(charIDToTypeID("Usng"), charIDToTypeID("Lyr "), layerProps);

      executeAction(charIDToTypeID("Mk  "), layerDesc, DialogModes.NO);

      var newLayer = app.activeDocument.activeLayer;
      newLayer.move(animFolder, ElementPlacement.INSIDE);

      alert("✅ 'anim_auto' folder created with 'Frame 1' inside at index: " + tempIndex);
    } else {
      alert("❌ Folder would not be at root. Please deselect nested items.");
    }
  `;
  window.parent.postMessage(script, "*");
}
