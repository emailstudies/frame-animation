function handleAddAnimation() {
  const script = `
    try {
      var desc = new ActionDescriptor();
      var ref = new ActionReference();
      ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
      desc.putReference(charIDToTypeID("null"), ref);
      executeAction(charIDToTypeID("Dslc"), desc, DialogModes.NO);
    } catch (e) {
      alert("Could not deselect layers.");
    }
  `;

  window.parent.postMessage(script, "*");
}
