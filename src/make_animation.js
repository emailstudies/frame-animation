function handleAddAnimation() {
  const script = `
    try {
      // Step 1: Create a temporary layer (forces single selection)
      var tempDesc = new ActionDescriptor();
      var tempRef = new ActionReference();
      tempRef.putClass(charIDToTypeID("Lyr "));
      tempDesc.putReference(charIDToTypeID("null"), tempRef);

      var props = new ActionDescriptor();
      props.putString(charIDToTypeID("Nm  "), "__temp_deselect__");
      tempDesc.putObject(charIDToTypeID("Usng"), charIDToTypeID("Lyr "), props);

      executeAction(charIDToTypeID("Mk  "), tempDesc, DialogModes.NO);

      // Step 2: Delete the temp layer (leaves nothing selected)
      var delRef = new ActionReference();
      delRef.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));

      var delDesc = new ActionDescriptor();
      delDesc.putReference(charIDToTypeID("null"), delRef);

      executeAction(charIDToTypeID("Dlt "), delDesc, DialogModes.NO);
    } catch (e) {
      alert("Failed to deselect layers: " + e.message);
    }
  `;

  window.parent.postMessage(script, "*");
}
