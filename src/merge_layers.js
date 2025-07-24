function previewGif() {
  const script = `
(function () {
  if (!app || !app.activeDocument) {
    alert("No active document.");
    return;
  }

  var doc = app.activeDocument;
  var selected = [];

  // Grab selected layers (must be 2)
  for (var i = 0; i < doc.layers.length; i++) {
    var layer = doc.layers[i];
    if (layer.selected) {
      selected.push(layer);
    }
  }

  if (selected.length !== 2) {
    alert("❌ Please select exactly two layers to merge.");
    return;
  }

  // Duplicate each
  var dup1 = selected[0].duplicate();
  var dup2 = selected[1].duplicate();

  // Merge dup1 and dup2
  doc.activeLayer = dup2; // make top layer active
  var merged = dup2.merge(dup1); // merge with the one below

  merged.name = "Merged_Layer_Test";
  alert("✅ Merged two layers without affecting originals.");
})();`;

  window.parent.postMessage(script, "*");
}
