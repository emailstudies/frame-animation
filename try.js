function exportGif() {
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

  // Step 1: Create 3 layers for animation
  createLayer("Frame_3");
  createLayer("Frame_2");
  createLayer("Frame_1");

  // Step 2: Hide all layers except Frame_1
  for (var i = 0; i < doc.layers.length; i++) {
    var layer = doc.layers[i];
    layer.visible = (layer.name === "Frame_1");
  }

  // Step 3: Start fake playback loop
  var frameNames = ["Frame_1", "Frame_2", "Frame_3"];
  var frameCount = frameNames.length;
  var current = 0;

  function showNextFrame() {
    for (var i = 0; i < doc.layers.length; i++) {
      var layer = doc.layers[i];
      if (layer.name.startsWith("Frame_")) {
        layer.visible = (layer.name === frameNames[current]);
      }
    }

    current = (current + 1) % frameCount;
    app.scheduleTask("showNextFrame()", 500, false); // 500ms delay
  }

  app.scheduleTask("showNextFrame()", 0, false);
})();`.trim();

  window.parent.postMessage(script, "*");
}
