function handleCreateFolder() {
  const script = `
    (function () {
      // ✅ Deselect all layers using temporary group trick
      var desc = new ActionDescriptor();
      var ref = new ActionReference();
      ref.putClass(stringIDToTypeID("layerSection"));
      desc.putReference(charIDToTypeID("null"), ref);

      var nameDesc = new ActionDescriptor();
      nameDesc.putString(charIDToTypeID("Nm  "), "__temp_deselect__");
      desc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("layerSection"), nameDesc);

      // Create the temp group
      executeAction(charIDToTypeID("Mk  "), desc, DialogModes.NO);

      // Immediately delete the temp group
      var delRef = new ActionReference();
      delRef.putName(stringIDToTypeID("layerSection"), "__temp_deselect__");
      var delDesc = new ActionDescriptor();
      delDesc.putReference(charIDToTypeID("null"), delRef);
      executeAction(charIDToTypeID("Dlt "), delDesc, DialogModes.NO);

      alert("✅ All layers deselected.");
    })();
  `;

  window.parent.postMessage(script, "*");
}
