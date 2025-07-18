function handleCreateFolder() {
  const script = `
    if (app.documents.length == 0) {
      alert("No document is open.");
    } else {
      var doc = app.activeDocument;
      var sel = doc.activeLayer;

      if (sel == null) {
        alert("Nothing is selected.");
      } else {
        var name = sel.name;
        if (sel.isFolder) {
          alert("Selected item is a folder named: " + name);
        } else {
          alert("Selected item is a layer named: " + name);
        }
      }
    }
  `;
  setTimeout(() => {
    window.parent.postMessage(script, "*");
  }, 100); // slight delay helps in some cases
}
