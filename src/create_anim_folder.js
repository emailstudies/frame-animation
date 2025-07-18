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

      // Check if folder exists
      for (var i = 0; i < doc.layerSets.length; i++) {
        var g = doc.layerSets[i];
        if (g.name === "${fullName}" && g.parent === doc) {
          alert("⚠️ A root-level folder named '${fullName}' already exists.");
          return;
        }
      }

      // Create folder
      var desc = new ActionDescriptor();
      var ref = new ActionReference();
      ref.putClass(stringIDToTypeID("layerSection"));
      desc.putReference(charIDToTypeID("null"), ref);

      var nameDesc = new ActionDescriptor();
      nameDesc.putString(charIDToTypeID("Nm  "), "${fullName}");
      desc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("layerSection"), nameDesc);

      executeAction(charIDToTypeID("Mk  "), desc, DialogModes.NO);

      // Add layer inside folder
      var layerDesc = new ActionDescriptor();
      var layerRef = new ActionReference();
      layerRef.putClass(stringIDToTypeID("layer"));
      layerDesc.putReference(charIDToTypeID("null"), layerRef);
      executeAction(charIDToTypeID("Mk  "), layerDesc, DialogModes.NO);

      alert("✅ Created folder '${fullName}' with one layer.");
    })();
  `;

  window.parent.postMessage(script.trim(), "*");
}
