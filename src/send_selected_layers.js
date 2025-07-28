window.addEventListener("message", (event) => {
  if (event.data === "EXPORT_SELECTED_ANIM_FRAMES") {
    const script = `
      (function () {
        try {
          var doc = app.activeDocument;
          if (!doc || doc.layers.length === 0) {
            app.echoToOE("❌ No document open.");
            return;
          }

          var animGroups = [];
          for (var i = 0; i < doc.layers.length; i++) {
            var group = doc.layers[i];
            if (group.typename === "LayerSet" && group.name.indexOf("anim_") === 0) {
              animGroups.push(group);
            }
          }

          if (animGroups.length === 0) {
            app.echoToOE("❌ No anim_* folders found.");
            return;
          }

          for (var g = 0; g < animGroups.length; g++) {
            var group = animGroups[g];
            var layers = group.layers.slice().reverse(); // Frame 1 at bottom
            var visibilityBackup = [];

            for (var i = 0; i < layers.length; i++) {
              // Backup visibility
              visibilityBackup[i] = layers[i].visible;

              // Hide all layers
              for (var j = 0; j < layers.length; j++) {
                layers[j].visible = false;
              }

              // Show only current frame
              layers[i].visible = true;

              // Export current view
              var png = doc.saveToOE("png");
              app.sendToOE(png);
            }

            // Restore visibility
            for (var i = 0; i < layers.length; i++) {
              layers[i].visible = visibilityBackup[i];
            }
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
