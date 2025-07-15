function mergeFrames() {
  const script =
    '(async function () {\n' +
    '  let doc = app.activeDocument;\n' +
    '  let folderNames = doc.layers.filter(l => l.type === "group").map(l => l.name);\n' +
    '  function getFolderLayers(name) {\n' +
    '    let group = doc.layers.find(l => l.name === name && l.type === "group");\n' +
    '    return group ? group.layers.slice().reverse() : [];\n' +
    '  }\n' +
    '  let folders = folderNames.map(getFolderLayers);\n' +
    '  let frameCount = Math.min(...folders.map(f => f.length));\n' +
    '  let mergedGroup = await doc.createLayerGroup("Merged_Frames");\n' +
    '  for (let i = 0; i < frameCount; i++) {\n' +
    '    doc.layers.forEach(l => {\n' +
    '      if (l.type === "group") l.layers.forEach(sublayer => sublayer.visible = false);\n' +
    '    });\n' +
    '    folders.forEach(folder => {\n' +
    '      if (folder[i]) folder[i].visible = true;\n' +
    '    });\n' +
    '    app.redraw();\n' +
    '    await app.runMenuCommand("rasterizeVisible");\n' +
    '    let frameLayer = doc.activeLayer;\n' +
    '    frameLayer.name = "Frame_" + (i + 1);\n' +
    '    await frameLayer.move(mergedGroup);\n' +
    '  }\n' +
    '  alert("✅ Merged frames created.");\n' +
    '})();';

  window.parent.postMessage(script, "*");
}

function exportGif() {
  const script =
    'await app.runMenuCommand("toTimeline");\n' +
    'await app.runMenuCommand("exportAsGif");';
  window.parent.postMessage(script, "*");
}
