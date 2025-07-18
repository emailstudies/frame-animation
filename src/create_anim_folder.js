function handleCreateFolder() {
  const script = `
    try {
      if (!app.activeDocument) {
        alert("No document open.");
      } else {
        var doc = app.activeDocument;
        var sel = doc.activeLayer;

        if (sel == null) {
          alert("Nothing is selected.");
        } else if (typeof sel.name !== "undefined") {
          var name = sel.name;
          if (sel.isFolder) {
            alert("Selected item is a folder named: " + name);
          } else {
            alert("Selected item is a layer named: " + name);
          }
        } else {
          alert("Layer selected but name is not accessible.");
        }
      }
    } catch (e) {
      alert("Error: " + e.message);
    }
  `;

  setTimeout(() => {
    window.parent.postMessage(script, "*");
  }, 150); // Slightly longer delay
}
