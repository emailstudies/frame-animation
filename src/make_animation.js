function handleAddAnimation() {
  const script = `
    var desc = new ActionDescriptor();
    var ref = new ActionReference();
    ref.putClass(charIDToTypeID("Lyr "));
    desc.putReference(charIDToTypeID("null"), ref);

    var layerDesc = new ActionDescriptor();
    layerDesc.putString(charIDToTypeID("Nm  "), "Frame 1");
    desc.putObject(charIDToTypeID("Usng"), charIDToTypeID("Lyr "), layerDesc);

    executeAction(charIDToTypeID("Mk  "), desc, DialogModes.NO);
  `;

  window.parent.postMessage(script, "*");
}
