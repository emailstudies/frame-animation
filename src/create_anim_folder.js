function handleCreateFolder() {
  const script = `
    var doc = app.activeDocument;
    if (!doc) {
      alert("No document open.");
    } else {
      var sel = doc.activeLayer;
      var docName = doc.name;

      var isAtRoot = (!sel || (sel.parent && sel.parent.name === docName));

      if (isAtRoot) {
        // Create folder
        var desc = new ActionDescriptor();
        var ref = new ActionReference();
        ref.putClass(stringIDToTypeID("layerSection")); // Folder class
        desc.putReference(charIDToTypeID("null"), ref);

        var nameDesc = new ActionDescriptor();
        nameDesc.putString(stringIDToTypeID("name"), "anim_1");
        desc.putObject(stringIDToTypeID("using"), stringIDToTypeID("layerSection"), nameDesc);

        executeAction(charIDToTypeID("Mk  "), desc, DialogModes.NO);

        // Create layer inside newly created folder
        var folder = doc.activeLayer;
        if (folder && typeof folder.layers !== "undefined") {
          var layerDesc = new ActionDescriptor();
          var layerRef = new ActionReference();
          layerRef.putClass(charIDToTypeID("ArtLayer"));
          layerDesc.putReference(charIDToTypeID("null"), layerRef);

          executeAction(charIDToTypeID("Mk  "), layerDesc, DialogModes.NO);

          alert("✅ Folder 'anim_1' created with a layer inside.");
        } else {
          alert("⚠️ Folder creation failed.");
        }
      } else {
        var pname = sel && sel.parent ? sel.parent.name : "unknown";
        alert("❌ Cannot create folder. Selected item's parent is: '" + pname + "'.\\nPlease deselect or select a top-level layer or folder.");
      }
    }
  `;
  window.parent.postMessage(script, "*");
}
