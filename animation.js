function mergeFrames() {
  const script =
    '(function () {\n' +
    '  let doc = app.activeDocument;\n' +
    '  let layer = doc.activeLayer;\n' +
    '  if (!layer) {\n' +
    '    alert("⚠️ No active layer selected.");\n' +
    '    return;\n' +
    '  }\n' +
    '  layer.name = "Renamed_From_Plugin";\n' +
    '  alert("✅ Layer renamed.");\n' +
    '})();';

  window.parent.postMessage(script, "*");
}

function exportGif() {
  alert("🕒 Timeline mode and export to GIF are not scriptable. Please export manually.");
}
