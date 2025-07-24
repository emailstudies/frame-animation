function previewGif() {
  const script = `
(function () {
  if (!app || !app.activeDocument) {
    alert("No active document.");
    return;
  }

  var doc = app.activeDocument;

  // Step 1: Collect anim_* folders
  var animFolders = [];
  for (var i = 0; i < doc.layerSets.length; i++) {
    var folder = doc.layerSets[i];
    if (folder.name.toLowerCase().startsWith("anim") && !folder.allLocked) {
      animFolders.push(folder);
    }
  }

  if (animFolders.length === 0) {
    alert("❌ No 'anim_*' folders found.");
    return;
  }

  // Step 2: Find max number of frames
  var maxFrames = 0;
  for (var i = 0; i < animFolders.length; i++) {
    maxFrames = Math.max(maxFrames, animFolders[i].artLayers.length);
  }

  // Step 3: Create a new document
  var w = doc.width;
  var h = doc.height;
  var res = doc.resolution;
  var previewDoc = app.documents.add(w, h, res, "Merged Preview", NewDocumentMode.RGB);
  app.activeDocument = previewDoc;

  // Step 4: Create 'anim_preview' group
  var groupDesc = new ActionDescriptor();
  var ref = new ActionReference();
  ref.putClass(stringIDToTypeID("layerSection"));
  groupDesc.putReference(charIDToTypeID("null"), ref);
  executeAction(charIDToTypeID("Mk  "), groupDesc, DialogModes.NO);

  var previewGroup = app.activeDocument.activeLayer;
  previewGroup.name = "anim_preview";

  // Step 5: Create a dummy layer for test (we'll use this pattern to insert real ones)
  var desc = new ActionDescriptor();
  var ref = new ActionReference();
  ref.putClass(stringIDToTypeID("layer"));
  desc.putReference(charIDToTypeID("null"), ref);
  executeAction(charIDToTypeID("Mk  "), desc, DialogModes.NO);

  var testLayer = app.activeDocument.activeLayer;
  testLayer.name = "_a_Frame 1";
  testLayer.move(previewGroup, ElementPlacement.PLACEATBEGINNING);

  alert("✅ Test frame layer created inside 'anim_preview' group.");
})();`.trim();

  window.parent.postMessage(script, "*");
}
