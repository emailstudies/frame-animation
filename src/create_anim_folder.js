function handleCreateFolder() {
  setTimeout(() => {
    const script = `
      var doc = app.activeDocument;
      if (!doc) {
        alert("No document open.");
      } else {
        var sel = doc.activeLayer;
        var isOkayToCreate = true;

        if (sel) {
          var parent = sel.parent;
          if (parent !== doc) {
            isOkayToCreate = false;
            alert("❌ Cannot create folder here.\\n\\nPlease deselect or select a top-level layer/folder.");
          }
        }

        if (isOkayToCreate) {
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
  }, 50); // Delay to ensure selection is updated
}
