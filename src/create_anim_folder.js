function handleCreateFolder() {
  const script = `
    if (!app.documents || app.documents.length === 0) {
      alert("No document is open.");
    } else {
      var doc = app.activeDocument;
      if (!doc || !doc.activeLayer) {
        alert("Nothing is selected.");
      } else {
        var sel = doc.activeLayer;
        var name = sel.name;
        if (sel.isFolder) {
          alert("Selected item is a folder named: " + name);
        } else {
          alert("Selected item is a layer named: " + name);
        }
      }
    }
  `;
  window.parent.postMessage(script, "*");
}
