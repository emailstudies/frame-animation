function handleCreateFolder() {
  const script = `
    (function () {
      var doc = app.activeDocument;

      // 1. Create a dummy layer at the root
      var desc = new ActionDescriptor();
      var ref = new ActionReference();
      ref.putClass(charIDToTypeID("Lyr "));
      desc.putReference(charIDToTypeID("null"), ref);
      var layerDesc = new ActionDescriptor();
      layerDesc.putString(charIDToTypeID("Nm  "), "__temp_layer__");
      desc.putObject(charIDToTypeID("Usng"), charIDToTypeID("Lyr "), layerDesc);
      executeAction(charIDToTypeID("Mk  "), desc, DialogModes.NO);

      // 2. Select that dummy layer (which deselects others)
      var selectRef = new ActionReference();
      selectRef.putName(charIDToTypeID("Lyr "), "__temp_layer__");
      var selectDesc = new ActionDescriptor();
      selectDesc.putReference(charIDToTypeID("null"), selectRef);
      selectDesc.putBoolean(charIDToTypeID("MkVs"), false); // no make visible
      executeAction(charIDToTypeID("slct"), selectDesc, DialogModes.NO);

      // 3. Now delete it, leaving no selection behind
      var delRef = new ActionReference();
      delRef.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
      var delDesc = new ActionDescriptor();
      delDesc.putReference(charIDToTypeID("null"), delRef);
      executeAction(charIDToTypeID("Dlt "), delDesc, DialogModes.NO);

      alert("✅ All layers deselected successfully.");
    })();
  `;

  window.parent.postMessage(script, "*");
}
