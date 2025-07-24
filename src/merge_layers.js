function previewGif() {
  const script = `
(function () {
  var doc = app.activeDocument;

  function createLayer(name) {
    var desc = new ActionDescriptor();
    var ref = new ActionReference();
    ref.putClass(stringIDToTypeID("layer"));
    desc.putReference(charIDToTypeID("null"), ref);
    executeAction(charIDToTypeID("Mk  "), desc, DialogModes.NO);
    app.activeDocument.activeLayer.name = name;
  }

  // Create 3 layers for animation
  createLayer("Frame_3");
  createLayer("Frame_2");
  createLayer("Frame_1");

  // Hide all layers except Frame_1
  for (var i = 0; i < doc.layers.length; i++) {
    var layer = doc.layers[i];
    layer.visible = (layer.name === "Frame_1");
  }

  alert("🎬 Created 3 frames. Showing Frame_1 only.");
})();`.trim();

  window.parent.postMessage(script, "*");
}

function showFrameByName(name = "Frame_1") {
  const script = `
(function () {
  var doc = app.activeDocument;
  var found = false;

  for (var i = 0; i < doc.layers.length; i++) {
    var layer = doc.layers[i];
    if (layer.name.startsWith("Frame_")) {
      layer.visible = (layer.name === "${name}");
      if (layer.visible) found = true;
    }
  }

  alert(found ? "🖼️ Showing: ${name}" : "❌ Frame not found: ${name}");
})();`.trim();

  window.parent.postMessage(script, "*");
}

function exportGif() {
  const script = `
(function () {
  alert("📤 Plugin working: Please export manually via File > Export As > GIF.");
})();`.trim();

  window.parent.postMessage(script, "*");
}
