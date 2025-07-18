function handleCreateFolder() {
  const input = document.getElementById("animFolderInput");
  const suffix = input ? input.value.trim() : "";

  // Ensure user actually changed the default value
  if (!suffix || suffix === "walkCycle") {
    alert("❌ Please enter a custom folder name.");
    return;
  }

  const fullName = "anim_" + suffix;

  const script = `
    (function () {
      var doc = app.activeDocument;

      // Check if a folder with the same name already exists at root level
      for (var i = 0; i < doc.layerSets.length; i++) {
        var g = doc.layerSets[i];
        if (g.name === "${fullName}" && g.parent === doc) {
          alert("⚠️ A root-level folder named '${fullName}' already exists.");
          return;
        }
      }

      // Create a root-level folder with ActionDescriptor
      var desc = new ActionDescriptor();
      var ref = new ActionReference();
      ref.putClass(stringIDToTypeID("layerSection"));
      desc.putReference(charIDToTypeID("null"), ref);

      var nameDesc = new ActionDescriptor();
      nameDesc.putString(charIDToTypeID("Nm  "), "${fullName}");
      desc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("layerSection"), nameDesc);

      executeAction(charIDToTypeID("Mk  "), desc, DialogModes.NO);

      alert("✅ Created root-level folder: '${fullName}'");
    })();
  `;

  window.parent.postMessage(script, "*");
}
