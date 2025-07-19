function handleCreateFolder() {
  const userInput = document.getElementById("animFolderInput").value.trim();
  if (!userInput) {
    alert("Please enter a folder name.");
    return;
  }

  const folderName = `anim_${userInput}`;

  const script = `
    var folderName = "${folderName}";
    var doc = app.activeDocument;
    var docName = doc.name;
    var totalLayers = doc.layers.length;
    var duplicate = false;

    // Check if a folder with same name already exists at root
    for (var i = 0; i < totalLayers; i++) {
      var l = doc.layers[i];
      if (l.name === folderName && l.typename === "LayerSet") {
        duplicate = true;
        break;
      }
    }

    if (duplicate) {
      alert("❌ A folder named '" + folderName + "' already exists at the root level.");
    } else {
      var sel = doc.activeLayer;
      var allow = false;

      if (totalLayers > 1 || totalLayers === 1) {
        // Case: One or more layers — check if selection is nested
        if (!sel) {
          allow = true; // Nothing selected, still okay
        } else if (sel.parent && sel.parent.name === docName) {
          allow = true; // Selected layer/folder is at root
        } else {
          // Selected item is nested
          var pname = sel && sel.parent ? sel.parent.name : "unknown";
          alert("❌ Cannot create folder. Selected item's parent is: '" + pname + "'.\\nPlease deselect or select a top-level item.");
        }
      } else {
        // Case: fallback — unknown state, safe to create
        allow = true;
      }

      if (allow) {
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

        // Move "Frame 1" layer into the newly created folder
        var newLayer = app.activeDocument.activeLayer;
        var group = newLayer.parent.layers[0];
        newLayer.move(group, ElementPlacement.INSIDE);
      }
    }
  `;

  window.parent.postMessage(script, "*");
}
