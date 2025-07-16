function handleAddAnimation() {
  const script = `
    var hasSelection = false;

    try {
      var ref = new ActionReference();
      ref.putProperty(charIDToTypeID("Prpr"), stringIDToTypeID("targetLayers"));
      ref.putEnumerated(charIDToTypeID("Dcmn"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));

      var desc = executeActionGet(ref);
      if (desc.hasKey(stringIDToTypeID("targetLayers"))) {
        var sel = desc.getList(stringIDToTypeID("targetLayers"));
        if (sel.count > 0) {
          hasSelection = true;
        }
      }
    } catch (e) {
      hasSelection = false;
    }

    if (hasSelection) {
      alert("Something is selected in the Layers panel. Please deselect all layers and folders before creating an animation folder.");
    } else {
      alert("✅ Nothing is selected. You can safely create an animation folder.");
    }
  `;

  window.parent.postMessage(script, "*");
}
