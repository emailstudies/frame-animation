function handleAddAnimation() {
  const userInput = document.getElementById("animFolderInput").value.trim();
  if (!userInput) {
    alert("Please enter a folder name.");
    return;
  }

  const folderName = `anim_${userInput}`;

  const script = `
    var doc = app.activeDocument;
    var layer = doc.activeLayer;

    // Check: if activeLayer is a group or not a top-level layer
    var isFolder = (layer.typename === "LayerSet");
    var isNested = (layer.parent !== doc);

    if (isFolder || isNested) {
      alert("Please deselect everything in the Layers panel before creating an animation folder.");
    } else {
      // Check for duplicates
      var exists = false;
      for (var i = 0; i < doc.layers.length; i++) {
        var topLayer = doc.layers[i];
        if (topLayer.name === "${folderName}" && topLayer.typename === "LayerSet") {
          exists = true;
          break;
        }
      }

      if (exists) {
        alert("A folder named '${folderName}' already exists at the root level.");
      } else {
        // Create group
        var groupDesc = new ActionDescriptor();
        var ref = new ActionReference();
        ref.putClass(stringIDToTypeID("layerSection"));
        groupDesc.putReference(charIDToTypeID("null"), ref);

        var props = new ActionDescriptor();
        props.putString(charIDToTypeID("Nm  "), "${folderName}");
        groupDesc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("layerSection"), props);

        executeAction(charIDToTypeID("Mk  "), groupDesc, DialogModes.NO);

        // Create "Frame 1" layer
        var layerDesc = new ActionDescriptor();
        var layerRef = new ActionReference();
        layerRef.putClass(charIDToTypeID("Lyr "));
        layerDesc.putReference(charIDToTypeID("null"), layerRef);

        var layerProps = new ActionDescriptor();
        layerProps.putString(charIDToTypeID("Nm  "), "Frame 1");
        layerDesc.putObject(charIDToTypeID("Usng"), charIDToTypeID("Lyr "), layerProps);

        executeAction(charIDToTypeID("Mk  "), layerDesc, DialogModes.NO);

        // Move to group
        var newLayer = app.activeDocument.activeLayer;
        var group = app.activeDocument.layers[0];
        newLayer.move(group, ElementPlacement.INSIDE);
      }
    }
  `;

  window.parent.postMessage(script, "*");
}
