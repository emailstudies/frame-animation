// browser_preview_loader.js (Step 2: Parse received PSD and render frames)

import { parsePsdFrames } from "./psd_parser.js";

const collectedPSD = [];

window.addEventListener("message", async (event) => {
  if (event.data instanceof ArrayBuffer) {
    console.log("📥 Received PSD ArrayBuffer");
    collectedPSD.push(event.data);
  } else if (typeof event.data === "string") {
    console.log("📩 Message:", event.data);

    if (event.data === "done") {
      if (collectedPSD.length === 0) {
        alert("❌ No PSD received.");
        return;
      }

      try {
        const psdBuffer = collectedPSD.pop();
        const frames = await parsePsdFrames(psdBuffer);

        if (!frames || frames.length === 0) {
          alert("❌ No frames parsed from PSD.");
          return;
        }

        console.log(`✅ Parsed ${frames.length} frames from PSD`);
        openPreviewTab(frames);
      } catch (err) {
        console.error("❌ Failed to parse PSD:", err);
        alert("❌ Failed to parse PSD");
      }
    }
  }
});

function openPreviewTab(frames) {
  const url = new URL("preview.html", window.location.origin);
  const win = window.open(url.toString(), "_blank");

  const waitForReady = setInterval(() => {
    if (win && win.postMessage) {
      win.postMessage({ frames }, "*");
      clearInterval(waitForReady);
    }
  }, 500);
}
