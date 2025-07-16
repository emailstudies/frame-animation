function handleAddAnimation() {
  const script = `
    try {
      var doc = app.activeDocument;
      var sel = doc.activeLayer;

      if (!sel) {
        alert("❗ Nothing is selected.");
      } else {
        var msg = "";

        // Kind detection (folder vs layer)
        if (sel.layers) {
          msg += "✅ A folder (group) is selected.\\n";
        } else {
          msg += "✅ A pixel or regular layer is selected.\\n";
        }

        // Check lock (this works in most cases)
        if (sel.allLocked) {
          msg += "🔒 The layer is locked.\\n";
        }

        // Check nesting
        var parent = sel.parent;
        if (parent && parent.name && parent !== doc) {
          msg += "📂 It is inside folder: " + parent.name + "\\n";
        } else {
          msg += "📁 It is at the root level.\\n";
        }

        alert(msg);
      }
    } catch (e) {
      alert("❌ Error: " + e.message);
    }
  `;

  window.parent.postMessage(script, "*");
}
