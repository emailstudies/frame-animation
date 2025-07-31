// onion_skin.js
function toggleOnionSkinMode() {
  const before = parseInt(document.getElementById("beforeSteps").value, 10);
  const after = parseInt(document.getElementById("afterSteps").value, 10);
  console.log("\uD83E\uDDC5 Onion Skin: Before =", before, "After =", after);

  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) {
        alert("No active document.");
        return;
      }

      var before = ${before};
      var after = ${after};
      var selectedByParent = {};

      // Collect selected layers grouped by their anim_* folder
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

      for (var g = 0; g < doc.layers.length; g++) {
        var group = doc.layers[g];
        if (group.typename !== "LayerSet" || group.name.indexOf("anim_") !== 0) continue;

        var selectedIndexes = selectedByParent[group.name] || [];
        var layers = group.layers;

        // Hide anim folders not selected (unless locked)
        if (selectedIndexes.length === 0 && !group.allLocked) {
          group.visible = false;
          continue;
        }

        for (var i = 0; i < layers.length; i++) {
          var layer = layers[i];
          if (layer.typename === "LayerSet" || layer.locked) continue;

          // Default opacity
          layer.opacity = 0;

          for (var s = 0; s < selectedIndexes.length; s++) {
            var selIdx = selectedIndexes[s];
            var offset = i - selIdx;
            var absOffset = Math.abs(offset);

            if (offset === 0) {
              layer.opacity = 100;
              break;
            } else if (offset < 0 && absOffset <= before) {
              var step = absOffset;
              var value = Math.max(100 - step * 30, 10);
              layer.opacity = value;
              break;
            } else if (offset > 0 && absOffset <= after) {
              var step = absOffset;
              var value = Math.max(100 - step * 30, 10);
              layer.opacity = value;
              break;
            }
          }
        }
      }

      alert("\u2705 Onion Skin applied: " + parentNames.length + " folder(s).");
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
