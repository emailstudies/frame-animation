function mergeFrames() {
  const script = `
    (function () {
      // Create a new raster layer using ActionDescriptor
      var desc = new ActionDescriptor();
      var ref = new ActionReference();
      ref.putClass(stringIDToTypeID("layer")); // Create raster layer
      desc.putReference(charIDToTypeID("null"), ref);
      executeAction(charIDToTypeID("Mk  "), desc, DialogModes.NO);

      // Rename the new layer
      var newLayer = app.activeDocument.activeLayer;
      newLayer.name = "Layer_From_Merge_Button";

      alert("✅ New layer created: Layer_From_Merge_Button");
    })();
  `;

  window.parent.postMessage(script.trim(), "*");
}

function exportGif() {
  alert("🕒 No timeline in Photopea. Please export manually via File > Export As > GIF.");
}
