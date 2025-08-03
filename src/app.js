
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

 
  
  /* document.getElementById("previewAllBtn").onclick = exportGif; */

  
 
/*  document.getElementById("browserPreviewAllBtn").onclick = async () => {
  exportPreviewFramesToFlipbook();
}; */

  /* adding the flipbook paer - FLIPBOOK*/

  document.getElementById("browserPreviewAllBtn").onclick = () => {
  beforeMergingInExport(() => {
    const handler = (event) => {
      if (typeof event.data === "string" && event.data.trim() === "✅ anim_preview created - done") {
        console.log("✅ Confirmed: anim_preview created.");
        window.removeEventListener("message", handler);
        exportPreviewFramesToFlipbook(); // Safe to start extracting frames now
      }
    };

    window.addEventListener("message", handler);
    exportGif(); // This posts the script to Photopea
  });
};


 /* document.getElementById("browserPreviewAllBtn").onclick = () => {
  beforeMergingInExport(() => {
    exportGif();  // triggers script in Photopea

    // ⏳ Wait 500ms to allow anim_preview to actually appear
    setTimeout(() => {
      console.log("⏱ Now running flipbook export");
      exportPreviewFramesToFlipbook();
    }, 500);
  });
};
*/
 
/* document.getElementById("browserPreviewAllBtn").onclick = () => {
  beforeMergingInExport(() => {
    exportGif();  // ⏳ Starts building anim_preview in Photopea
  });

  // 📬 Listen for "done" message from Photopea
  const handler = (event) => {
    if (typeof event.data === "string" && event.data.trim() === "done") {
      console.log("✅ exportGif complete — now checking anim_preview");
      window.removeEventListener("message", handler);

      // ▶️ Now start the flipbook export
      exportPreviewFramesToFlipbook();
    }
  };

  window.addEventListener("message", handler);
};


/* document.getElementById("browserPreviewSelectedBtn").onclick = () => {
  beforeMergingInExport(() => {
    setTimeout(async () => {
      await exportGifFromSelected();
      exportPreviewFramesToFlipbook();
    }, 150);
  });
}; */



}); /*closing the DOM thing */


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


