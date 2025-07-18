function handleCreateFolder() {
  const script = `
    try {
      if (!app || !app.activeDocument) {
        alert("No document open.");
      } else {
        var doc = app.activeDocument;
        var sel = doc.activeLayer;

        if (!sel) {
          // ✅ Nothing selected → add a layer
          var newLayer = doc.createLayer();
          newLayer.name = "Auto Layer";
          alert("Nothing was selected. A new layer was created.");
        } else {
          // ✅ Something selected → alert type and name
          var type = sel.isFolder ? "Folder" : "Layer";
          var name = "(Unnamed)";
          try { name = sel.name; } catch (e) {}
          alert("You selected a " + type + " named: " + name);
        }
      }
    } catch (e) {
      alert("Script error: " + e.message);
    }
  `;

  setTimeout(() => {
    window.parent.postMessage(script, "*");
  }, 50);
}
