// ✅ Updated Onion Skin Logic with Before/After Sliders
function toggleOnionSkinMode(beforeSteps = 1, afterSteps = 1) {
  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) {
        alert("No active document.");
        return;
      }

      // Group selected layers by their anim_* folder
      var selectedByParent = {};
      for (var i = 0; i < doc.layers.length; i++) {
        var group = doc.layers[i];
        if (group.typename === "LayerSet" && group.name.indexOf("anim_") === 0) {
          for (var j = 0; j < group.layers.length; j++) {
            var layer = group.layers[j];
            if (layer.selected && layer.typename !== "LayerSet") {
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

      // Hide unselected anim_* folders (if not locked)
      for (var i = 0; i < doc.layers.length; i++) {
        var group = doc.layers[i];
        if (group.typename === "LayerSet" && group.name.indexOf("anim_") === 0 && parentNames.indexOf(group.name) === -1) {
          if (!group.allLocked && !group.visible) continue; // Already hidden
          group.visible = false;
        }
      }

      // Apply onion skin to selected anim folders
      for (var p = 0; p < doc.layers.length; p++) {
        var group = doc.layers[p];
        if (group.typename !== "LayerSet" || parentNames.indexOf(group.name) === -1) continue;

        var selectedIndexes = selectedByParent[group.name] || [];
        var layers = group.layers;

        for (var i = 0; i < layers.length; i++) {
          var layer = layers[i];
          if (layer.typename === "LayerSet" || layer.locked) continue;

          var opacity = 0;
          for (var s = 0; s < selectedIndexes.length; s++) {
            var selIdx = selectedIndexes[s];
            var diff = i - selIdx;

            if (diff === 0) {
              opacity = 100;
              break;
            } else if (diff < 0 && Math.abs(diff) <= beforeSteps) {
              opacity = 20 + (beforeSteps - Math.abs(diff)) * 10; // Eg: 2 steps: [30%, 40%]
              break;
            } else if (diff > 0 && diff <= afterSteps) {
              opacity = 20 + (afterSteps - diff) * 10;
              break;
            }
          }

          layer.opacity = opacity;
        }
      }

      console.log("🧅 Onion Skin applied (Before = " + ${beforeSteps} + ", After = " + ${afterSteps} + ")");
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
