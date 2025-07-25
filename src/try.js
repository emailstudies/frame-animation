function exportGif() {
  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) {
        alert("No active document.");
        return;
      }

      // Step 1: Find Layer 1 and Layer 2
      var layer1 = null;
      var layer2 = null;
      for (var i = 0; i < doc.layers.length; i++) {
        var layer = doc.layers[i];
        if (!layer1 && layer.name === "Layer 1" && layer.typename !== "LayerSet") {
          layer1 = layer;
        } else if (!layer2 && layer.name === "Layer 2" && layer.typename !== "LayerSet") {
          layer2 = layer;
        }
      }

      if (!layer1 || !layer2) {
        alert("Layer 1 or Layer 2 not found.");
        return;
      }

      // Step 2: Duplicate both
      var dup1 = layer1.duplicate();
      var dup2 = layer2.duplicate();

      // Step 3: Move both to top
      dup1.move(doc, ElementPlacement.PLACEATBEGINNING);
      dup2.move(doc, ElementPlacement.PLACEATBEGINNING);

      // Step 4: Select duplicates by name using ActionDescriptor
      function selectLayer(name, add) {
        var desc = new ActionDescriptor();
        var ref = new ActionReference();
        ref.putName(charIDToTypeID("Lyr "), name);
        desc.putReference(charIDToTypeID("null"), ref);
        if (add) desc.putEnumerated(charIDToTypeID("selectionModifier"), charIDToTypeID("selectionModifierType"), charIDToTypeID("addToSelection"));
        desc.putBoolean(charIDToTypeID("MkVs"), false);
        executeAction(charIDToTypeID("slct"), desc, DialogModes.NO);
      }

      selectLayer(dup1.name, false);
      selectLayer(dup2.name, true);

      // Step 5: Merge
      executeAction(charIDToTypeID("Mrg2"), undefined, DialogModes.NO);

      app.activeDocument.activeLayer.name = "Merged Layer";

      console.log("✅ Forced merge of Layer 1 and Layer 2 via ActionDescriptor");
    })();
  `;

  window.parent.postMessage(script, "*");
}
