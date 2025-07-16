function handleAddAnimation() {
  const script = `
    try {
      var doc = app.activeDocument;
      var sel = doc.activeLayer;

      if (!sel) {
        alert("Nothing is selected.");
      } else {
        var msg = "";

        if (sel.typename === "LayerSet") {
          msg += "✅ A folder (LayerSet) is selected.\\n";
        } else {
          msg += "✅ A pixel layer is selected.\\n";
        }

        if (sel.allLocked || sel.pixelsLocked) {
          msg += "🔒 The selected item is locked.\\n";
        }

        if (sel.parent && sel.parent.typename === "LayerSet") {
          msg += "📂 It is inside a folder named: " + sel.parent.name + "\\n";
        } else {
          msg += "📁 It is at the root level.\\n";
        }

        alert(msg);
      }
    } catch (e) {
      alert("Error while detecting selected item: " + e.message);
    }
  `;

  window.parent.postMessage(script, "*");
}
