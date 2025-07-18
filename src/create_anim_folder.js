function handleCreateFolder() {
  const input = document.getElementById("animNameInput");
  const suffix = input ? input.value.trim() : "";

  if (!suffix) {
    alert("❌ Please enter a folder name.");
    return;
  }

  const fullName = "anim_" + suffix;

  const script = `
    (function () {
      var doc = app.activeDocument;
      // Check for existing root-level folder
      for (var i = 0; i < doc.layerSets.length; i++) {
        var g = doc.layerSets[i];
        if (g.name === "${fullName}" && g.parent === doc) {
          alert("⚠️ A root-level folder named '${fullName}' already exists.");
          return;
        }
      }

      // Create root-level group using ActionDescriptor
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
