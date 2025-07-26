function exportGif() {
  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) {
        alert("No active document.");
        return;
      }

      // Step 1: Check if anim_e exists
      for (var i = 0; i < doc.layers.length; i++) {
        var layer = doc.layers[i];
        if (layer.name === "anim_e" && layer.typename === "LayerSet") {
          alert("❌ 'anim_e' folder already exists. Please delete it first.");
          return;
        }
      }

      // Step 2: Create anim_e folder at top
      var tempGroup = doc.layerSets.add();
      tempGroup.name = "temp_check_folder";
      var atRoot = (tempGroup.parent === doc);
      tempGroup.remove();

      if (!atRoot) {
        alert("❌ Please deselect any folder. 'anim_e' must be created at root.");
        return;
      }

      var animE = doc.layerSets.add();
      animE.name = "anim_e";

      // Move anim_e to top of layer stack
      var topLayer = doc.layers[0];
      animE.move(topLayer, ElementPlacement.PLACEBEFORE);

      // Step 3: Loop through anim_* folders and duplicate their first visible, unlocked layer
      var duplicated = [];

      for (var i = doc.layers.length - 1; i >= 0; i--) {
        var group = doc.layers[i];
        if (group.typename !== "LayerSet") continue;
        if (group.name.indexOf("anim_") !== 0 || group.name === "anim_e") continue;

        if (group.layers.length === 0) continue;

        var firstLayer = group.layers[group.layers.length - 1]; // topmost
        if (!firstLayer || firstLayer.typename === "LayerSet" || firstLayer.locked) continue;

        doc.activeLayer = firstLayer;
        var dup = firstLayer.duplicate();
        dup.name = "_a_" + firstLayer.name;
        dup.move(animE, ElementPlacement.INSIDE);
        duplicated.push(dup.name);
      }

      if (duplicated.length < 2) {
        alert("❌ Need at least two layers to merge. Found: " + duplicated.length);
        return;
      }

      // Step 4: Merge all duplicated layers inside anim_e
      for (var i = animE.layers.length - 2; i >= 0; i--) {
        var top = animE.layers[i + 1];
        if (top.typename !== "ArtLayer") continue;
        top.merge(); // merge with layer below
      }

      animE.layers[0].name = "_a_merged_1";

      // Debug console log
      console.log("📦 Selected folders: " + duplicated.join(", "));
      console.log("✅ Merged into: _a_merged_1");

    })();
  `;

  window.parent.postMessage(script, "*");
}
