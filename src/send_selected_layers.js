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

          // Else fallback to first anim_* folder
          if (!group) {
            for (var i = 0; i < doc.layers.length; i++) {
              var l = doc.layers[i];
              if (l.typename === "LayerSet" && l.name.startsWith("anim_")) {
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
            originalVisibility[i] = frames[i].visible;
            frames[i].visible = false;
          }

          function exportNext(index) {
            if (index >= frames.length) {
              // Restore visibility
              for (var i = 0; i < frames.length; i++) {
                frames[i].visible = originalVisibility[i];
              }
              app.echoToOE("done");
              return;
            }

            for (var i = 0; i < frames.length; i++) {
              frames[i].visible = false;
            }

            frames[index].visible = true;
            var png = doc.saveToOE("png");
            app.sendToOE(png);

            // Wait before next export (⚠️ Give browser time to process)
            app.scheduleTask("exportNext(" + (index + 1) + ")", 200, false);
          }

          exportNext(0);
        } catch (e) {
          app.echoToOE("❌ ERROR: " + e.message);
        }
      })();
    `;
    parent.postMessage(script, "*");
  }
});
