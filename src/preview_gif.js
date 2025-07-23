function previewGif() {
  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) {
        alert("No active document.");
        return;
      }

      var fps = 24;
      var delay = 1000 / fps;
      var frameIndex = 0;
      var animFolder = null;

      // Get the first anim_* folder
      for (var i = 0; i < doc.layers.length; i++) {
        var layer = doc.layers[i];
        if (layer.typename === "LayerSet" && layer.name.startsWith("anim_")) {
          animFolder = layer;
          break;
        }
      }

      if (!animFolder) {
        alert("No animation folder found.");
        return;
      }

      var frames = [];
      for (var j = 0; j < animFolder.layers.length; j++) {
        var subLayer = animFolder.layers[j];
        if (subLayer.typename !== "LayerSet" && !subLayer.locked && subLayer.visible) {
          frames.push(subLayer);
        }
      }

      if (frames.length < 2) {
        alert("Need at least 2 visible and unlocked frame layers.");
        return;
      }

      // Hide all frames initially
      for (var f = 0; f < frames.length; f++) {
        frames[f].visible = false;
      }

      // Store interval ID globally in app object
      if (!app._framePreviewIntervalId) {
        app._framePreviewIntervalId = setInterval(function () {
          // Hide all
          for (var f = 0; f < frames.length; f++) {
            frames[f].visible = false;
          }
          // Show current
          frames[frameIndex].visible = true;
          frameIndex = (frameIndex + 1) % frames.length;
        }, delay);
        alert("▶️ Preview started at 24 FPS.");
      } else {
        alert("⚠️ Preview already running.");
      }
    })();
  `;
  window.parent.postMessage(script, "*");
}
