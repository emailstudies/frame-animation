// Global helper functions
function getSelectedFPS() {
  const fpsSelect = document.getElementById("fpsSelect");
  return fpsSelect ? parseInt(fpsSelect.value, 10) : 12;
}

function fpsToDelay(fps) {
  return Math.round(1000 / fps);
}

// DOM event hookups
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("createAnimBtn").onclick = handleCreateFolder;
  document.getElementById("updateLayerNumbersBtn").onclick = handleUpdateLayerNumbers;
  document.getElementById("onionSkinBtn").onclick = toggleOnionSkinMode; 
  document.getElementById("resetOnionSkinBtn").onclick = resetOnionSkin; 
  document.getElementById("previewAllBtn").onclick = exportGif;
});

// wrapping in a function because now app.js is being loaded first in index.html because of fps


/*document.getElementById("createAnimBtn").onclick = handleCreateFolder;
document.getElementById("updateLayerNumbersBtn").onclick = handleUpdateLayerNumbers;
document.getElementById("onionSkinBtn").onclick = toggleOnionSkinMode; 
document.getElementById("resetOnionSkinBtn").onclick = resetOnionSkin; 
document.getElementById("previewAllBtn").onclick = exportGif;
/*document.getElementById("webPreviewSelectedBtn").onclick = openMagicCut;*/


