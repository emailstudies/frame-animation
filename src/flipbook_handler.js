// ✅ flipbook_handler.js (in your plugin)

const flipbookFrames = [];

// 📩 Listen for messages from Photopea
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
    flipbookFrames.push(event.data);
    console.log("📥 Received frame #" + flipbookFrames.length);

    // ✅ Signal Photopea to continue
    parent.postMessage("[flipbook] ✅ frame received", "*");
  }

  // 🚀 Launch viewer when all frames are done
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
