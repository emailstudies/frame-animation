function handleCreateFolder() {
  const userInput = document.getElementById("animFolderInput").value.trim();
  if (!userInput) {
    alert("Please enter a folder name.");
    return;
  }

  const folderName = `anim_${userInput}`;

  const script = `
    var duplicate = false;

    // Check for duplicate folder at root level
    for (var i = 0; i < app.activeDocument.layers.length; i++) {
      var l = app.activeDocument.layers[i];
      if (l.name === "${folderName}" && l.typename === "LayerSet") {
        duplicate = true;
        break;
      }
    }

    if (duplicate) {
      alert("A folder named '${folderName}' already exists at the root level.");
    } else {
      var sel = app.activeDocument.activeLayer;
      var docName = app.activeDocument.name;
      var allow = false;

      if (!sel) {
        // Nothing is selected — allowed
        allow = true;
      } else if (sel.parent && sel.parent.name === docName) {
        // Something selected, but it's at root — allowed
        allow = true;
      }

      if (!allow) {
        var pname = sel && sel.parent ? sel.parent.name : "unknown";
        alert("❌ Cannot create folder. Selected item's parent is: '" + pname + "'.\\nPlease deselect or select a top-level item.");
      } else {
        // ✅ Create folder
        var groupDesc = new ActionDescriptor();
        var ref = new ActionReference();
        ref.putClass(stringIDToTypeID("layerSection"));
        groupDesc.putReference(charIDToTypeID("null"), ref);

        var props = new ActionDescriptor();
        props.putString(charIDToTypeID("Nm  "), "${folderName}");
        groupDesc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("layerSection"), props);

        executeAction(charIDToTypeID("Mk  "), groupDesc, DialogModes.NO);

        // ✅ Create a layer inside the folder
        var layerDesc = new ActionDescriptor();
        var layerRef = new ActionReference();
        layerRef.putClass(charIDToTypeID("Lyr "));
        layerDesc.putReference(charIDToTypeID("null"), layerRef);

        var layerProps = new ActionDescriptor();
        layerProps.putString(charIDToTypeID("Nm  "), "Frame 1");
        layerDesc.putObject(charIDToTypeID("Usng"), charIDToTypeID("Lyr "), layerProps);

        executeAction(charIDToTypeID("Mk  "), layerDesc, DialogModes.NO);

        // Move newly created layer into the newly created folder
        var newLayer = app.activeDocument.activeLayer;
        var group = newLayer.parent.layers[0];
        newLayer.move(group, ElementPlacement.INSIDE);
      }
    }
  `;

  window.parent.postMessage(script, "*");
}
