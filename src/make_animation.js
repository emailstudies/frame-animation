function handleAddAnimation() {
  const script = `
    try {
      var doc = app.activeDocument;
      var sel = doc.activeLayer;

      function isRoot(layer, doc) {
        return layer && layer.parent === doc;
      }

      if (!sel) {
        alert("❗ Nothing is selected. Please deselect everything if you want to create a root-level animation folder.");
      } else {
        var msg = "";

        // Folder vs layer check
        if (sel.layers) {
          msg += "✅ A folder (group) is selected.\\n";
        } else {
          msg += "✅ A regular layer is selected.\\n";
        }

        // Lock status
        if (sel.allLocked) {
          msg += "🔒 The selected item is locked.\\n";
        }

        // Root-level check
        if (isRoot(sel, doc)) {
          msg += "📁 It is at the root level.\\n";
        } else {
          msg += "📂 It is inside a group named: " + sel.parent.name + "\\n";
        }

        alert(msg + "\\nPlease deselect everything before creating an animation folder.");
      }
    } catch (e) {
      alert("❌ Script error: " + e.message);
    }
  `;

  window.parent.postMessage(script, "*");
}
