function exportGif() {
  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) {
        alert("No active document.");
        return;
      }

      if (!doc.activeLayers || doc.activeLayers.length !== 2) {
        alert("❌ Please select exactly 2 layers.");
        return;
      }

      // Merge the two selected layers
      executeAction(charIDToTypeID("Mrg2"), undefined, DialogModes.NO);

      // Rename the result
      doc.activeLayer.name = "_a_MergedLayer";

      alert("✅ Merged two layers into: " + doc.activeLayer.name);
    })();
  `;
  window.parent.postMessage(script, "*");
}
