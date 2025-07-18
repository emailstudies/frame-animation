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
          var messages = [];
          for (var i = 0; i < selected.length; i++) {
            var layer = selected[i];
            var name = (typeof layer.name === "string") ? layer.name : "(Unnamed)";
            var type = layer.isFolder ? "Folder" : "Layer";
            messages.push(type + ": " + name);
          }
          alert(messages.join("\\n"));
        }
      }
    } catch (e) {
      alert("Script error: " + e.message);
    }
  `;

  setTimeout(() => {
    window.parent.postMessage(script, "*");
  }, 200); // Allow layer state to stabilize
}
