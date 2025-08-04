// Trigger setup and export on button click
document.getElementById("browserPreviewAllBtn").onclick = () => {
  const script = `
    (function () {
      var demoFolder = app.activeDocument.layers.find(l => l.name === "demo" && l.type === "layerSection");
      if (!demoFolder) {
        app.echoToOE("[plugin] ❌ Folder 'demo' not found");
        return;
      }

      var demoLayers = demoFolder.layers.filter(l => l.type === "layer" && !l.hidden);
      if (demoLayers.length === 0) {
        app.echoToOE("[plugin] ❌ No visible layers in 'demo'");
        return;
      }

      app.activeDocument.layers.forEach(l => l.visible = false);
      demoFolder.visible = true;
      demoLayers.forEach(l => l.visible = false);

      window._pluginExportIndex = 0;
      window._pluginDemoLayers = demoLayers;

      window._pluginExportNextLayer = function () {
        var i = window._pluginExportIndex;
        var layers = window._pluginDemoLayers;
        if (i >= layers.length) {
          app.echoToOE("[plugin] ✅ All layers sent");
          delete window._pluginExportNextLayer;
          delete window._pluginExportIndex;
          delete window._pluginDemoLayers;
          return;
        }

        layers.forEach(l => l.visible = false);
        layers[i].visible = true;

        app.activeDocument.saveToOE("png").then(function (png) {
          app.sendToOE(png);
          app.echoToOE("[plugin] sent layer " + (i + 1));
        });

        window._pluginExportIndex += 1;
      };

      app.echoToOE("[plugin] ✅ Ready to export " + demoLayers.length + " layers. Send [plugin] next to begin.");
    })();
  `;

  window.parent.postMessage("runScript " + script, "*");
};

// 🔁 Handle plugin communication with Photopea
const receivedDemoFrames = [];

window.addEventListener("message", (event) => {
  const data = event.data;

  if (data instanceof ArrayBuffer) {
    receivedDemoFrames.push(data);
    console.log("🖼️ Got PNG buffer:", data.byteLength);
    return;
  }

  if (typeof data === "string" && data.startsWith("[plugin]")) {
    console.log("📩", data);

    if (data.includes("Ready")) {
      window.parent.postMessage("window._pluginExportNextLayer()", "*");
    }

    if (data.includes("sent layer")) {
      setTimeout(() => {
        window.parent.postMessage("window._pluginExportNextLayer()", "*");
      }, 150);
    }

    if (data.includes("All layers sent")) {
      console.log("🎉 Done sending layers from demo.");
      console.log("✅ Total received:", receivedDemoFrames.length);
      // Optional: preview, flipbook, or download logic goes here
    }
  }
});
