function handleCreateFolder() {
  var script = `
    var sel = app.activeLayer;
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
  `;
  window.parent.postMessage(script, "*");
}
