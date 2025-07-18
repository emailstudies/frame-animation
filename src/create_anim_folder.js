function handleCreateFolder() {
  const input = document.getElementById("animNameInput");
  const suffix = input ? input.value.trim() : "";

  if (!suffix || suffix === "walkCycle") {
    alert("❌ Please enter a custom folder name.");
    return;
  }

  const fullName = "anim_" + suffix;

  const script = `
    (function () {
      var doc = app.activeDocument;

      // Check if a root-level folder with the same name already exists
      for (var i = 0; i < doc.layerSets.length; i++) {
        var g = doc.layerSets[i];
        if (g.name === "${fullName}" && g.parent === doc) {
          alert("⚠️ A root-level folder named '${fullName}' already exists.");
          return;
        }
      }

      // Create a new layer first (this will ensure it's at root level)
      var layerDesc = new ActionDescriptor();
      var layerRef = new ActionReference();
      layerRef.putClass(stringIDToTypeID("layer"));
      layerDesc.putReference(charIDToTypeID("null"), layerRef);
      executeAction(charIDToTypeID("Mk  "), layerDesc, DialogModes.NO);

      // Create a root-level folder
      var folderDesc = new ActionDescriptor();
      var folderRef = new ActionReference();
      folderRef.putClass(stringIDToTypeID("layerSection"));
      folderDesc.putReference(charIDToTypeID("null"), folderRef);

      var nameDesc = new ActionDescriptor();
      nameDesc.putString(charIDToTypeID("Nm  "), "${fullName}");
      folderDesc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("layerSection"), nameDesc);

      executeAction(charIDToTypeID("Mk  "), folderDesc, DialogModes.NO);

      alert("✅ Created root-level folder: '${fullName}' with a new layer inside.");
    })();
  `;

  window.parent.postMessage(script, "*");
}
