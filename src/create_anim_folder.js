function checkIfRootFolder() {
  const script = `
    try {
      var doc = app.activeDocument;
      var sel = doc.activeLayer;

      if (!sel) {
        alert("Nothing is selected.");
        return;
      }

      if (!sel.isFolder) {
        alert("This is a problem: you selected a layer, not a folder.");
        return;
      }

      var isRootLevel = (sel.parent == doc); // true if folder is at root
      if (isRootLevel) {
        alert("Folder is at root level.");
      } else {
        alert("This is a problem: folder is nested inside another group.");
      }
    } catch (e) {
      alert("Script error: " + e.message);
    }
  `;
  window.parent.postMessage(script, "*");
}
