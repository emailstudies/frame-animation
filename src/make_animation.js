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
      if ("activeLayer" in doc && doc.activeLayer) {
        var selected = doc.activeLayer;

        var isGroupSelected = false;
        var isInsideGroup = false;

        // Check if selected is a group
        if ("typename" in selected && selected.typename === "LayerSet") {
          isGroupSelected = true;
        }

        // Check if selected is inside a group
        if ("parent" in selected && selected.parent && selected.parent.typename === "LayerSet") {
          isInsideGroup = true;
        }

        if (isGroupSelected || isInsideGroup) {
          shouldCancel = true;
        }
      }
    } catch (err) {
      // If anything fails, assume it's safe to create
      shouldCancel = false;
    }

    if (shouldCancel) {
      alert("Please deselect all layers and folders before creating an animation folder at the root level.");
    } else {
      // Check for duplicate anim_ folder at root
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

        // Create Frame 1 layer
        var layerDesc = new ActionDescriptor();
        var layerRef = new ActionReference();
        layerRef.putClass(charIDToTypeID("Lyr "));
        layerDesc.putReference(charIDToTypeID("null"), layerRef);

        var layerProps = new ActionDescriptor();
        layerProps.putString(charIDToTypeID("Nm  "), "Frame 1");
        layerDesc.putObject(charIDToTypeID("Usng"), charIDToTypeID("Lyr "), layerProps);

        executeAction(charIDToTypeID("Mk  "), layerDesc, DialogModes.NO);

        // Move the new layer into the newly created group
        var newLayer = app.activeDocument.activeLayer;
        var group = newLayer.parent.layers[0];
        newLayer.move(group, ElementPlacement.INSIDE);
      }
    }
  `;

  window.parent.postMessage(script, "*");
}
