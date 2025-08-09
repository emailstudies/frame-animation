function toggleOnionSkinMode() {
  const beforeSteps = parseInt(document.getElementById("beforeSteps").value, 10);
  const afterSteps = parseInt(document.getElementById("afterSteps").value, 10);

  console.log("🧅 Onion Skin: Before =", beforeSteps, "After =", afterSteps);

  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) {
        alert("No active document.");
        return;
      }

      function isLayerSetLocked(layerSet) {
      return layerSet.allLocked || layerSet.pixelsLocked || layerSet.positionLocked || layerSet.transparentPixelsLocked;
      }

      var beforeSteps = ${beforeSteps};
      var afterSteps = ${afterSteps};

      var opacityMap = { 1: 50, 2: 40, 3: 30 };

      var selectedByParent = {};

      // Collect selected layer indexes by root folders
      for (var i = 0; i < doc.layers.length; i++) {
        var group = doc.layers[i];
        if (group.typename === "LayerSet" && !isLayerSetLocked(group)) {
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
        alert("No eligible layers selected inside anim_* folders.");
        return;
      }

      for (var g = 0; g < doc.layers.length; g++) {
        var group = doc.layers[g];
        if (group.typename !== "LayerSet" || isLayerSetLocked(group)) continue;

        var isSelectedGroup = selectedByParent.hasOwnProperty(group.name);
        if (!isSelectedGroup && !group.locked) {
          group.visible = false;
          continue;
        }

        var layers = group.layers;
        var selectedIndexes = selectedByParent[group.name] || [];

        for (var i = 0; i < layers.length; i++) {
          var layer = layers[i];
          if (layer.typename === "LayerSet" || layer.locked) continue;

          var set = false;

          for (var s = 0; s < selectedIndexes.length; s++) {
            var selIdx = selectedIndexes[s];
            if (i === selIdx) {
              layer.visible = true;
              layer.opacity = 100; // Selected
              set = true;
              break;
            }

            var distance = i - selIdx; // Now reversed logic

            if (distance > 0 && distance <= beforeSteps) {
              layer.opacity = opacityMap[distance] || 0;
              set = true;
              break;
            } else if (distance < 0 && Math.abs(distance) <= afterSteps) {
              layer.visible = true;
              layer.opacity = opacityMap[Math.abs(distance)] || 0;
              set = true;
              break;
            }
          }

          if (!set) {
            layer.visible = false;
          }
        }
      }

      alert("✅ Onion Skin applied.");
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
