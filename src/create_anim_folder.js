function handleCreateFolder() {
  const script = `
    var doc = app.activeDocument;
    var docName = doc.name;

    // Step 1: Create TEMP folder to detect nesting
    var tempFolder = doc.layerSets.add();
    tempFolder.name = "temp_check_folder";

    var isAtRoot = tempFolder.parent.name === docName;

    // Step 2: Remove temp folder
    tempFolder.remove();

    if (isAtRoot) {
      // Step 3: Create new anim_auto folder
      var groupDesc = new ActionDescriptor();
      var ref = new ActionReference();
      ref.putClass(stringIDToTypeID("layerSection"));
      groupDesc.putReference(charIDToTypeID("null"), ref);

      var props = new ActionDescriptor();
      props.putString(charIDToTypeID("Nm  "), "anim_auto");
      groupDesc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("layerSection"), props);

      executeAction(charIDToTypeID("Mk  "), groupDesc, DialogModes.NO);

      var newGroup = doc.activeLayer;

      // Step 4: Move it to top of UI (bottom of doc.layers[])
      if (doc.layers.length > 1) {
        var bottomLayer = doc.layers[doc.layers.length - 1];
        newGroup.move(bottomLayer, ElementPlacement.PLACEAFTER);
      }

      // Step 5: Add "Frame 1" layer inside it
      var layerDesc = new ActionDescriptor();
      var layerRef = new ActionReference();
      layerRef.putClass(charIDToTypeID("Lyr "));
      layerDesc.putReference(charIDToTypeID("null"), layerRef);

      var layerProps = new ActionDescriptor();
      layerProps.putString(charIDToTypeID("Nm  "), "Frame 1");
      layerDesc.putObject(charIDToTypeID("Usng"), charIDToTypeID("Lyr "), layerProps);

      executeAction(charIDToTypeID("Mk  "), layerDesc, DialogModes.NO);

      var newLayer = doc.activeLayer;
      newLayer.move(newGroup, ElementPlacement.INSIDE);

      // Step 6: Select the anim_auto folder using ActionDescriptor
      var selectDesc = new ActionDescriptor();
      var selectRef = new ActionReference();
      selectRef.putName(charIDToTypeID("Lyr "), "anim_auto");
      selectDesc.putReference(charIDToTypeID("null"), selectRef);
      executeAction(charIDToTypeID("slct"), selectDesc, DialogModes.NO);

      alert("✅ Folder 'anim_auto' created at top with 'Frame 1' inside and selected.");
    } else {
      alert("❌ Cannot create folder here — selection is nested. Please deselect or select a top-level item.");
    }
  `;
  window.parent.postMessage(script, "*");
}
