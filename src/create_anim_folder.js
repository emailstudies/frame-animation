function handleCreateFolder() {
  const script = `
    var doc = app.activeDocument;
    if (!doc) {
      alert("No document is open.");
    } else {
      var sel = doc.activeLayer;
      var docName = doc.name;

      // ✅ Allow creation if nothing is selected or selected item's parent is the doc (root)
      var allowCreation = (!sel) || (sel.parent && sel.parent.name === docName);

      if (allowCreation) {
        // Create new folder
        var folderDesc = new ActionDescriptor();
        var folderRef = new ActionReference();
        folderRef.putClass(stringIDToTypeID("layerSection"));
        folderDesc.putReference(charIDToTypeID("null"), folderRef);

        var nameDesc = new ActionDescriptor();
        nameDesc.putString(stringIDToTypeID("name"), "anim_1");
        folderDesc.putObject(stringIDToTypeID("using"), stringIDToTypeID("layerSection"), nameDesc);

        executeAction(charIDToTypeID("Mk  "), folderDesc, DialogModes.NO);

        // After creation, the new folder is selected → now create a layer inside it
        var newFolder = doc.activeLayer;

        if (newFolder && typeof newFolder.layers !== "undefined") {
          var layerDesc = new ActionDescriptor();
          var layerRef = new ActionReference();
          layerRef.putClass(charIDToTypeID("ArtLayer"));
          layerDesc.putReference(charIDToTypeID("null"), layerRef);

          executeAction(charIDToTypeID("Mk  "), layerDesc, DialogModes.NO);

          alert("✅ Created folder 'anim_1' with a layer inside.");
        } else {
          alert("⚠️ Could not create layer — the new folder was not created properly.");
        }

      } else {
        alert("❌ Cannot create folder here.\\nParent is: '" + sel.parent.name + "' (not at document root).\\n\\nPlease deselect or select a top-level item.");
      }
    }
  `;
  window.parent.postMessage(script, "*");
}
