// ✅ flipbook_handler.js (plugin side)
const flipbookFrames = [];

// 📩 Listen for frame count, status, errors
window.addEventListener("message", (event) => {
  if (typeof event.data === "string" && event.data.startsWith("[flipbook]")) {
    const msg = event.data.replace("[flipbook] ", "").trim();

    if (msg.startsWith("📦")) {
      console.log("🧮 Frame Count:", msg);
    } else if (msg.startsWith("🔁")) {
      console.log("📸", `[flipbook] ${msg}`);
    } else if (msg.startsWith("❌")) {
      console.warn("⚠️ Flipbook Error:", msg);
    } else {
      console.log("📩 Flipbook Plugin Message:", msg);
    }
  }
});

// 📥 Handle incoming frame data
window.addEventListener("message", (event) => {
  if (event.data instanceof ArrayBuffer) {
    console.log("🧪 Got ArrayBuffer of length", event.data.byteLength);
    flipbookFrames.push(event.data);
    console.log("📥 Received frame #" + flipbookFrames.length);

    // ✅ Tell Photopea we're ready for the next frame
    parent.postMessage("[flipbook] ✅ frame received", "*");
  }

  // 🚀 Launch viewer when done
  if (typeof event.data === "string" && event.data.trim() === "[flipbook] ✅ Exported all frames to OE.") {
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
});
