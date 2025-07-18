function handleCreateFolder() {
  const script = `
    alert("Please click OK to continue.");
  `;
  window.parent.postMessage(script, "*");
}
