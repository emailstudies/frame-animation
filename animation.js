function mergeFrames() {
  const script = `alert("🧪 Hello from plugin - basic test")`;
  window.parent.postMessage(script, "*");
}
