function toggleOnionSkinMode(beforeSteps, afterSteps) {
  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) {
        alert("No active document.");
        return;
      }

      var selectedByParent = {}; // { parentName: [selectedLayerIndexes] }
      var selectedParentNames = [];

      // 🧱 Collect selected layers inside anim_* folders
      for (var i = 0; i < doc.layers.length; i++) {
        var group = doc.layers[i];
        if (group.typename === "LayerSet" && group.name.indexOf("anim_") === 0) {
          if (group.locked) continue;
          for (var j = 0; j < group.layers.length; j++) {
            var layer = group.layers[j];
            if (layer.selected) {
              if (layer.typename === "LayerSet") {
                alert("Only individual layers can be selected for Onion Skin.");
                return;
              }
              if (!selectedByParent[group.name]) {
                selectedByParent[group.name] = [];
                selectedParentNames.push(group.name);
              }
              selectedByParent[group.name].push(j);
            }
          }
        }
      }

      if (selectedParentNames.length === 0) {
        alert("No eligible layers selected. Select layers inside anim_* folders.");
        return;
      }

      // 🧱 Hide unselected anim folders (if not locked)
      for (var i = 0; i < doc.layers.length; i++) {
        var group = doc.layers[i];
        if (group.typename === "LayerSet" && group.name.indexOf("anim_") === 0) {
          if (!selectedParentNames.includes(group.name) && !group.locked) {
            group.visible = false;
          } else {
            group.visible = true;
          }
        }
      }

      // 🧅 Onion skin application
      for (var i = 0; i < doc.layers.length; i++) {
        var group = doc.layers[i];
        if (
          group.typename !== "LayerSet" ||
          group.name.indexOf("anim_") !== 0 ||
          !selectedByParent[group.name]
        ) continue;

        var selectedIndexes = selectedByParent[group.name];
        var layers = group.layers;

        for (var j = 0; j < layers.length; j++) {
          var layer = layers[j];
          if (layer.typename === "LayerSet" || layer.locked) continue;

          let relativeDistance = null;

          for (var s = 0; s < selectedIndexes.length; s++) {
            var diff = j - selectedIndexes[s];

            if (diff < 0 && Math.abs(diff) <= beforeSteps) {
              if (relativeDistance === null || Math.abs(diff) < Math.abs(relativeDistance)) {
                relativeDistance = diff;
              }
            } else if (diff > 0 && diff <= afterSteps) {
              if (relativeDistance === null || diff < relativeDistance) {
                relativeDistance = diff;
              }
            } else if (diff === 0) {
              relativeDistance = 0;
              break;
            }
          }

          if (relativeDistance === 0) {
            // Keep original opacity
          } else if (relativeDistance !== null) {
            var opacity =
              relativeDistance < 0
                ? 100 - (beforeSteps - Math.abs(relativeDistance) + 1) * 20
                : 100 - (afterSteps - relativeDistance + 1) * 20;
            layer.opacity = Math.max(10, Math.min(opacity, 100)); // Clamp to 10–100
          } else {
            layer.opacity = 0;
          }
        }
      }

      console.log("🧅 Onion skin applied with", beforeSteps, "before &", afterSteps, "after.");
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
