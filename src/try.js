function exportGif() {
  const script = `
(function () {
  if (!app || !app.activeDocument) {
    alert("❌ No active document.");
    return;
  }

  var originalDoc = app.activeDocument;

  // Step 1: Find anim_* folders
  var animFolders = [];
  for (var i = 0; i < originalDoc.layers.length; i++) {
    var layer = originalDoc.layers[i];
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

  // Step 2: Create a new document
  var width = originalDoc.width;
  var height = originalDoc.height;
  var resolution = originalDoc.resolution;
  var newDoc = app.documents.add(width, height, resolution, "anim_preview_doc");

  // Remove the default empty layer
  if (newDoc.layers.length === 1 && !newDoc.layers[0].layers) {
    newDoc.layers[0].remove();
  }

  // Step 3: For each anim folder
  for (var i = 0; i < animFolders.length; i++) {
    var sourceFolder = animFolders[i];

    // Create a new folder in the new document
    app.activeDocument = newDoc;
    var desc = new ActionDescriptor();
    var ref = new ActionReference();
    ref.putClass(stringIDToTypeID("layerSection"));
    desc.putReference(charIDToTypeID("null"), ref);
    var nameDesc = new ActionDescriptor();
    nameDesc.putString(charIDToTypeID("Nm  "), sourceFolder.name);
    desc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("layerSection"), nameDesc);
    executeAction(charIDToTypeID("Mk  "), desc, DialogModes.NO);
    var newFolder = newDoc.layers[0];

    // Step 4: Copy each layer manually
    for (var j = 0; j < sourceFolder.layers.length; j++) {
      var layer = sourceFolder.layers[j];
      if (layer.locked || layer.typename === "LayerSet") continue;

      app.activeDocument = originalDoc;
      originalDoc.activeLayer = layer;
      var dup = layer.duplicate();
      dup.name = "_a_" + layer.name;

      app.activeDocument = newDoc;
      dup.move(newFolder, ElementPlacement.INSIDE);
    }
  }

  app.activeDocument = newDoc;
  alert("✅ anim_* folders and _a_ layers copied into new doc!");
})();`;

  window.parent.postMessage(script, "*");
}
