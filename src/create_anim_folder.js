function handleCreateFolder() {
  const script = `
    try {
      var doc = app.activeDocument;
      if (!doc) {
        alert("No document open.");
      } else {
        var selected = doc.getSelectedLayers();
        var sel = doc.activeLayer;

        if (selected && selected.length > 0) {
          alert("Selected using getSelectedLayers(). Count: " + selected.length);
        } else if (sel && typeof sel.isFolder !== "undefined") {
          var type = sel.isFolder ? "Folder" : "Layer";
          alert("Fallback to active layer. Type: " + type);
        } else {
          alert("Nothing is selected or selection is unusable.");
        }
      }
    } catch (e) {
      alert("Script error: " + e.message);
    }
  `;
  setTimeout(() => {
    window.parent.postMessage(script, "*");
  }, 50);
}
