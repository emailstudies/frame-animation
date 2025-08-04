// flipbook_logic.js
window.flipbookScript = `
  window.runCombinedFlipbookExport = async function () {
    const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

    try {
      const doc = app.activeDocument;
      const previewGroup = doc.layerSets.find(group => group.name === "anim_preview");

      if (!previewGroup) {
        app.echoToOE("❌ anim_preview group not found");
        return;
      }

      const layers = previewGroup.layers;
      if (!layers || layers.length === 0) {
        app.echoToOE("❌ anim_preview has no layers");
        return;
      }

      for (let layer of layers) layer.visible = false;

      for (let i = 0; i < layers.length; i++) {
        const frame = layers[i];
        frame.visible = true;
        await sleep(100);

        const png = app.activeDocument.saveToOE("png");
        app.sendToOE(png);
        app.echoToOE(\`[flipbook] 🖼️ Frame \${i + 1}/\${layers.length} sent\`);

        frame.visible = false;
        await sleep(100);
      }

      app.echoToOE("[flipbook] ✅ All frames sent");
    } catch (err) {
      app.echoToOE("❌ Error during flipbook export: " + err.message);
    }
  };

  window.runCombinedFlipbookExport();
`;
