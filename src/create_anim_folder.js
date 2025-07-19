function handleCreateFolder() {
  const script = `
    var doc = app.activeDocument;
    var docName = doc.name;

    // 1. Create TEMP folder to find insertion index
    var tempFolder = doc.layerSets.add();
    tempFolder.name = "temp_check_folder";

    // 2. Find temp's index
    var tempIndex = -1;
    for (var i = 0; i < doc.layers.length; i++) {
      if (doc.layers[i].name === "temp_check_folder") {
        tempIndex = i;
        break;
      }
    }

    // 3. Check nesting (parent should be document)
    var atRoot = tempFolder.parent.name === docName;

    // 4. Remove TEMP folder
    tempFolder.remove();

    if (!atRoot) {
      alert("❌ Folder would not be at root. Please deselect nested items.");
    } else {
      // 5. Create new anim_auto folder
      var groupDesc = new ActionDescriptor();
      var ref = new ActionReference();
      ref.putClass(stringIDToTypeID("layerSection"));
      groupDesc.putReference(charIDToTypeID("null"), ref);

      var props = new ActionDescriptor();
      props.putString(charIDToTypeID("Nm  "), "anim_auto");
      groupDesc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("layerSection"), props);

      executeAction(charIDToTypeID("Mk  "), groupDesc, DialogModes.NO);

      // 6. Move new folder to tempIndex position
      var newGroup = app.activeDocument.activeLayer;
      var target = doc.layers[tempIndex];
      newGroup.move(target, ElementPlacement.PLACEAFTER);

      // 7. Create "Frame 1" layer
      var layerDesc = new ActionDescriptor();
      var layerRef = new ActionReference();
      layerRef.putClass(charIDToTypeID("Lyr "));
      layerDesc.putReference(charIDToTypeID("null"), layerRef);

      var layerProps = new ActionDescriptor();
      layerProps.putString(charIDToTypeID("Nm  "), "Frame 1");
      layerDesc.putObject(charIDToTypeID("Usng"), charIDToTypeID("Lyr "), layerProps);

      executeAction(charIDToTypeID("Mk  "), layerDesc, DialogModes.NO);

      // 8. Move new layer into folder
      var newLayer = app.activeDocument.activeLayer;
      newLayer.move(newGroup, ElementPlacement.INSIDE);

      alert("✅ anim_auto folder created with Frame 1 at correct index.");
    }
  `;

  window.parent.postMessage(script, "*");
}
