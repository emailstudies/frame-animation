function handleAddAnimation() {
  const script = `
    var doc = app.activeDocument;
    var selected = false;

    try {
      if ("activeLayer" in doc && doc.activeLayer) {
        selected = true;
      }
    } catch (e) {
      selected = false;
    }

    if (selected) {
      alert("A layer or group is selected. Please deselect everything before creating an animation folder.");
    } else {
      alert("Nothing is selected. You can safely create an animation folder.");
    }
  `;

  window.parent.postMessage(script, "*");
}
