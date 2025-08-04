
document.addEventListener("DOMContentLoaded", function () {

// app.js
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("browserPreviewAllBtn");
  if (!btn) {
    console.error("❌ Button 'browserPreviewAllBtn' not found");
    return;
  }

  if (typeof getStepwiseDemoExportScript !== "function") {
    console.error("❌ getStepwiseDemoExportScript() is not defined");
    return;
  }

  btn.onclick = () => {
    const script = getStepwiseDemoExportScript();
    // Send the script string directly to Photopea (parent window)
    window.parent.postMessage(script, "*");
  };
});

// Listen for Photopea messages (strings) and log them
window.addEventListener("message", (event) => {
  if (typeof event.data === "string" && event.data.startsWith("[demo]")) {
    console.log("📨 Photopea message:", event.data);
  }
});



  /* ------------------------------------------------------------------------------------------------*/

  
  document.getElementById("createAnimBtn").onclick = handleCreateFolder;
  document.getElementById("updateLayerNumbersBtn").onclick = handleUpdateLayerNumbers;
 /* document.getElementById("onionSkinBtn").onclick = toggleOnionSkinMode; */
  document.getElementById("resetOnionSkinBtn").onclick = resetOnionSkin;
  /* document.getElementById("browserPreviewAllBtn").onclick = previewInPhotopeaFlipbook; ths was app.refresh to update canvas in PP itself */


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






