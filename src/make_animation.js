function handleAddAnimation() {
  const userInput = document.getElementById("animFolderInput").value.trim();
  if (!userInput) {
    alert("Please enter a folder name.");
    return;
  }

  const folderName = `anim_${userInput}`;

  // 1. Deselect everything to ensure creation at root
  // 2. Check for duplicate group names
  // 3. Create group and Frame 1 layer
  // 4. Move layer inside group

  const script = `
    var doc = app.activeDocument;

    // Deselect all layers to force root-level group creation
    var selNone = new ActionDescriptor();
    var ref = new ActionReference();
    ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
    selNone.putReference(charIDToTypeID("null"), ref);
    executeAction(charIDToTypeID("Dslc"), selNone, DialogModes.NO);

    // Check for duplicate anim_ folder
    var exists = false;
    for (var i = 0; i < doc.layers.length; i++) {
      var layer = doc.layers[i];
      if (layer.kind === LayerKind.GROUP && layer.name === "${folderName}") {
        exists = true;
        break;
      }
    }

    if (exists) {
      alert("A folder named '${folderName}' already exists at the root level.");
    } else {
      var groupDesc = new ActionDescriptor();
      var ref = new ActionReference();
      ref.putClass(stringIDToTypeID("layerSection"));
      groupDesc.putReference(charIDToTypeID("null"), ref);

      var props = new ActionDescriptor();
      props.putString(charIDToTypeID("Nm  "), "${folderName}");
      groupDesc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("layerSection"), props);

      executeAction(charIDToTypeID("Mk  "), groupDesc, DialogModes.NO);

      var layerDesc = new ActionDescriptor();
      var layerRef = new ActionReference();
      layerRef.putClass(charIDToTypeID("Lyr "));
      layerDesc.putReference(charIDToTypeID("null"), layerRef);

      var layerProps = new ActionDescriptor();
      layerProps.putString(charIDToTypeID("Nm  "), "Frame 1");
      layerDesc.putObject(charIDToTypeID("Usng"), charIDToTypeID("Lyr "), layerProps);

      executeAction(charIDToTypeID("Mk  "), layerDesc, DialogModes.NO);

      var newLayer = app.activeDocument.activeLayer;
      var group = app.activeDocument.layers[0]; // most recently added group
      newLayer.move(group, ElementPlacement.INSIDE);
    }
  `;

  window.parent.postMessage(script, "*");
}
