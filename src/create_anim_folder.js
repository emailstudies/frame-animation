function handleCreateFolder() {
  const script = `
    try {
      var doc = app.activeDocument;
      var layers = doc.getSelectedLayers();
      
      if (!layers || layers.length === 0) {
        alert("Nothing is selected.");
      } else {
        var summary = layers.map(l => l.name).join("\\n");
        alert("Selected Layers:\\n" + summary);
      }
    } catch (e) {
      alert("Script Error: " + e.message);
    }
  `;
  window.parent.postMessage(script, "*");
}
