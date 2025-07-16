function handleAddAnimation() {
  const userInput = document.getElementById("animFolderInput").value.trim();
  if (!userInput) {
    alert("Please enter a folder name.");
    return;
  }

  const folderName = `anim_${userInput}`;

  const script = `
    var doc = app.activeDocument;

    var selectionSafe = false;

    try {
      // If this throws, then no layer is selected (which is what we want)
      var active = doc.activeLayer;
      selectionSafe = false; // Something is selected → not safe
    } catch (e) {
      selectionSafe = true; // Nothing selected → safe to proceed
    }

    if (!selectionSafe) {
      alert("Please deselect everything in the Layers panel before creating an animation folder.");
      return;
    }

    // Check for duplicate anim_ folder
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
      return;
    }

    // Create the animation folder
    var groupDesc = new ActionDescriptor();
    var ref = new ActionReference();
    ref.putClass(stringIDToTypeID("layerSection"));
    groupDesc.putReference(charIDToTypeID("null"), ref);

    var props = new ActionDescriptor();
    props.putString(charIDToTypeID("Nm  "), "${folderName}");
    groupDesc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("layerSection"), props);

    executeAction(charIDToTypeID("Mk  "), groupDesc, DialogModes.NO);

    // Create the "Frame 1" layer
    var layerDesc = new ActionDescriptor();
    var layerRef = new ActionReference();
    layerRef.putClass(charIDToTypeID("Lyr "));
    layerDesc.putReference(charIDToTypeID("null"), layerRef);

    var layerProps = new ActionDescriptor();
    layerProps.putString(charIDToTypeID("Nm  "), "Frame 1");
    layerDesc.putObject(charIDToTypeID("Usng"), charIDToTypeID("Lyr "), layerProps);

    executeAction(charIDToTypeID("Mk  "), layerDesc, DialogModes.NO);

    // Move the layer into the newly created folder
    var newLayer = app.activeDocument.activeLayer;
    var group = app.activeDocument.layers[0]; // most recently created group
    newLayer.move(group, ElementPlacement.INSIDE);
  `;

  window.parent.postMessage(script, "*");
}
