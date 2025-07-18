async function handleCreateFolder() {
  var sel = app.activeLayer;

  if (sel == null) {
    alert("Nothing is selected.");
    return;
  }

  // If something is selected
  var name = sel.name;
  var isFolder = sel.isFolder;

  if (isFolder) {
    alert("Selected item is a folder named: " + name);
  } else {
    alert("Selected item is a layer named: " + name);
  }
}
