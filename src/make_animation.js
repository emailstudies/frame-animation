function handleAddAnimation() {
  const userInput = document.getElementById("animFolderInput").value.trim();
  if (!userInput) {
    alert("Please enter a folder name.");
    return;
  }

  const folderName = `anim_${userInput}`;

  const script = `
    var doc = app.activeDocument;

    var isSafeToCreate = true;

    try {
      var layer = doc.activeLayer;

      // Check if selected layer is a group
      if (layer.typename === "LayerSet") {
        isSafeToCreate = false;
      }

      // Check if selected layer is nested inside another group
      if (typeof layer.parent !== "undefined" && layer.parent !== doc) {
        isSafeToCreate = false;
      }
    } catch (e) {
      // If accessing activeLayer fails, assume nothing is selected → safe
      isSafeToCreate = true;
    }

    if (!isSafeToCreate) {
      alert("Please deselect all layers and folders before creating an animation folder.");
    } else {
      // Check for duplicate folder
      var exists = false;
      for (var i = 0; i < doc.layers.length; i++) {
        var l = doc.layers[i];
        if (l.name === "${folderName}" && l.typename === "LayerSet") {
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

        // Create Frame 1
        var layerDesc = new ActionDescriptor();
        var layerRef = new ActionReference();
        layerRef.putClass(charIDToTypeID("Lyr "));
        layerDesc.putReference(charIDToTypeID("null"), layerRef);

        var layerProps = new ActionDescriptor();
        layerProps.putString(charIDToTypeID("Nm  "), "Frame 1");
        layerDesc.putObject(charIDToTypeID("Usng"), charIDToTypeID("Lyr "), layerProps);

        executeAction(charIDToTypeID("Mk  "), layerDesc, DialogModes.NO);

        // Move into folder
        var newLayer = app.activeDocument.activeLayer;
        var group = app.activeDocument.layers[0];
        newLayer.move(group, ElementPlacement.INSIDE);
      }
    }
  `;

  window.parent.postMessage(script, "*");
}
