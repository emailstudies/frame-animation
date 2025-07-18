function handleCreateFolder() {
  setTimeout(() => {
    const script = `
      var doc = app.activeDocument;
      if (!doc) {
        alert("No document open.");
      } else {
        var sel = doc.activeLayer;

        var allow = true;

        if (sel) {
          var isRoot = sel.parent === doc;
          if (!isRoot) {
            alert("❌ Selected item is inside a folder.\\n\\nPlease deselect or select a top-level item to create a new folder at root.");
            allow = false;
          }
        }

        if (allow) {
          // ✅ Create folder
          var desc = new ActionDescriptor();
          var ref = new ActionReference();
          ref.putClass(stringIDToTypeID("layerSection"));
          desc.putReference(charIDToTypeID("null"), ref);

          var nameDesc = new ActionDescriptor();
          nameDesc.putString(stringIDToTypeID("name"), "anim_1");
          desc.putObject(stringIDToTypeID("using"), stringIDToTypeID("layerSection"), nameDesc);

          executeAction(charIDToTypeID("Mk  "), desc, DialogModes.NO);
          alert("✅ Created folder 'anim_1' at root.");
        }
      }
    `;
    window.parent.postMessage(script, "*");
  }, 50);
}
