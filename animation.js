function testMessage() {
  const script = 'alert("✅ Hello from inside Photopea!")';
  window.parent.postMessage(script, "*");
}
