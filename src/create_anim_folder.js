function handleCreateFolder() {
  const userInput = document.getElementById("animFolderInput").value.trim();
  if (!userInput) {
    alert("Please enter a folder name.");
    return;
  }

  const folderName = `anim_${userInput}`;

  const script = `
    var folderName = "${folderName}";
    var docName = app.activeDocument.name;
    var duplicate = false;

    // Check for duplicate at root
    for (var i = 0; i < app.activeDocument.layers.length; i++) {
      var l = app.activeDocument.layers[i];
      if (l.name === folderName && l.typename === "LayerSet") {
        duplicate = true;
        break;
      }
    }

    if (duplicate) {
      alert("❌ A folder named '" + folderName + "' already exists at the root level.");
    } else {
      var sel = app.activeDocument.activeLayer;
      var allow = false;

      if (!sel) {
        // Nothing is selected → safe
        allow = true;
      } else if (sel.parent && sel.parent.name === docName) {
        // Selected item is at root → safe
        allow = true;
      }

      if (!allow) {
        var pname = sel && sel.parent ? sel.parent.name : "unknown";
        alert("❌ Cannot create folder. Selected item's parent is: '" + pname + "'.\\nPlease deselect or select a top-level item.");
      } else {
        // ✅ Create Folder
        var groupDesc = new ActionDescriptor();
        var ref = new ActionReference();
        ref.putClass(stringIDToTypeID("layerSection"));
        groupDesc.putReference(charIDToTypeID("null"), ref);

        var props = new ActionDescriptor();
        props.putString(charIDToTypeID("Nm  "), folderName);
        groupDesc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("layerSection"), props);

        executeAction(charIDToTypeID("Mk  "), groupDesc, DialogModes.NO);

        // ✅ Create Layer "Frame 1"
        var layerDesc = new ActionDescriptor();
        var layerRef = new ActionReference();
        layerRef.putClass(charIDToTypeID("Lyr "));
        layerDesc.putReference(charIDToTypeID("null"), layerRef);

        var layerProps = new ActionDescriptor();
        layerProps.putString(charIDToTypeID("Nm  "), "Frame 1");
        layerDesc.putObject(charIDToTypeID("Usng"), charIDToTypeID("Lyr "), layerProps);

        executeAction(charIDToTypeID("Mk  "), layerDesc, DialogModes.NO);

        // Move the new layer into the newly created folder
        var newLayer = app.activeDocument.activeLayer;
        var group = newLayer.parent.layers[0]; // Assumes the newly created group is selected
        newLayer.move(group, ElementPlacement.INSIDE);
      }
    }
  `;

  window.parent.postMessage(script, "*");
}
