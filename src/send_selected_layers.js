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

          var group = null;
          var selectedLayer = doc.activeLayer;

          // Prefer selected layer's parent
          if (selectedLayer && selectedLayer.parent && selectedLayer.parent !== doc && selectedLayer.parent.name.startsWith("anim_")) {
            group = selectedLayer.parent;
          }

          // Else auto-pick first anim_* folder
          if (!group) {
            for (var i = 0; i < doc.layers.length; i++) {
              var l = doc.layers[i];
              if (l.typename === "LayerSet" && l.name.indexOf("anim_") === 0) {
                group = l;
                break;
              }
            }
          }

          if (!group) {
            app.echoToOE("❌ No anim_* folder found.");
            return;
          }

          var frames = group.layers.slice().reverse(); // Frame 1 = bottom
          var originalVisibility = [];

          for (var i = 0; i < frames.length; i++) {
            var frame = frames[i];

            originalVisibility[i] = frame.visible;

            // Hide all
            for (var j = 0; j < frames.length; j++) {
              frames[j].visible = false;
            }

            frame.visible = true;

            var png = doc.saveToOE("png");
            app.sendToOE(png);
          }

          // Restore visibility
          for (var i = 0; i < frames.length; i++) {
            frames[i].visible = originalVisibility[i];
          }

          app.echoToOE("done");
        } catch (e) {
          app.echoToOE("❌ ERROR: " + e.message);
        }
      })();
    `;
    parent.postMessage(script, "*");
  }
});
