const script = `
  (function () {
    var doc = app.activeDocument;

    // Deselect all layers using Action Descriptor
    var desc = new ActionDescriptor();
    var ref = new ActionReference();
    desc.putReference(charIDToTypeID("null"), ref);
    executeAction(charIDToTypeID("selectNoLayers"), desc, DialogModes.NO);

    // ... rest of your logic
  })();
`;
