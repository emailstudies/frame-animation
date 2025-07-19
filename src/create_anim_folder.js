function isSelectionNested() {
  const script = `
    var doc = app.activeDocument;
    var sel = doc.activeLayer;
    if (!sel) {
      true; // Nothing selected → treat as non-nested (safe)
    } else {
      var docName = doc.name;
      (sel.parent && sel.parent.name !== docName); // true = nested, false = top-level
    }
  `;
  return new Promise((resolve) => {
    window.addEventListener("message", function handler(event) {
      if (typeof event.data === "boolean") {
        window.removeEventListener("message", handler);
        resolve(event.data);
      }
    });
    window.parent.postMessage(script, "*");
  });
}

function handleCreateFolder() {
  const userInput = document.getElementById("animFolderInput").value.trim();
  if (!userInput) {
    alert("Please enter a folder name.");
    return;
  }

  const folderName = `anim_${userInput}`;

  isSelectionNested().then((isNested) => {
    if (isNested) {
      alert("❌ Cannot create folder. Selection is inside a nested group.\\nPlease deselect or select a top-level item.");
      return;
    }

    const script = `
      var doc = app.activeDocument;
      if (!doc) {
        alert("No document open.");
      } else {
        var sel = doc.activeLayer;
        var docName = doc.name;
        var allowCreation = (!sel) || (sel.parent && sel.parent.name === docName);

        if (allowCreation) {
          // Create folder
          var groupDesc = new ActionDescriptor();
          var groupRef = new ActionReference();
          groupRef.putClass(stringIDToTypeID("layerSection"));
          groupDesc.putReference(charIDToTypeID("null"), groupRef);

          var groupProps = new ActionDescriptor();
          groupProps.putString(charIDToTypeID("Nm  "), "${folderName}");
          groupDesc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("layerSection"), groupProps);

          executeAction(charIDToTypeID("Mk  "), groupDesc, DialogModes.NO);

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

            // Move the layer into the new folder
            var newLayer = doc.activeLayer;
            newLayer.move(newFolder, ElementPlacement.INSIDE);

            alert("✅ Folder '${folderName}' created with 'Frame 1' inside.");
          } else {
            alert("⚠️ Folder creation failed.");
          }
        } else {
          var pname = sel && sel.parent ? sel.parent.name : "unknown";
          alert("❌ Cannot create folder. Selected item's parent is: '" + pname + "'.\\nPlease deselect or select a top-level item.");
        }
      }
    `;
    window.parent.postMessage(script, "*");
  });
}
