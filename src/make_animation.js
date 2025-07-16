function handleAddAnimation() {
  const userInput = document.getElementById("animFolderInput").value.trim();
  if (!userInput) {
    alert("Please enter a folder name.");
    return;
  }

  const folderName = `anim_${userInput}`;

  const script = `
    var doc = app.activeDocument;

    // Check if folder with same name already exists at root
    var exists = false;
    for (var i = 0; i < doc.layers.length; i++) {
      var layer = doc.layers[i];
      if (layer.name === "${folderName}" && layer.typename === "LayerSet") {
        exists = true;
        break;
      }
    }

    if (exists) {
      alert("A folder named '${folderName}' already exists at the root level.");
    } else {
      // Step 1: Create a new group
      var groupDesc = new ActionDescriptor();
      var ref = new ActionReference();
      ref.putClass(stringIDToTypeID("layerSection"));
      groupDesc.putReference(charIDToTypeID("null"), ref);

      var props = new ActionDescriptor();
      props.putString(charIDToTypeID("Nm  "), "${folderName}");
      groupDesc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("layerSection"), props);

      executeAction(charIDToTypeID("Mk  "), groupDesc, DialogModes.NO);

      // Step 2: Move group to top/root level if needed
      var group = app.activeDocument.activeLayer;
      group.move(app.activeDocument, ElementPlacement.PLACEATBEGINNING);

      // Step 3: Create a new layer
      var layerDesc = new ActionDescriptor();
      var layerRef = new ActionReference();
      layerRef.putClass(charIDToTypeID("Lyr "));
      layerDesc.putReference(charIDToTypeID("null"), layerRef);

      var layerProps = new ActionDescriptor();
      layerProps.putString(charIDToTypeID("Nm  "), "Frame 1");
      layerDesc.putObject(charIDToTypeID("Usng"), charIDToTypeID("Lyr "), layerProps);

      executeAction(charIDToTypeID("Mk  "), layerDesc, DialogModes.NO);

      // Step 4: Move layer into group
      var newLayer = app.activeDocument.activeLayer;
      newLayer.move(group, ElementPlacement.INSIDE);
    }
  `;

  window.parent.postMessage(script, "*");
}
