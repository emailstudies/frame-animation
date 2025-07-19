function handleCreateFolder() {
  const script = `
    var doc = app.activeDocument;
    var docName = doc.name;

    // Step 1: Create a TEMP folder
    var tempFolder = doc.layerSets.add();
    tempFolder.name = "temp_check_folder";

    // Step 2: Get its index among top-level layers
    var tempIndex = -1;
    for (var i = 0; i < doc.layers.length; i++) {
      if (doc.layers[i].name === "temp_check_folder") {
        tempIndex = i;
        break;
      }
    }

    // Step 3: Check if it's at root
    var atRoot = (tempFolder.parent.name === docName);

    // Step 4: Remove temp
    tempFolder.remove();

    if (!atRoot) {
      alert("❌ Folder would not be created at root. Please deselect nested items.");
    } else {
      // Step 5: Create the real anim_auto folder
      var groupDesc = new ActionDescriptor();
      var ref = new ActionReference();
      ref.putClass(stringIDToTypeID("layerSection"));
      groupDesc.putReference(charIDToTypeID("null"), ref);

      var props = new ActionDescriptor();
      props.putString(charIDToTypeID("Nm  "), "anim_auto");
      groupDesc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("layerSection"), props);

      executeAction(charIDToTypeID("Mk  "), groupDesc, DialogModes.NO);

      // Step 6: Move it to tempIndex
      var newGroup = doc.activeLayer;

      var safeIndex = tempIndex;
      if (safeIndex >= doc.layers.length) {
        safeIndex = doc.layers.length - 1;
      }

      var target = doc.layers[safeIndex];
      newGroup.move(target, ElementPlacement.PLACEBEFORE);

      // Step 7: Add "Frame 1" layer inside the new folder
      var layerDesc = new ActionDescriptor();
      var layerRef = new ActionReference();
      layerRef.putClass(charIDToTypeID("Lyr "));
      layerDesc.putReference(charIDToTypeID("null"), layerRef);

      var layerProps = new ActionDescriptor();
      layerProps.putString(charIDToTypeID("Nm  "), "Frame 1");
      layerDesc.putObject(charIDToTypeID("Usng"), charIDToTypeID("Lyr "), layerProps);

      executeAction(charIDToTypeID("Mk  "), layerDesc, DialogModes.NO);

      var newLayer = app.activeDocument.activeLayer;
      newLayer.move(newGroup, ElementPlacement.INSIDE);

      alert("✅ Folder 'anim_auto' created at index " + tempIndex + " with Frame 1 inside.");
    }
  `;
  window.parent.postMessage(script, "*");
}
