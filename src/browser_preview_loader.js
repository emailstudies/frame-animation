// browser_preview_loader.js

let previewWindow = null;
let frames = [];

// Handle the UI button click
const btn = document.getElementById("webPreviewSelectedBtn");
btn.onclick = () => {
  frames = []; // reset
  console.log("🪟 Opening preview tab...");

  previewWindow = window.open("preview.html", "_blank");
};

// Listen for messages from Photopea and the preview tab
window.addEventListener("message", async (event) => {
  const msg = event.data;

  // From preview tab
  if (msg === "READY_FOR_FRAMES") {
    console.log("✅ Preview tab ready");
    console.log("▶️ Starting frame export");
    parent.postMessage("EXPORT_SELECTED_ANIM_FRAMES", "*");
  }

  // PNG frame from Photopea
  else if (msg instanceof ArrayBuffer) {
    frames.push(msg);
    parent.postMessage("READY_FOR_NEXT_FRAME", "*");
  }

  // Final message from Photopea
  else if (msg === "done") {
    console.log("📦 All frames received:", frames.length, "total");

    if (previewWindow) {
      previewWindow.postMessage(frames, "*");
    } else {
      alert("❌ Preview window not found.");
    }
  }

  // Error string
  else if (typeof msg === "string" && msg.startsWith("❌")) {
    alert(msg);
  } else {
    console.log("📩 Message from Photopea:", msg);
  }
});
