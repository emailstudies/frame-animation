function handleCreateFolder() {
  const script = `
    var sel = app.activeLayer;

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
  `;
  window.parent.postMessage(script, "*");
}
