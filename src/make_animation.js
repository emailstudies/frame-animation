function handleAddAnimation() {
  const script = `
    var desc = new ActionDescriptor();
    var ref = new ActionReference();
    ref.putClass(charIDToTypeID("Lyr "));
    desc.putReference(charIDToTypeID("null"), ref);

    var layerProps = new ActionDescriptor();
    layerProps.putString(charIDToTypeID("Nm  "), "Frame 1");

    desc.putObject(charIDToTypeID("Usng"), charIDToTypeID("Lyr "), layerProps);

    app.doAction("make", desc);
  `;

  window.parent.postMessage(script, "*");
}
