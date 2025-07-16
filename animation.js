function mergeFrames() {
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

  // Create 3 layers
  createLayer("Frame_3");
  createLayer("Frame_2");
  createLayer("Frame_1");

  // Hide all but Frame_1
  for (var i = 0; i < doc.layers.length; i++) {
    var layer = doc.layers[i];
    layer.visible = (layer.name === "Frame_1");
  }

  // Set global vars for playback
  $.global.frameNames = ["Frame_1", "Frame_2", "Frame_3"];
  $.global.frameCount = $.global.frameNames.length;
  $.global.currentFrameIndex = 0;

  // Define global loop function
  $.global.showNextFrame = function () {
    var layers = app.activeDocument.layers;
    var currentName = $.global.frameNames[$.global.currentFrameIndex];

    for (var i = 0; i < layers.length; i++) {
      var layer = layers[i];
      if (layer.name.startsWith("Frame_")) {
        layer.visible = (layer.name === currentName);
      }
    }

    $.global.currentFrameIndex = ($.global.currentFrameIndex + 1) % $.global.frameCount;
    app.scheduleTask("showNextFrame()", 300, false); // 300ms delay
  };

  // Kick off the loop
  app.scheduleTask("showNextFrame()", 0, false);
})();`.trim();

  window.parent.postMessage(script, "*");
}
