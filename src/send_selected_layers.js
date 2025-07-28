// send_selected_layers.js (patched for sequential frame export)
window.addEventListener("message", (event) => {
  if (event.data === "EXPORT_SELECTED_ANIM_FRAMES") {
    const script = `
      (function () {
        try {
          var doc = app.activeDocument;
          if (!doc) return app.echoToOE("❌ No document open.");

          var selectedLayer = doc.activeLayer;
          if (!selectedLayer || !selectedLayer.parent || selectedLayer.parent === doc) {
            return app.echoToOE("❌ Please select a layer inside an anim_* folder.");
          }

          var group = selectedLayer.parent;
          if (!group.name.startsWith("anim_")) {
            return app.echoToOE("❌ Selection is not inside an anim_* folder.");
          }

          var frames = group.layers.slice().reverse();
          var frameIndex = 0;
          var originalVisibility = [];

          for (var i = 0; i < frames.length; i++) {
            originalVisibility[i] = frames[i].visible;
            frames[i].visible = false;
          }

          function sendNextFrame() {
            if (frameIndex >= frames.length) {
              // Restore visibility
              for (var i = 0; i < frames.length; i++) {
                frames[i].visible = originalVisibility[i];
              }
              return app.echoToOE("done");
            }

            var current = frames[frameIndex];
            current.visible = true;
            var png = doc.saveToOE("png");
            app.sendToOE(png);
            current.visible = false;
            frameIndex++;
          }

          app.listenToOE(function(msg) {
            if (msg === "READY_FOR_NEXT_FRAME") {
              sendNextFrame();
            }
          });

          sendNextFrame();
        } catch (e) {
          app.echoToOE("❌ ERROR: " + e.message);
        }
      })();
    `;
    parent.postMessage(script, "*");
  }
});
