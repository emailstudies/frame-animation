document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("browserPreviewAllBtn");

  if (!btn) {
    console.error("❌ Button not found");
    return;
  }

  const collectedFrames = [];

  btn.onclick = () => {
    const script = `
      (function () {
        try {
          var doc = app.activeDocument;
          var demoFolder = doc.layers.find(l => l.name === "demo" && l.type === "layerSection");
          if (!demoFolder) {
            app.echoToOE("[plugin] ❌ Folder 'demo' not found");
            return;
          }

          var layers = demoFolder.layers.filter(l => l.type === "layer" && !l.hidden);
          if (layers.length === 0) {
            app.echoToOE("[plugin] ❌ No layers in demo folder");
            return;
          }

          // Create temp doc
          var temp = app.documents.add(doc.width, doc.height, doc.resolution, "_demo_export", NewDocumentMode.RGB);

          for (var i = 0; i < layers.length; i++) {
            app.activeDocument = temp;
            while (temp.layers.length > 0) temp.layers[0].remove();

            app.activeDocument = doc;
            layers[i].duplicate(temp, ElementPlacement.PLACEATBEGINNING);

            app.activeDocument = temp;
            temp.saveToOE("png");
          }

          app.activeDocument = temp;
          temp.close(SaveOptions.DONOTSAVECHANGES);

          app.echoToOE("done");
        } catch (e) {
          app.echoToOE("❌ Error: " + e.message);
        }
      })();
    `;

    parent.postMessage(script, "*");
    console.log("📤 Script sent to Photopea");
  };

  window.addEventListener("message", (event) => {
    const data = event.data;

    if (data instanceof ArrayBuffer) {
      collectedFrames.push(data);
      return;
    }

    if (typeof data === "string") {
      console.log("📩", data);

      if (data === "done") {
        console.log("✅ All frames received:", collectedFrames.length);

        // Optional: Open flipbook
        const flipbookHTML = `<!DOCTYPE html>
<html><body style="margin:0;background:#111;"><canvas id="c"></canvas><script>
const ctx = document.getElementById('c').getContext('2d');
const frames = [];
${collectedFrames.map((ab, i) => {
  const b64 = btoa(String.fromCharCode(...new Uint8Array(ab)));
  return \`frames[\${i}] = "data:image/png;base64,\${b64}";\`;
}).join("\n")}

let imgs = frames.map(src => {
  let img = new Image();
  img.src = src;
  return img;
});

let i = 0;
let loaded = 0;
imgs.forEach(img => img.onload = () => {
  if (++loaded === imgs.length) {
    c.width = imgs[0].width;
    c.height = imgs[0].height;
    setInterval(() => {
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.drawImage(imgs[i], 0, 0);
      i = (i + 1) % imgs.length;
    }, 100);
  }
});
</script></body></html>`;

        const blob = new Blob([flipbookHTML], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const win = window.open(url, "_blank");

        // Clear frames
        collectedFrames.length = 0;
      }

      if (data.startsWith("❌")) {
        alert(data);
      }
    }
  });
});
