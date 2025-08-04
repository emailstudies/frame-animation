// ✅ flipbook_logic.js — Combined logic for anim_preview flipbook export and playback

// 🖼️ Store received PNG ArrayBuffers
const flipbookFrames = [];

// 🚀 Initiate flipbook export sequence after anim_preview is built
window.runCombinedFlipbookExport = function () {
  console.log("🚀 Starting combined flipbook export");

  const script = `
    (function () {
      try {
        var doc = app.activeDocument;
        var previewGroup = null;

        // 🔍 Locate anim_preview group
        for (var i = 0; i < doc.layers.length; i++) {
          var layer = doc.layers[i];
          if (layer.typename === "LayerSet" && layer.name === "anim_preview") {
            previewGroup = layer;
            break;
          }
        }

        if (!previewGroup) {
          app.echoToOE("[flipbook] ❌ anim_preview not found");
          return;
        }

        // 🫥 Hide everything except anim_preview
        for (var i = 0; i < doc.layers.length; i++) {
          doc.layers[i].visible = (doc.layers[i] === previewGroup);
        }
        previewGroup.visible = true;
        app.refresh();

        app.echoToOE("[flipbook] 📦 " + previewGroup.layers.length + " frames");
        window._flipbookIndex = 0;
        app.echoToOE("[flipbook] ✅ anim_preview created - done");
      } catch (e) {
        app.echoToOE("[flipbook] ❌ JS ERROR: " + e.message);
      }
    })();
  `;
  parent.postMessage(script, "*");
};

// 🔁 Show one anim_preview frame at a time and export to OE
window.stepAndExportNextFrame = function () {
  const script = `
    (function () {
      try {
        var doc = app.activeDocument;
        var group = null;

        for (var i = 0; i < doc.layers.length; i++) {
          var layer = doc.layers[i];
          if (layer.typename === "LayerSet" && layer.name === "anim_preview") {
            group = layer;
            break;
          }
        }

        if (!group) {
          app.echoToOE("[flipbook] ❌ anim_preview group missing during step");
          return;
        }

        if (typeof window._flipbookIndex === "undefined") {
          window._flipbookIndex = 0;
        }

        if (window._flipbookIndex >= group.layers.length) {
          app.echoToOE("[flipbook] ✅ Exported all frames to OE.");
          delete window._flipbookIndex;
          return;
        }

        // Hide all preview layers
        for (var j = 0; j < group.layers.length; j++) {
          group.layers[j].visible = false;
        }

        var layer = group.layers[window._flipbookIndex];
        layer.visible = true;
        app.refresh();

        app.echoToOE("[flipbook] 🔁 Sending frame " + window._flipbookIndex + ": " + layer.name);
        doc.saveToOE("png");

        window._flipbookIndex++;
      } catch (e) {
        app.echoToOE("[flipbook] ❌ JS ERROR: " + e.message);
      }
    })();
  `;
  parent.postMessage(script, "*");
};

// 📩 Handle ArrayBuffers and flipbook control messages
window.addEventListener("message", (event) => {
  if (event.data instanceof ArrayBuffer) {
    console.log("🧪 Got ArrayBuffer of length", event.data.byteLength);
    flipbookFrames.push(event.data);
    console.log("📥 Received frame #" + flipbookFrames.length);

    // ⏳ Add delay before triggering next export
    setTimeout(() => {
      window.stepAndExportNextFrame();
    }, 200);
  }

  if (typeof event.data === "string") {
    const msg = event.data.trim();

    // Filter flipbook-specific messages
    if (msg.startsWith("[flipbook]")) {
      const cleanMsg = msg.replace("[flipbook] ", "").trim();
      console.log("📩 Flipbook Plugin Message:", cleanMsg);
    }

    // When all frames are done, launch viewer
    if (msg === "[flipbook] ✅ Exported all frames to OE.") {
      console.log("📸 Flipbook: Received " + flipbookFrames.length + " frames.");

      if (flipbookFrames.length === 0) {
        alert("❌ No flipbook frames received.");
        return;
      }

      // 🧠 Convert ArrayBuffers to Base64 and build player HTML
      const frameBase64 = flipbookFrames.map((ab) =>
        `data:image/png;base64,${btoa(String.fromCharCode(...new Uint8Array(ab)))}`
      );

      const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Flipbook Preview</title>
  <style>
    html, body { margin: 0; background: #111; overflow: hidden; height: 100%; display: flex; justify-content: center; align-items: center; }
    canvas { image-rendering: pixelated; }
  </style>
</head>
<body>
  <canvas id="previewCanvas"></canvas>
  <script>
    const frames = ${JSON.stringify(frameBase64)};
    const canvas = document.getElementById("previewCanvas");
    const ctx = canvas.getContext("2d");
    const fps = 12;
    let index = 0;

    const images = frames.map(src => {
      const img = new Image();
      img.src = src;
      return img;
    });

    const preload = () => {
      let loaded = 0;
      images.forEach(img => {
        img.onload = () => {
          loaded++;
          if (loaded === images.length) startLoop();
        };
      });
    };

    const startLoop = () => {
      canvas.width = images[0].width;
      canvas.height = images[0].height;
      setInterval(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(images[index], 0, 0);
        index = (index + 1) % images.length;
      }, 1000 / fps);
    };

    preload();
  </script>
</body>
</html>
      `;

      // 🪄 Launch new tab with flipbook
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");

      flipbookFrames.length = 0; // clear
    }
  }
});
