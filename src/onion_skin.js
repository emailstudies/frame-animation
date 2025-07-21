function toggleOnionSkinMode() {
  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) {
        alert("No active document.");
        return;
      }

      var selectedByParent = {}; // { parentName: [selectedLayerIndexes] }

      // Step 1: Collect and validate selected layers
      for (var i = 0; i < doc.layers.length; i++) {
        var group = doc.layers[i];
        if (group.typename === "LayerSet" && group.name.indexOf("anim_") === 0) {
          for (var j = 0; j < group.layers.length; j++) {
            var layer = group.layers[j];

            if (layer.selected) {
              if (layer.typename === "LayerSet") {
                alert("Only individual layers can be selected for Onion Skin.");
                return;
              }

              // ✅ Reliable lock check using try–catch
              try {
                var testOpacity = layer.opacity;
                layer.opacity = testOpacity;
              } catch (e) {
                alert("A selected layer is locked. Please unlock it to use Onion Skin.");
                return;
              }

              try {
                var groupOpacity = group.opacity;
                group.opacity = groupOpacity;
              } catch (e) {
                alert("The parent folder of a selected layer is locked. Please unlock it to use Onion Skin.");
                return;
              }

              if (!selectedByParent[group.name]) {
                selectedByParent[group.name] = [];
              }
              selectedByParent[group.name].push(j);
            }
          }
        }
      }

      var parentNames = Object.keys(selectedByParent);
      if (parentNames.length === 0) {
        alert("No eligible layers selected. Select layers inside anim_* folders.");
        return;
      }

      // Step 2: Apply onion skin to all anim_* folders
      for (var p = 0; p < doc.layers.length; p++) {
        var group = doc.layers[p];
        if (group.typename !== "LayerSet" || group.name.indexOf("anim_") !== 0) continue;

        var selectedIndexes = selectedByParent[group.name] || [];
        var layers = group.layers;

        for (var i = 0; i < layers.length; i++) {
          var layer = layers[i];
          if (layer.typename === "LayerSet") continue;

          var isSelected = false;
          var isSibling = false;

          for (var s = 0; s < selectedIndexes.length; s++) {
            var selIdx = selectedIndexes[s];
            if (i === selIdx) isSelected = true;
            if (i === selIdx - 1 || i === selIdx + 1) isSibling = true;
          }

          try {
            if (isSelected) {
              layer.opacity = 100;
            } else if (isSibling) {
              layer.opacity = 40;
            } else {
              layer.opacity = 0;
            }
          } catch (e) {
            console.log("🔒 Skipped locked or protected layer:", layer.name);
          }
        }
      }

      console.log("🧅 Onion Skin applied for multiple selections.");
    })();
  `;

  window.parent.postMessage(script, "*");
}
