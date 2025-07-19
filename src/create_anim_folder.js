function handleCreateFolder() {
  const userInput = document.getElementById("animFolderInput").value.trim();
  if (!userInput) {
    alert("Please enter a folder name.");
    return;
  }

  const folderName = `anim_${userInput}`;

  const script = `
    var doc = app.activeDocument;
    var docName = doc.name;

    // Step 1: Check for duplicates at root
    var isDuplicate = false;
    for (var i = 0; i < doc.layers.length; i++) {
      var layer = doc.layers[i];
      if (layer.name === "${folderName}" && layer.typename === "LayerSet") {
        isDuplicate = true;
        break;
      }
    }

    if (isDuplicate) {
      alert("❌ A folder named '${folderName}' already exists at root.");
    } else {
      // Step 2: Use temp folder to check nesting
      var tempFolder = doc.layerSets.add();
      tempFolder.name = "temp_check_folder";
      var parent = tempFolder.parent;
      var atRoot = (parent && parent.name === docName);
      tempFolder.remove();

      if (!atRoot) {
        alert("❌ Anim_Folder cannot be nested under another folder. Please deselect everything by clicking outside the Layers Panel or select a un-nested folder.");
      } else {
        // Step 3: Create real folder
        var groupDesc = new ActionDescriptor();
        var ref = new ActionReference();
        ref.putClass(stringIDToTypeID("layerSection"));
        groupDesc.putReference(charIDToTypeID("null"), ref);

        var props = new ActionDescriptor();
        props.putString(charIDToTypeID("Nm  "), "${folderName}");
        groupDesc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("layerSection"), props);

        executeAction(charIDToTypeID("Mk  "), groupDesc, DialogModes.NO);

        // Step 4: Move folder to top of UI
        var newGroup = doc.activeLayer;
        var topLayer = doc.layers[0];
        newGroup.move(topLayer, ElementPlacement.PLACEBEFORE);

        // Step 5: Create Frame 1 layer inside
        var layerDesc = new ActionDescriptor();
        var layerRef = new ActionReference();
        layerRef.putClass(charIDToTypeID("Lyr "));
        layerDesc.putReference(charIDToTypeID("null"), layerRef);

        var layerProps = new ActionDescriptor();
        layerProps.putString(charIDToTypeID("Nm  "), "Frame 1");
        layerDesc.putObject(charIDToTypeID("Usng"), charIDToTypeID("Lyr "), layerProps);

        executeAction(charIDToTypeID("Mk  "), layerDesc, DialogModes.NO);

        // Step 6: Move Frame 1 into the folder
        var newLayer = doc.activeLayer;
        newLayer.move(newGroup, ElementPlacement.INSIDE);

        alert("✅ Folder '${folderName}' created at top with Frame 1 inside.");
      }
    }
  `;

  window.parent.postMessage(script, "*");
}
