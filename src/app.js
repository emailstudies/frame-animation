document.getElementById("createAnimBtn").onclick = handleCreateFolder;

// Placeholders for later phases
document.getElementById("updateLayerNumbersBtn").onclick = handleUpdateLayerNumbers;


/*document.getElementById("onionSkinBtn").onclick = () => {
  if (!window.onionSkinMode) {
    window.toggleOnionSkinMode(); // Enable mode
  } else {
    window.handleLiveOnionSkin(); // Apply on newly selected layer
  }
}; 
*/

 document.getElementById("onionSkinBtn").onclick = toggleOnionSkinMode; //single step

// Onion Skin toggle mode
/*document.getElementById("onionSkinBtn").onclick = () => {
  window.toggleOnionSkinMode();
};*/
document.getElementById("exportGifBtn").onclick = () => alert("Feature coming soon!");

// onion skin

/* document.getElementById("onionSkinBtn").onclick = () => {
  window.toggleOnionSkinMode(1); // Change 2 to 1–5 for step depth
}; */
