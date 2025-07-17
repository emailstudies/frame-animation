function handleAddAnimation() {
  const script = `
    try {
      var doc = app.activeDocument;
      var sel = doc.activeLayer;

      function isRoot(layer, doc) {
        return layer && layer.parent === doc;
      }

      if (sel) {
        var msg = "";

        if (sel.layers) {
          msg += "✅ A folder (group) is selected.\\n";
        } else {
          msg += "✅ A regular layer is selected.\\n";
        }

        if (sel.allLocked) {
          msg += "🔒 The selected item is locked.\\n";
        }

        if (isRoot(sel, doc)) {
          msg += "📁 It is at the root level.\\n";
        } else {
          msg += "📂 It is inside a group named: " + sel.parent.name + "\\n";
        }

        alert(msg + "\\n❗ Please deselect everything before creating an animation folder.");
      } else {
        // No selection – proceed with folder creation
        var folderName = "anim_untitled";
        var groupDesc = new ActionDescriptor();
        var ref = new ActionReference();
        ref.putClass(stringIDToTypeID("layerSection"));
        groupDesc.putReference(charIDToTypeID("null"), ref);

        var props = new ActionDescriptor();
        props.putString(charIDToTypeID("Nm  "), folderName);
        groupDesc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("layerSection"), props);
        executeAction(charIDToTypeID("Mk  "), groupDesc, DialogModes.NO);

        var layerDesc = new ActionDescriptor();
        var layerRef = new ActionReference();
        layerRef.putClass(charIDToTypeID("Lyr "));
        layerDesc.putReference(charIDToTypeID("null"), layerRef);

        var layerProps = new ActionDescriptor();
        layerProps.putString(charIDToTypeID("Nm  "), "Frame 1");
        layerDesc.putObject(charIDToTypeID("Usng"), charIDToTypeID("Lyr "), layerProps);
        executeAction(charIDToTypeID("Mk  "), layerDesc, DialogModes.NO);

        var newLayer = app.activeDocument.activeLayer;
        var group = newLayer.parent.layers[0];
        newLayer.move(group, ElementPlacement.INSIDE);

        alert("✅ Animation folder created.");
      }
    } catch (e) {
      alert("❌ Script error: " + e.message);
    }
  `;

  window.parent.postMessage(script, "*");
}
