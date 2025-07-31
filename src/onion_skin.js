// 🧅 onion_skin.js
function toggleOnionSkinMode() {
  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) {
        alert("No active document.");
        return;
      }

      var beforeSteps = parseInt(document.getElementById("beforeSteps").value, 10);
      var afterSteps = parseInt(document.getElementById("afterSteps").value, 10);

      console.log("\uD83E\uDD05 Onion Skin: Before = " + beforeSteps + " After = " + afterSteps);

      var selectedByParent = {}; // { parentName: [selectedLayerIndexes] }

      // Collect selected layers grouped by parent anim_* folder
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

      for (var i = 0; i < doc.layers.length; i++) {
        var group = doc.layers[i];

        if (group.typename !== "LayerSet" || group.name.indexOf("anim_") !== 0) continue;
        if (!group.visible && !group.locked) group.visible = false; // Hide non-selected folders if not locked

        var isSelectedFolder = !!selectedByParent[group.name];
        group.visible = isSelectedFolder || group.locked;

        var selectedIndexes = selectedByParent[group.name] || [];

        for (var j = 0; j < group.layers.length; j++) {
          var layer = group.layers[j];
          if (layer.typename === "LayerSet" || layer.locked) continue;

          let opacity = 0;
          if (selectedIndexes.includes(j)) {
            opacity = 100;
          } else {
            for (let s = 0; s < selectedIndexes.length; s++) {
              const index = selectedIndexes[s];
              const dist = j - index;

              if (dist < 0 && Math.abs(dist) <= beforeSteps) {
                opacity = Math.max(opacity, 100 - (Math.abs(dist) * 30));
              } else if (dist > 0 && dist <= afterSteps) {
                opacity = Math.max(opacity, 100 - (dist * 30));
              }
            }
          }

          layer.opacity = Math.max(0, Math.min(opacity, 100));
        }
      }
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
