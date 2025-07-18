function handleCreateFolder() {
  const script = `
    try {
      var doc = app.activeDocument;
      if (!doc) {
        alert("No document open.");
      } else {
        var selected = doc.getSelectedLayers();

        if (!selected || selected.length === 0) {
          alert("Nothing is selected.");
        } else {
          var summary = selected.map(l => {
            var type = l.isFolder ? "Folder" : "Layer";
            return type + ": " + l.name;
          }).join("\\n");

          alert("Selected items:\\n" + summary);
        }
      }
    } catch (e) {
      alert("Script error: " + e.message);
    }
  `;

  window.parent.postMessage(script, "*");
}
