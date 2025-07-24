function previewGif() {
  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) {
        alert("❌ No active document.");
        return;
      }

      // Step 1: Create anim_preview folder
      var previewFolder = doc.layerSets.add();
      previewFolder.name = "anim_preview";

      // Step 2: Find all anim_* folders
      var animFolders = [];
      for (var i = 0; i < doc.layers.length; i++) {
        var layer = doc.layers[i];
        if (layer.typename === "LayerSet" && layer.name.indexOf("anim") === 0 && layer.name !== "anim_preview") {
          animFolders.push(layer);
        }
      }

      if (animFolders.length === 0) {
        alert("❌ No anim_* folders found.");
        return;
      }

      // Step 3: Duplicate each anim folder and move it into anim_preview
      for (var j = 0; j < animFolders.length; j++) {
        var originalFolder = animFolders[j];
        var duplicated = originalFolder.duplicate(); // Duplicate the folder
        duplicated.move(previewFolder, ElementPlacement.INSIDE); // Move inside preview
      }

      alert("✅ anim_preview created with copies of all anim_* folders.");
    })();
  `;
  window.parent.postMessage(script, "*");
}
