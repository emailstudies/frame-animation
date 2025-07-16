function mergeFrames() {
  const script = `
(function () {
  var doc = app.activeDocument;

  // Get all frame layer names in order
  var frameNames = [];
  for (var i = 0; i < doc.layers.length; i++) {
    var layer = doc.layers[i];
    if (layer.name.startsWith("Frame_")) {
      frameNames.unshift(layer.name); // reverse order (top layer is frame 1)
    }
  }

  if (frameNames.length === 0) {
    alert("⚠️ No layers starting with 'Frame_' found.");
    return;
  }

  // Fallback: define $.global if it doesn't exist
  if (typeof $.global === "undefined") {
    $.global = {};
  }

  $.global.frameNames = frameNames;
  $.global.frameCount = frameNames.length;
  $.global.currentFrameIndex = 0;
  $.global.remainingLoops = 4 * frameNames.length; // 4 loops

  $.global.showNextFrame = function () {
    if ($.global.remainingLoops <= 0) {
      alert("✅ Animation finished looping 4 times.");
      return;
    }

    var layers = app.activeDocument.layers;
    var currentName = $.global.frameNames[$.global.currentFrameIndex];

    for (var i = 0; i < layers.length; i++) {
      var layer = layers[i];
      if (layer.name.startsWith("Frame_")) {
        layer.visible = (layer.name === currentName);
      }
    }

    $.global.currentFrameIndex = ($.global.currentFrameIndex + 1) % $.global.frameCount;
    $.global.remainingLoops--;

    app.scheduleTask("showNextFrame()", 300, false);
  };

  app.scheduleTask("showNextFrame()", 0, false);
})();`.trim();

  window.parent.postMessage(script, "*");
}
