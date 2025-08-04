/*
// ✅ Stores all received frame buffers
const flipbookFrames = [];

// 🧭 Listen for Photopea status messages (frame count, export info, etc.)
window.addEventListener("message", (event) => {
  if (typeof event.data === "string" && event.data.startsWith("[flipbook]")) {
    const msg = event.data.replace("[flipbook] ", "").trim();

    if (msg.startsWith("📦")) {
      console.log("🧮 Frame Count:", msg);
    } else if (msg.startsWith("🔁")) {
      console.log("📸", `[flipbook] ${msg}`);
    } else if (msg.startsWith("✅ anim_preview created")) {
      console.log("✅ Confirmed: anim_preview created.");
    } else if (msg.startsWith("❌")) {
      console.warn("⚠️ Flipbook Error:", msg);
    } else {
      console.log("📩 Flipbook Plugin Message:", msg);
    }
  }
});

// 📥 Listen for binary image data from Photopea
window.addEventListener("message", (event) => {
  if (event.data instanceof ArrayBuffer) {
    console.log("🧪 Got ArrayBuffer of length", event.data.byteLength);
    flipbookFrames.push(event.data);
    console.log("📥 Received frame #" + flipbookFrames.length);

    // 📢 Ask Photopea to send the next frame
    parent.postMessage("[flipbook] ✅ frame received", "*");
    return;
  }

  // 🚀 Flipbook done: open preview window
  if (
    typeof event.data === "string" &&
    event.data.trim() === "[flipbook] ✅ Exported all frames to OE."
  ) {
    console.log("📸 Flipbook: Received " + flipbookFrames.length + " frames.");

    if (flipbookFrames.length === 0) {
      alert("❌ No flipbook frames received.");
      return;
    }

    // 📄 Build HTML flipbook
    const html = generateFlipbookHTML(flipbookFrames);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const win = window.open();
    win.document.open();
    win.document.write(html);
    win.document.close();

    // 🧹 Reset for future use
    flipbookFrames.length = 0;
  }
});
