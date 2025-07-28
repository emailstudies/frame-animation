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
          if (!group.name.startsWith("anim_")) {
            app.echoToOE("❌ Selection is not inside an anim_* folder.");
            return;
          }

          var frames = group.layers.slice().reverse(); // Frame 1 is bottom-most
          var originalVisibility = [];

          for (var i = 0; i < frames.length; i++) {
            var frame = frames[i];

            originalVisibility[i] = frame.visible;

            // Hide all
            for (var j = 0; j < frames.length; j++) {
              frames[j].visible = false;
            }

            // Show only one frame
            frame.visible = true;

            // Export
            var png = doc.saveToOE("png");
            app.sendToOE(png); // ✅ actually sends it
          }

          // Restore visibility
          for (var i = 0; i < frames.length; i++) {
            frames[i].visible = originalVisibility[i];
          }

          app.echoToOE("done"); // Only sent ONCE
        } catch (e) {
          app.echoToOE("❌ ERROR: " + e.message);
        }
      })();
    `;
    parent.postMessage(script, "*");
  }
});
