function exportGif() {
  const script = `
    (function () {
      var doc = app.activeDocument;

      for (var i = 0; i < doc.layers.length; i++) {
        var group = doc.layers[i];

        // Step 1: Check for folders named anim_*
        if (group.typename !== "LayerSet" || !group.name.startsWith("anim_")) continue;

        // Step 2: Prefix all layers and collect mergeable ones
        var mergeable = [];
        for (var j = 0; j < group.layers.length; j++) {
          var layer = group.layers[j];
          if (layer.typename === "ArtLayer" && !layer.locked) {
            layer.name = "_a_" + layer.name;
            mergeable.push(layer);
          }
        }

        // Step 3: Merge layers from bottom up (Photopea merges top into bottom)
        while (mergeable.length > 1) {
          var top = mergeable.pop(); // last in array = top in UI
          var below = mergeable[mergeable.length - 1];
          top.merge(); // merges into below
        }

        // Final merged layer (or the only one)
        if (mergeable.length === 1) {
          mergeable[0].name = "_a_Merged";
        }
      }

      alert("✅ All anim_* folders merged using bottom-up logic.");
    })();
  `;

  window.parent.postMessage(script, "*");
}
