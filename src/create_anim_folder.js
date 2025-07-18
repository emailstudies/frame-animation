function handleCreateFolder() {
  const input = document.getElementById("animFolderInput");
  const suffix = input ? input.value.trim() : "";

  if (!suffix || suffix === "walkCycle") {
    alert("❌ Please enter a custom folder name.");
    return;
  }

  const fullName = "anim_" + suffix;

  const script = `
    (function () {
      var doc = app.activeDocument;

      // Deselect everything to ensure root-level creation
      while (app.activeDocument.activeLayer) {
        try {
          app.activeDocument.activeLayer = null;
        } catch (e) {
          break;
        }
      }

      // Check for existing folder with the same full name at root level
      for (var i = 0; i < doc.layerSets.length; i++) {
        var g = doc.layerSets[i];
        if (g.name === "${fullName}" && g.parent === doc) {
          alert("⚠️ A root-level folder named '${fullName}' already exists.");
          return;
        }
      }

      // 1. Create folder
      var desc = new ActionDescriptor();
      var ref = new ActionReference();
      ref.putClass(stringIDToTypeID("layerSection"));
      desc.putReference(charIDToTypeID("null"), ref);

      var nameDesc = new ActionDescriptor();
      nameDesc.putString(charIDToTypeID("Nm  "), "${fullName}");
      desc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("layerSection"), nameDesc);

      executeAction(charIDToTypeID("Mk  "), desc, DialogModes.NO);

      // 2. Select newly created folder
      var group = doc.layerSets.getByName("${fullName}");
      doc.activeLayer = group;

      // 3. Create a new layer inside the group
      var layerDesc = new ActionDescriptor();
      var layerRef = new ActionReference();
      layerRef.putClass(stringIDToTypeID("artLayer"));
      layerDesc.putReference(charIDToTypeID("null"), layerRef);
      executeAction(charIDToTypeID("Mk  "), layerDesc, DialogModes.NO);

      // 4. Move new layer into the group
      var newLayer = doc.activeLayer;
      newLayer.move(group, ElementPlacement.INSIDE);

      alert("✅ Created '${fullName}' at root with 1 frame layer.");
    })();
  `;

  window.parent.postMessage(script, "*");
}
