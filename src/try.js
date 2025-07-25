function exportGif() {
  const script = `
    (function () {
      var doc = app.activeDocument;

      // Step 1: Duplicate the document
      var dupDoc = doc.duplicate();
      app.activeDocument = dupDoc;

      // Step 2: Rename the duplicate (optional)
      dupDoc.name = doc.name + " - Duplicated";

      alert("✅ Document duplicated successfully.");
    })();
  `;

  window.parent.postMessage(script, "*");
}
