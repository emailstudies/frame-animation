function handleCreateFolder() {
  const script = `
    prompt("Please press OK to continue.", "");
  `;
  window.parent.postMessage(script, "*");
}
