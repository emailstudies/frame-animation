function mergeFrames() {
 

  window.parent.postMessage('alert("Hello from plugin!")', '*');
}

function exportGif() {
  alert("🕒 No timeline in Photopea. Please export manually via File > Export As > GIF.");
}
