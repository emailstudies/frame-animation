function handleCreateFolder() {
  const script = `
    try {
      if (!app.activeDocument) {
        alert("No document open.");
      } else {
        var doc = app.activeDocument;
        var sel = doc.activeLayer;

        if (!sel) {
          alert("Nothing is selected.");
        } else {
          try {
            var name = sel.name;
            var isFolder = sel.isFolder;
            var type = isFolder ? "folder" : "layer";
            alert("Selected item is a " + type + " named: " + name);
          } catch (innerErr) {
            alert("Layer selected, but Photopea hasn't fully loaded it yet.");
          }
        }
      }
    } catch (e) {
      alert("Fatal script error: " + e.message);
    }
  `;

  setTimeout(() => {
    window.parent.postMessage(script, "*");
  }, 200); // ← Slightly more time to settle
}
