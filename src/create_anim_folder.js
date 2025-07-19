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
    var totalLayers = doc.layers.length;
    var folderExists = false;

    // Check for duplicate anim_ folder at root
    for (var i = 0; i < totalLayers; i++) {
      var l = doc.layers[i];
      if (l.name === "${folderName}" && l.typename === "LayerSet") {
        folderExists = true;
        break;
      }
    }

    if (folderExists) {
      alert("A folder named '${folderName}' already exists at the root.");
    } else {
      function createAnimFolderAndLayer() {
        // Create Folder
        var groupDesc = new ActionDescriptor();
        var ref = new ActionReference();
        ref.putClass(stringIDToTypeID("layerSection"));
        groupDesc.putReference(charIDToTypeID("null"), ref);

        var props = new ActionDescriptor();
        props.putString(charIDToTypeID("Nm  "), "${folderName}");
        groupDesc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("layerSection"), props);

        executeAction(charIDToTypeID("Mk  "), groupDesc, DialogModes.NO);

        // Create Layer
        var layerDesc = new ActionDescriptor();
        var layerRef = new ActionReference();
        layerRef.putClass(charIDToTypeID("Lyr "));
        layerDesc.putReference(charIDToTypeID("null"), layerRef);

        var layerProps = new ActionDescriptor();
        layerProps.putString(charIDToTypeID("Nm  "), "Frame 1");
        layerDesc.putObject(charIDToTypeID("Usng"), charIDToTypeID("Lyr "), layerProps);

        executeAction(charIDToTypeID("Mk  "), layerDesc, DialogModes.NO);

        // Move the new layer inside the new folder
        var newLayer = app.activeDocument.activeLayer;
        var group = newLayer.parent.layers[0];
        newLayer.move(group, ElementPlacement.INSIDE);
      }

      if (totalLayers > 1) {
        var active = doc.activeLayer;
        var parentName = active && active.parent ? active.parent.name : "";

        if (parentName !== docName) {
          alert("Selected layer is nested. Please select a root-level layer.");
        } else {
          createAnimFolderAndLayer();
        }
      } else if (totalLayers === 1) {
        var onlyLayer = doc.layers[0];
        var onlyParentName = onlyLayer && onlyLayer.parent ? onlyLayer.parent.name : "";

        if (onlyParentName === docName) {
          createAnimFolderAndLayer();
        } else {
          // Select top-level layer using ActionDescriptor
          var desc = new ActionDescriptor();
          var ref = new ActionReference();
          ref.putIndex(charIDToTypeID("Lyr "), totalLayers); // Reverse index
          desc.putReference(charIDToTypeID("null"), ref);
          desc.putBoolean(charIDToTypeID("MkVs"), false);
          executeAction(charIDToTypeID("slct"), desc, DialogModes.NO);

          // Now create the folder + layer
          createAnimFolderAndLayer();
        }
      } else {
        alert("No layers found in the document.");
      }
    }
  `;

  window.parent.postMessage(script, "*");
}
