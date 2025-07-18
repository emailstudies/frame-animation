function handleCreateFolder() {
  const script = `
    var doc = app.activeDocument;
    if (!doc) {
      alert("No document is open.");
    } else {
      var sel = doc.activeLayer;

      if (!sel) {
        alert("Nothing is selected.");
      } else {
        var parent = sel.parent;

        if (parent === doc) {
          alert("✅ Parent is the Document (root level).");
        } else {
          alert("📁 Parent is: " + parent.name);
        }
      }
    }
  `;
  window.parent.postMessage(script, "*");
}
