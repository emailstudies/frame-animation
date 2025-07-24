function exportGif() {
  const script = `
    (async function () {
      let doc = app.activeDocument;
      let folderNames = doc.layers.filter(l => l.type === "group").map(l => l.name);

      function getFolderLayers(name) {
        let group = doc.layers.find(l => l.name === name && l.type === "group");
        return group ? group.layers.slice().reverse() : [];
      }

      let folders = folderNames.map(getFolderLayers);
      let frameCount = Math.min(...folders.map(f => f.length));
      let mergedGroup = await doc.createLayerGroup("Merged_Frames");

      for (let i = 0; i < frameCount; i++) {
        doc.layers.forEach(l => {
          if (l.type === "group") l.layers.forEach(s => s.visible = false);
        });

        folders.forEach(folder => {
          if (folder[i]) folder[i].visible = true;
        });

        app.redraw();
        await app.runMenuCommand("rasterizeVisible");
        let frameLayer = doc.activeLayer;
        frameLayer.name = "Frame_" + (i + 1);
        await frameLayer.move(mergedGroup);
      }

      alert("✅ Merged frames created.");
    })();`;

  window.parent.postMessage(script, "*");
}

function exportGif() {
  const script = `
    await app.runMenuCommand("toTimeline");
    await app.runMenuCommand("exportAsGif");
  `;
  window.parent.postMessage(script, "*");
}
