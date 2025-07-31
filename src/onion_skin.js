function toggleOnionSkinMode() {
  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) {
        alert("No active document.");
        return;
      }

      var beforeSlider = document.getElementById("beforeSteps");
      var afterSlider = document.getElementById("afterSteps");

      if (!beforeSlider || !afterSlider) {
        alert("❌ Sliders not found.");
        return;
      }

      var beforeSteps = parseInt(beforeSlider.value, 10) || 0;
      var afterSteps = parseInt(afterSlider.value, 10) || 0;

      alert("🧅 Onion Skin: Before = " + beforeSteps + " After = " + afterSteps);

      var selectedFolders = [];
      var selectedLayerIndexes = {};

      // Step 1: Collect selected anim_* folders and their selected layers
      for (var i = 0; i < doc.layers.length; i++) {
        var folder = doc.layers[i];
        if (
          folder.typename === "LayerSet" &&
          folder.name.indexOf("anim_") === 0 &&
          folder.name !== "anim_preview" &&
          folder.selected
        ) {
          selectedFolders.push(folder);
          selectedLayerIndexes[folder.name] = [];

          for (var j = 0; j < folder.layers.length; j++) {
            var layer = folder.layers[j];
            if (layer.selected && layer.typename !== "LayerSet") {
              selectedLayerIndexes[folder.name].push(j);
            }
          }
        }
      }

      if (selectedFolders.length === 0) {
        alert("❌ No anim_* folders selected.");
        return;
      }

      // Step 2: Hide all non-selected anim_* folders (unless locked)
      for (var i = 0; i < doc.layers.length; i++) {
        var folder = doc.layers[i];
        if (
          folder.typename === "LayerSet" &&
          folder.name.indexOf("anim_") === 0 &&
          folder.name !== "anim_preview" &&
          !folder.selected &&
          !folder.locked
        ) {
          folder.visible = false;
        }
      }

      // Step 3: Apply Onion Skin logic to each selected folder
      for (var f = 0; f < selectedFolders.length; f++) {
        var group = selectedFolders[f];
        var groupLayers = group.layers;
        var selectedIndexes = selectedLayerIndexes[group.name] || [];

        for (var i = 0; i < groupLayers.length; i++) {
          var layer = groupLayers[i];
          if (!layer || layer.typename === "LayerSet" || layer.locked) continue;

          var opacity = 0;

          for (var s = 0; s < selectedIndexes.length; s++) {
            var selIndex = selectedIndexes[s];

            if (i === selIndex) {
              opacity = 100;
              break;
            }

            var offset = selIndex - i; // negative = before, positive = after

            if (offset > 0 && offset <= afterSteps) {
              // after layers
              var step = offset;
              opacity = Math.max(opacity, Math.round(100 - step * 30));
            } else if (offset < 0 && Math.abs(offset) <= beforeSteps) {
              // before layers
              var step = Math.abs(offset);
              opacity = Math.max(opacity, Math.round(100 - step * 30));
            }
          }

          layer.opacity = Math.max(0, Math.min(100, opacity));
        }
      }

      alert("✅ Onion skin applied to selected folders.");
    })();
  `;

  window.parent.postMessage(script, "*");
}




/* This was the original onion skin with only 1 before and after getting affected */

/* function toggleOnionSkinMode() {
  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) {
        alert("No active document.");
        return;
      }

      var selectedByParent = {}; // { parentName: [selectedLayerIndexes] }

      // Step 1: Collect selected layers grouped by parent anim_* folder
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
              if (!selectedByParent[group.name]) selectedByParent[group.name] = [];
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

      // Step 2: Loop through each anim folder and apply onion skin
      for (var p = 0; p < doc.layers.length; p++) {
        var group = doc.layers[p];
        if (group.typename !== "LayerSet" || group.name.indexOf("anim_") !== 0) continue;

        var selectedIndexes = selectedByParent[group.name] || [];
        var layers = group.layers;

        for (var i = 0; i < layers.length; i++) {
          var layer = layers[i];
          if (layer.typename === "LayerSet" || layer.locked) continue;

          var isSelected = false;
          var isSibling = false;

          for (var s = 0; s < selectedIndexes.length; s++) {
            var selIdx = selectedIndexes[s];
            if (i === selIdx) isSelected = true;
            if (i === selIdx - 1 || i === selIdx + 1) isSibling = true;
          }

          if (isSelected) {
            layer.opacity = 100;
          } else if (isSibling) {
            layer.opacity = 40;
          } else {
            layer.opacity = 0;
          }
        }
      }

      console.log("🧅 Onion Skin applied for multiple selections.");
    })();
  `;

  window.parent.postMessage(script, "*");
}
*/
