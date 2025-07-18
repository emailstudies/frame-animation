function handleCreateFolder() {
  const script = `
    try {
      if (!app || !app.activeDocument) {
        alert("No document open.");
        return;
      }

      var doc = app.activeDocument;
      var selected = doc.getSelectedLayers ? doc.getSelectedLayers() : [];
      var sel = doc.activeLayer;

      if (selected && selected.length > 0) {
        alert("Selected using getSelectedLayers(). Count: " + selected.length);
      } else if (sel) {
        if (sel.locked || !sel.visible) {
          alert("Selected layer is locked or hidden.");
        } else {
          var name = "(Unnamed)";
          try { name = sel.name; } catch (e) {}
          var type = sel.isFolder ? "Folder" : "Layer";
          alert("Fallback selection: " + type + " → " + name);
        }
      } else {
        alert("Nothing is selected.");
      }

    } catch (e) {
      alert("Script error: " + e.message);
    }
  `;

  setTimeout(() => {
    window.parent.postMessage(script, "*");
  }, 200);
}
