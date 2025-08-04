// flipbook_handler.js
document.addEventListener("DOMContentLoaded", () => {
  const flipbookFrames = [];

  // 1. Handle click on "Preview All" button
  const previewButton = document.getElementById("browserPreviewAllBtn");
  if (previewButton) {
    previewButton.onclick = () => {
      beforeMergingInExport(() => {
        const handler = (event) => {
          if (typeof event.data === "string" && event.data.trim() === "[flipbook] ✅ anim_preview created - done") {
            console.log("✅ Confirmed: anim_preview created.");
            window.removeEventListener("message", handler);
            exportPreviewFramesToFlipbook();
          }
        };

        window.addEventListener("message", handler);
        exportGif(); // Should end with [flipbook] ✅ anim_preview created - done
      });
    };
  }

  // 2. Listen for messages from Photopea
  window.addEventListener("message", (event) => {
    if (event.data instanceof ArrayBuffer) {
      flipbookFrames.push(event.data);
      console.log("📥 Received frame #" + flipbookFrames.length);
    }

    if (typeof event.data === "string" && event.data.startsWith("[flipbook]")) {
      const msg = event.data.replace("[flipbook] ", "").trim();

      if (msg.startsWith("📦")) {
        console.log("🧮 Frame Count:", msg); // e.g. anim_preview contains 5 frames
      } else if (msg.startsWith("🔁 Ready to export frame")) {
        console.log("📸 [flipbook]", msg);
      } else if (msg.startsWith("❌")) {
        console.warn("⚠️ Flipbook Error:", msg);
      } else if (msg === "✅ Exported all frames to OE.") {
        console.log("📸 Flipbook: Received " + flipbookFrames.length + " frames.");
        if (flipbookFrames.length === 0) {
          alert("❌ No flipbook frames received.");
          return;
        }

        // Base64 debug check
        const base64Snippets = flipbookFrames.map((ab, i) => {
          const base64 = btoa(String.fromCharCode(...new Uint8Array(ab)));
          console.log("🧪 Frame", i, "starts with:", base64.slice(0, 80));
          return `frames[${i}] = "data:image/png;base64,${base64}";`;
        });
        console.log("🧪 Base64 snippet diff check done.");

        // 3. Launch the flipbook preview
        const html = generateFlipbookHTML(flipbookFrames);
        const blob = new Blob([html], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const win = window.open();
        win.document.open();
        win.document.write(html);
        win.document.close();

        flipbookFrames.length = 0; // reset
      } else {
        console.log("📩 Flipbook Plugin Message:", msg);
      }
    }
  });
});
