
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("createAnimBtn").onclick = handleCreateFolder;
  document.getElementById("updateLayerNumbersBtn").onclick = handleUpdateLayerNumbers;
 /* document.getElementById("onionSkinBtn").onclick = toggleOnionSkinMode; */
  document.getElementById("resetOnionSkinBtn").onclick = resetOnionSkin;

  /* doing the reset first before the onion skin happens */
  document.getElementById("onionSkinBtn").onclick = function () {
  resetOnionSkin(); // reset first
  setTimeout(() => {
    const before = parseInt(document.getElementById("beforeSteps").value, 10);
    const after = parseInt(document.getElementById("afterSteps").value, 10);
    toggleOnionSkinMode(before, after); // apply new onion skin after reset
  }, 250); // delay to allow Photopea reset script to finish
};

  
 /* document.getElementById("previewAllBtn").onclick = exportGif;
  document.getElementById("previewSelectedBtn").onclick = exportGifFromSelected; */
  document.getElementById("manualDelay").addEventListener("input", updateDelayInputState);

  document.getElementById("previewAllBtn").onclick = function () {
  resetOnionSkin();
  setTimeout(() => {
    exportGif();
  }, 150); // Wait for reset to finish
};

document.getElementById("previewSelectedBtn").onclick = function () {
  resetOnionSkin();
  setTimeout(() => {
    exportGifFromSelected();
  }, 150); // Wait for reset to finish
};

});


// -----------------------------------------------------------
/* // Global helper functions
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


