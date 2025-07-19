function handleCreateFolder() {
  const script = `
    var doc = app.activeDocument;
    if (!doc) {
      alert("No document is open.");
    } else {
      var sel = doc.activeLayer;
      var docName = doc.name;

      // ✅ Allow folder creation if nothing is selected or selection is at root
      var allowCreation = (!sel) || (sel.parent && sel.parent.name === docName);

      if (allowCreation) {
        // 🟢 Create new folder at root
        var folderDesc = new ActionDescriptor();
        var folderRef = new ActionReference();
        folderRef.putClass(stringIDToTypeID("layerSection"));
        folderDesc.putReference(charIDToTypeID("null"), folderRef);

        var nameDesc = new ActionDescriptor();
        nameDesc.putString(stringIDToTypeID("name"), "anim_1");
        folderDesc.putObject(stringIDToTypeID("using"), stringIDToTypeID("layerSection"), nameDesc);

        executeAction(charIDToTypeID("Mk  "), folderDesc, DialogModes.NO);

        // 🟢 Automatically selected folder after creation
        var newFolder = app.activeDocument.activeLayer;

        // Confirm it is a folder
        if (newFolder && typeof newFolder.layers !== "undefined") {
          // Create a layer (it will go inside the folder)
          var layerDesc = new ActionDescriptor();
          var layerRef = new ActionReference();
          layerRef.putClass(charIDToTypeID("ArtLayer"));
          layerDesc.putReference(charIDToTypeID("null"), layerRef);
          executeAction(charIDToTypeID("Mk  "), layerDesc, DialogModes.NO);

          alert("✅ Folder 'anim_1' created with one layer inside.");
        } else {
          alert("⚠️ Created something, but it was not a valid folder.");
        }

      } else {
        // ❌ Nested selection – not allowed
        var parentName = sel && sel.parent ? sel.parent.name : "(unknown)";
        alert("❌ Cannot create folder.\\nParent is: '" + parentName + "' (not at document root).\\nPlease deselect or select a top-level item.");
      }
    }
  `;
  window.parent.postMessage(script, "*");
}
