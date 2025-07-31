function toggleOnionSkinMode() {
  const before = parseInt(document.getElementById("beforeSlider").value, 10);
  const after = parseInt(document.getElementById("afterSlider").value, 10);

  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) { alert("No active document."); return; }

      var before = ${before};
      var after = ${after};

      var selectedMap = {};

      for (var i = 0; i < doc.layers.length; i++) {
        var group = doc.layers[i];
        if (group.typename === "LayerSet" && group.name.indexOf("anim_") === 0) {
          for (var j = 0; j < group.layers.length; j++) {
            var layer = group.layers[j];
            if (layer.selected && layer.typename !== "LayerSet") {
              if (!selectedMap[group.name]) selectedMap[group.name] = [];
              selectedMap[group.name].push(j);
            }
          }
        }
      }

      var selectedFolders = Object.keys(selectedMap);
      if (selectedFolders.length === 0) {
        alert("❌ No valid anim_* layers selected.");
        return;
      }

      for (var i = 0; i < doc.layers.length; i++) {
        var group = doc.layers[i];
        if (group.typename !== "LayerSet" || group.name.indexOf("anim_") !== 0) continue;

        var isSelectedFolder = selectedFolders.includes(group.name);
        if (!isSelectedFolder && !group.allLocked) {
          group.visible = false;
          console.log("👻 Hiding unrelated folder:", group.name);
          continue;
        }

        var selectedIndexes = selectedMap[group.name] || [];
        var layers = group.layers;

        for (var j = 0; j < layers.length; j++) {
          var layer = layers[j];
          if (layer.typename === "LayerSet") continue;

          var opacity = 0;
          var visible = false;

          for (var k = 0; k < selectedIndexes.length; k++) {
            var idx = selectedIndexes[k];

            if (j === idx) {
              opacity = 100;
              visible = true;
              break;
            }

            var dist = Math.abs(j - idx);
            if (j < idx && dist <= before) { // before layer
              opacity = 50 - (dist - 1) * 10;
              visible = true;
              break;
            }
            if (j > idx && dist <= after) { // after layer
              opacity = 50 - (dist - 1) * 10;
              visible = true;
              break;
            }
          }

          layer.visible = visible;
          layer.opacity = opacity;
          console.log("🧅", group.name + "/" + layer.name, "→ opacity:", opacity);
        }
      }

      console.log("✅ Onion skin applied (before:", before, "after:", after + ")");
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
