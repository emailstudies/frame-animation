function handleCreateFolder() {
  const input = document.getElementById("animNameInput");
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

      // ✅ Step 1: Deselect all by selecting & deleting a temporary group
      var desc = new ActionDescriptor();
      var ref = new ActionReference();
      ref.putClass(stringIDToTypeID("layerSection"));
      desc.putReference(charIDToTypeID("null"), ref);
      var nameDesc = new ActionDescriptor();
      nameDesc.putString(charIDToTypeID("Nm  "), "__temp_deselect__");
      desc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("layerSection"), nameDesc);
      executeAction(charIDToTypeID("Mk  "), desc, DialogModes.NO);

      var delRef = new ActionReference();
      delRef.putName(stringIDToTypeID("layerSection"), "__temp_deselect__");
      var delDesc = new ActionDescriptor();
      delDesc.putReference(charIDToTypeID("null"), delRef);
      executeAction(charIDToTypeID("Dlt "), delDesc, DialogModes.NO);

      // ✅ Step 2: Check for root-level duplicate
      for (var i = 0; i < doc.layerSets.length; i++) {
        var g = doc.layerSets[i];
        if (g.name === "${fullName}" && g.parent === doc) {
          alert("⚠️ A root-level folder named '${fullName}' already exists.");
          return;
        }
      }

      // ✅ Step 3: Create root-level folder
      var groupDesc = new ActionDescriptor();
      var groupRef = new ActionReference();
      groupRef.putClass(stringIDToTypeID("layerSection"));
      groupDesc.putReference(charIDToTypeID("null"), groupRef);

      var nameDesc = new ActionDescriptor();
      nameDesc.putString(charIDToTypeID("Nm  "), "${fullName}");
      groupDesc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("layerSection"), nameDesc);
      executeAction(charIDToTypeID("Mk  "), groupDesc, DialogModes.NO);

      // ✅ Step 4: Add 1 layer inside the new folder
      var newLayerDesc = new ActionDescriptor();
      var newLayerRef = new ActionReference();
      newLayerRef.putClass(stringIDToTypeID("artLayer"));
      newLayerDesc.putReference(charIDToTypeID("null"), newLayerRef);
      executeAction(charIDToTypeID("Mk  "), newLayerDesc, DialogModes.NO);

      alert("✅ Created '${fullName}' at root with 1 layer");
    })();
  `;

  window.parent.postMessage(script, "*");
}
function handleCreateFolder() {
  const input = document.getElementById("animNameInput");
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

      // ✅ Step 1: Deselect all by selecting & deleting a temporary group
      var desc = new ActionDescriptor();
      var ref = new ActionReference();
      ref.putClass(stringIDToTypeID("layerSection"));
      desc.putReference(charIDToTypeID("null"), ref);
      var nameDesc = new ActionDescriptor();
      nameDesc.putString(charIDToTypeID("Nm  "), "__temp_deselect__");
      desc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("layerSection"), nameDesc);
      executeAction(charIDToTypeID("Mk  "), desc, DialogModes.NO);

      var delRef = new ActionReference();
      delRef.putName(stringIDToTypeID("layerSection"), "__temp_deselect__");
      var delDesc = new ActionDescriptor();
      delDesc.putReference(charIDToTypeID("null"), delRef);
      executeAction(charIDToTypeID("Dlt "), delDesc, DialogModes.NO);

      // ✅ Step 2: Check for root-level duplicate
      for (var i = 0; i < doc.layerSets.length; i++) {
        var g = doc.layerSets[i];
        if (g.name === "${fullName}" && g.parent === doc) {
          alert("⚠️ A root-level folder named '${fullName}' already exists.");
          return;
        }
      }

      // ✅ Step 3: Create root-level folder
      var groupDesc = new ActionDescriptor();
      var groupRef = new ActionReference();
      groupRef.putClass(stringIDToTypeID("layerSection"));
      groupDesc.putReference(charIDToTypeID("null"), groupRef);

      var nameDesc = new ActionDescriptor();
      nameDesc.putString(charIDToTypeID("Nm  "), "${fullName}");
      groupDesc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("layerSection"), nameDesc);
      executeAction(charIDToTypeID("Mk  "), groupDesc, DialogModes.NO);

      // ✅ Step 4: Add 1 layer inside the new folder
      var newLayerDesc = new ActionDescriptor();
      var newLayerRef = new ActionReference();
      newLayerRef.putClass(stringIDToTypeID("artLayer"));
      newLayerDesc.putReference(charIDToTypeID("null"), newLayerRef);
      executeAction(charIDToTypeID("Mk  "), newLayerDesc, DialogModes.NO);

      alert("✅ Created '${fullName}' at root with 1 layer");
    })();
  `;

  window.parent.postMessage(script, "*");
}
