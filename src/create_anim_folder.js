function handleCreateFolder() {
  // STEP 1: Create folder (this activates it)
  const createFolderScript = `
    var doc = app.activeDocument;
    if (!doc) {
      alert("No document is open.");
    } else {
      var sel = doc.activeLayer;
      var docName = doc.name;

      if (!sel || sel.parent.name === docName) {
        var desc = new ActionDescriptor();
        var ref = new ActionReference();
        ref.putClass(stringIDToTypeID("layerSection"));
        desc.putReference(charIDToTypeID("null"), ref);

        var nameDesc = new ActionDescriptor();
        nameDesc.putString(stringIDToTypeID("name"), "anim_1");
        desc.putObject(stringIDToTypeID("using"), stringIDToTypeID("layerSection"), nameDesc);

        executeAction(charIDToTypeID("Mk  "), desc, DialogModes.NO);
      } else {
        alert("❌ Cannot create folder here.\\nParent is: '" + sel.parent.name + "' (not the document).");
      }
    }
  `;

  window.parent.postMessage(createFolderScript, "*");

  // STEP 2: Wait 10ms and create a layer inside the newly created folder
  setTimeout(() => {
    const createLayerScript = `
      var doc = app.activeDocument;
      var newFolder = doc.activeLayer;

      if (newFolder && typeof newFolder.layers !== "undefined") {
        var layerDesc = new ActionDescriptor();
        var layerRef = new ActionReference();
        layerRef.putClass(charIDToTypeID("ArtLayer"));
        layerDesc.putReference(charIDToTypeID("null"), layerRef);

        executeAction(charIDToTypeID("Mk  "), layerDesc, DialogModes.NO);

        var newLayer = doc.activeLayer;
        newLayer.move(newFolder, ElementPlacement.INSIDE);

        alert("✅ Created folder 'anim_1' with a layer inside.");
      } else {
        alert("⚠️ Could not add layer — active layer is not a folder.");
      }
    `;
    window.parent.postMessage(createLayerScript, "*");
  }, 10);
}
