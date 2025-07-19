function handleCreateFolder() {
  const userInput = document.getElementById("animFolderInput").value.trim();
  if (!userInput) {
    alert("Please enter a folder name.");
    return;
  }

  const folderName = `anim_${userInput}`;

  const script = `
    var duplicate = false;

    // Check if a folder with the same name already exists at root
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
      var rootCount = app.activeDocument.layers.length;
      var sel = app.activeDocument.activeLayer;
      var docName = app.activeDocument.name;

      var allow = false;

      if (rootCount === 0 || (!sel && rootCount >= 0)) {
        // Case: nothing selected (clean state)
        allow = true;
      } else if (sel && sel.parent && sel.parent.name === docName) {
        // Case: something selected but at root
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

        // ✅ Create a layer inside that folder
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
        var group = newLayer.parent.layers[0]; // Last created folder
        newLayer.move(group, ElementPlacement.INSIDE);
      }
    }
  `;

  window.parent.postMessage(script, "*");
}
