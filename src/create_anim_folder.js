function handleCreateFolder() {
  const script = `
    try {
      if (!app.activeDocument) {
        alert("No document open.");
      } else {
        var doc = app.activeDocument;
        var selected = doc.getSelectedLayers();

        if (!selected || selected.length === 0) {
          alert("Nothing is selected.");
        } else {
          var messages = [];
          for (var i = 0; i < selected.length; i++) {
            var layer = selected[i];
            if (layer && typeof layer.name !== "undefined") {
              var msg = layer.isFolder 
                ? "Folder: " + layer.name 
                : "Layer: " + layer.name;
              messages.push(msg);
            } else {
              messages.push("Selected item #" + (i+1) + " is invalid or not ready.");
            }
          }
          alert(messages.join("\\n"));
        }
      }
    } catch (e) {
      alert("Error: " + e.message);
    }
  `;

  // Longer delay to ensure selection is fully ready
  setTimeout(() => {
    window.parent.postMessage(script, "*");
  }, 200);
}
