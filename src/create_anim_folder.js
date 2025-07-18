afunction handleCreateFolder() {
  const script = `
  if (!app.activeDocument) {
    alert("No document open. Please open or create a document first.");
  } else {
    var doc = app.activeDocument;
    // safe to use 'doc' now
  }
`;
window.parent.postMessage(script, "*");

}
