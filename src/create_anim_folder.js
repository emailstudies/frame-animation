function handleCreateFolder() {
  const script = `
    if (!app.activeDocument) {
      alert("No document open.");
    } else {
      var sel = app.activeDocument.activeLayer;

      if (sel) {
        var name = sel.name;
        if (sel.isFolder) {
          alert("Selected item is a folder named: " + name);
        } else {
          alert("Selected item is a layer named: " + name);
        }
      } else {
        alert("Nothing is selected.");
      }
    }
  `;

  // Delay to ensure selection is registered
  setTimeout(() => {
    window.parent.postMessage(script, "*");
  }, 100);
}
