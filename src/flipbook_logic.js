// ✅ Combined Flipbook Export Logic (uses anim_preview and temp doc)

let collectedFrames = [];
let frameIndex = 0;
let totalFrames = 0;

// 🏁 Start the export process after anim_preview is created
window.runCombinedFlipbookExport = function () {
  console.log("🚀 Starting combined flipbook export");

  const script = `
    (function () {
      try {
        var doc = app.activeDocument;
        var previewGroup = null;

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

        app.activeDocument.suspendHistory("Prep anim_preview", ""); // avoids history bloat

        // Hide everything except anim_preview
        for (var i = 0; i < doc.layers.length; i++) {
          doc.layers[i].visible = (doc.layers[i] === previewGroup);
        }
        previewGroup.visible = true;
        app.refresh();

        app.echoToOE("[flipbook] 📦 " + previewGroup.layers.length + " frames");
        app.echoToOE("[flipbook] ✅ anim_preview created - done");
      } catch (e) {
        app.echoToOE("[flipbook] ❌ JS ERROR: " + e.message);
      }
    })();
  `;
  parent.postMessage(script, "*");
};

function sendNextFrame() {
  const script = `
    (function () {
      try {
        var original = app.activeDocument;
        var previewGroup = null;

        for (var i = 0; i < original.layers.length; i++) {
          var layer = original.layers[i];
          if (layer.typename === "LayerSet" && layer.name === "anim_preview") {
            previewGroup = layer;
            break;
          }
        }

        if (!previewGroup || ${frameIndex} >= previewGroup.layers.length) {
          app.echoToOE("[flipbook] ✅ All frames sent");
          return;
        }

        var tempDoc;
        if (app.documents.length > 1) {
          tempDoc = app.documents.getByName("_temp_export");
        } else {
          tempDoc = app.documents.add(original.width, original.height, original.resolution, "_temp_export", NewDocumentMode.RGB);
        }

        app.activeDocument = tempDoc;

        // Remove all layers in tempDoc
        while (tempDoc.layers.length > 0) {
          tempDoc.layers[0].remove();
        }

        // Duplicate current frame into temp
        var layerToSend = previewGroup.layers[${frameIndex}];
        app.activeDocument = original;
        original.activeLayer = layerToSend;
        layerToSend.duplicate(tempDoc, ElementPlacement.PLACEATBEGINNING);

        app.activeDocument = tempDoc;
        app.refresh();

        app.echoToOE("[flipbook] 🔁 Sending frame ${frameIndex}: " + layerToSend.name);
        tempDoc.saveToOE("png");
      } catch (e) {
        app.echoToOE("[flipbook] ❌ JS ERROR DURING FRAME: " + e.message);
      }
    })();
  `;

  parent.postMessage(script, "*");
}

window.addEventListener("message", (event) => {
  if (event.data instanceof ArrayBuffer) {
    collectedFrames.push(event.data);
    console.log("🧪 Got ArrayBuffer of length", event.data.byteLength);
    console.log("📥 Received frame #" + collectedFrames.length);

    frameIndex++;

    if (frameIndex < totalFrames) {
      sendNextFrame();
    } else {
      console.log("📸 Flipbook: Received " + collectedFrames.length + " frames.");
      showFlipbook();
    }
  } else if (typeof event.data === "string") {
    console.log("📩 Flipbook Plugin Message:", event.data);

    if (event.data.startsWith("[flipbook] 📦")) {
      totalFrames = parseInt(event.data.match(/📦 (\d+) frames/)[1], 10);
      frameIndex = 0;
      collectedFrames = [];
    }

    if (event.data.includes("✅ anim_preview created - done")) {
      sendNextFrame();
    }
  }
});

// 🎞️ Render collectedFrames into new tab flipbook
function showFlipbook() {
  if (collectedFrames.length === 0) {
    console.warn("⚠️ Flipbook received 0 frames — nothing to show.");
    return;
  }

  const flipbookHTML = `
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
      const frames = [];
      ${collectedFrames
        .map((ab, i) => {
          const base64 = btoa(String.fromCharCode(...new Uint8Array(ab)));
          return \`frames[\${i}] = "data:image/png;base64,\${base64}";\`;
        })
        .join("\n")}

      const images = frames.map(src => {
        const img = new Image();
        img.src = src;
        return img;
      });

      const canvas = document.getElementById("previewCanvas");
      const ctx = canvas.getContext("2d");
      const fps = 12;
      let index = 0;

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
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(images[index], 0, 0);
          index = (index + 1) % images.length;
        }, 1000 / fps);
      };

      preload();
    </script>
  </body>
</html>
`;

  const blob = new Blob([flipbookHTML], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const win = window.open();
  win.document.open();
  win.document.write(flipbookHTML);
  win.document.close();

  collectedFrames.length = 0;
}
