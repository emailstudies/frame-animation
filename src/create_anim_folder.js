document.getElementById("createAnimFolderBtn").onclick = async function () {
  const input = document.getElementById("animFolderInput");
  const suffix = input ? input.value.trim() : "";

  if (!suffix) {
    alert("❌ Please enter a folder name.");
    return;
  }

  const fullName = "anim_" + suffix;
  const doc = app.activeDocument;

  // Check for existing folder with the full name
  const exists = doc.layerSets.some(f => f.name === fullName && f.parent === doc);
  if (exists) {
    alert("⚠️ A root-level folder named '" + fullName + "' already exists.");
    return;
  }

  // 📁 Create the folder at the root level
  const groupDesc = new ActionDescriptor();
  const groupRef = new ActionReference();
  groupRef.putClass(stringIDToTypeID("layerSection"));
  groupDesc.putReference(charIDToTypeID("null"), groupRef);

  const nameDesc = new ActionDescriptor();
  nameDesc.putString(charIDToTypeID("Nm  "), fullName);
  groupDesc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("layerSection"), nameDesc);

  await executeAction(charIDToTypeID("Mk  "), groupDesc, DialogModes.NO);

  // 🖌️ Add a blank layer inside the folder
  const newFolder = doc.layerSets.find(g => g.name === fullName && g.parent === doc);
  if (newFolder) {
    doc.activeLayer = newFolder;

    const layerDesc = new ActionDescriptor();
    const layerRef = new ActionReference();
    layerRef.putClass(stringIDToTypeID("layer"));
    layerDesc.putReference(charIDToTypeID("null"), layerRef);

    await executeAction(charIDToTypeID("Mk  "), layerDesc, DialogModes.NO);

    alert(`✅ Created '${fullName}' with one empty layer inside.`);
  } else {
    alert("❌ Folder creation failed.");
  }
};
