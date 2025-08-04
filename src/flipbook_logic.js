window.flipbookScript = `
  window.runCombinedFlipbookExport = function () {
    try {
      var doc = app.activeDocument;
      var previewGroup = doc.layerSets.find(function(g) { return g.name === "anim_preview"; });
      if (!previewGroup) {
        app.echoToOE("❌ anim_preview group not found");
        return;
      }

      var layers = previewGroup.layers;
      if (!layers || layers.length === 0) {
        app.echoToOE("❌ anim_preview has no layers");
        return;
      }

      // Hide all layers first
      for (var i = 0; i < layers.length; i++) {
        layers[i].visible = false;
      }

      for (var i = 0; i < layers.length; i++) {
        var frame = layers[i];
        frame.visible = true;

        var png = app.activeDocument.saveToOE("png");
        app.sendToOE(png);
        app.echoToOE("[flipbook] 🖼️ Frame " + (i + 1) + "/" + layers.length + " sent");

        frame.visible = false;
      }

      app.echoToOE("[flipbook] ✅ All frames sent");
    } catch (e) {
      app.echoToOE("❌ Error during flipbook export: " + e.message);
    }
  };
  runCombinedFlipbookExport();
`;
