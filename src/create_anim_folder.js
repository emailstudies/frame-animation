function createAnimFolderAtRoot() {
  const script = `
    (function () {
      function createTempFolderAndGetIndex(doc) {
        var tempFolder = doc.layerSets.add();
        tempFolder.name = "temp_check_folder";

        var index = -1;
        for (var i = 0; i < doc.layers.length; i++) {
          if (doc.layers[i].name === "temp_check_folder") {
            index = i;
            break;
          }
        }

        var isRoot = (tempFolder.parent.name === doc.name);
        tempFolder.remove();

        return { isRoot: isRoot, index: index };
      }

      function createFolderAtIndex(name) {
        var desc = new ActionDescriptor();
        var ref = new ActionReference();
        ref.putClass(stringIDToTypeID("layerSection"));
        desc.putReference(charIDToTypeID("null"), ref);

        var props = new ActionDescriptor();
        props.putString(charIDToTypeID("Nm  "), name);
        desc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("layerSection"), props);

        executeAction(charIDToTypeID("Mk  "), desc, DialogModes.NO);
        return app.activeDocument.activeLayer;
      }

      function createFrameInside(folder, frameName) {
        var desc = new ActionDescriptor();
        var ref = new ActionReference();
        ref.putClass(charIDToTypeID("Lyr "));
        desc.putReference(charIDToTypeID("null"), ref);

        var props = new ActionDescriptor();
        props.putString(charIDToTypeID("Nm  "), frameName);
        desc.putObject(charIDToTypeID("Usng"), charIDToTypeID("Lyr "), props);

        executeAction(charIDToTypeID("Mk  "), desc, DialogModes.NO);

        var newLayer = app.activeDocument.activeLayer;
        newLayer.move(folder, ElementPlacement.INSIDE);
      }

      // MAIN EXECUTION
      var doc = app.activeDocument;
      var result = createTempFolderAndGetIndex(doc);

      if (!result.isRoot) {
        alert("❌ Folder would not be at root. Please deselect nested items.");
        return;
      }

      var animFolder = createFolderAtIndex("anim_auto");

      if (result.index > 0) {
        var belowLayer = doc.layers[result.index - 1];
        animFolder.move(belowLayer, ElementPlacement.PLACEAFTER);
      }

      createFrameInside(animFolder, "Frame 1");
      alert("✅ Folder and Frame 1 created.");
    })();
  `;

  window.parent.postMessage(script, "*");
}
