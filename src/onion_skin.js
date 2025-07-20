// 🧅 Onion Skin Mode with multi-folder awareness and visibility control

function toggleOnionSkinMode() {
  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) return;

      var selectedLayers = [];

      // Step 1: Collect selected layers inside anim_* folders
      for (var i = 0; i < doc.layerSets.length; i++) {
        var top = doc.layerSets[i];
        if (top.name.startsWith("anim_")) {
          for (var j = 0; j < top.artLayers.length; j++) {
            var layer = top.artLayers[j];
            if (layer.selected && layer.typename !== "LayerSet") {
              selectedLayers.push({ layer: layer, parent: top });
            }
          }
        }
      }

      if (selectedLayers.length === 0) return;

      // Step 2: Reset previously affected layers
      if (window.onionSkinLog && Array.isArray(window.onionSkinLog)) {
        for (var a = 0; a < window.onionSkinLog.length; a++) {
          var entry = window.onionSkinLog[a];
          for (var b = 0; b < entry.affected.length; b++) {
            try {
              var rec = entry.affected[b];
              if (rec.layer) rec.layer.opacity = rec.originalOpacity;
            } catch (e) {}
          }
        }
      }

      // Step 3: Apply new onion skin and store log
      var newLog = [];

      for (var i = 0; i < doc.layerSets.length; i++) {
        var top = doc.layerSets[i];
        if (!top.name.startsWith("anim_")) continue;

        var selectedInFolder = selectedLayers.filter(sl => sl.parent.name === top.name);
        var entryLog = {
          folderName: top.name,
          selectedLayer: selectedInFolder.length > 0 ? selectedInFolder[0].layer.name : null,
          affected: []
        };

        for (var j = 0; j < top.artLayers.length; j++) {
          var layer = top.artLayers[j];

          // If selected
          if (selectedInFolder.some(sl => sl.layer.name === layer.name)) {
            continue; // leave selected layer at 100%
          }

          // If sibling of selected
          var isSibling = false;
          if (selectedInFolder.length > 0) {
            var selectedIndex = -1;
            for (var k = 0; k < top.artLayers.length; k++) {
              if (top.artLayers[k].name === selectedInFolder[0].layer.name) {
                selectedIndex = k;
                break;
              }
            }

            if (
              j === selectedIndex - 1 ||
              j === selectedIndex + 1
            ) {
              entryLog.affected.push({ layer: layer, originalOpacity: layer.opacity });
              layer.opacity = 40;
              isSibling = true;
            }
          }

          // If neither selected nor sibling → set opacity 0
          if (!isSibling) {
            entryLog.affected.push({ layer: layer, originalOpacity: layer.opacity });
            layer.opacity = 0;
          }
        }

        newLog.push(entryLog);
      }

      window.onionSkinLog = newLog;

      // 🐞 DEBUG: Print the onion skin log to console
      console.log("\uD83E\uDDC5 Updated Onion Skin Log:", window.onionSkinLog);
    })();
  `;

  window.parent.postMessage(script, "*");
}
