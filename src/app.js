document.getElementById("createAnimBtn").onclick = handleCreateFolder;

// Placeholders for later phases
document.getElementById("updateLayerNumbersBtn").onclick = handleUpdateLayerNumbers;

// onion skin
//document.getElementById("onionSkinBtn").onclick = toggleOnionSkinMode; single step
document.getElementById("onionSkinBtn").onclick = () => {
  window.toggleOnionSkinMode(2); // Change 2 to 1–5 for step depth
};
document.getElementById("exportGifBtn").onclick = () => alert("Feature coming soon!");
