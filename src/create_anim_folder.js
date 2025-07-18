function handleCreateFolder() {
  const script = `
    app.activeDocument.activeLayer = null;
  `;
  window.parent.postMessage(script, "*");
}
