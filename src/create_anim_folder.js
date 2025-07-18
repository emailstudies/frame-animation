function handleCreateFolder() {
  const script = `
    try {
      if (typeof app === 'undefined' || !app.activeDocument) {
        alert("No document open.");
      } else {
        var doc = app.activeDocument;
        var selected = doc.getSelectedLayers ? doc.getSelectedLayers() : [];
        var sel = doc.activeLayer;

        if (selected && selected.length > 0) {
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
  }, 200); // give Photopea time to settle
}
