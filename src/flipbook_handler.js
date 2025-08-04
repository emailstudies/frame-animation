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

      // Open new tab with flipbook viewer
      const newTab = window.open("", "_blank");
      const scriptTag = `<script>${generateFlipbookHTML.toString()}; generateFlipbookHTML(${JSON.stringify(collectedFrames.map(buf => Array.from(new Uint8Array(buf)))).replace(/</g, '\\u003c')});<\/script>`;

      newTab.document.write(`
        <!DOCTYPE html>
        <html>
        <head><title>Flipbook Preview</title></head>
        <body style="margin:0; background:#111;"><canvas id="previewCanvas"></canvas>${scriptTag}</body>
        </html>
      `);
    }
  }
});
