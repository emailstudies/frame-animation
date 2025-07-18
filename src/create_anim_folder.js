function handleCreateFolder() {
  const input = document.getElementById("animFolderInput");
  const suffix = input ? input.value.trim() : "";

  // Ensure user changed the default value
  if (!suffix || suffix === "walkCycle") {
    alert("❌ Please enter a custom folder name.");
    return;
  }

  const fullName = "anim_" + suffix;

  const script = `
    (function () {
      var doc = app.activeDocument;

      // Check if folder with same full name exists at root
      for (var i = 0; i < doc.layerSets.length; i++) {
        var g = doc.layerSets[i];
        if (g.name === "${fullName}" && g.parent === doc) {
          alert("⚠️ A root-level folder named '${fullName}' already exists.");
          return;
        }
      }

      // Step 1: Create root-level folder
      var groupDesc = new ActionDescriptor();
      var groupRef = new ActionReference();
      groupRef.putClass(stringIDToTypeID("layerSection"));
      groupDesc.putReference(charIDToTypeID("null"), groupRef);

      var nameDesc = new ActionDescriptor();
      nameDesc.putString(charIDToTypeID("Nm  "), "${fullName}");
      groupDesc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("layerSection"), nameDesc);

      executeAction(charIDToTypeID("Mk  "), groupDesc, DialogModes.NO);

      // Step 2: Select the new folder (topmost)
      var selDesc = new ActionDescriptor();
      var selRef = new ActionReference();
      selRef.putIndex(charIDToTypeID("Lyr "), 1);  // Top of stack
      selDesc.putReference(charIDToTypeID("null"), selRef);
      executeAction(charIDToTypeID("slct"), selDesc, DialogModes.NO);

      // Step 3: Create new layer inside selected folder
      var layerDesc = new ActionDescriptor();
      var layerRef = new ActionReference();
      layerRef.putClass(stringIDToTypeID("layer"));
      layerDesc.putReference(charIDToTypeID("null"), layerRef);
      executeAction(charIDToTypeID("Mk  "), layerDesc, DialogModes.NO);

      alert("✅ Created '${fullName}' at root with 'Frame 1' inside.");
    })();
  `;

  window.parent.postMessage(script, "*");
}
