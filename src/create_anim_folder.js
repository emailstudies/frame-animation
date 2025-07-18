function handleCreateFolder() {
  const input = document.getElementById("animNameInput");
  const suffix = input ? input.value.trim() : "";

  // Block default or empty input
  if (!suffix || suffix === "walkCycle") {
    alert("❌ Please enter a custom folder name.");
    return;
  }

  const fullName = "anim_" + suffix;

  const script = `
    (function () {
      var doc = app.activeDocument;

      // Check if folder with same name exists at root
      for (var i = 0; i < doc.layerSets.length; i++) {
        var g = doc.layerSets[i];
        if (g.name === "${fullName}" && g.parent === doc) {
          alert("⚠️ A root-level folder named '${fullName}' already exists.");
          return;
        }
      }

      // Create folder at root level
      var folderDesc = new ActionDescriptor();
      var folderRef = new ActionReference();
      folderRef.putClass(stringIDToTypeID("layerSection"));
      folderDesc.putReference(charIDToTypeID("null"), folderRef);

      var nameDesc = new ActionDescriptor();
      nameDesc.putString(charIDToTypeID("Nm  "), "${fullName}");
      folderDesc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("layerSection"), nameDesc);

      executeAction(charIDToTypeID("Mk  "), folderDesc, DialogModes.NO);

      // Select the newly created folder
      var folder = doc.layerSets.getByName("${fullName}");

      // Create a layer inside the folder
      var newLayer = folder.artLayers.add();
      newLayer.name = "Frame 1";

      alert("✅ Created folder '${fullName}' with a default layer.");
    })();
  `;

  window.parent.postMessage(script, "*");
}
