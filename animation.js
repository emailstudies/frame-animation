function mergeFrames() {
  const script =
    '(function () {\n' +
    '  let doc = app.activeDocument;\n' +
    '  let newLayer = doc.createLayer();\n' +
    '  newLayer.name = "Layer_From_Plugin";\n' +
    '  alert("✅ New layer created by plugin.");\n' +
    '})();';

  window.parent.postMessage(script, "*");
}

function exportGif() {
  alert("🕒 No timeline in Photopea. Please export manually via File > Export As > GIF.");
}
