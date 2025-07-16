function handleAddAnimation() {
  const userInput = document.getElementById("animFolderInput").value.trim();
  if (!userInput) {
    alert("Please enter a folder name.");
    return;
  }

  const folderName = `anim_${userInput}`;

  const script = `
    var doc = app.activeDocument;
    var shouldCancel = false;

    try {
      var selected = doc.activeLayer;
      if (selected && selected.parent && selected.parent.typename === "LayerSet") {
        // Selected layer is inside a group — new folder will nest
        shouldCancel = true;
      }
      if (selected && selected.typename === "LayerSet") {
        // A group itself is selected — new folder will nest inside it
        shouldCancel = true;
      }
    } catch (e) {
      shouldCancel = false;
    }

    if (shouldCancel) {
      alert("Please deselect all layers and groups. The animation folder must be created at the root level.");
    } else {
      // Check for duplicate anim_ folder
      var duplicate = false;
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
        // Create group
        var groupDesc = new ActionDescriptor();
        var ref = new ActionReference();
        ref.putClass(stringIDToTypeID("layerSection"));
        groupDesc.putReference(charIDToTypeID("null"), ref);

        var props = new ActionDescriptor();
        props.putString(charIDToTypeID("Nm  "), "${folderName}");
        groupDesc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("layerSection"), props);

        executeAction(charIDToTypeID("Mk  "), groupDesc, DialogModes.NO);

        // Create Frame 1
        var layerDesc = new ActionDescriptor();
        var layerRef = new ActionReference();
        layerRef.putClass(charIDToTypeID("Lyr "));
        layerDesc.putReference(charIDToTypeID("null"), layerRef);

        var layerProps = new ActionDescriptor();
        layerProps.putString(charIDToTypeID("Nm  "), "Frame 1");
        layerDesc.putObject(charIDToTypeID("Usng"), charIDToTypeID("Lyr "), layerProps);

        executeAction(charIDToTypeID("Mk  "), layerDesc, DialogModes.NO);

        // Move layer into group
        var newLayer = app.activeDocument.activeLayer;
        var group = newLayer.parent.layers[0];
        newLayer.move(group, ElementPlacement.INSIDE);
      }
    }
  `;

  window.parent.postMessage(script, "*");
}
