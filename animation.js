function mergeFrames() {
  const script = `
(function () {
  var doc = app.activeDocument;
  var frameLayers = [];

  // Collect Frame_ layers
  for (var i = 0; i < doc.layers.length; i++) {
    var layer = doc.layers[i];
    if (layer.name.startsWith("Frame_")) {
      frameLayers.push(layer);
    }
  }

  if (frameLayers.length === 0) {
    alert("⚠️ No Frame_ layers found.");
    return;
  }

  var total = frameLayers.length;
  var current = 0;
  var loopsRemaining = 4 * total; // Show each frame 4 times

  function showNextFrame() {
    for (var i = 0; i < total; i++) {
      var layer = frameLayers[i];
      if (!layer.allLocked) {
        layer.visible = (i === current);
      }
    }

    current = (current + 1) % total;
    loopsRemaining--;

    if (loopsRemaining > 0) {
      app.scheduleTask("showNextFrame()", 300, false); // 300ms delay
    } else {
      alert("✅ Frame preview complete.");
    }
  }

  app.scheduleTask("showNextFrame()", 0, false);
})();`.trim();

  window.parent.postMessage(script, "*");
}
