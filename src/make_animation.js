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
        dup.visible = true;

        // Step 2: Lock transparency
        dup.transparentPixelsLocked = true;

        // Step 3: Create darker gray overlay layer
        var grayLayer = doc.artLayers.add();
        grayLayer.name = "gray_overlay";
        doc.activeLayer = grayLayer;

        var gray = new SolidColor();
        gray.rgb.red = 80;
        gray.rgb.green = 80;
        gray.rgb.blue = 80;
        app.foregroundColor = gray;

        app.activeDocument.selection.selectAll();
        app.activeDocument.selection.fill(app.foregroundColor);
        app.activeDocument.selection.deselect();

        grayLayer.blendMode = BlendMode.COLOR;

        // Step 4: Create group and move layers into it
        var group = doc.layerSets.add();
        group.name = "_onion_skin";

        dup.move(group, ElementPlacement.INSIDE);
        grayLayer.move(group, ElementPlacement.PLACEATBEGINNING);

        // Step 5: Reduce group opacity
        group.opacity = 40;

        // Step 6: Hide the original below-layer to avoid color showing through
        below.visible = false;

        alert("✅ Onion skin added with darker gray. Original layer hidden.");
      } else {
        alert("ℹ️ No layer below to create onion skin from.");
      }

    } catch (e) {
      alert("❌ Error: " + e.message);
    }
  `;

  window.parent.postMessage(script, "*");
}
