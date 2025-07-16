function handleAddAnimation() {
  const script = `
    try {
      // Step 1: Create temp layer to force single selection
      var tempDesc = new ActionDescriptor();
      var tempRef = new ActionReference();
      tempRef.putClass(charIDToTypeID("Lyr "));
      tempDesc.putReference(charIDToTypeID("null"), tempRef);

      var props = new ActionDescriptor();
      props.putString(charIDToTypeID("Nm  "), "__temp_deselect__");
      tempDesc.putObject(charIDToTypeID("Usng"), charIDToTypeID("Lyr "), props);

      executeAction(charIDToTypeID("Mk  "), tempDesc, DialogModes.NO);

      // Step 2: Delete the temp layer
      var deleteRef = new ActionReference();
      deleteRef.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));

      var deleteDesc = new ActionDescriptor();
      deleteDesc.putReference(charIDToTypeID("null"), deleteRef);

      executeAction(charIDToTypeID("Dlt "), deleteDesc, DialogModes.NO);
    } catch (e) {
      alert("Deselect workaround failed: " + e.message);
    }
  `;

  window.parent.postMessage(script, "*");
}
