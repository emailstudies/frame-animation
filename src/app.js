
document.addEventListener("DOMContentLoaded", function () {
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


document.getElementById("browserPreviewAllBtn").onclick = () => {
  const commands = [
    "saveForWeb", "saveAsPNG", "saveAsJPG", "saveAsGIF",
    "magicCut", "exportLayers", "imageSize", "canvasSize",
    "newLayer", "duplicateLayer", "deleteLayer", "fill", "levels"
  ];

  const script = `
    (function () {
      const results = [];
      ${commands.map(cmd => `
        try {
          app.runMenuItem("${cmd}");
          results.push("✅ ${cmd}");
        } catch (e) {
          results.push("❌ ${cmd} - " + e.message);
        }
      `).join('')}
      app.echoToOE("[menuTest]\\n" + results.join("\\n"));
    })();
  `;

  parent.postMessage(script, "*");
};

window.addEventListener("message", (event) => {
  if (typeof event.data === "string" && event.data.startsWith("[menuTest]")) {
    const lines = event.data.split("\n").slice(1); // Skip header
    const container = document.getElementById("menuTestResults");

    const table = document.createElement("table");
    table.style.borderCollapse = "collapse";
    table.style.width = "100%";

    for (const line of lines) {
      const row = document.createElement("tr");
      const status = line.startsWith("✅") ? "✅" : "❌";
      const cmd = line.replace(/^✅ |^❌ /, "");

      row.innerHTML = `
        <td style="border: 1px solid #ccc; padding: 4px;">${status}</td>
        <td style="border: 1px solid #ccc; padding: 4px;">${cmd}</td>
      `;
      table.appendChild(row);
    }

    container.innerHTML = ""; // Clear previous
    container.appendChild(table);
  }
});


  
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

  /* adding the flipbook paer - FLIPBOOK----------------------------------------------------------------

  

  document.getElementById("browserPreviewAllBtn").onclick = () => {
  beforeMergingInExport(() => {
    const handler = (event) => {
      if (typeof event.data === "string" && event.data.trim() === "[flipbook] ✅ anim_preview created - done") {
        console.log("✅ Confirmed: anim_preview created.");
        window.removeEventListener("message", handler);
        exportPreviewFramesToFlipbook();  // Step 1: Prep and send init message
      }
    };

    window.addEventListener("message", handler);
    exportGif();
  });
};

const flipbookFrames = [];

window.addEventListener("message", (event) => {
  // Handle raw image buffers
  if (event.data instanceof ArrayBuffer) {
    flipbookFrames.push(event.data);
    console.log("📥 Received frame #" + flipbookFrames.length);
    return;
  }

  // Handle string messages
  if (typeof event.data !== "string" || !event.data.startsWith("[flipbook]")) return;

  const msg = event.data.replace("[flipbook]", "").trim();

  if (msg.startsWith("✅ Exported all frames to OE.")) {
    console.log("📸 Flipbook: Received " + flipbookFrames.length + " frames.");

    if (flipbookFrames.length === 0) {
      alert("❌ No flipbook frames received.");
      return;
    }

    const html = generateFlipbookHTML(flipbookFrames);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const win = window.open();
    win.document.open();
    win.document.write(html);
    win.document.close();

    flipbookFrames.length = 0;
    return;
  }

  if (msg.startsWith("📦 init")) {
    const count = parseInt(msg.split("init")[1].trim());
    console.log(`📦 Total Flipbook Frames: ${count}`);
    continueFlipbookExport(count);  // Step 2: Start looped export
    return;
  }

  if (msg.startsWith("🔁 Frame")) {
    console.log("🖼️", msg);
    exportNextFrame();
    return;
  }

  if (msg.startsWith("📦")) {
    console.log("🧮 Frame Count:", msg);
    return;
  }

  if (msg.startsWith("❌")) {
    console.warn("⚠️ Flipbook Error:", msg);
    return;
  }

  console.log("📩 Flipbook Plugin Message:", msg);
});


  // Filtered global listener for only this plugin's messages
/*window.addEventListener("message", (event) => {
  if (typeof event.data === "string" && event.data.startsWith("[flipbook]")) {
    const cleanMsg = event.data.replace("[flipbook] ", "").trim();
    console.log("📩 Flipbook Plugin Message:", cleanMsg);
  }
}); */

// 📩 Global listener to log Photopea echo messages
/*window.addEventListener("message", (event) => {
  if (typeof event.data === "string") {
    if (event.data.startsWith("📦")) {
      console.log(event.data); // e.g., frame count
    } else if (event.data.startsWith("❌")) {
      console.warn(event.data); // e.g., missing preview group
    } else if (event.data.startsWith("✅")) {
      console.log(event.data); // success messages
    } else {
      console.log("📩 Message from Photopea:", event.data);
    }
  }
}); */


/*  document.getElementById("browserPreviewAllBtn").onclick = () => {
  beforeMergingInExport(() => {
    const handler = (event) => {
      if (typeof event.data === "string" && event.data.trim() === "[flipbook] ✅ anim_preview created - done") {
        console.log("✅ Confirmed: anim_preview created.");
        window.removeEventListener("message", handler);
        exportPreviewFramesToFlipbook();  // Run only after exportGif completes
      }
    };

    window.addEventListener("message", handler);
    exportGif();  // This should end with app.echoToOE("[flipbook] ✅ anim_preview created - done")
  });
};

// Flipbook-specific global listener
window.addEventListener("message", (event) => {
  if (typeof event.data === "string" && event.data.startsWith("[flipbook]")) {
    const msg = event.data.replace("[flipbook] ", "").trim();

    if (msg.startsWith("📦")) {
      console.log("🧮 Frame Count:", msg);  // e.g., "anim_preview contains 10 frames."
    } else if (msg.startsWith("❌")) {
      console.warn("⚠️ Flipbook Error:", msg);
    } else {
      console.log("📩 Flipbook Plugin Message:", msg);
    }
  }
});

  // for the flipbook
  const flipbookFrames = [];

window.addEventListener("message", (event) => {
  if (event.data instanceof ArrayBuffer) {
    flipbookFrames.push(event.data);
    console.log("📥 Received frame #" + flipbookFrames.length);
  } else if (typeof event.data === "string") {
    const msg = event.data.trim();

    if (msg === "[flipbook] ✅ Exported all frames to OE.") {
      console.log("📸 Flipbook: Received " + flipbookFrames.length + " frames.");

      if (flipbookFrames.length === 0) {
        alert("❌ No flipbook frames received.");
        return;
      }

      const html = generateFlipbookHTML(flipbookFrames);
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const win = window.open();
      win.document.open();
      win.document.write(html);
      win.document.close();

      flipbookFrames.length = 0;
    }
  }
});





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


