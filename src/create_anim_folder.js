function handleCreateFolder() {
  const script = `
    try {
      if (!app || !app.activeDocument) {
        alert("No document open.");
      } else {
        var doc = app.activeDocument;
        var sel = doc.activeLayer;

        if (!sel) {
          // ✅ Nothing is selected — use Action Descriptor to create a new layer
          var desc = new ActionDescriptor();
          var ref = new ActionReference();
          ref.putClass(stringIDToTypeID("layer"));
          desc.putReference(charIDToTypeID("null"), ref);
          executeAction(charIDToTypeID("Mk  "), desc, DialogModes.NO);

          alert("Nothing was selected. A new layer has been created safely.");
        } else {
          // ✅ Something is selected — alert type
          var type = "Layer";
          try { if (sel.isFolder) type = "Folder"; } catch (e) {}
          alert("You selected a " + type + ".");
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
