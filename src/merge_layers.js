function previewGif() {
  const script = `
(function () {
  var doc = app.activeDocument;
  if (!doc || doc.layers.length < 2) {
    alert("❌ Need at least 2 layers to merge.");
    return;
  }

  // Step 1: Deselect all
  for (var i = 0; i < doc.layers.length; i++) {
    doc.layers[i].selected = false;
  }

  // Step 2: Duplicate top 2 layers
  var layer1 = doc.layers[0].duplicate();
  var layer2 = doc.layers[1].duplicate();

  // Step 3: Select both duplicates
  layer1.selected = true;
  layer2.selected = true;

  // Step 4: Merge them
  app.activeDocument.mergeLayers();
  doc.activeLayer.name = "Merged_Layer_Test";

  alert("✅ Merged top two layers into 'Merged_Layer_Test'");
})();
  `;

  window.parent.postMessage(script, "*");
}
