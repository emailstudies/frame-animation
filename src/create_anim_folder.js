function handleCreateFolder() {
  const userInput = document.getElementById("animFolderInput").value.trim();
  if (!userInput) {
    alert("Please enter a folder name.");
    return;
  }

  const folderName = `anim_${userInput}`;

  const script = `
    var doc = app.activeDocument;
    var duplicate = false;

    // Check if anim_* folder already exists at root
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
      var rootCount = doc.layers.length;
      var sel = doc.activeLayer;
      var docName = doc.name;

      // CASE 1: Nothing selected (rootCount is 0)
      if (rootCount === 0 || (!sel && rootCount >= 0)) {
        // Create folder
        var groupDesc = new ActionDescriptor();
        var ref = new ActionReference();
        ref.putClass(stringIDToTypeID("layerSection"));
        groupDesc.putReference(charIDToTypeID("null"), ref);

        var props = new ActionDescriptor();
        props.putString(charIDToTypeID("Nm  "), "${folderName}");
        groupDesc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("layerSection"), props);

        executeAction(charIDToTypeID("Mk  "), groupDesc, DialogModes.NO);

        // Create layer inside the folder
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
      // CASE 2: Something selected
      else {
        var parent = sel.parent;
        if (parent && parent.name === docName) {
          // Selection is at root → allow
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
        } else {
          // ❌ Selection is nested
          var pname = parent ? parent.name : "unknown";
          alert("❌ Cannot create folder. Selected item's parent is: '" + pname + "'.\\nPlease deselect or select a top-level item.");
        }
      }
    }
  `;

  window.parent.postMessage(script, "*");
}
