window.addEventListener("message", (event) => {
  if (event.data === "EXPORT_SELECTED_ANIM_FRAMES") {
    const script = `
      (function () {
        try {
          var doc = app.activeDocument;
          if (!doc) return app.echoToOE("❌ No document open.");

          var selected = doc.activeLayer;
          if (!selected || !selected.parent || selected.parent === doc)
            return app.echoToOE("❌ Please select a layer inside an anim_* folder.");

          var group = selected.parent;
          if (!group.name.startsWith("anim_"))
            return app.echoToOE("❌ Selection not in anim_* folder.");

          var frames = group.layers.slice().reverse();
          var originalVis = frames.map(f => f.visible);

          for (var i = 0; i < frames.length; i++) {
            // Hide all
            for (var j = 0; j < frames.length; j++) frames[j].visible = false;
            // Show one
            frames[i].visible = true;

            // Export frame
            var png = doc.saveToOE("png");
            app.sendToOE(png);
          }

          // Restore visibility
          for (var i = 0; i < frames.length; i++) frames[i].visible = originalVis[i];

          app.echoToOE("done");
        } catch (e) {
          app.echoToOE("❌ ERROR: " + e.message);
        }
      })();
    `;
    parent.postMessage(script, "*");
  }
});
