function handleAddAnimation() {
  const script = `
    try {
      var doc = app.activeDocument;
      var layer = doc.activeLayer;

      // Lock transparency to preserve only visible pixels
      layer.transparentPixelsLocked = true;

      // Set foreground color to black
      var color = new SolidColor();
      color.rgb.red = 0;
      color.rgb.green = 0;
      color.rgb.blue = 0;
      app.foregroundColor = color;

      // Fill the visible parts of the layer with black
      app.activeDocument.selection.selectAll();
      app.activeDocument.selection.fill(app.foregroundColor);

      // Unlock transparency again
      layer.transparentPixelsLocked = false;

      alert("✅ Layer contents replaced with black.");
    } catch (e) {
      alert("❌ Error: " + e.message);
    }
  `;

  window.parent.postMessage(script, "*");
}
