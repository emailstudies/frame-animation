function handleCreateFolder() {
  const script = `
    var doc = app.activeDocument;
    if (!doc) {
      alert("No document is open.");
    } else {
      var sel = doc.activeLayer;
      var docName = doc.name;

      if (!sel || sel.parent.name === docName) {
        // ✅ Nothing selected or top-level item selected → create folder
        var desc = new ActionDescriptor();
        var ref = new ActionReference();
        ref.putClass(stringIDToTypeID("layerSection"));
        desc.putReference(charIDToTypeID("null"), ref);

        var nameDesc = new ActionDescriptor();
        nameDesc.putString(stringIDToTypeID("name"), "anim_1");
        desc.putObject(stringIDToTypeID("using"), stringIDToTypeID("layerSection"), nameDesc);

        executeAction(charIDToTypeID("Mk  "), desc, DialogModes.NO);

        // ⏱ Delay to ensure folder is created before adding the layer
        setTimeout(function () {
          var newFolder = app.activeDocument.activeLayer; // The folder just created becomes active

          if (newFolder && typeof newFolder.layers !== "undefined") {
            var layerDesc = new ActionDescriptor();
            var layerRef = new ActionReference();
            layerRef.putClass(charIDToTypeID("ArtLayer"));
            layerDesc.putReference(charIDToTypeID("null"), layerRef);

            executeAction(charIDToTypeID("Mk  "), layerDesc, DialogModes.NO);

            // Move the layer into the new folder
            var newLayer = app.activeDocument.activeLayer;
            newLayer.move(newFolder, ElementPlacement.INSIDE);

            alert("✅ Created folder 'anim_1' with a layer inside.");
          } else {
            alert("⚠️ Could not add layer — folder creation failed.");
          }
        }, 10);
      } else {
        alert("❌ Cannot create folder here.\\nParent is: '" + sel.parent.name + "' (not the document).\\n\\nPlease deselect or select a top-level item.");
      }
    }
  `;
  window.parent.postMessage(script, "*");
}
