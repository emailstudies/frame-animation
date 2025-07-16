function handleAddAnimation() {
  const script = `
    try {
      var hasSelection = false;

      // ActionDescriptor to check selected layers
      var ref = new ActionReference();
      ref.putProperty(charIDToTypeID("Prpr"), stringIDToTypeID("targetLayers"));
      ref.putEnumerated(charIDToTypeID("Dcmn"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));

      try {
        var desc = executeActionGet(ref);
        hasSelection = true;
      } catch (e) {
        hasSelection = false;
      }

      if (!hasSelection) {
        alert("✅ All okay! Nothing is selected. You can now safely create an animation folder at the root level.");
      } else {
        alert("❌ Something is selected in the Layers panel. Please deselect everything before creating an animation folder.");
      }

    } catch (e) {
      alert("❌ Script error: " + e.message);
    }
  `;

  window.parent.postMessage(script, "*");
}
