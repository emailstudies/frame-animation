function handleCreateFolder() {
  const script = `
    var doc = app.activeDocument;
    var docName = doc.name;

    // 1. Create TEMP folder
    var tempFolder = doc.layerSets.add();
    tempFolder.name = "temp_check_folder";

    // 2. Check if TEMP is at root level
    var atRoot = (tempFolder.parent.name === docName);

    // 3. Find its index among top-level layers
    var tempIndex = -1;
    for (var i = 0; i < doc.layers.length; i++) {
      if (doc.layers[i].name === "temp_check_folder") {
        tempIndex = i;
        break;
      }
    }

    // 4. Store name of layer currently below it (if any)
    var targetLayerBelow = (tempIndex > 0) ? doc.layers[tempIndex - 1] : null;

    // 5. Remove TEMP folder
    tempFolder.remove();

    if (!atRoot) {
      alert("❌ Folder would not be at root. Please deselect nested items.");
      return;
    }

    // 6. Create new anim_auto folder
    var groupDesc = new ActionDescriptor();
    var ref = new ActionReference();
    ref.putClass(stringIDToTypeID("layerSection"));
    groupDesc.putReference(charIDToTypeID("null"), ref);

    var props = new ActionDescriptor();
    props.putString(charIDToTypeID("Nm  "), "anim_auto");
    groupDesc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("layerSection"), props);

    executeAction(charIDToTypeID("Mk  "), groupDesc, DialogModes.NO);

    // 7. Get the newly created folder
    var newGroup = app.activeDocument.activeLayer;

    // 8. Move it below the same layer the temp was above
    if (targetLayerBelow) {
      newGroup.move(targetLayerBelow, ElementPlacement.PLACEAFTER);
    }

    // 9. Add "Frame 1" inside it
    var layerDesc = new ActionDescriptor();
    var layerRef = new ActionReference();
    layerRef.putClass(charIDToTypeID("Lyr "));
    layerDesc.putReference(charIDToTypeID("null"), layerRef);

    var layerProps = new ActionDescriptor();
    layerProps.putString(charIDToTypeID("Nm  "), "Frame 1");
    layerDesc.putObject(charIDToTypeID("Usng"), charIDToTypeID("Lyr "), layerProps);

    executeAction(charIDToTypeID("Mk  "), layerDesc, DialogModes.NO);

    // 10. Move it inside the new folder
    var newLayer = app.activeDocument.activeLayer;
    newLayer.move(newGroup, ElementPlacement.INSIDE);

    alert("✅ Folder 'anim_auto' created with Frame 1 at correct index.");
  `;

  window.parent.postMessage(script, "*");
}
