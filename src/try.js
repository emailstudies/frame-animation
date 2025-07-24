function exportGif() {
  const script = `
(function () {
  if (!app || !app.activeDocument) {
    alert("❌ No active document.");
    return;
  }

  var doc = app.activeDocument;

  // Step 1: Find anim_* folders
  var animFolders = [];
  for (var i = 0; i < doc.layers.length; i++) {
    var layer = doc.layers[i];
    if (
      layer.name.indexOf("anim_") === 0 &&
      typeof layer.layers !== "undefined" &&
      !layer.locked
    ) {
      animFolders.push(layer);
    }
  }

  if (animFolders.length === 0) {
    alert("❌ No anim_* folders found.");
    return;
  }

  // Step 2: Create new document
  var width = doc.width;
  var height = doc.height;
  var resolution = doc.resolution;
  var newDoc = app.documents.add(width, height, resolution, "Animation Preview");

  // Step 3: Copy each anim_* folder and rename its inner layers
  for (var i = 0; i < animFolders.length; i++) {
    var folder = animFolders[i];
    var dupFolder = folder.duplicate();
    newDoc.layers[0].remove(); // Remove default blank layer

    newDoc.activeLayer = newDoc.layers[0];
    dupFolder.move(newDoc, ElementPlacement.PLACEATBEGINNING);

    // Rename all inner layers
    for (var j = 0; j < dupFolder.layers.length; j++) {
      var layer = dupFolder.layers[j];
      if (!layer.locked) {
        layer.name = "_a_" + layer.name;
      }
    }
  }

  app.activeDocument = newDoc;
  alert("✅ Duplicated anim_* folders into new doc with _a_ layer names.");
})();`;

  window.parent.postMessage(script, "*");
}
