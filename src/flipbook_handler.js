const collectedFrames = [];

window.addEventListener("message", (event) => {
  if (event.data instanceof ArrayBuffer) {
    collectedFrames.push(event.data);
    console.log("🧩 Received frame", collectedFrames.length);
    return;
  }

  if (typeof event.data === "string" && event.data.startsWith("[flipbook]")) {
    console.log("📩", event.data);

    if (event.data.includes("✅ All frames sent")) {
      if (!collectedFrames.length) {
        alert("❌ No frames collected");
        return;
      }

      // ✅ Call the shared function from generate_flipbook.js
      if (typeof generateFlipbookInNewTab === "function") {
        generateFlipbookInNewTab(collectedFrames);
      } else {
        alert("❌ generateFlipbookInNewTab not found");
      }
    }
  }
});
