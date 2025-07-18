function handleCreateFolder() {
  const script = `
    try {
      var doc = app.activeDocument;
      var sel = doc.activeLayer;

     
        var isFolder = typeof sel.layers !== "undefined";
        var isRootLevel = sel.parent === doc;

        if (isFolder && isRootLevel) {
          // ✅ Create folder
          var desc = new ActionDescriptor();
          var ref = new ActionReference();
          ref.putClass(stringIDToTypeID("layerSection"));
          desc.putReference(charIDToTypeID("null"), ref);

          var nameDesc = new ActionDescriptor();
          nameDesc.putString(stringIDToTypeID("name"), "anim_1");
          desc.putObject(stringIDToTypeID("using"), stringIDToTypeID("layerSection"), nameDesc);

          executeAction(charIDToTypeID("Mk  "), desc, DialogModes.NO);

          // 📌 Move new folder to the top (index 0)
          var newFolder = doc.activeLayer; // last created = active
          if (newFolder) {
            doc.layers.move(newFolder, 0);
          }
        } else {
          // ❌ Not a top-level folder
          alert("Created folder should be top level — please deselect everything by clicking on canvas.");
        }
      }
    } catch (e) {
      alert("Script error: " + e.message);
    }
  `;

  window.parent.postMessage(script, "*");
}
