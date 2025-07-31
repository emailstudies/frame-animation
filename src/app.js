document.getElementById("webPreviewAllBtn").onclick = function () {
  const before = parseInt(document.getElementById("beforeSteps").value, 10);
  const after = parseInt(document.getElementById("afterSteps").value, 10);

  console.log("🧅 Onion Skin: Before =", before, "After =", after);
  toggleOnionSkinMode(before, after);
};


// ✅ app.js (updated)
function getSelectedFPS() {
  const fpsSelect = document.getElementById("fpsSelect");
  return fpsSelect ? parseInt(fpsSelect.value, 10) : 12;
}

function fpsToDelay(fps) {
  return Math.round(1000 / fps);
}

function getSelectedDelay() {
  const manualInput = document.getElementById("manualDelay").value.trim();
  if (manualInput) {
    const delayInSec = parseFloat(manualInput);
    if (!isNaN(delayInSec) && delayInSec > 0) {
      return Math.round(delayInSec * 1000); // seconds to milliseconds
    }
  }

  const fps = getSelectedFPS();
  return fpsToDelay(fps);
}

// Optional: Disable fps select if manual delay exists
function updateDelayInputState() {
  const fpsSelect = document.getElementById("fpsSelect");
  const manualDelay = document.getElementById("manualDelay").value.trim();
  fpsSelect.disabled = manualDelay !== "";
}

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("createAnimBtn").onclick = handleCreateFolder;
  document.getElementById("updateLayerNumbersBtn").onclick = handleUpdateLayerNumbers;
  document.getElementById("onionSkinBtn").onclick = toggleOnionSkinMode;
  document.getElementById("resetOnionSkinBtn").onclick = resetOnionSkin;
  document.getElementById("previewAllBtn").onclick = exportGif;
  document.getElementById("previewSelectedBtn").onclick = exportGifFromSelected;
  document.getElementById("manualDelay").addEventListener("input", updateDelayInputState);
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


