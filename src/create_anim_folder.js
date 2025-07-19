function handleCreateFolder() {
  const script = `
    try {
      var desc = new ActionDescriptor();
      var ref = new ActionReference();
      ref.putEnumerated(
        charIDToTypeID("Lyr "),
        charIDToTypeID("Ordn"),
        charIDToTypeID("Trgt") // Target → then deselect below
      );
      desc.putReference(charIDToTypeID("null"), ref);
      desc.putBoolean(stringIDToTypeID("dontRecord"), true);
      desc.putBoolean(stringIDToTypeID("forceDeselect"), true); // ⬅️ Experimental
      executeAction(charIDToTypeID("slct"), desc, DialogModes.NO);
    } catch (e) {
      alert("Force-deselect failed: " + e.message);
    }
  `;
  window.parent.postMessage(script, "*");
}
