function handleAddAnimation() {
  const script = `
    try {
      var doc = app.activeDocument;
      var layers = doc.layers;
      var current = doc.activeLayer;
      var index = layers.indexOf(current);

      if (index < layers.length - 1) {
        var below = layers[index + 1];

        // Step 1: Duplicate the below layer
        var dup = below.duplicate();
        dup.name = "_onion_clone";

        // Step 2: Lock transparency to preserve shape
        dup.transparentPixelsLocked = true;

        // Step 3: Create gray overlay layer
        var grayLayer = doc.artLayers.add();
        grayLayer.name = "gray_overlay";
        doc.activeLayer = grayLayer;

        var gray = new SolidColor();
        gray.rgb.red = 128;
        gray.rgb.green = 128;
        gray.rgb.blue = 128;
        app.foregroundColor = gray;

        app.activeDocument.selection.selectAll();
        app.activeDocument.selection.fill(app.foregroundColor);
        app.activeDocument.selection.deselect();

        grayLayer.blendMode = BlendMode.COLOR;

        // Step 4: Group both into _onion_skin
        var group = doc.layerSets.add();
        group.name = "_onion_skin";
        grayLayer.move(group, ElementPlacement.INSIDE);
        dup.move(group, ElementPlacement.INSIDE);

        // Step 5: Lower opacity of the group
        group.opacity = 40;

        alert("✅ Onion skin added from layer below.");
      } else {
        alert("ℹ️ No layer below to onion skin from.");
      }

    } catch (e) {
      alert("❌ Error: " + e.message);
    }
  `;

  window.parent.postMessage(script, "*");
}
