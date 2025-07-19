function handleCreateFolder() {
  // STEP 1: Create folder
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

  // STEP 2: Wait and add a layer if a folder was created
  setTimeout(() => {
    const addLayerScript = `
      var doc = app.activeDocument;
      var target = doc.activeLayer;

      // Check that the active layer exists and is a folder
      if (target && typeof target.layers !== "undefined") {
        // Create new layer
        var desc = new ActionDescriptor();
        var ref = new ActionReference();
        ref.putClass(charIDToTypeID("ArtLayer"));
        desc.putReference(charIDToTypeID("null"), ref);

        executeAction(charIDToTypeID("Mk  "), desc, DialogModes.NO);

        // Move it inside the folder
        var newLayer = doc.activeLayer;
        newLayer.move(target, ElementPlacement.INSIDE);

        alert("✅ Created folder 'anim_1' with a layer inside.");
      } else {
        alert("⚠️ No valid folder selected to insert layer into.");
      }
    `;
    window.parent.postMessage(addLayerScript, "*");
  }, 10);
}
