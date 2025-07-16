function handleAddAnimation() {
  const script = `
    try {
      var doc = app.activeDocument;
      var sel = doc.activeLayer;

      function isRoot(layer, doc) {
        return layer && layer.parent === doc;
      }

      if (!sel) {
        alert("❗ Nothing is selected.");
      } else {
        var msg = "";

        if (sel.layers) {
          msg += "✅ A folder is selected.\\n";
        } else {
          msg += "✅ A regular layer is selected.\\n";
        }

        if (sel.allLocked) {
          msg += "🔒 The layer is locked.\\n";
        }

        if (isRoot(sel, doc)) {
          msg += "📁 It is at the root level.\\n";
        } else {
          msg += "📂 It is inside a group named: " + sel.parent.name + "\\n";
        }

        alert(msg);
      }
    } catch (e) {
      alert("❌ Error: " + e.message);
    }
  `;

  window.parent.postMessage(script, "*");
}
