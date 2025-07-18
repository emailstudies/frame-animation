function handleCreateFolder() {
  const script = `
    (function () {
      // ✅ Deselect all layers by creating and deleting a temp group
      var desc = new ActionDescriptor();
      var ref = new ActionReference();
      ref.putClass(stringIDToTypeID("layerSection"));
      desc.putReference(charIDToTypeID("null"), ref);

      var nameDesc = new ActionDescriptor();
      nameDesc.putString(charIDToTypeID("Nm  "), "__temp_deselect__");
      desc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("layerSection"), nameDesc);

      // Create the group (automatically selects it)
      executeAction(charIDToTypeID("Mk  "), desc, DialogModes.NO);

      // Now delete the currently selected (temp) group
      var deleteRef = new ActionReference();
      deleteRef.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
      var deleteDesc = new ActionDescriptor();
      deleteDesc.putReference(charIDToTypeID("null"), deleteRef);
      executeAction(charIDToTypeID("Dlt "), deleteDesc, DialogModes.NO);

      alert("✅ All layers deselected using temp group trick.");
    })();
  `;

  window.parent.postMessage(script, "*");
}
