function handleCreateFolder() {
  const userInput = document.getElementById("animFolderInput").value.trim();
  if (!userInput) {
    alert("Please enter a folder name.");
    return;
  }

  const folderName = `anim_${userInput}`;

  const script = `
    var doc = app.activeDocument;
    if (!doc) {
      alert("No document open.");
    } else {
      // Create folder
      var groupDesc = new ActionDescriptor();
      var groupRef = new ActionReference();
      groupRef.putClass(stringIDToTypeID("layerSection"));
      groupDesc.putReference(charIDToTypeID("null"), groupRef);

      var groupProps = new ActionDescriptor();
      groupProps.putString(charIDToTypeID("Nm  "), "${folderName}");
      groupDesc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("layerSection"), groupProps);

      executeAction(charIDToTypeID("Mk  "), groupDesc, DialogModes.NO);

      // Store reference to the newly created folder
      var newFolder = doc.activeLayer;

      if (newFolder && typeof newFolder.layers !== "undefined") {
        // Create layer
        var layerDesc = new ActionDescriptor();
        var layerRef = new ActionReference();
        layerRef.putClass(charIDToTypeID("Lyr "));
        layerDesc.putReference(charIDToTypeID("null"), layerRef);

        var layerProps = new ActionDescriptor();
        layerProps.putString(charIDToTypeID("Nm  "), "Frame 1");
        layerDesc.putObject(charIDToTypeID("Usng"), charIDToTypeID("Lyr "), layerProps);

        executeAction(charIDToTypeID("Mk  "), layerDesc, DialogModes.NO);

        // Move the layer inside the folder
        var newLayer = doc.activeLayer;
        newLayer.move(newFolder, ElementPlacement.INSIDE);

        alert("✅ Folder '${folderName}' created with 'Frame 1' inside.");
      } else {
        alert("❌ Folder creation failed or not selected.");
      }
    }
  `;

  window.parent.postMessage(script, "*");
}
