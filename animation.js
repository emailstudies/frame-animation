function mergeFrames() {
  const script = `
    (function () {
      alert("🧪 Hello from plugin - basic test (inside function)");
    })();
  `;

  window.parent.postMessage(script.trim(), "*");
}
