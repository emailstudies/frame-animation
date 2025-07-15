function mergeFrames() {
  const script =
    '(async function () {\n' +
    '  let doc = app.activeDocument;\n' +
    '  let group = doc.layers.find(l => l.name === "Merged_Frames" && l.type === "group");\n' +
    '  if (!group) {\n' +
    '    alert("❗ Merged_Frames group not found.");\n' +
    '    return;\n' +
    '  }\n' +
    '  let layers = group.layers.slice().reverse();\n' +
    '  for (let i = 0; i < layers.length; i++) {\n' +
    '    layers.forEach((l, idx) => l.visible = (i === idx));\n' +
    '    app.redraw();\n' +
    '    await new Promise(r => setTimeout(r, 200));\n' +
    '  }\n' +
    '})();';

  window.parent.postMessage(script, "*");
}

function exportGif() {
  alert("🕒 No native timeline in Photopea. Export manually via File > Export As > GIF.");
}
