window.addEventListener("message", (event) => {
  if (event.data === "EXPORT_SELECTED_ANIM_FRAMES") {
    const script = `
      (function () {
        try {
          var doc = app.activeDocument;
          if (!doc) {
            app.echoToOE("❌ No document open.");
            return;
          }

          var selectedLayer = doc.activeLayer;
          if (!selectedLayer || !selectedLayer.parent || selectedLayer.parent === doc) {
            app.echoToOE("❌ Please select a layer inside an anim_* folder.");
            return;
          }

          var group = selectedLayer.parent;
          app.echoToOE("ℹ️ Selected group: " + group.name);

          if (!group.name.startsWith("anim_")) {
            app.echoToOE("❌ Selection is not inside an anim_* folder.");
            return;
          }

          var frames = group.layers.slice().reverse();
          app.echoToOE("📦 Frame count: " + frames.length);

          var originalVis = [];

          for (var i = 0; i < frames.length; i++) {
            originalVis[i] = frames[i].visible;
            frames[i].visible = false;
          }

          for (var i = 0; i < frames.length; i++) {
            var frame = frames[i];
            frame.visible = true;
            app.echoToOE("📤 Exporting frame " + (i + 1) + ": " + frame.name);

            var png = doc.saveToOE("png");
            app.sendToOE(png);

            frame.visible = false;
          }

          for (var i = 0; i < frames.length; i++) {
            frames[i].visible = originalVis[i];
          }

          app.echoToOE("✅ Frame export complete.");
          app.echoToOE("done");
        } catch (e) {
          app.echoToOE("❌ ERROR: " + e.message);
        }
      })();
    `;
    parent.postMessage(script, "*");
  }
});
