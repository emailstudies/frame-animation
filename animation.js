function mergeFrames() {
  const script = 'alert("✅ Script received and running inside Photopea!");';
  window.parent.postMessage(script, "*");
}

function exportGif() {
  const script = 'alert("🚀 Export script triggered!");';
  window.parent.postMessage(script, "*");
}
