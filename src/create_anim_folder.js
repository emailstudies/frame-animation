function handleCreateFolder() {
  const script = `
    var doc = app.activeDocument;
    var docName = doc.name;

    // Step 1: Create TEMP folder to detect position and nesting
    var tempFolder = doc.layerSets.add();
    tempFolder.name = "temp_check_folder";

    // Step 2: Determine if at root
    var parent = tempFolder.parent;
    var atRoot = (parent.name === docName);

    // Step 3: Find index of TEMP folder
    var tempIndex = -1;
    for (var i = 0; i < doc.layers.length; i++) {
      if (doc.layers[i].name === "temp_check_folder") {
        tempIndex = i;
        break;
      }
    }

    // Step 4: Store reference to layer just below TEMP (in UI terms)
    var targetLayerBelow = (tempIndex > 0) ? doc.layers[tempIndex - 1] : null;

    // Step 5: Delete TEMP folder
    tempFolder.remove();

    if (!atRoot) {
      alert("❌ Cannot create folder: selection is nested. Please deselect or select at root.");
      return;
    }

    // Step 6: Create actual anim_auto folder
    var groupDesc = new ActionDescriptor();
    var ref = new ActionReference();
    ref.putClass(stringIDToTypeID("layerSection"));
    groupDesc.putReference(charIDToTypeID("null"), ref);

    var props = new ActionDescriptor();
    props.putString(charIDToTypeID("Nm  "), "anim_auto");
    groupDesc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("layerSection"), props);

    executeAction(charIDToTypeID("Mk  "), groupDesc, DialogModes.NO);

    // Step 7: Get the newly created group
    var newGroup = app.activeDocument.activeLayer;

    // Step 8: Move it below the same layer that TEMP was above
    if (targetLayerBelow) {
      newGroup.move(targetLayerBelow, ElementPlacement.PLACEAFTER);
    }

    // Step 9: Create "Frame 1" inside the new folder
    var layerDesc = new ActionDescriptor();
    var layerRef = new ActionReference();
    layerRef.putClass(charIDToTypeID("Lyr "));
    layerDesc.putReference(charIDToTypeID("null"), layerRef);

    var layerProps = new ActionDescriptor();
    layerProps.putString(charIDToTypeID("Nm  "), "Frame 1");
    layerDesc.putObject(charIDToTypeID("Usng"), charIDToTypeID("Lyr "), layerProps);

    executeAction(charIDToTypeID("Mk  "), layerDesc, DialogModes.NO);

    var newLayer = app.activeDocument.activeLayer;
    newLayer.move(newGroup, ElementPlacement.INSIDE);

    alert("✅ 'anim_auto' created at correct index with Frame 1 inside.");
  `;

  window.parent.postMessage(script, "*");
}
