function handleCreateFolder() {
  const script = `
    try {
      var doc = app.activeDocument;
      if (!doc) {
        alert("No document open.");
      } else {
        var selected = doc.getSelectedLayers();
        var sel = doc.activeLayer;

        if (selected.length > 0) {
          var summary = selected.map((l, i) => {
            var type = l.isFolder ? "Folder" : "Layer";
            var name = "(Unnamed)";
            try { name = l.name; } catch (e) {}
            return type + " #" + (i+1) + ": " + name;
          }).join("\\n");
          alert("Selected layers:\\n" + summary);

        } else if (sel) {
          var type = sel.isFolder ? "Folder" : "Layer";
          var name = "(Unnamed)";
          try { name = sel.name; } catch (e) {}
          alert("Fallback to active layer:\\n" + type + ": " + name);

        } else {
          alert("Nothing is selected.");
        }
      }
    } catch (e) {
      alert("Script error: " + e.message);
    }
  `;

  setTimeout(() => {
    window.parent.postMessage(script, "*");
  }, 200);
}
