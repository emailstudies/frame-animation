
document.addEventListener("DOMContentLoaded", function () {



  /* ------------------------------------------------------------------------------------------------*/

  
  document.getElementById("createAnimBtn").onclick = handleCreateFolder;
  document.getElementById("updateLayerNumbersBtn").onclick = handleUpdateLayerNumbers;
 /* document.getElementById("onionSkinBtn").onclick = toggleOnionSkinMode; */

  /* this was the previous onion skin logic which make all 1005 but turened on visibility of only Layer 1 in folder as true 
  document.getElementById("resetOnionSkinBtn").onclick = resetOnionSkin; */

  /* I prefer this for the reset since it will make everything opacity as 100 and visible so easier to navigate */
  document.getElementById("resetOnionSkinBtn").onclick = beforeMergingInExport;
  /* document.getElementById("browserPreviewAllBtn").onclick = previewInPhotopeaFlipbook; ths was app.refresh to update canvas in PP itself */


  /* doing the reset first before the onion skin happens */
  document.getElementById("onionSkinBtn").onclick = function () {
  beforeMergingInExport(); // reset first
  setTimeout(() => {
    const before = parseInt(document.getElementById("beforeSteps").value, 10);
    const after = parseInt(document.getElementById("afterSteps").value, 10);
    toggleOnionSkinMode(before, after); // apply new onion skin after reset
  }, 20); // delay to allow Photopea reset script to finish
};

   /* document.getElementById("previewSelectedBtn").onclick = exportGifFromSelected; */
  document.getElementById("manualDelay").addEventListener("input", updateDelayInputState);

  document.getElementById("previewSelectedBtn").onclick = function () {
  beforeMergingInExport(() => {
    setTimeout(() => {
      exportGifFromSelected(); // Run export after onion skin reset
    }, 150); // Small delay ensures reset completes
  });
};

 document.getElementById("previewAllBtn").onclick = function () {
  beforeMergingInExport(() => {
    setTimeout(() => {
      exportGif(); // Call export only AFTER reset is done
    }, 150); // Short delay to allow Photopea to complete
  });
};



 }); /*closing the DOM thing */ 

  
/*document.getElementById("browserPreviewAllBtn").onclick = () => {
  beforeMergingInExport(() => {
    const handler = (event) => {
      if (typeof event.data === "string" && event.data.trim() === "[flipbook] ✅ anim_preview created - done") {
        console.log("✅ Confirmed: anim_preview created.");
        window.removeEventListener("message", handler);
        if (window.runCombinedFlipbookExport) {
          window.runCombinedFlipbookExport();
        } else {
          console.warn("⚠️ runCombinedFlipbookExport not found.");
        }
      }
    };
    window.addEventListener("message", handler);
    exportGif(); // or exportGifFromSelected()
  });
};
 */

    

  /* document.getElementById("previewAllBtn").onclick = exportGif; */

  
 
/*  document.getElementById("browserPreviewAllBtn").onclick = async () => {
  exportPreviewFramesToFlipbook();
}; */






