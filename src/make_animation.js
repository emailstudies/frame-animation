function handleAddAnimation() {
  const userInput = document.getElementById("animFolderInput").value.trim();
  if (!userInput) {
    alert("Please enter a folder name.");
    return;
  }

  const folderName = `anim_${userInput}`;

  const script = `
    var doc = app.activeDocument;
    var duplicate = false;

    // Check for duplicate anim_ folder at root
    for (var i = 0; i < doc.layers.length; i++) {
      var l = doc.layers[i];
      if (l.name === "${folderName}" && l.typename === "LayerSet") {
        duplicate = true;
        break;
      }
    }

    if (duplicate) {
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
      var group = newLayer.parent.layers[0];
      newLayer.move(group, ElementPlacement.INSIDE);
    }
  `;

  window.parent.postMessage(script, "*");
}
