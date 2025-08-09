/* enabling onion skin for all, not just anim_ folders */
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

      // 1. Check if any selected layer is a LayerSet (group)
      for (var i = 0; i < doc.activeLayers.length; i++) {
        if (doc.activeLayers[i].typename === "LayerSet") {
          alert("Onion skin cannot run when LayerSets (groups) are selected. Please select only individual layers.");
          return;
        }
      }

      // 2. Collect unique parent groups of selected layers (only unlocked groups)
      var parentGroups = {};
      for (var i = 0; i < doc.activeLayers.length; i++) {
        var parent = doc.activeLayers[i].parent;
        if (parent.typename === "LayerSet" && !parent.locked) {
          parentGroups[parent.id] = parent;
        }
      }

      // 3. Check for locked selected layers or locked siblings in each parent group
      for (var key in parentGroups) {
        var group = parentGroups[key];

        // Check if any selected layer inside this group is locked
        for (var j = 0; j < group.layers.length; j++) {
          var layer = group.layers[j];
          if (layer.selected && layer.locked) {
            alert("Selected layers must not be locked.");
            return;
          }
        }

        // Check if any sibling layer inside this group is locked
        for (var j = 0; j < group.layers.length; j++) {
          var layer = group.layers[j];
          if (layer.locked) {
            alert("Sibling layers inside the selected layer's group must not be locked.");
            return;
          }
        }
      }

      var beforeSteps = ${beforeSteps};
      var afterSteps = ${afterSteps};
      var opacityMap = { 1: 50, 2: 40, 3: 30 };

      // 4. Process each parent group independently with onion skin
      for (var key in parentGroups) {
        var group = parentGroups[key];

        // Collect selected, unlocked layer indexes inside this group (non-LayerSet)
        var selectedIndexes = [];
        for (var j = 0; j < group.layers.length; j++) {
          var layer = group.layers[j];
          if (layer.selected && layer.typename !== "LayerSet" && !layer.locked) {
            selectedIndexes.push(j);
          }
        }

        // Hide the group if no unlocked selected layers (unlikely here)
        if (selectedIndexes.length === 0) {
          group.visible = false;
          continue;
        } else {
          group.visible = true;
        }

        // Onion skin logic inside this group
        var layers = group.layers;
        for (var i = 0; i < layers.length; i++) {
          var layer = layers[i];

          // Skip LayerSets and locked layers inside the group
          if (layer.typename === "LayerSet" || layer.locked) continue;

          var set = false;

          for (var s = 0; s < selectedIndexes.length; s++) {
            var selIdx = selectedIndexes[s];

            if (i === selIdx) {
              layer.visible = true;
              layer.opacity = 100;
              set = true;
              break;
            }

            var distance = i - selIdx;

            if (distance > 0 && distance <= beforeSteps) {
              layer.visible = true;
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

      // 5. For unlocked groups that are NOT parents of selected layers
      //    turn OFF their visibility (the LayerSet visibility)
      //    but do NOT change any layers inside those groups
      for (var g = 0; g < doc.layers.length; g++) {
        var group = doc.layers[g];

        if (group.typename !== "LayerSet" || group.locked) continue;

        // Skip groups that are parents of selected layers
        if (parentGroups.hasOwnProperty(group.id)) continue;

        group.visible = false;
      }

      alert("✅ Onion Skin applied with correct group visibility handling.");
    })();
  `;

  window.parent.postMessage(script, "*");
}



/*
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

      var beforeSteps = ${beforeSteps};
      var afterSteps = ${afterSteps};

      var opacityMap = { 1: 50, 2: 40, 3: 30 };

      var selectedByParent = {};

      // Collect selected layer indexes by anim_* folder
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
        alert("No eligible layers selected inside anim_* folders.");
        return;
      }

      for (var g = 0; g < doc.layers.length; g++) {
        var group = doc.layers[g];
        if (group.typename !== "LayerSet" || group.name.indexOf("anim_") !== 0) continue;

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

*/


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
